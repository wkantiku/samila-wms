from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from auth import User, require_user
from schemas import ReceivingCreate, ReceivingStatusUpdate
from wms_database_schema import ReceivingOrder, ReceivingItem, Product, PurchaseOrder, Warehouse

router = APIRouter(prefix="/api/receiving", tags=["Receiving"])


def _gr_number(db: Session) -> str:
    count = db.query(ReceivingOrder).count() + 1
    return f"GR-{datetime.now().year}-{str(count).zfill(4)}"


def _recv_out(r: ReceivingOrder) -> dict:
    items = r.receiving_items or []
    return {
        "id": r.id,
        "grNumber": r.gr_number,
        "date": r.gr_date.isoformat()[:10] if r.gr_date else "",
        "supplier": r.purchase_order.supplier.name_en if r.purchase_order and r.purchase_order.supplier else "",
        "receiver": r.receiver_name or "",
        "status": r.status,
        "items": len(items),
        "warehouse_id": r.warehouse_id,
        "remarks": r.remarks or "",
        "itemDetails": [
            {
                "id": i.id,
                "sku": i.product.sku if i.product else "",
                "product": i.product.name_en if i.product else "",
                "barcode": i.barcode,
                "quantity": float(i.quantity_received or 0),
                "mainUnit": i.product.unit if i.product else "PCS",
                "batNumber": i.batch_number or "",
                "lotNumber": i.lot_number or "",
                "expiryDate": i.expiry_date.isoformat() if i.expiry_date else "",
                "status": i.qc_status or "GOOD",
            }
            for i in items
        ],
    }


@router.get("")
def list_receiving(db: Session = Depends(get_db), _: User = Depends(require_user)):
    rows = db.query(ReceivingOrder).order_by(ReceivingOrder.id.desc()).all()
    return [_recv_out(r) for r in rows]


@router.get("/{recv_id}")
def get_receiving(recv_id: int, db: Session = Depends(get_db), _: User = Depends(require_user)):
    r = db.query(ReceivingOrder).filter(ReceivingOrder.id == recv_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="ไม่พบใบรับสินค้า")
    return _recv_out(r)


@router.post("")
def create_receiving(data: ReceivingCreate, db: Session = Depends(get_db), user: User = Depends(require_user)):
    # Find or create product
    prod = db.query(Product).filter(Product.sku == data.sku).first()
    if not prod:
        prod = Product(sku=data.sku, barcode=data.barcode, name_en=data.product, name_th=data.product, unit=data.mainUnit, is_active=True)
        db.add(prod)
        db.flush()

    # Create a stub PO if needed
    po = db.query(PurchaseOrder).first()
    if not po:
        po = PurchaseOrder(
            po_number=f"PO-AUTO-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            po_date=datetime.utcnow(), status="CONFIRMED",
            supplier_id=1, created_by=user.name,
        )
        db.add(po)
        db.flush()

    gr_no = _gr_number(db)
    wh_id = data.warehouse_id or 1
    ro = ReceivingOrder(
        po_id=po.id, warehouse_id=wh_id,
        gr_number=gr_no, gr_date=datetime.utcnow(),
        receiver_name=user.name, status="RECEIVING",
        total_items_received=1,
    )
    db.add(ro)
    db.flush()

    item = ReceivingItem(
        gr_id=ro.id, product_id=prod.id, barcode=data.barcode,
        quantity_received=data.quantity,
        batch_number=data.batNumber, lot_number=data.lotNumber,
        expiry_date=datetime.strptime(data.expiryDate, "%Y-%m-%d").date() if data.expiryDate else None,
        qc_status="GOOD", location=data.location,
    )
    db.add(item)
    db.commit()
    db.refresh(ro)
    return _recv_out(ro)


@router.put("/{recv_id}/status")
def update_status(recv_id: int, data: ReceivingStatusUpdate, db: Session = Depends(get_db), _: User = Depends(require_user)):
    r = db.query(ReceivingOrder).filter(ReceivingOrder.id == recv_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="ไม่พบใบรับสินค้า")
    r.status = data.status
    r.updated_at = datetime.utcnow()
    db.commit()
    return {"message": f"อัพเดทสถานะเป็น {data.status} สำเร็จ"}
