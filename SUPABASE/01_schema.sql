-- ══════════════════════════════════════════════════════════════
--  SAMILA WMS 3PL — Supabase PostgreSQL Schema
--  วิธีใช้: ไปที่ Supabase Dashboard → SQL Editor → วาง SQL นี้ → Run
-- ══════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS (ใช้ร่วมกับ Supabase Auth) ─────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  auth_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username      VARCHAR(50) UNIQUE NOT NULL,
  email         VARCHAR(100) UNIQUE,
  name          VARCHAR(100) NOT NULL,
  role          VARCHAR(50) DEFAULT 'operator',
  warehouses    JSONB DEFAULT '[]',
  menus         JSONB DEFAULT '{}',
  status        VARCHAR(20) DEFAULT 'active',
  company_no    VARCHAR(50),
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── SUPPLIERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id             SERIAL PRIMARY KEY,
  code           VARCHAR(50) UNIQUE NOT NULL,
  name_en        VARCHAR(255) NOT NULL,
  name_th        VARCHAR(255) NOT NULL,
  contact_person VARCHAR(100),
  email          VARCHAR(100),
  phone          VARCHAR(20),
  address        TEXT,
  city           VARCHAR(100),
  postal_code    VARCHAR(10),
  tax_id         VARCHAR(20),
  payment_terms  VARCHAR(50),
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── CUSTOMERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id             SERIAL PRIMARY KEY,
  code           VARCHAR(50) UNIQUE NOT NULL,
  name_en        VARCHAR(255) NOT NULL,
  name_th        VARCHAR(255) NOT NULL,
  contact_person VARCHAR(100),
  email          VARCHAR(100),
  phone          VARCHAR(20),
  address        TEXT,
  city           VARCHAR(100),
  postal_code    VARCHAR(10),
  tax_id         VARCHAR(20),
  credit_limit   FLOAT DEFAULT 0,
  payment_terms  VARCHAR(50),
  logo           TEXT,
  credit_days    INTEGER DEFAULT 30,
  company_no     VARCHAR(50),
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── WAREHOUSES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS warehouses (
  id                  SERIAL PRIMARY KEY,
  code                VARCHAR(50) UNIQUE NOT NULL,
  name_en             VARCHAR(255) NOT NULL,
  name_th             VARCHAR(255) NOT NULL,
  address             TEXT,
  city                VARCHAR(100),
  phone               VARCHAR(20),
  manager_name        VARCHAR(100),
  total_capacity      FLOAT,
  used_sqm            FLOAT DEFAULT 0,
  max_pallet_capacity INTEGER,
  zones               INTEGER DEFAULT 0,
  staff               INTEGER DEFAULT 0,
  wh_type             VARCHAR(100) DEFAULT 'General',
  icon                VARCHAR(10) DEFAULT '🏭',
  company_no          VARCHAR(50) DEFAULT 'COMP-001',
  is_active           BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── LOCATIONS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS locations (
  id            SERIAL PRIMARY KEY,
  warehouse_id  INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
  code          VARCHAR(50) UNIQUE NOT NULL,
  zone          VARCHAR(10),
  aisle         VARCHAR(10),
  shelf         VARCHAR(10),
  bin           VARCHAR(10),
  capacity      FLOAT,
  location_type VARCHAR(50),
  is_active     BOOLEAN DEFAULT TRUE
);

-- ── PRODUCTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id               SERIAL PRIMARY KEY,
  sku              VARCHAR(50) UNIQUE NOT NULL,
  barcode          VARCHAR(50) UNIQUE,
  name_en          VARCHAR(255) NOT NULL,
  name_th          VARCHAR(255) NOT NULL,
  description      TEXT,
  category         VARCHAR(100),
  unit             VARCHAR(20),
  weight_kg        FLOAT,
  volume_m3        FLOAT,
  reorder_level    INTEGER,
  max_stock_level  INTEGER,
  lead_time_days   INTEGER,
  price            NUMERIC(12,2),
  lot_number       VARCHAR(50),
  manufacture_date DATE,
  expiry_date      DATE,
  supplier_id      INTEGER REFERENCES suppliers(id),
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── PURCHASE ORDERS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_orders (
  id                     SERIAL PRIMARY KEY,
  supplier_id            INTEGER REFERENCES suppliers(id),
  po_number              VARCHAR(50) UNIQUE NOT NULL,
  po_date                TIMESTAMPTZ NOT NULL,
  expected_delivery_date TIMESTAMPTZ,
  total_items            INTEGER,
  total_amount           NUMERIC(12,2),
  status                 VARCHAR(50) DEFAULT 'PENDING',
  remarks                TEXT,
  created_by             VARCHAR(100),
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id               SERIAL PRIMARY KEY,
  po_id            INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id       INTEGER REFERENCES products(id),
  line_number      INTEGER,
  quantity_ordered FLOAT NOT NULL,
  unit_price       NUMERIC(12,2),
  line_amount      NUMERIC(12,2)
);

-- ── RECEIVING ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS receiving_orders (
  id                   SERIAL PRIMARY KEY,
  po_id                INTEGER REFERENCES purchase_orders(id),
  warehouse_id         INTEGER REFERENCES warehouses(id),
  gr_number            VARCHAR(50) UNIQUE NOT NULL,
  gr_date              TIMESTAMPTZ NOT NULL,
  total_items_received INTEGER,
  total_pallets        INTEGER,
  receiver_name        VARCHAR(100),
  receiver_phone       VARCHAR(20),
  remarks              TEXT,
  status               VARCHAR(50) DEFAULT 'RECEIVING',
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS receiving_items (
  id                 SERIAL PRIMARY KEY,
  gr_id              INTEGER REFERENCES receiving_orders(id) ON DELETE CASCADE,
  product_id         INTEGER REFERENCES products(id),
  barcode            VARCHAR(50),
  quantity_received  FLOAT NOT NULL,
  quantity_accepted  FLOAT,
  quantity_rejected  FLOAT DEFAULT 0,
  rejection_reason   VARCHAR(255),
  location_id        INTEGER REFERENCES locations(id),
  serial_number      VARCHAR(50),
  batch_number       VARCHAR(50),
  lot_number         VARCHAR(50),
  manufacture_date   DATE,
  expiry_date        DATE,
  qc_status          VARCHAR(50),
  qc_date            TIMESTAMPTZ,
  qc_by              VARCHAR(100),
  received_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── INVENTORY ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory (
  id                 SERIAL PRIMARY KEY,
  warehouse_id       INTEGER REFERENCES warehouses(id),
  location_id        INTEGER REFERENCES locations(id),
  product_id         INTEGER REFERENCES products(id) NOT NULL,
  batch_number       VARCHAR(50),
  lot_number         VARCHAR(50),
  serial_number      VARCHAR(50),
  quantity_on_hand   FLOAT DEFAULT 0,
  quantity_reserved  FLOAT DEFAULT 0,
  quantity_available FLOAT DEFAULT 0,
  customer           VARCHAR(255),
  received_date      TIMESTAMPTZ,
  manufacture_date   DATE,
  expiry_date        DATE,
  last_count_date    TIMESTAMPTZ,
  status             VARCHAR(50) DEFAULT 'GOOD',
  last_updated       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id               SERIAL PRIMARY KEY,
  inventory_id     INTEGER REFERENCES inventory(id),
  warehouse_id     INTEGER REFERENCES warehouses(id),
  location_from    INTEGER REFERENCES locations(id),
  location_to      INTEGER REFERENCES locations(id),
  movement_type    VARCHAR(50),
  quantity         FLOAT NOT NULL,
  reference_number VARCHAR(50),
  reference_type   VARCHAR(50),
  movement_date    TIMESTAMPTZ NOT NULL,
  moved_by         VARCHAR(100),
  remarks          TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── STOCK COUNT ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_counts (
  id                SERIAL PRIMARY KEY,
  warehouse_id      INTEGER REFERENCES warehouses(id),
  count_number      VARCHAR(50) UNIQUE NOT NULL,
  count_date        TIMESTAMPTZ NOT NULL,
  location_id       INTEGER REFERENCES locations(id),
  product_id        INTEGER REFERENCES products(id),
  count_type        VARCHAR(50),
  system_quantity   FLOAT,
  physical_quantity FLOAT,
  variance          FLOAT,
  counted_by        VARCHAR(100),
  verified_by       VARCHAR(100),
  status            VARCHAR(50),
  remarks           TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── SALES ORDERS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales_orders (
  id                       SERIAL PRIMARY KEY,
  customer_id              INTEGER REFERENCES customers(id),
  warehouse_id             INTEGER REFERENCES warehouses(id),
  so_number                VARCHAR(50) UNIQUE NOT NULL,
  so_date                  TIMESTAMPTZ NOT NULL,
  requested_delivery_date  TIMESTAMPTZ,
  total_items              INTEGER,
  total_amount             NUMERIC(12,2),
  status                   VARCHAR(50) DEFAULT 'NEW',
  priority                 VARCHAR(50),
  delivery_address         TEXT,
  remarks                  TEXT,
  created_by               VARCHAR(100),
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_order_items (
  id                 SERIAL PRIMARY KEY,
  so_id              INTEGER REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id         INTEGER REFERENCES products(id),
  product_name       VARCHAR(255),
  unit               VARCHAR(20) DEFAULT 'PCS',
  line_number        INTEGER,
  quantity_ordered   FLOAT NOT NULL,
  quantity_allocated FLOAT DEFAULT 0,
  quantity_picked    FLOAT DEFAULT 0,
  quantity_shipped   FLOAT DEFAULT 0,
  unit_price         NUMERIC(12,2),
  line_amount        NUMERIC(12,2)
);

-- ── PICKING ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS picking_lists (
  id              SERIAL PRIMARY KEY,
  so_id           INTEGER REFERENCES sales_orders(id),
  warehouse_id    INTEGER REFERENCES warehouses(id),
  pick_number     VARCHAR(50) UNIQUE NOT NULL,
  pick_date       TIMESTAMPTZ NOT NULL,
  customer_name   VARCHAR(255),
  total_items     INTEGER,
  status          VARCHAR(50) DEFAULT 'PENDING',
  picked_by       VARCHAR(100),
  verified_by     VARCHAR(100),
  created_by      VARCHAR(100),
  completed_at    TIMESTAMPTZ,
  pick_start_time TIMESTAMPTZ,
  pick_end_time   TIMESTAMPTZ,
  remarks         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS picking_items (
  id               SERIAL PRIMARY KEY,
  pick_id          INTEGER REFERENCES picking_lists(id) ON DELETE CASCADE,
  product_id       INTEGER REFERENCES products(id),
  product_name     VARCHAR(255),
  from_location    VARCHAR(100),
  unit             VARCHAR(20) DEFAULT 'PCS',
  lot_number       VARCHAR(50),
  location_id      INTEGER REFERENCES locations(id),
  batch_number     VARCHAR(50),
  serial_number    VARCHAR(50),
  barcode          VARCHAR(50),
  quantity_to_pick FLOAT NOT NULL,
  quantity_picked  FLOAT DEFAULT 0,
  pick_status      VARCHAR(50) DEFAULT 'PENDING',
  picked_at        TIMESTAMPTZ,
  verified_at      TIMESTAMPTZ
);

-- ── PACKING ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS packing_orders (
  id            SERIAL PRIMARY KEY,
  pick_id       INTEGER REFERENCES picking_lists(id),
  so_id         INTEGER REFERENCES sales_orders(id),
  warehouse_id  INTEGER REFERENCES warehouses(id),
  pack_number   VARCHAR(50) UNIQUE NOT NULL,
  pack_date     TIMESTAMPTZ NOT NULL,
  customer_name VARCHAR(255),
  total_items   INTEGER DEFAULT 0,
  total_boxes   INTEGER DEFAULT 0,
  status        VARCHAR(50) DEFAULT 'PENDING',
  packed_by     VARCHAR(100),
  verified_by   VARCHAR(100),
  created_by    VARCHAR(100),
  completed_at  TIMESTAMPTZ,
  remarks       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS packing_items (
  id               SERIAL PRIMARY KEY,
  pack_id          INTEGER REFERENCES packing_orders(id) ON DELETE CASCADE,
  product_id       INTEGER REFERENCES products(id),
  product_name     VARCHAR(255),
  sku              VARCHAR(50),
  barcode          VARCHAR(50),
  unit             VARCHAR(20) DEFAULT 'PCS',
  lot_number       VARCHAR(50),
  batch_number     VARCHAR(50),
  quantity_to_pack FLOAT NOT NULL,
  quantity_packed  FLOAT DEFAULT 0,
  box_number       VARCHAR(50),
  pack_status      VARCHAR(50) DEFAULT 'PENDING',
  packed_at        TIMESTAMPTZ
);

-- ── SHIPMENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shipment_orders (
  id               SERIAL PRIMARY KEY,
  so_id            INTEGER REFERENCES sales_orders(id),
  warehouse_id     INTEGER REFERENCES warehouses(id),
  shipment_number  VARCHAR(50) UNIQUE NOT NULL,
  shipment_date    TIMESTAMPTZ,
  carrier          VARCHAR(100),
  tracking_number  VARCHAR(50),
  vehicle_number   VARCHAR(50),
  driver_name      VARCHAR(100),
  driver_phone     VARCHAR(20),
  total_weight_kg  FLOAT,
  total_volume_m3  FLOAT,
  total_pallets    INTEGER,
  status           VARCHAR(50) DEFAULT 'PREPARED',
  delivery_date    TIMESTAMPTZ,
  delivery_address TEXT,
  delivery_contact VARCHAR(100),
  delivery_phone   VARCHAR(20),
  remarks          TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipment_items (
  id                  SERIAL PRIMARY KEY,
  shipment_id         INTEGER REFERENCES shipment_orders(id) ON DELETE CASCADE,
  product_id          INTEGER REFERENCES products(id),
  batch_number        VARCHAR(50),
  serial_number       VARCHAR(50),
  barcode             VARCHAR(50),
  quantity_shipped    FLOAT NOT NULL,
  quantity_delivered  FLOAT,
  quantity_returned   FLOAT DEFAULT 0,
  box_number          VARCHAR(50),
  pallet_number       VARCHAR(50)
);

-- ── RETURNS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS return_orders (
  id                 SERIAL PRIMARY KEY,
  customer_id        INTEGER REFERENCES customers(id),
  warehouse_id       INTEGER REFERENCES warehouses(id),
  return_number      VARCHAR(50) UNIQUE NOT NULL,
  return_date        TIMESTAMPTZ NOT NULL,
  original_so_number VARCHAR(50),
  total_items        INTEGER,
  reason             VARCHAR(255),
  status             VARCHAR(50),
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS return_items (
  id                   SERIAL PRIMARY KEY,
  return_id            INTEGER REFERENCES return_orders(id) ON DELETE CASCADE,
  product_id           INTEGER REFERENCES products(id),
  quantity_returned    FLOAT NOT NULL,
  condition            VARCHAR(50),
  qc_result            VARCHAR(50),
  restocking_location  INTEGER REFERENCES locations(id)
);

-- ── INVOICES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id              SERIAL PRIMARY KEY,
  customer_id     INTEGER REFERENCES customers(id),
  warehouse_id    INTEGER REFERENCES warehouses(id),
  invoice_number  VARCHAR(50) UNIQUE NOT NULL,
  invoice_date    TIMESTAMPTZ NOT NULL,
  period_start    TIMESTAMPTZ NOT NULL,
  period_end      TIMESTAMPTZ NOT NULL,
  subtotal        NUMERIC(12,2) NOT NULL,
  tax_percentage  FLOAT DEFAULT 7,
  tax_amount      NUMERIC(12,2) NOT NULL,
  total_amount    NUMERIC(12,2) NOT NULL,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  status          VARCHAR(50) DEFAULT 'PENDING',
  due_date        TIMESTAMPTZ,
  paid_date       TIMESTAMPTZ,
  remarks         TEXT,
  created_by      VARCHAR(100),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_line_items (
  id             SERIAL PRIMARY KEY,
  invoice_id     INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
  service_type   VARCHAR(50) NOT NULL,
  description    VARCHAR(500) NOT NULL,
  quantity       FLOAT NOT NULL,
  unit           VARCHAR(50) NOT NULL,
  rate           NUMERIC(12,2) NOT NULL,
  line_amount    NUMERIC(12,2) NOT NULL,
  reference_id   INTEGER,
  reference_type VARCHAR(50)
);

-- ── AUDIT & ACTIVITY ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER,
  user_name     VARCHAR(100),
  module        VARCHAR(50),
  action        VARCHAR(50),
  document_type VARCHAR(50),
  document_id   VARCHAR(50),
  old_value     JSONB,
  new_value     JSONB,
  remarks       TEXT,
  ip_address    VARCHAR(50),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_activities (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER,
  user_name       VARCHAR(100),
  device_type     VARCHAR(50),
  action          VARCHAR(100),
  document_number VARCHAR(50),
  location        VARCHAR(100),
  quantity        FLOAT,
  timestamp       TIMESTAMPTZ DEFAULT NOW()
);

-- ── SYSTEM CONFIG ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_config (
  id           SERIAL PRIMARY KEY,
  config_key   VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT,
  description  VARCHAR(500),
  is_active    BOOLEAN DEFAULT TRUE,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════════════════════
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE picking_lists      ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_orders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE receiving_orders   ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_counts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices           ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can read/write all
CREATE POLICY "Allow authenticated" ON users              FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated" ON customers          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated" ON warehouses         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated" ON products           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated" ON inventory          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated" ON sales_orders       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated" ON picking_lists      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated" ON shipment_orders    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated" ON receiving_orders   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated" ON stock_counts       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated" ON invoices           FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
--  SEED DATA เริ่มต้น
-- ══════════════════════════════════════════════════════════════
INSERT INTO warehouses (code, name_en, name_th, city, wh_type, total_capacity, zones, staff)
VALUES ('WH-001', 'Nayong Main Warehouse', 'คลังหลักโรงพยาบาลนายอง', 'Trang', 'Medical', 2000, 5, 10)
ON CONFLICT (code) DO NOTHING;

INSERT INTO system_config (config_key, config_value, description)
VALUES
  ('company_name',  'Samila Innovation Co., Ltd.', 'ชื่อบริษัท'),
  ('company_tax',   '0105560123456',               'เลขประจำตัวผู้เสียภาษี'),
  ('vat_rate',      '7',                           'อัตราภาษีมูลค่าเพิ่ม (%)'),
  ('default_currency', 'THB',                      'สกุลเงินหลัก')
ON CONFLICT (config_key) DO NOTHING;
