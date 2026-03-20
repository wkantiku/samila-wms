from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from auth import User, get_current_user
from schemas import WarehouseCreate, WarehouseUpdate
from wms_database_schema import Warehouse, Location

router = APIRouter(prefix="/api/warehouses", tags=["Warehouses"])


def _wh_out(w: Warehouse) -> dict:
    return {
        "id": w.id,
        "code": w.code,
        "name": w.name_en,
        "name_th": w.name_th or w.name_en,
        "location": w.city or "",
        "province": w.city or "",
        "address": w.address or "",
        "phone": w.phone or "",
        "manager_name": w.manager_name or "",
        "active": w.is_active,
        "icon": w.icon or "🏭",
        "companyNo": w.company_no or "COMP-001",
        "type": w.wh_type or "General",
        "zones": w.zones or 0,
        "staff": w.staff or 0,
        "capacity": w.total_capacity or 0,
        "used": w.used_sqm or 0,
    }


@router.get("")
def list_warehouses(
    db: Session = Depends(get_db),
    current: Optional[User] = Depends(get_current_user),
):
    q = db.query(Warehouse)
    # non-superadmin: scope to their company only
    if current and current.role != "superadmin" and current.company_no:
        q = q.filter(Warehouse.company_no == current.company_no)
    return [_wh_out(w) for w in q.order_by(Warehouse.id).all()]


@router.post("")
def create_warehouse(data: WarehouseCreate, db: Session = Depends(get_db)):
    if db.query(Warehouse).filter(Warehouse.code == data.code).first():
        raise HTTPException(status_code=400, detail="รหัส Warehouse นี้มีอยู่แล้ว")
    w = Warehouse(
        code=data.code,
        name_en=data.name,
        name_th=data.name_th or data.name,
        city=data.province or data.location,
        address=data.address,
        phone=data.phone,
        manager_name=data.manager_name,
        is_active=data.active,
        icon=data.icon or "🏭",
        company_no=data.companyNo or "COMP-001",
        wh_type=data.wh_type or "General",
        zones=data.zones or 0,
        staff=data.staff or 0,
        total_capacity=data.capacity or 0,
        used_sqm=data.used or 0,
    )
    db.add(w)
    db.commit()
    db.refresh(w)
    return _wh_out(w)


@router.put("/{wh_id}")
def update_warehouse(wh_id: int, data: WarehouseUpdate, db: Session = Depends(get_db)):
    w = db.query(Warehouse).filter(Warehouse.id == wh_id).first()
    if not w:
        raise HTTPException(status_code=404, detail="ไม่พบ Warehouse")
    if data.name is not None:           w.name_en = data.name
    if data.name_th is not None:        w.name_th = data.name_th
    if data.province is not None:        w.city = data.province
    elif data.location is not None:     w.city = data.location
    if data.address is not None:        w.address = data.address
    if data.phone is not None:          w.phone = data.phone
    if data.manager_name is not None:   w.manager_name = data.manager_name
    if data.active is not None:         w.is_active = data.active
    if data.icon is not None:           w.icon = data.icon
    if data.wh_type is not None:        w.wh_type = data.wh_type
    if data.zones is not None:          w.zones = data.zones
    if data.staff is not None:          w.staff = data.staff
    if data.capacity is not None:       w.total_capacity = data.capacity
    if data.used is not None:           w.used_sqm = data.used
    db.commit()
    db.refresh(w)
    return _wh_out(w)


@router.patch("/{wh_id}/toggle")
def toggle_warehouse(wh_id: int, db: Session = Depends(get_db)):
    w = db.query(Warehouse).filter(Warehouse.id == wh_id).first()
    if not w:
        raise HTTPException(status_code=404, detail="ไม่พบ Warehouse")
    w.is_active = not w.is_active
    db.commit()
    db.refresh(w)
    return _wh_out(w)


@router.delete("/{wh_id}")
def delete_warehouse(wh_id: int, db: Session = Depends(get_db)):
    w = db.query(Warehouse).filter(Warehouse.id == wh_id).first()
    if not w:
        raise HTTPException(status_code=404, detail="ไม่พบ Warehouse")
    # ลบ locations ก่อน (warehouse_id NOT NULL ทำให้ SET NULL cascade ไม่ได้)
    db.query(Location).filter(Location.warehouse_id == wh_id).delete(synchronize_session=False)
    try:
        db.delete(w)
        db.commit()
        return {"message": "ลบ Warehouse สำเร็จ"}
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="ไม่สามารถลบ Warehouse ได้ เนื่องจากมีข้อมูลที่เกี่ยวข้อง (ใบรับสินค้า, สต็อก, ฯลฯ) กรุณาลบข้อมูลที่เกี่ยวข้องก่อน"
        )
