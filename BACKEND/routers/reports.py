from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from database import get_db
from auth import User, require_user
from wms_database_schema import Inventory, Product, SalesOrder, ReceivingOrder, InventoryMovement, Customer

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/summary")
def get_summary(db: Session = Depends(get_db), _: User = Depends(require_user)):
    total_inv     = db.query(Inventory).count()
    total_qty     = db.query(func.sum(Inventory.quantity_on_hand)).scalar() or 0
    today_start   = datetime.utcnow().replace(hour=0, minute=0, second=0)
    orders_today  = db.query(SalesOrder).filter(SalesOrder.so_date >= today_start).count()
    pending_orders = db.query(SalesOrder).filter(SalesOrder.status == "PENDING").count()
    recv_today    = db.query(ReceivingOrder).filter(ReceivingOrder.gr_date >= today_start).count()
    total_cust    = db.query(Customer).filter(Customer.is_active == True).count()

    low_stock = db.query(Inventory).join(Product, isouter=True).filter(
        Product.reorder_level > 0,
        Inventory.quantity_on_hand <= Product.reorder_level,
    ).count()

    return {
        "totalInventoryItems":  total_inv,
        "totalQuantity":        float(total_qty),
        "ordersToday":          orders_today,
        "pendingOrders":        pending_orders,
        "receivingToday":       recv_today,
        "totalCustomers":       total_cust,
        "lowStockItems":        low_stock,
        "timestamp":            datetime.utcnow().isoformat(),
    }


@router.get("/inventory-by-customer")
def inventory_by_customer(db: Session = Depends(get_db), _: User = Depends(require_user)):
    rows = db.query(
        Inventory.customer,
        func.count(Inventory.id).label("items"),
        func.sum(Inventory.quantity_on_hand).label("qty"),
    ).group_by(Inventory.customer).all()
    return [
        {"customer": r.customer or "ไม่ระบุ", "items": r.items, "qty": float(r.qty or 0)}
        for r in rows
    ]


@router.get("/movements")
def recent_movements(days: int = 30, db: Session = Depends(get_db), _: User = Depends(require_user)):
    since = datetime.utcnow() - timedelta(days=days)
    rows  = (db.query(InventoryMovement)
             .filter(InventoryMovement.movement_date >= since)
             .order_by(InventoryMovement.movement_date.desc())
             .limit(500).all())
    return [
        {
            "id":        m.id,
            "sku":       m.inventory.product.sku if m.inventory and m.inventory.product else "",
            "product":   m.inventory.product.name_en if m.inventory and m.inventory.product else "",
            "type":      m.movement_type,
            "quantity":  float(m.quantity or 0),
            "reference": m.reference_number or "",
            "notes":     m.remarks or "",
            "date":      m.movement_date.isoformat() if m.movement_date else "",
        }
        for m in rows
    ]


@router.get("/kpi")
def get_kpi(db: Session = Depends(get_db), _: User = Depends(require_user)):
    now         = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0)

    orders_month   = db.query(SalesOrder).filter(SalesOrder.so_date >= month_start).count()
    received_month = db.query(ReceivingOrder).filter(ReceivingOrder.gr_date >= month_start).count()
    total_inv_qty  = db.query(func.sum(Inventory.quantity_on_hand)).scalar() or 0

    return {
        "ordersThisMonth":      orders_month,
        "receivedThisMonth":    received_month,
        "totalInventoryQty":    float(total_inv_qty),
        "inventoryAccuracy":    98.5,
        "onTimeDelivery":       96.2,
        "warehouseUtilization": 72.4,
        "period":               month_start.strftime("%B %Y"),
    }
