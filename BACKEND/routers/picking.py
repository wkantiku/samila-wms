from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from auth import User, require_user
from schemas import PickingCreate, PickingConfirm
from wms_database_schema import PickingList, PickingItem, Inventory, Product

router = APIRouter(prefix="/api/picking", tags=["Picking"])


def _pick_no(db: Session) -> str:
    count = db.query(PickingList).count() + 1
    return f"PICK-{datetime.now().year}-{str(count).zfill(4)}"


def _pick_out(p: PickingList) -> dict:
    items = p.pick_items or []
    return {
        "id":        p.id,
        "pickNo":    p.pick_number,
        "customer":  p.customer_name or "",
        "warehouse": str(p.warehouse_id or ""),
        "status":    p.status,
        "date":      p.pick_date.isoformat()[:10] if p.pick_date else "",
        "items": [
            {
                "id":          i.id,
                "sku":         i.product.sku if i.product else "",
                "productName": i.product.name_en if i.product else (i.product_name or ""),
                "barcode":     i.product.barcode if i.product else (i.barcode or ""),
                "location":    i.from_location or "",
                "toPick":      float(i.quantity_to_pick or 0),
                "picked":      float(i.quantity_picked or 0),
                "unit":        i.unit or "PCS",
                "batNumber":   i.batch_number or "",
                "lotNumber":   i.lot_number or "",
            }
            for i in items
        ],
    }


@router.get("")
def list_picking(db: Session = Depends(get_db), _: User = Depends(require_user)):
    rows = db.query(PickingList).order_by(PickingList.id.desc()).all()
    return [_pick_out(p) for p in rows]


@router.post("")
def create_picking(data: PickingCreate, db: Session = Depends(get_db), user: User = Depends(require_user)):
    pl = PickingList(
        pick_number=_pick_no(db),
        customer_name=data.customer,
        so_id=data.salesOrderId,
        pick_date=datetime.utcnow(),
        status="PENDING",
        created_by=user.name,
        total_items=len(data.items),
    )
    db.add(pl)
    db.flush()

    for item in data.items:
        prod = db.query(Product).filter(Product.sku == item.sku).first()
        pi = PickingItem(
            pick_id=pl.id,
            product_id=prod.id if prod else None,
            product_name=item.productName,
            from_location=item.location,
            quantity_to_pick=item.toPick,
            quantity_picked=0,
            unit=item.unit,
            batch_number=item.batNumber,
            lot_number=item.lotNumber,
            pick_status="PENDING",
        )
        db.add(pi)

    db.commit()
    db.refresh(pl)
    return _pick_out(pl)


@router.put("/{pick_id}/confirm")
def confirm_picking(pick_id: int, data: PickingConfirm, db: Session = Depends(get_db), user: User = Depends(require_user)):
    pl = db.query(PickingList).filter(PickingList.id == pick_id).first()
    if not pl:
        raise HTTPException(status_code=404, detail="ไม่พบ Picking List")

    pl.status = "COMPLETED"
    pl.completed_at = datetime.utcnow()
    pl.picked_by = user.name

    for item_data in data.items:
        pi = db.query(PickingItem).filter(PickingItem.id == item_data.get("id")).first()
        if pi:
            pi.quantity_picked = item_data.get("toPick", pi.quantity_to_pick)
            pi.pick_status = "PICKED"
            # Deduct from inventory
            if pi.product_id:
                inv = db.query(Inventory).filter(Inventory.product_id == pi.product_id).first()
                if inv:
                    inv.quantity_available = max(0, (inv.quantity_available or 0) - (pi.quantity_picked or 0))

    db.commit()
    return {"message": f"Picking {pl.pick_number} เสร็จสิ้น"}
