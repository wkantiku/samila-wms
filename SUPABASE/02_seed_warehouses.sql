-- ══════════════════════════════════════════════════════════════
--  SAMILA WMS 3PL — Warehouse Seed + RLS Fix
--  วิธีใช้: Supabase Dashboard → SQL Editor → วาง SQL นี้ → Run
--  ทำครั้งเดียว หรือรันซ้ำได้ (ON CONFLICT DO NOTHING)
-- ══════════════════════════════════════════════════════════════

-- ── 1. Allow anon read on warehouses ─────────────────────────
--  จำเป็นเมื่อ user login ด้วย username (local fallback)
--  แทนที่จะ login ผ่าน Supabase email auth
--  warehouse name ไม่ใช่ข้อมูลลับ จึง allow anon read ได้
DROP POLICY IF EXISTS "Allow anon read warehouses" ON warehouses;
CREATE POLICY "Allow anon read warehouses"
  ON warehouses FOR SELECT TO anon USING (true);

-- ── 2. Seed demo warehouses ───────────────────────────────────
INSERT INTO warehouses (code, name_en, name_th, city, icon, company_no, is_active, wh_type, zones, staff)
VALUES
  ('WH-BKK', 'Warehouse Bangkok',      'คลังกรุงเทพฯ (ลาดกระบัง)',  'กรุงเทพฯ (ลาดกระบัง)', '🏙️', 'COMP-001', true,  'General', 6, 20),
  ('WH-NTB', 'Warehouse Nonthaburi',   'คลังนนทบุรี (บางใหญ่)',       'นนทบุรี (บางใหญ่)',     '🏭', 'COMP-001', true,  'General', 4, 12),
  ('WH-PTN', 'Warehouse Pathum Thani', 'คลังปทุมธานี (คลองหลวง)',     'ปทุมธานี (คลองหลวง)',   '🌿', 'COMP-001', true,  'General', 4, 10),
  ('WH-TRG', 'Warehouse Trang',        'คลังตรัง',                    'ตรัง',                  '🏥', 'COMP-001', true,  'Medical', 5, 10),
  ('WH-CNX', 'Warehouse Chiang Mai',   'คลังเชียงใหม่ (สันกำแพง)',    'เชียงใหม่ (สันกำแพง)', '⛰️', 'COMP-001', true,  'General', 3, 8),
  ('WH-HYD', 'Warehouse Hat Yai',      'คลังหาดใหญ่',                 'สงขลา (หาดใหญ่)',       '🌊', 'COMP-001', false, 'General', 2, 0)
ON CONFLICT (code) DO NOTHING;

-- ── 3. Update WH-001 (seeded in 01_schema.sql) ───────────────
UPDATE warehouses
SET icon = '🏥', company_no = 'COMP-001', wh_type = 'Medical', zones = 5, staff = 10
WHERE code = 'WH-001';

-- ── ตรวจสอบผล ─────────────────────────────────────────────────
SELECT id, code, name_en, city, icon, company_no, is_active FROM warehouses ORDER BY id;
