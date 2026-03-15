"""
SAMILA WMS 3PL - Tarif & Billing Models
Database models for pricing and billing system
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean, Enum
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


# =============== TARIF MODELS ===============

class ServiceType(Base):
    """Service Types"""
    __tablename__ = 'service_types'
    
    id = Column(Integer, primary_key=True)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Example: 'INBOUND', 'STORAGE', 'OUTBOUND', 'LABELING', 'REPACKING'


class UnitOfMeasure(Base):
    """Units of Measure"""
    __tablename__ = 'units_of_measure'
    
    id = Column(Integer, primary_key=True)
    code = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(String(255))
    
    # Example: 'PCS' (piece), 'BOX', 'PALLET', 'KG', 'M3', 'DAY', 'MONTH'


class TarifMaster(Base):
    """Master Tarif Table"""
    __tablename__ = 'tarif_master'
    
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, nullable=False)  # If per-customer pricing
    service_type_id = Column(Integer, ForeignKey('service_types.id'), nullable=False)
    unit_id = Column(Integer, ForeignKey('units_of_measure.id'), nullable=False)
    
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Pricing
    rate = Column(Float, nullable=False)  # Amount per unit
    currency = Column(String(3), default='THB')
    
    # Effective Period
    effective_date = Column(DateTime, nullable=False)
    expiry_date = Column(DateTime)
    
    # Minimum & Maximum
    minimum_charge = Column(Float, default=0)
    maximum_charge = Column(Float)
    minimum_quantity = Column(Float)
    
    # Discount
    discount_percentage = Column(Float, default=0)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class InboundTarif(Base):
    """Inbound/Receiving Tarif"""
    __tablename__ = 'inbound_tarif'
    
    id = Column(Integer, primary_key=True)
    tarif_id = Column(Integer, ForeignKey('tarif_master.id'), nullable=False)
    customer_id = Column(Integer, nullable=False)
    
    # Rate per unit type
    per_pallet = Column(Float)  # บาท/พาเลท
    per_carton = Column(Float)  # บาท/ลัง
    per_item = Column(Float)    # บาท/ชิ้น
    per_kg = Column(Float)      # บาท/กิโลกรัม
    per_m3 = Column(Float)      # บาท/ลูกบาศก์เมตร
    
    # Minimum charge
    minimum_charge = Column(Float, default=500)
    
    # QC Fee
    qc_required = Column(Boolean, default=False)
    qc_fee = Column(Float, default=0)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class StorageTarif(Base):
    """Storage/Warehousing Tarif"""
    __tablename__ = 'storage_tarif'
    
    id = Column(Integer, primary_key=True)
    tarif_id = Column(Integer, ForeignKey('tarif_master.id'), nullable=False)
    customer_id = Column(Integer, nullable=False)
    
    # Daily rates
    per_pallet_day = Column(Float)      # บาท/พาเลท/วัน
    per_m3_day = Column(Float)          # บาท/ลูกบาศก์เมตร/วัน
    per_item_month = Column(Float)      # บาท/ชิ้น/เดือน
    
    # Monthly rates
    per_pallet_month = Column(Float)    # บาท/พาเลท/เดือน
    per_m3_month = Column(Float)        # บาท/ลูกบาศก์เมตร/เดือน
    
    # Minimums
    monthly_minimum = Column(Float, default=1000)
    
    # Free storage days
    free_storage_days = Column(Integer, default=0)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class OutboundTarif(Base):
    """Outbound/Shipping Tarif"""
    __tablename__ = 'outbound_tarif'
    
    id = Column(Integer, primary_key=True)
    tarif_id = Column(Integer, ForeignKey('tarif_master.id'), nullable=False)
    customer_id = Column(Integer, nullable=False)
    
    # Picking & Packing
    per_order = Column(Float)       # บาท/ใบสั่ง
    per_item = Column(Float)        # บาท/ชิ้น
    per_box = Column(Float)         # บาท/กล่อง
    per_pallet = Column(Float)      # บาท/พาเลท
    
    # Minimum charge
    minimum_charge = Column(Float, default=500)
    
    # Special handling
    hazmat_fee = Column(Float, default=0)
    fragile_fee = Column(Float, default=0)
    oversize_fee = Column(Float, default=0)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ValueAddedServicesTarif(Base):
    """Value Added Services Pricing"""
    __tablename__ = 'value_added_services_tarif'
    
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, nullable=False)
    
    service_code = Column(String(50), unique=True, nullable=False)
    service_name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Pricing
    rate = Column(Float, nullable=False)
    unit = Column(String(50))  # PER_ITEM, PER_BOX, PER_ORDER, etc
    
    # Example services:
    # LABELING, RELABELING, REPACKING, QC, CONSOLIDATION,
    # KITTING, ASSEMBLY, RETURNS, DOCUMENTATION
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class SpecialServicesTarif(Base):
    """Special Services (Cold Storage, Hazmat, etc)"""
    __tablename__ = 'special_services_tarif'
    
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, nullable=False)
    
    service_code = Column(String(50), unique=True, nullable=False)
    service_name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Pricing
    rate = Column(Float, nullable=False)
    unit = Column(String(50))  # PER_M3_DAY, PER_MONTH, PERCENTAGE, etc
    
    # Example services:
    # COLD_STORAGE, FROZEN_STORAGE, HAZMAT, TEMPERATURE_CONTROL
    # SECURITY, INSURANCE, CUSTOMS
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# =============== BILLING MODELS ===============

class Invoice(Base):
    """Invoice Header"""
    __tablename__ = 'invoices'
    
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, nullable=False)
    
    invoice_number = Column(String(50), unique=True, nullable=False)
    invoice_date = Column(DateTime, nullable=False)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    
    # Amounts
    subtotal = Column(Float, nullable=False)
    tax_percentage = Column(Float, default=7)  # Thailand VAT
    tax_amount = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    
    # Discount
    discount_amount = Column(Float, default=0)
    discount_reason = Column(String(255))
    
    # Status
    status = Column(String(50), default='PENDING')  # PENDING, PAID, OVERDUE, CANCELLED
    
    # Payment
    due_date = Column(DateTime)
    paid_date = Column(DateTime)
    
    # Notes
    remarks = Column(Text)
    
    created_by = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class InvoiceLineItem(Base):
    """Invoice Detail Lines"""
    __tablename__ = 'invoice_line_items'
    
    id = Column(Integer, primary_key=True)
    invoice_id = Column(Integer, ForeignKey('invoices.id'), nullable=False)
    
    line_number = Column(Integer, nullable=False)
    service_type = Column(String(100), nullable=False)  # INBOUND, STORAGE, OUTBOUND, etc
    description = Column(String(500), nullable=False)
    
    # Quantity & Rate
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)  # PCS, BOX, PALLET, KG, M3, DAY, MONTH
    rate = Column(Float, nullable=False)
    
    # Amount
    line_amount = Column(Float, nullable=False)
    
    # Reference
    receiving_id = Column(Integer)  # Reference to receiving order
    shipment_id = Column(Integer)   # Reference to shipment order
    service_date = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class BillingCalculation(Base):
    """Billing Calculation Records"""
    __tablename__ = 'billing_calculations'
    
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, nullable=False)
    invoice_id = Column(Integer, ForeignKey('invoices.id'))
    
    billing_date = Column(DateTime, nullable=False)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    
    # Inbound charges
    inbound_charges = Column(Float, default=0)
    inbound_items = Column(Integer, default=0)
    
    # Storage charges
    storage_charges = Column(Float, default=0)
    storage_days = Column(Integer, default=0)
    avg_inventory = Column(Float, default=0)
    
    # Outbound charges
    outbound_charges = Column(Float, default=0)
    outbound_items = Column(Integer, default=0)
    
    # Value added services
    vas_charges = Column(Float, default=0)
    
    # Special services
    special_charges = Column(Float, default=0)
    
    # Total
    subtotal = Column(Float, default=0)
    tax = Column(Float, default=0)
    total = Column(Float, default=0)
    
    status = Column(String(50), default='DRAFT')  # DRAFT, FINALIZED, INVOICED
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PaymentRecord(Base):
    """Payment Records"""
    __tablename__ = 'payment_records'
    
    id = Column(Integer, primary_key=True)
    invoice_id = Column(Integer, ForeignKey('invoices.id'), nullable=False)
    customer_id = Column(Integer, nullable=False)
    
    payment_date = Column(DateTime, nullable=False)
    amount = Column(Float, nullable=False)
    
    payment_method = Column(String(50))  # BANK_TRANSFER, CASH, CHEQUE, etc
    reference_number = Column(String(100))  # Bank slip, cheque number, etc
    
    remarks = Column(Text)
    received_by = Column(String(100))
    
    created_at = Column(DateTime, default=datetime.utcnow)


# =============== PRICING HISTORY ===============

class TarifHistory(Base):
    """Tarif Change History"""
    __tablename__ = 'tarif_history'
    
    id = Column(Integer, primary_key=True)
    tarif_id = Column(Integer, ForeignKey('tarif_master.id'), nullable=False)
    customer_id = Column(Integer, nullable=False)
    
    old_rate = Column(Float)
    new_rate = Column(Float, nullable=False)
    
    effective_date = Column(DateTime, nullable=False)
    change_reason = Column(String(255))
    changed_by = Column(String(100))
    
    created_at = Column(DateTime, default=datetime.utcnow)
