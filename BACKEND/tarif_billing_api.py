"""
SAMILA WMS 3PL - Tarif & Billing APIs
FastAPI endpoints for pricing and invoicing
"""

from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# =============== PYDANTIC SCHEMAS ===============

class ServiceTypeCreate(BaseModel):
    code: str
    name: str
    description: Optional[str] = None


class UnitOfMeasureCreate(BaseModel):
    code: str
    name: str
    description: Optional[str] = None


class InboundTarifCreate(BaseModel):
    customer_id: int
    per_pallet: Optional[float] = None
    per_carton: Optional[float] = None
    per_item: Optional[float] = None
    per_kg: Optional[float] = None
    per_m3: Optional[float] = None
    minimum_charge: float = 500
    qc_required: bool = False
    qc_fee: Optional[float] = None


class StorageTarifCreate(BaseModel):
    customer_id: int
    per_pallet_day: Optional[float] = None
    per_m3_day: Optional[float] = None
    per_item_month: Optional[float] = None
    per_pallet_month: Optional[float] = None
    per_m3_month: Optional[float] = None
    monthly_minimum: float = 1000
    free_storage_days: int = 0


class OutboundTarifCreate(BaseModel):
    customer_id: int
    per_order: Optional[float] = None
    per_item: Optional[float] = None
    per_box: Optional[float] = None
    per_pallet: Optional[float] = None
    minimum_charge: float = 500
    hazmat_fee: Optional[float] = None
    fragile_fee: Optional[float] = None


class VASCreate(BaseModel):
    customer_id: int
    service_code: str
    service_name: str
    description: Optional[str] = None
    rate: float
    unit: str  # PER_ITEM, PER_BOX, PER_ORDER


class SpecialServiceCreate(BaseModel):
    customer_id: int
    service_code: str
    service_name: str
    description: Optional[str] = None
    rate: float
    unit: str  # PER_M3_DAY, PER_MONTH, PERCENTAGE


class InvoiceCreate(BaseModel):
    customer_id: int
    period_start: datetime
    period_end: datetime
    remarks: Optional[str] = None


class InvoiceLineItemCreate(BaseModel):
    invoice_id: int
    line_number: int
    service_type: str
    description: str
    quantity: float
    unit: str
    rate: float


class BillingCalculationCreate(BaseModel):
    customer_id: int
    period_start: datetime
    period_end: datetime


class PaymentCreate(BaseModel):
    invoice_id: int
    customer_id: int
    amount: float
    payment_method: str
    reference_number: Optional[str] = None
    remarks: Optional[str] = None


# =============== API ROUTER ===============

router = APIRouter(
    prefix="/api/v1/tarif",
    tags=["Tarif & Billing"]
)


# =============== SERVICE TYPE ENDPOINTS ===============

@router.post("/service-type/create")
async def create_service_type(service: ServiceTypeCreate):
    """Create new service type"""
    try:
        # TODO: Save to database
        return {
            "status": "success",
            "message": "Service type created",
            "data": service.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/service-types")
async def list_service_types(skip: int = Query(0), limit: int = Query(100)):
    """List all service types"""
    try:
        # TODO: Fetch from database
        return {
            "status": "success",
            "data": [
                {"id": 1, "code": "INBOUND", "name": "Inbound/Receiving"},
                {"id": 2, "code": "STORAGE", "name": "Storage/Warehousing"},
                {"id": 3, "code": "OUTBOUND", "name": "Outbound/Shipping"},
                {"id": 4, "code": "VAS", "name": "Value Added Services"},
                {"id": 5, "code": "SPECIAL", "name": "Special Services"},
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# =============== INBOUND TARIF ENDPOINTS ===============

@router.post("/inbound-tarif/create")
async def create_inbound_tarif(tarif: InboundTarifCreate):
    """Create inbound tarif for customer"""
    try:
        # TODO: Save to database
        return {
            "status": "success",
            "message": "Inbound tarif created",
            "data": {
                "id": 1,
                **tarif.dict()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/inbound-tarif/{customer_id}")
async def get_inbound_tarif(customer_id: int):
    """Get inbound tarif for customer"""
    try:
        # TODO: Fetch from database
        return {
            "status": "success",
            "data": {
                "id": 1,
                "customer_id": customer_id,
                "per_pallet": 1000,
                "per_carton": 150,
                "per_item": 50,
                "per_kg": 20,
                "per_m3": 5000,
                "minimum_charge": 500,
                "qc_required": True,
                "qc_fee": 500
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/inbound-tarif/{tarif_id}")
async def update_inbound_tarif(tarif_id: int, tarif: InboundTarifCreate):
    """Update inbound tarif"""
    try:
        # TODO: Update database
        return {
            "status": "success",
            "message": "Inbound tarif updated",
            "data": {
                "id": tarif_id,
                **tarif.dict()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# =============== STORAGE TARIF ENDPOINTS ===============

@router.post("/storage-tarif/create")
async def create_storage_tarif(tarif: StorageTarifCreate):
    """Create storage tarif for customer"""
    try:
        # TODO: Save to database
        return {
            "status": "success",
            "message": "Storage tarif created",
            "data": {
                "id": 1,
                **tarif.dict()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/storage-tarif/{customer_id}")
async def get_storage_tarif(customer_id: int):
    """Get storage tarif for customer"""
    try:
        # TODO: Fetch from database
        return {
            "status": "success",
            "data": {
                "id": 1,
                "customer_id": customer_id,
                "per_pallet_day": 50,
                "per_m3_day": 200,
                "per_item_month": 10,
                "per_pallet_month": 1000,
                "per_m3_month": 4000,
                "monthly_minimum": 1000,
                "free_storage_days": 3
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/storage-tarif/{tarif_id}")
async def update_storage_tarif(tarif_id: int, tarif: StorageTarifCreate):
    """Update storage tarif"""
    try:
        # TODO: Update database
        return {
            "status": "success",
            "message": "Storage tarif updated",
            "data": {
                "id": tarif_id,
                **tarif.dict()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# =============== OUTBOUND TARIF ENDPOINTS ===============

@router.post("/outbound-tarif/create")
async def create_outbound_tarif(tarif: OutboundTarifCreate):
    """Create outbound tarif for customer"""
    try:
        # TODO: Save to database
        return {
            "status": "success",
            "message": "Outbound tarif created",
            "data": {
                "id": 1,
                **tarif.dict()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/outbound-tarif/{customer_id}")
async def get_outbound_tarif(customer_id: int):
    """Get outbound tarif for customer"""
    try:
        # TODO: Fetch from database
        return {
            "status": "success",
            "data": {
                "id": 1,
                "customer_id": customer_id,
                "per_order": 200,
                "per_item": 50,
                "per_box": 100,
                "per_pallet": 1000,
                "minimum_charge": 500,
                "hazmat_fee": 2000,
                "fragile_fee": 500
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# =============== VALUE ADDED SERVICES ENDPOINTS ===============

@router.post("/vas/create")
async def create_vas(vas: VASCreate):
    """Create value added service pricing"""
    try:
        # TODO: Save to database
        return {
            "status": "success",
            "message": "VAS created",
            "data": {
                "id": 1,
                **vas.dict()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/vas/list/{customer_id}")
async def list_vas(customer_id: int):
    """List VAS for customer"""
    try:
        # TODO: Fetch from database
        return {
            "status": "success",
            "data": [
                {"id": 1, "service_code": "LABELING", "service_name": "Labeling", "rate": 10, "unit": "PER_ITEM"},
                {"id": 2, "service_code": "RELABEL", "service_name": "Relabeling", "rate": 15, "unit": "PER_ITEM"},
                {"id": 3, "service_code": "REPACK", "service_name": "Repacking", "rate": 50, "unit": "PER_ITEM"},
                {"id": 4, "service_code": "QC", "service_name": "Quality Check", "rate": 5, "unit": "PER_ITEM"},
                {"id": 5, "service_code": "CONSOLIDATION", "service_name": "Consolidation", "rate": 200, "unit": "PER_ORDER"},
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# =============== BILLING CALCULATION ENDPOINTS ===============

@router.post("/billing/calculate")
async def calculate_billing(calculation: BillingCalculationCreate):
    """Calculate billing for period"""
    try:
        customer_id = calculation.customer_id
        period_start = calculation.period_start
        period_end = calculation.period_end
        
        # TODO: Calculate inbound charges
        # TODO: Calculate storage charges
        # TODO: Calculate outbound charges
        # TODO: Calculate VAS charges
        # TODO: Calculate special services
        # TODO: Generate invoice
        
        return {
            "status": "success",
            "message": "Billing calculated",
            "data": {
                "id": 1,
                "customer_id": customer_id,
                "period_start": period_start,
                "period_end": period_end,
                "inbound_charges": 5000,
                "storage_charges": 10000,
                "outbound_charges": 8000,
                "vas_charges": 2000,
                "special_charges": 1000,
                "subtotal": 26000,
                "tax": 1820,  # 7% VAT
                "total": 27820
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# =============== INVOICE ENDPOINTS ===============

@router.post("/invoice/create")
async def create_invoice(invoice: InvoiceCreate):
    """Create invoice"""
    try:
        # TODO: Save to database
        return {
            "status": "success",
            "message": "Invoice created",
            "data": {
                "id": 1,
                "invoice_number": "INV-2026-0001",
                "customer_id": invoice.customer_id,
                "invoice_date": datetime.now(),
                "period_start": invoice.period_start,
                "period_end": invoice.period_end,
                "subtotal": 0,
                "tax_amount": 0,
                "total_amount": 0,
                "status": "DRAFT"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/invoice/{invoice_id}")
async def get_invoice(invoice_id: int):
    """Get invoice details"""
    try:
        # TODO: Fetch from database
        return {
            "status": "success",
            "data": {
                "id": invoice_id,
                "invoice_number": "INV-2026-0001",
                "customer_id": 1,
                "invoice_date": datetime.now(),
                "period_start": "2026-03-01",
                "period_end": "2026-03-31",
                "subtotal": 26000,
                "tax_percentage": 7,
                "tax_amount": 1820,
                "total_amount": 27820,
                "status": "PENDING",
                "due_date": "2026-04-15"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/invoice/{invoice_id}/items")
async def get_invoice_items(invoice_id: int):
    """Get invoice line items"""
    try:
        # TODO: Fetch from database
        return {
            "status": "success",
            "data": [
                {
                    "line_number": 1,
                    "service_type": "INBOUND",
                    "description": "Receiving - 100 pallets",
                    "quantity": 100,
                    "unit": "PALLET",
                    "rate": 1000,
                    "line_amount": 100000
                },
                {
                    "line_number": 2,
                    "service_type": "STORAGE",
                    "description": "Storage - 50 pallets x 30 days",
                    "quantity": 50,
                    "unit": "PALLET",
                    "rate": 30,
                    "line_amount": 1500
                },
                {
                    "line_number": 3,
                    "service_type": "OUTBOUND",
                    "description": "Shipping - 80 pallets",
                    "quantity": 80,
                    "unit": "PALLET",
                    "rate": 1000,
                    "line_amount": 80000
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/invoice/{invoice_id}/finalize")
async def finalize_invoice(invoice_id: int):
    """Finalize invoice (convert from DRAFT to FINALIZED)"""
    try:
        # TODO: Update database
        return {
            "status": "success",
            "message": "Invoice finalized",
            "data": {
                "id": invoice_id,
                "status": "FINALIZED"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# =============== PAYMENT ENDPOINTS ===============

@router.post("/payment/create")
async def record_payment(payment: PaymentCreate):
    """Record payment"""
    try:
        # TODO: Save to database
        # TODO: Update invoice status if fully paid
        return {
            "status": "success",
            "message": "Payment recorded",
            "data": {
                "id": 1,
                "invoice_id": payment.invoice_id,
                "customer_id": payment.customer_id,
                "payment_date": datetime.now(),
                "amount": payment.amount,
                "payment_method": payment.payment_method,
                "reference_number": payment.reference_number,
                "status": "RECORDED"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/invoice/{invoice_id}/payments")
async def get_invoice_payments(invoice_id: int):
    """Get payments for invoice"""
    try:
        # TODO: Fetch from database
        return {
            "status": "success",
            "data": [
                {
                    "id": 1,
                    "invoice_id": invoice_id,
                    "payment_date": "2026-04-10",
                    "amount": 27820,
                    "payment_method": "BANK_TRANSFER",
                    "reference_number": "SLIP-123456"
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# =============== REPORTS ENDPOINTS ===============

@router.get("/reports/customer-invoices/{customer_id}")
async def get_customer_invoices(customer_id: int, 
                                skip: int = Query(0), 
                                limit: int = Query(12)):
    """Get invoices for customer"""
    try:
        # TODO: Fetch from database
        return {
            "status": "success",
            "data": [
                {
                    "id": 1,
                    "invoice_number": "INV-2026-0001",
                    "invoice_date": "2026-03-31",
                    "period": "2026-03-01 to 2026-03-31",
                    "total_amount": 27820,
                    "status": "PAID"
                },
                {
                    "id": 2,
                    "invoice_number": "INV-2026-0002",
                    "invoice_date": "2026-04-30",
                    "period": "2026-04-01 to 2026-04-30",
                    "total_amount": 31250,
                    "status": "PENDING"
                }
            ],
            "total": 2
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/reports/aging")
async def get_aging_report(days: int = Query(30)):
    """Get invoice aging report"""
    try:
        # TODO: Fetch from database
        return {
            "status": "success",
            "data": {
                "current": {
                    "count": 10,
                    "amount": 150000
                },
                f"overdue_{days}_days": {
                    "count": 5,
                    "amount": 75000
                },
                f"overdue_{days*2}_days": {
                    "count": 2,
                    "amount": 30000
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/reports/revenue")
async def get_revenue_report(start_date: str, end_date: str):
    """Get revenue report for period"""
    try:
        # TODO: Fetch from database
        return {
            "status": "success",
            "data": {
                "period": f"{start_date} to {end_date}",
                "inbound_revenue": 150000,
                "storage_revenue": 250000,
                "outbound_revenue": 200000,
                "vas_revenue": 50000,
                "special_revenue": 30000,
                "total_revenue": 680000
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# =============== REGISTER ROUTER ===============
# In main.py: app.include_router(router)
