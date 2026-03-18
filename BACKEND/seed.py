#!/usr/bin/env python3
"""Seed initial data for Samila WMS 3PL"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from wms_database_schema import (
    Base, engine, SessionLocal, Warehouse, Location,
    Customer, Product, Inventory
)
from auth import User, hash_password


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _seed_users(db)
        _seed_warehouses(db)
        _seed_customers(db)
        _seed_products(db)
        db.commit()
        print("✅ Seed data complete")
    except Exception as e:
        db.rollback()
        print(f"⚠️  Seed warning: {e}")
    finally:
        db.close()


def _all_menus():
    keys = [
        'dashboard','receiving','inventory','product','picking','putaway',
        'shipping','tarif','customer','reports','kpi','mobile',
        'users','warehouse-setting','user-limit','settings'
    ]
    return {k: True for k in keys}


def _seed_users(db):
    if db.query(User).count() > 0:
        return
    all_m = _all_menus()
    users = [
        User(username='superadmin', name='Samila Super Admin', email='superadmin@samila.th',
             hashed_password=hash_password(os.getenv('REACT_APP_SA_PASS', 'Super@2026')),
             role='superadmin', warehouses=['All'], menus=all_m, status='active'),
        User(username='admin', name='สมชาย ใจดี', email='somchai@samila.th',
             hashed_password=hash_password(os.getenv('REACT_APP_ADMIN_PASS', 'admin123')),
             role='admin', warehouses=['All'], menus=all_m, status='active'),
        User(username='manager', name='สุภาพร รักงาน', email='supaporn@samila.th',
             hashed_password=hash_password(os.getenv('REACT_APP_MGR_PASS', 'manager123')),
             role='manager', warehouses=['Warehouse Bangkok'],
             menus={**all_m, 'user-limit': False, 'settings': False}, status='active'),
        User(username='operator', name='ปรีชา เก่งกาจ', email='preecha@samila.th',
             hashed_password=hash_password(os.getenv('REACT_APP_OPR_PASS', 'Opr@2026')),
             role='operator', warehouses=['Warehouse Nonthaburi'],
             menus={**all_m, 'users': False, 'reports': False, 'kpi': False, 'settings': False},
             status='active'),
        User(username='worker', name='มือถือ Worker', email='worker@samila.th',
             hashed_password=hash_password('Worker@2026'),
             role='worker', warehouses=['All'],
             menus={'mobile': True, 'dashboard': True},
             status='active'),
    ]
    db.add_all(users)
    db.flush()
    print(f"  → {len(users)} users seeded")


def _seed_warehouses(db):
    if db.query(Warehouse).count() > 0:
        return
    warehouses = [
        Warehouse(code='WH-BKK', name_en='Warehouse Bangkok',   name_th='คลังกรุงเทพฯ',  city='กรุงเทพฯ (ลาดกระบัง)', is_active=True),
        Warehouse(code='WH-NTB', name_en='Warehouse Nonthaburi',name_th='คลังนนทบุรี',    city='นนทบุรี (บางใหญ่)',     is_active=True),
        Warehouse(code='WH-PTN', name_en='Warehouse Pathum Thani',name_th='คลังปทุมธานี', city='ปทุมธานี (คลองหลวง)',   is_active=True),
        Warehouse(code='WH-CNX', name_en='Warehouse Chiang Mai', name_th='คลังเชียงใหม่', city='เชียงใหม่ (สันกำแพง)', is_active=True),
    ]
    db.add_all(warehouses)
    db.flush()
    # Seed locations for first warehouse
    for wh in warehouses[:1]:
        for zone in ['A', 'B', 'C']:
            for aisle in ['01', '02', '03']:
                for shelf in ['1', '2', '3']:
                    for bin_ in ['A', 'B']:
                        loc = Location(
                            warehouse_id=wh.id,
                            code=f"{zone}-{aisle}-{shelf}-{bin_}",
                            zone=zone, aisle=aisle, shelf=shelf, bin=bin_,
                            location_type='SHELF', is_active=True,
                        )
                        db.add(loc)
    db.flush()
    print(f"  → {len(warehouses)} warehouses seeded")


def _seed_customers(db):
    if db.query(Customer).count() > 0:
        return
    customers = [
        Customer(code='CUST-001', name_en='Nayong Hospital',   name_th='โรงพยาบาลนายง',    email='purchase@nayong.th', phone='074-123-456', is_active=True),
        Customer(code='CUST-002', name_en='ThaiBev Co.',        name_th='ไทยเบฟเวอเรจ',     email='wms@thaibev.th',     phone='02-123-4567', is_active=True),
        Customer(code='CUST-003', name_en='SCG Logistics',      name_th='เอสซีจี โลจิสติกส์',email='wms@scg.th',         phone='02-234-5678', is_active=True),
        Customer(code='CUST-004', name_en='Central Retail',     name_th='เซ็นทรัล รีเทล',  email='wms@central.th',     phone='02-345-6789', is_active=True),
    ]
    db.add_all(customers)
    db.flush()
    print(f"  → {len(customers)} customers seeded")


def _seed_products(db):
    if db.query(Product).count() > 0:
        return
    products = [
        Product(sku='SKU-001', barcode='8850000001', name_en='Medical Gloves L',    name_th='ถุงมือแพทย์ L',      category='Medical',  unit='PCS', reorder_level=100, is_active=True),
        Product(sku='SKU-002', barcode='8850000002', name_en='Surgical Mask Box',   name_th='หน้ากากอนามัย กล่อง',category='Medical',  unit='BOX', reorder_level=50,  is_active=True),
        Product(sku='SKU-003', barcode='8850000003', name_en='Disinfectant 5L',      name_th='น้ำยาฆ่าเชื้อ 5ล',  category='Cleaning', unit='BTL', reorder_level=20,  is_active=True),
        Product(sku='SKU-004', barcode='8850000004', name_en='IV Fluid 500ml',       name_th='น้ำเกลือ 500มล',    category='Medical',  unit='BAG', reorder_level=200, is_active=True),
        Product(sku='SKU-005', barcode='8850000005', name_en='Alcohol 70% 1L',       name_th='แอลกอฮอล์ 70% 1ล',  category='Cleaning', unit='BTL', reorder_level=30,  is_active=True),
    ]
    db.add_all(products)
    db.flush()
    print(f"  → {len(products)} products seeded")


if __name__ == "__main__":
    seed()
