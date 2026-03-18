from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from database import get_db
from auth import User, require_user
from schemas import InventoryReceive, InventoryAdjust
from wms_database_schema import Inventory, InventoryMovement, Product, Location

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


def _inv_out(inv: Inventory) -> dict:
    prod_name = inv.product.name_en if inv.product else str(inv.product_id)
    barcode   = inv.product.barcode if inv.product else None
    loc_code  = inv.location.code if inv.location else "RECEIVING"
    return {
        "id": inv.id,
        "sku":       inv.product.sku if inv.product else "",
        "product":   prod_name,
        "barcode":   barcode,
        "location":  loc_code,
        "quantity":  float(inv.quantity_on_hand or 0),
        "available": float(inv.quantity_available or inv.quantity_on_hand or 0),
        "mainUnit":  inv.product.unit if inv.product else "PCS",
        "customer":  inv.customer or "",
        "batNumber": inv.batch_number or "",
        "lotNumber": inv.lot_number or "",
        "expiryDate": inv.expiry_date.isoformat() if inv.expiry_date else "",
        "minStock":  float(inv.product.reorder_level or 0) if inv.product else 0,
        "status":    inv.status or "GOOD",
    }


@router.get("")
def list_inventory(
    warehouse_id: Optional[int] = None,
    customer: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_user),
):
    q = db.query(Inventory).join(Product, isouter=True).join(Location, isouter=True)
    if warehouse_id:
        q = q.filter(Inventory.warehouse_id == warehouse_id)
    if customer:
        q = q.filter(Inventory.customer.ilike(f"%{customer}%"))
    if search:
        like = f"%{search}%"
        q = q.filter(
            Product.sku.ilike(like) |
            Product.name_en.ilike(like) |
            Product.barcode.ilike(like)
        )
    return [_inv_out(i) for i in q.order_by(Inventory.id).all()]


@router.post("/receive")
def receive_inventory(data: InventoryReceive, db: Session = Depends(get_db), user: User = Depends(require_user)):
    # Find or create product
    prod = db.query(Product).filter(Product.sku == data.sku).first()
    if not prod:
        prod = Product(sku=data.sku, barcode=data.barcode, name_en=data.product,
                       name_th=data.product, unit=data.mainUnit, is_active=True)
        db.add(prod)
        db.flush()

    # Find or create location
    loc = None
    if data.location and data.location != "RECEIVING":
        loc = db.query(Location).filter(Location.code == data.location).first()
        if not loc:
            loc = Location(code=data.location, zone=data.location[:1],
                           warehouse_id=data.warehouse_id or 1,
                           location_type='SHELF', is_active=True)
            db.add(loc)
            db.flush()

    # Upsert inventory row
    q = db.query(Inventory).filter(Inventory.product_id == prod.id)
    if data.lotNumber:
        q = q.filter(Inventory.lot_number == data.lotNumber)
    inv = q.first()

    if inv:
        inv.quantity_on_hand  = (inv.quantity_on_hand or 0) + data.quantity
        inv.quantity_available = (inv.quantity_available or 0) + data.quantity
        if loc:
            inv.location_id = loc.id
    else:
        inv = Inventory(
            product_id=prod.id,
            location_id=loc.id if loc else None,
            warehouse_id=data.warehouse_id or 1,
            quantity_on_hand=data.quantity,
            quantity_available=data.quantity,
            customer=data.customer,
            batch_number=data.batNumber,
            lot_number=data.lotNumber,
            expiry_date=datetime.strptime(data.expiryDate, "%Y-%m-%d").date() if data.expiryDate else None,
            status="GOOD",
        )
        db.add(inv)
        db.flush()

    # Record movement
    mov = InventoryMovement(
        inventory_id=inv.id,
        warehouse_id=data.warehouse_id or 1,
        movement_type="RECEIVING",
        quantity=data.quantity,
        reference_number=data.grNumber,
        movement_date=datetime.utcnow(),
        moved_by=user.name if user else "system",
        remarks=f"รับสินค้า GR: {data.grNumber or ''}",
    )
    db.add(mov)
    db.commit()
    db.refresh(inv)
    return _inv_out(inv)


@router.put("/adjust")
def adjust_inventory(data: InventoryAdjust, db: Session = Depends(get_db), user: User = Depends(require_user)):
    prod = db.query(Product).filter(Product.sku == data.sku).first()
    if not prod:
        raise HTTPException(status_code=404, detail=f"ไม่พบ SKU: {data.sku}")
    inv = db.query(Inventory).filter(Inventory.product_id == prod.id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="ไม่พบ Inventory record")
    diff = data.quantity - (inv.quantity_on_hand or 0)
    inv.quantity_on_hand  = data.quantity
    inv.quantity_available = data.quantity
    mov = InventoryMovement(
        inventory_id=inv.id,
        warehouse_id=inv.warehouse_id or 1,
        movement_type="ADJUSTMENT",
        quantity=abs(diff),
        movement_date=datetime.utcnow(),
        moved_by=user.name if user else "system",
        remarks=f"{data.reason}: {data.notes or ''}",
    )
    db.add(mov)
    db.commit()
    db.refresh(inv)
    return _inv_out(inv)


@router.get("/movements")
def get_movements(sku: Optional[str] = None, db: Session = Depends(get_db), _: User = Depends(require_user)):
    q = (db.query(InventoryMovement)
         .join(Inventory, isouter=True)
         .join(Product, Inventory.product_id == Product.id, isouter=True))
    if sku:
        q = q.filter(Product.sku == sku)
    rows = q.order_by(InventoryMovement.movement_date.desc()).limit(200).all()
    return [
        {
            "id": m.id,
            "sku":       m.inventory.product.sku if m.inventory and m.inventory.product else "",
            "product":   m.inventory.product.name_en if m.inventory and m.inventory.product else "",
            "type":      m.movement_type,
            "quantity":  float(m.quantity or 0),
            "reference": m.reference_number,
            "notes":     m.remarks,
            "date":      m.movement_date.isoformat() if m.movement_date else "",
            "by":        m.moved_by,
        }
        for m in rows
    ]
