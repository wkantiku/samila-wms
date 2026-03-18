from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.orm import Session
from datetime import datetime
from wms_database_schema import Base, engine
from database import get_db
from auth import User, require_user
from schemas import ShippingCreate, ShippingStatusUpdate

# Shipment model
class Shipment(Base):
    __tablename__ = "shipments"
    id         = Column(Integer, primary_key=True, index=True)
    so_number  = Column(String(50), unique=True, nullable=False)
    carrier    = Column(String(100), nullable=False)
    tracking   = Column(String(100))
    notes      = Column(Text)
    status     = Column(String(30), default="PENDING")
    items      = Column(JSON, default=list)
    created_by = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/api/shipping", tags=["Shipping"])


def _so_number(db: Session) -> str:
    count = db.query(Shipment).count() + 1
    return f"SO-{datetime.now().year}-{str(count).zfill(4)}"


def _ship_out(s: Shipment) -> dict:
    return {
        "id": s.id, "soNumber": s.so_number, "carrier": s.carrier,
        "tracking": s.tracking or "", "notes": s.notes or "",
        "status": s.status, "items": s.items or [],
        "createdBy": s.created_by or "",
        "date": s.created_at.isoformat()[:10] if s.created_at else "",
    }


@router.get("")
def list_shipments(db: Session = Depends(get_db), _: User = Depends(require_user)):
    rows = db.query(Shipment).order_by(Shipment.id.desc()).all()
    return [_ship_out(s) for s in rows]


@router.post("")
def create_shipment(data: ShippingCreate, db: Session = Depends(get_db), user: User = Depends(require_user)):
    # Check duplicate SO number
    existing = db.query(Shipment).filter(Shipment.so_number == data.soNumber).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"SO Number {data.soNumber} มีอยู่แล้ว")
    s = Shipment(
        so_number=data.soNumber, carrier=data.carrier,
        tracking=data.tracking, notes=data.notes,
        items=data.items, status="SHIPPED",
        created_by=user.name if user else "system",
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return _ship_out(s)


@router.put("/{ship_id}/status")
def update_status(ship_id: int, data: ShippingStatusUpdate, db: Session = Depends(get_db), _: User = Depends(require_user)):
    s = db.query(Shipment).filter(Shipment.id == ship_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="ไม่พบรายการจัดส่ง")
    s.status = data.status
    s.updated_at = datetime.utcnow()
    db.commit()
    return {"message": f"อัพเดทสถานะเป็น {data.status}"}


@router.get("/track/{so_number}")
def track_shipment(so_number: str, db: Session = Depends(get_db)):
    s = db.query(Shipment).filter(Shipment.so_number == so_number).first()
    if not s:
        raise HTTPException(status_code=404, detail="ไม่พบข้อมูลการจัดส่ง")
    return _ship_out(s)
