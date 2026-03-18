from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.orm import Session
from datetime import datetime
from wms_database_schema import Base, engine
from database import get_db
from auth import User, require_user
from schemas import PutawayCreate

# PutawayTask model (not in wms_database_schema)
class PutawayTask(Base):
    __tablename__ = "putaway_tasks"
    id           = Column(Integer, primary_key=True, index=True)
    pa_number    = Column(String(50), unique=True, nullable=False)
    gr_number    = Column(String(50))
    sku          = Column(String(50), nullable=False)
    customer     = Column(String(255))
    qty          = Column(Float, default=0)
    main_unit    = Column(String(20), default="PCS")
    from_location = Column(String(50), default="RECEIVING")
    to_location  = Column(String(50), nullable=False)
    bat_number   = Column(String(50))
    lot_number   = Column(String(50))
    status       = Column(String(30), default="PENDING")
    assigned_to  = Column(String(100))
    created_at   = Column(DateTime, default=datetime.utcnow)
    updated_at   = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/api/putaway", tags=["Putaway"])


def _pa_number(db: Session) -> str:
    count = db.query(PutawayTask).count() + 1
    return f"PA-{datetime.now().year}-{str(count).zfill(4)}"


def _pa_out(t: PutawayTask) -> dict:
    return {
        "id": t.id, "paNumber": t.pa_number, "grNumber": t.gr_number or "",
        "sku": t.sku, "customer": t.customer or "", "qty": float(t.qty or 0),
        "mainUnit": t.main_unit or "PCS",
        "fromLocation": t.from_location, "toLocation": t.to_location,
        "batNumber": t.bat_number or "", "lotNumber": t.lot_number or "",
        "status": t.status, "assignedTo": t.assigned_to or "",
        "date": t.created_at.isoformat()[:10] if t.created_at else "",
    }


@router.get("")
def list_putaway(db: Session = Depends(get_db), _: User = Depends(require_user)):
    rows = db.query(PutawayTask).order_by(PutawayTask.id.desc()).all()
    return [_pa_out(t) for t in rows]


@router.post("")
def create_putaway(data: PutawayCreate, db: Session = Depends(get_db), _: User = Depends(require_user)):
    t = PutawayTask(
        pa_number=_pa_number(db), gr_number=data.grNumber,
        sku=data.sku, customer=data.customer,
        qty=data.qty, main_unit=data.mainUnit,
        from_location=data.fromLocation, to_location=data.toLocation,
        bat_number=data.batNumber, lot_number=data.lotNumber,
        status="PENDING",
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return _pa_out(t)


@router.put("/{pa_id}/confirm")
def confirm_putaway(pa_id: int, db: Session = Depends(get_db), user: User = Depends(require_user)):
    from wms_database_schema import Inventory, Product, Location
    t = db.query(PutawayTask).filter(PutawayTask.id == pa_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="ไม่พบ Putaway Task")
    t.status = "COMPLETE"
    t.updated_at = datetime.utcnow()

    # Update inventory location
    prod = db.query(Product).filter(Product.sku == t.sku).first()
    if prod:
        inv = db.query(Inventory).filter(Inventory.product_id == prod.id).first()
        if inv:
            new_loc = db.query(Location).filter(Location.code == t.to_location).first()
            if new_loc:
                inv.location_id = new_loc.id

    db.commit()
    return {"message": f"Putaway {t.pa_number} เสร็จสิ้น"}
