from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import User, require_user
from schemas import WarehouseCreate, WarehouseUpdate
from wms_database_schema import Warehouse

router = APIRouter(prefix="/api/warehouses", tags=["Warehouses"])


def _wh_out(w: Warehouse) -> dict:
    return {
        "id": w.id, "code": w.code,
        "name": w.name_en, "name_th": w.name_th or w.name_en,
        "location": w.city or "", "province": w.city or "",
        "phone": w.phone or "", "manager_name": w.manager_name or "",
        "active": w.is_active, "icon": getattr(w, "icon", "🏭") or "🏭",
        "companyNo": getattr(w, "companyNo", "COMP-001") or "COMP-001",
    }


@router.get("")
def list_warehouses(db: Session = Depends(get_db)):
    whs = db.query(Warehouse).order_by(Warehouse.id).all()
    return [_wh_out(w) for w in whs]


@router.post("")
def create_warehouse(data: WarehouseCreate, db: Session = Depends(get_db), _: User = Depends(require_user)):
    if db.query(Warehouse).filter(Warehouse.code == data.code).first():
        raise HTTPException(status_code=400, detail="รหัส Warehouse นี้มีอยู่แล้ว")
    w = Warehouse(
        code=data.code, name_en=data.name, name_th=data.name_th or data.name,
        city=data.location or data.province, phone=data.phone,
        manager_name=data.manager_name, is_active=data.active,
    )
    db.add(w)
    db.commit()
    db.refresh(w)
    return _wh_out(w)


@router.put("/{wh_id}")
def update_warehouse(wh_id: int, data: WarehouseUpdate, db: Session = Depends(get_db), _: User = Depends(require_user)):
    w = db.query(Warehouse).filter(Warehouse.id == wh_id).first()
    if not w:
        raise HTTPException(status_code=404, detail="ไม่พบ Warehouse")
    if data.name is not None:       w.name_en = data.name
    if data.name_th is not None:    w.name_th = data.name_th
    if data.location is not None:   w.city = data.location
    if data.phone is not None:      w.phone = data.phone
    if data.manager_name is not None: w.manager_name = data.manager_name
    if data.active is not None:     w.is_active = data.active
    db.commit()
    db.refresh(w)
    return _wh_out(w)


@router.delete("/{wh_id}")
def delete_warehouse(wh_id: int, db: Session = Depends(get_db), _: User = Depends(require_user)):
    w = db.query(Warehouse).filter(Warehouse.id == wh_id).first()
    if not w:
        raise HTTPException(status_code=404, detail="ไม่พบ Warehouse")
    w.is_active = False
    db.commit()
    return {"message": "ลบ Warehouse สำเร็จ"}
