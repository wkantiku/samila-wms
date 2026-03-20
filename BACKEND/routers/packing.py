from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from auth import User, require_user
from schemas import PackingCreate, PackingConfirm
from wms_database_schema import PackingOrder, PackingItem, Product

router = APIRouter(prefix="/api/packing", tags=["Packing"])


def _pack_no(db: Session) -> str:
    count = db.query(PackingOrder).count() + 1
    return f"PACK-{datetime.now().year}-{str(count).zfill(4)}"


def _pack_out(p: PackingOrder) -> dict:
    items = p.packing_items or []
    return {
        "id":         p.id,
        "packNo":     p.pack_number,
        "customer":   p.customer_name or "",
        "warehouse":  str(p.warehouse_id or ""),
        "status":     p.status,
        "date":       p.pack_date.isoformat()[:10] if p.pack_date else "",
        "totalBoxes": p.total_boxes or 0,
        "items": [
            {
                "id":          i.id,
                "sku":         i.sku or (i.product.sku if i.product else ""),
                "productName": i.product_name or (i.product.name_en if i.product else ""),
                "barcode":     i.barcode or (i.product.barcode if i.product else ""),
                "toPack":      float(i.quantity_to_pack or 0),
                "packed":      float(i.quantity_packed or 0),
                "unit":        i.unit or "PCS",
                "batNumber":   i.batch_number or "",
                "lotNumber":   i.lot_number or "",
                "boxNumber":   i.box_number or "",
                "packStatus":  i.pack_status or "PENDING",
            }
            for i in items
        ],
    }


@router.get("")
def list_packing(db: Session = Depends(get_db), _: User = Depends(require_user)):
    rows = db.query(PackingOrder).order_by(PackingOrder.id.desc()).all()
    return [_pack_out(p) for p in rows]


@router.post("")
def create_packing(data: PackingCreate, db: Session = Depends(get_db), user: User = Depends(require_user)):
    po = PackingOrder(
        pack_number=_pack_no(db),
        customer_name=data.customer,
        pick_id=data.pickingId,
        so_id=data.salesOrderId,
        pack_date=datetime.utcnow(),
        status="PENDING",
        created_by=user.name,
        total_items=len(data.items),
        total_boxes=0,
    )
    db.add(po)
    db.flush()

    for item in data.items:
        prod = db.query(Product).filter(Product.sku == item.sku).first()
        pi = PackingItem(
            pack_id=po.id,
            product_id=prod.id if prod else None,
            product_name=item.productName,
            sku=item.sku,
            barcode=item.barcode,
            quantity_to_pack=item.toPack,
            quantity_packed=0,
            unit=item.unit,
            batch_number=item.batNumber,
            lot_number=item.lotNumber,
            pack_status="PENDING",
        )
        db.add(pi)

    db.commit()
    db.refresh(po)
    return _pack_out(po)


@router.put("/{pack_id}/confirm")
def confirm_packing(pack_id: int, data: PackingConfirm, db: Session = Depends(get_db), user: User = Depends(require_user)):
    po = db.query(PackingOrder).filter(PackingOrder.id == pack_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="ไม่พบ Packing Order")

    po.status = "COMPLETED"
    po.completed_at = datetime.utcnow()
    po.packed_by = user.name

    box_numbers = set()
    for item_data in data.items:
        pi = db.query(PackingItem).filter(PackingItem.id == item_data.get("id")).first()
        if pi:
            pi.quantity_packed = item_data.get("toPack", pi.quantity_to_pack)
            pi.pack_status = "PACKED"
            pi.box_number = item_data.get("boxNumber", "")
            pi.packed_at = datetime.utcnow()
            if pi.box_number:
                box_numbers.add(pi.box_number)

    po.total_boxes = len(box_numbers)
    db.commit()
    return {"message": f"Packing {po.pack_number} เสร็จสิ้น"}


@router.delete("/{pack_id}")
def delete_packing(pack_id: int, db: Session = Depends(get_db), _: User = Depends(require_user)):
    po = db.query(PackingOrder).filter(PackingOrder.id == pack_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="ไม่พบ Packing Order")
    db.query(PackingItem).filter(PackingItem.pack_id == pack_id).delete()
    db.delete(po)
    db.commit()
    return {"message": "ลบ Packing Order เรียบร้อย"}
