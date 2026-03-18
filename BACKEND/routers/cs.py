from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from wms_database_schema import Base, engine
from database import get_db
from auth import User, require_user
from schemas import CSCaseCreate, CSCaseUpdate, CSNoteCreate


class CSCase(Base):
    __tablename__ = "cs_cases"
    id                = Column(Integer, primary_key=True, index=True)
    cs_no             = Column(String(50), unique=True, nullable=False)
    date              = Column(String(20))
    customer          = Column(String(255), nullable=False)
    order_ref         = Column(String(100))
    category          = Column(String(50))
    complaint_type    = Column(String(100))
    priority          = Column(String(20), default="Medium")
    subject           = Column(String(255))
    detail            = Column(Text)
    assign_to         = Column(String(100))
    status            = Column(String(30), default="Open")
    due_date          = Column(String(20))
    resolved_date     = Column(String(20))
    root_cause        = Column(Text)
    corrective_action = Column(Text)
    preventive_action = Column(Text)
    compensation      = Column(Text)
    notes             = Column(JSON, default=list)
    created_at        = Column(DateTime, default=datetime.utcnow)
    updated_at        = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/api/cs", tags=["Customer Service"])


def _cs_no(db: Session) -> str:
    count = db.query(CSCase).count() + 1
    return f"CS-{datetime.now().strftime('%Y%m%d')}-{str(count).zfill(4)}"


def _cs_out(c: CSCase) -> dict:
    return {
        "id": c.id, "csNo": c.cs_no,
        "date": c.date or "", "customer": c.customer,
        "orderRef": c.order_ref or "", "category": c.category or "",
        "complaintType": c.complaint_type or "",
        "priority": c.priority or "Medium",
        "subject": c.subject or "", "detail": c.detail or "",
        "assignTo": c.assign_to or "", "status": c.status or "Open",
        "dueDate": c.due_date or "", "resolvedDate": c.resolved_date or "",
        "rootCause": c.root_cause or "",
        "correctiveAction": c.corrective_action or "",
        "preventiveAction": c.preventive_action or "",
        "compensation": c.compensation or "",
        "notes": c.notes or [],
    }


@router.get("")
def list_cases(status: Optional[str] = None, db: Session = Depends(get_db), _: User = Depends(require_user)):
    q = db.query(CSCase)
    if status:
        q = q.filter(CSCase.status == status)
    return [_cs_out(c) for c in q.order_by(CSCase.id.desc()).all()]


@router.get("/{case_id}")
def get_case(case_id: int, db: Session = Depends(get_db), _: User = Depends(require_user)):
    c = db.query(CSCase).filter(CSCase.id == case_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="ไม่พบเคส")
    return _cs_out(c)


@router.post("")
def create_case(data: CSCaseCreate, db: Session = Depends(get_db), user: User = Depends(require_user)):
    c = CSCase(
        cs_no=_cs_no(db),
        date=datetime.now().strftime("%Y-%m-%d"),
        customer=data.customer, order_ref=data.orderRef,
        category=data.category, complaint_type=data.complaintType,
        priority=data.priority, subject=data.subject, detail=data.detail,
        assign_to=data.assignTo, status="Open",
        due_date=data.dueDate, notes=[],
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return _cs_out(c)


@router.put("/{case_id}")
def update_case(case_id: int, data: CSCaseUpdate, db: Session = Depends(get_db), _: User = Depends(require_user)):
    c = db.query(CSCase).filter(CSCase.id == case_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="ไม่พบเคส")
    if data.status is not None:            c.status = data.status
    if data.assignTo is not None:          c.assign_to = data.assignTo
    if data.rootCause is not None:         c.root_cause = data.rootCause
    if data.correctiveAction is not None:  c.corrective_action = data.correctiveAction
    if data.preventiveAction is not None:  c.preventive_action = data.preventiveAction
    if data.compensation is not None:      c.compensation = data.compensation
    if data.resolvedDate is not None:      c.resolved_date = data.resolvedDate
    c.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(c)
    return _cs_out(c)


@router.post("/{case_id}/note")
def add_note(case_id: int, data: CSNoteCreate, db: Session = Depends(get_db), user: User = Depends(require_user)):
    c = db.query(CSCase).filter(CSCase.id == case_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="ไม่พบเคส")
    notes = list(c.notes or [])
    note_id = max((n.get("id", 0) for n in notes), default=0) + 1
    notes.append({
        "id": note_id,
        "author": user.name if user else "system",
        "date": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "text": data.text,
        "type": data.type,
    })
    c.notes = notes
    c.updated_at = datetime.utcnow()
    db.commit()
    return _cs_out(c)
