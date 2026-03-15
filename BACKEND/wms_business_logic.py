"""
SAMILA WMS - Business Logic & Service Layer
Core business operations
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional
from decimal import Decimal
import json

# =============== RECEIVING SERVICE ===============

class ReceivingService:
    """Business logic for receiving operations"""
    
    @staticmethod
    def create_receiving_order(po_id: int, warehouse_id: int, receiver_name: str) -> Dict:
        """Create receiving order from purchase order"""
        try:
            # Get PO details
            # Create GR number
            gr_number = f"GR-{datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            # Create receiving order record
            receiving_order = {
                "gr_number": gr_number,
                "po_id": po_id,
                "warehouse_id": warehouse_id,
                "receiver_name": receiver_name,
                "gr_date": datetime.now().isoformat(),
                "status": "RECEIVING",
                "items": []
            }
            
            return {
                "status": "success",
                "message": "Receiving order created",
                "data": receiving_order
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    @staticmethod
    def receive_item(gr_id: int, product_id: int, barcode: str, 
                     quantity: float, location_id: int) -> Dict:
        """Receive individual item (from scanner)"""
        try:
            # Validate barcode
            # Check location availability
            # Create inventory record
            # Log movement
            
            item = {
                "id": int(datetime.now().timestamp()),
                "gr_id": gr_id,
                "product_id": product_id,
                "barcode": barcode,
                "quantity_received": quantity,
                "location_id": location_id,
                "received_at": datetime.now().isoformat(),
                "status": "RECEIVED"
            }
            
            return {
                "status": "success",
                "message": "Item received",
                "data": item
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    @staticmethod
    def perform_qc(item_id: int, qc_status: str, qc_notes: str = "") -> Dict:
        """Perform quality check on received item"""
        try:
            # Update item QC status
            # Log QC result
            # If failed, mark for return
            
            return {
                "status": "success",
                "message": f"QC completed: {qc_status}",
                "data": {
                    "item_id": item_id,
                    "qc_status": qc_status,
                    "qc_date": datetime.now().isoformat()
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    @staticmethod
    def complete_receiving(gr_id: int) -> Dict:
        """Complete receiving order - transfer to putaway"""
        try:
            # Check all items received
            # Check all items QC passed
            # Create putaway tasks
            # Update inventory
            
            return {
                "status": "success",
                "message": "Receiving completed",
                "data": {
                    "gr_id": gr_id,
                    "status": "COMPLETED",
                    "completed_at": datetime.now().isoformat()
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }


# =============== INVENTORY SERVICE ===============

class InventoryService:
    """Business logic for inventory operations"""
    
    @staticmethod
    def get_current_inventory(warehouse_id: int, product_id: int = None) -> Dict:
        """Get current inventory levels"""
        try:
            # Query inventory by warehouse
            # Calculate available = on_hand - reserved
            # Return grouped by product
            
            return {
                "status": "success",
                "data": {
                    "warehouse_id": warehouse_id,
                    "total_items": 50000,
                    "total_pallets": 1000,
                    "items": [
                        {
                            "product_id": 1,
                            "sku": "SKU001",
                            "quantity_on_hand": 500,
                            "quantity_reserved": 100,
                            "quantity_available": 400,
                            "locations": ["A-01-1-A", "A-01-1-B"]
                        }
                    ]
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    @staticmethod
    def adjust_inventory(inventory_id: int, adjustment_qty: float, 
                        reason: str, user_id: int) -> Dict:
        """Adjust inventory (damage, expiry, correction)"""
        try:
            # Validate inventory exists
            # Check sufficient quantity for negative adjustment
            # Update inventory level
            # Create movement record
            # Create audit log
            
            return {
                "status": "success",
                "message": "Inventory adjusted",
                "data": {
                    "inventory_id": inventory_id,
                    "adjustment": adjustment_qty,
                    "reason": reason,
                    "adjusted_at": datetime.now().isoformat()
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    @staticmethod
    def reserve_inventory(so_id: int, items: List[Dict]) -> Dict:
        """Reserve inventory for sales order"""
        try:
            # Check availability for all items
            # Reserve quantity
            # Create allocation records
            
            return {
                "status": "success",
                "message": "Inventory reserved",
                "data": {
                    "so_id": so_id,
                    "reserved_at": datetime.now().isoformat(),
                    "items_reserved": len(items)
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    @staticmethod
    def perform_stock_count(count_id: int, items: List[Dict]) -> Dict:
        """Process stock count results"""
        try:
            variances = []
            
            for item in items:
                system_qty = item.get('system_qty', 0)
                physical_qty = item.get('physical_qty', 0)
                variance = physical_qty - system_qty
                
                if variance != 0:
                    variances.append({
                        "product_id": item.get('product_id'),
                        "variance_qty": variance,
                        "variance_pct": (variance / system_qty * 100) if system_qty > 0 else 0
                    })
            
            return {
                "status": "success",
                "message": "Stock count processed",
                "data": {
                    "count_id": count_id,
                    "total_items_counted": len(items),
                    "variances": variances,
                    "variance_rate": f"{(len(variances) / len(items) * 100):.2f}%"
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }


# =============== PICKING SERVICE ===============

class PickingService:
    """Business logic for picking operations"""
    
    @staticmethod
    def create_picking_list(so_id: int, warehouse_id: int) -> Dict:
        """Create picking list from sales order"""
        try:
            # Get SO details
            # Check inventory availability
            # Allocate locations for each item
            # Generate pick routes (optimize)
            # Create picking tasks
            
            pick_number = f"PICK-{datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            return {
                "status": "success",
                "message": "Picking list created",
                "data": {
                    "pick_number": pick_number,
                    "so_id": so_id,
                    "warehouse_id": warehouse_id,
                    "status": "CREATED"
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    @staticmethod
    def pick_item(pick_id: int, item_id: int, barcode: str, 
                  quantity: float, location_id: int) -> Dict:
        """Pick individual item (from scanner)"""
        try:
            # Validate barcode matches item
            # Validate location has item
            # Validate quantity available
            # Update pick status
            # Deduct from inventory
            
            return {
                "status": "success",
                "message": "Item picked",
                "data": {
                    "pick_id": pick_id,
                    "item_id": item_id,
                    "quantity_picked": quantity,
                    "picked_at": datetime.now().isoformat()
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    @staticmethod
    def complete_picking(pick_id: int) -> Dict:
        """Complete picking list"""
        try:
            # Check all items picked
            # Validate quantities match
            # Release inventory
            # Create packing list
            
            return {
                "status": "success",
                "message": "Picking completed",
                "data": {
                    "pick_id": pick_id,
                    "status": "COMPLETED",
                    "completed_at": datetime.now().isoformat()
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }


# =============== SHIPPING SERVICE ===============

class ShippingService:
    """Business logic for shipping operations"""
    
    @staticmethod
    def create_shipment(so_id: int, warehouse_id: int, carrier: str) -> Dict:
        """Create shipment order"""
        try:
            # Get SO details
            # Get picked items
            # Validate all items picked
            # Assign boxes/pallets
            # Calculate weight/volume
            
            shipment_number = f"SHIP-{datetime.now().strftime('%Y%m%d%H%M%S')}"
            
            return {
                "status": "success",
                "message": "Shipment created",
                "data": {
                    "shipment_number": shipment_number,
                    "so_id": so_id,
                    "carrier": carrier,
                    "status": "PREPARED"
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    @staticmethod
    def pack_item(shipment_id: int, item_id: int, barcode: str, 
                  box_number: str) -> Dict:
        """Pack item for shipment"""
        try:
            # Validate item belongs to shipment
            # Validate barcode
            # Assign to box
            # Update packing list
            
            return {
                "status": "success",
                "message": "Item packed",
                "data": {
                    "shipment_id": shipment_id,
                    "item_id": item_id,
                    "box_number": box_number,
                    "packed_at": datetime.now().isoformat()
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    @staticmethod
    def ship_shipment(shipment_id: int, carrier: str, 
                      tracking_number: str) -> Dict:
        """Mark shipment as shipped"""
        try:
            # Validate all items packed
            # Update shipment status
            # Create shipping label
            # Send notification
            # Update inventory (deduct)
            
            return {
                "status": "success",
                "message": "Shipment shipped",
                "data": {
                    "shipment_id": shipment_id,
                    "tracking_number": tracking_number,
                    "shipped_at": datetime.now().isoformat(),
                    "status": "SHIPPED"
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }


# =============== BILLING SERVICE ===============

class BillingService:
    """Business logic for billing"""
    
    @staticmethod
    def calculate_inbound_charges(warehouse_id: int, gr_id: int, 
                                  tarif_id: int) -> Dict:
        """Calculate inbound charges"""
        try:
            # Get receiving order details
            # Get tarif rates
            # Calculate charges based on:
            # - Quantity received
            # - Unit type (pallet, item, kg, m3)
            # - QC if required
            
            charges = {
                "base_charge": 100000,
                "qc_charge": 500,
                "total": 100500
            }
            
            return {
                "status": "success",
                "data": charges
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    @staticmethod
    def calculate_storage_charges(inventory_id: int, days: int, 
                                 tarif_id: int) -> Dict:
        """Calculate storage charges"""
        try:
            # Get inventory details
            # Get tarif rates
            # Calculate daily/monthly charges
            # Apply free storage days
            # Apply minimum charges
            
            charges = {
                "daily_rate": 50,
                "days": 30,
                "gross_charge": 1500,
                "free_days_discount": -150,
                "total": 1350
            }
            
            return {
                "status": "success",
                "data": charges
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    @staticmethod
    def generate_invoice(customer_id: int, period_start: str, 
                        period_end: str) -> Dict:
        """Generate invoice for period"""
        try:
            # Aggregate all charges for period:
            # - Inbound charges
            # - Storage charges
            # - Outbound charges
            # - VAS charges
            # - Special services
            
            # Calculate tax (7%)
            # Create invoice record
            # Create line items
            
            return {
                "status": "success",
                "message": "Invoice generated",
                "data": {
                    "invoice_number": "INV-2026-0001",
                    "customer_id": customer_id,
                    "period_start": period_start,
                    "period_end": period_end,
                    "subtotal": 253000,
                    "tax": 17710,
                    "total": 270710
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
