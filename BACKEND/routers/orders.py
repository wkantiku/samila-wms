from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from auth import User, require_user
from schemas import OrderCreate, OrderStatusUpdate
from wms_database_schema import SalesOrder, SalesOrderItem, Customer, Product

router = APIRouter(prefix="/api/orders", tags=["Orders"])


def _order_no(db: Session) -> str:
    count = db.query(SalesOrder).count() + 1
    return f"ORD-{datetime.now().strftime('%Y%m%d')}-{str(count).zfill(4)}"


def _order_out(o: SalesOrder) -> dict:
    items = o.line_items or []
    return {
        "id":        o.id,
        "orderNo":   o.so_number,
        "customer":  o.customer.name_en if o.customer else "",
        "status":    o.status,
        "orderDate": o.so_date.isoformat()[:10] if o.so_date else "",
        "dueDate":   o.requested_delivery_date.isoformat()[:10] if o.requested_delivery_date else "",
        "notes":     o.remarks or "",
        "total":     float(o.total_amount or 0),
        "items": [
            {
                "id":      i.id,
                "sku":     i.product.sku if i.product else "",
                "product": i.product.name_en if i.product else (i.product_name or ""),
                "qty":     float(i.quantity_ordered or 0),
                "unit":    i.unit or "PCS",
                "price":   float(i.unit_price or 0),
            }
            for i in items
        ],
    }


@router.get("")
def list_orders(db: Session = Depends(get_db), _: User = Depends(require_user)):
    rows = db.query(SalesOrder).order_by(SalesOrder.id.desc()).all()
    return [_order_out(o) for o in rows]


@router.get("/{order_id}")
def get_order(order_id: int, db: Session = Depends(get_db), _: User = Depends(require_user)):
    o = db.query(SalesOrder).filter(SalesOrder.id == order_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="ไม่พบคำสั่งขาย")
    return _order_out(o)


@router.post("")
def create_order(data: OrderCreate, db: Session = Depends(get_db), user: User = Depends(require_user)):
    cust = db.query(Customer).filter(Customer.name_en.ilike(f"%{data.customer}%")).first()
    if not cust:
        count = db.query(Customer).count() + 1
        cust = Customer(code=f"CUST-{str(count).zfill(3)}", name_en=data.customer, name_th=data.customer, is_active=True)
        db.add(cust)
        db.flush()

    order_date = datetime.strptime(data.orderDate, "%Y-%m-%d") if data.orderDate else datetime.utcnow()
    due_date   = datetime.strptime(data.dueDate, "%Y-%m-%d") if data.dueDate else None
    total = sum((i.qty or 0) * (i.price or 0) for i in data.items)

    so = SalesOrder(
        customer_id=cust.id,
        so_number=_order_no(db),
        so_date=order_date,
        requested_delivery_date=due_date,
        status="PENDING",
        remarks=data.notes,
        total_amount=total,
        created_by=user.name,
    )
    db.add(so)
    db.flush()

    for idx, it in enumerate(data.items, 1):
        prod = db.query(Product).filter(Product.sku == it.sku).first()
        item = SalesOrderItem(
            so_id=so.id,
            line_number=idx,
            product_id=prod.id if prod else None,
            product_name=it.product,
            unit=it.unit,
            quantity_ordered=it.qty,
            unit_price=it.price or 0,
            line_amount=(it.qty or 0) * (it.price or 0),
        )
        db.add(item)

    db.commit()
    db.refresh(so)
    return _order_out(so)


@router.put("/{order_id}/status")
def update_status(order_id: int, data: OrderStatusUpdate, db: Session = Depends(get_db), _: User = Depends(require_user)):
    o = db.query(SalesOrder).filter(SalesOrder.id == order_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="ไม่พบคำสั่งขาย")
    o.status = data.status
    o.updated_at = datetime.utcnow()
    db.commit()
    return {"message": f"อัพเดทสถานะเป็น {data.status}"}


@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db), _: User = Depends(require_user)):
    o = db.query(SalesOrder).filter(SalesOrder.id == order_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="ไม่พบคำสั่งขาย")
    o.status = "CANCELLED"
    db.commit()
    return {"message": "ยกเลิกคำสั่งขายสำเร็จ"}
