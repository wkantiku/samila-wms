import { useState, useEffect, useCallback } from 'react';
import { warehouseApi } from '../../services/api';
import '../Settings/SettingsModule.css';

const EMPTY_FORM = { name: '', code: '', province: '', address: '', type: 'General', zones: '', staff: '', icon: '🏭', capacity: '', active: true };

const getCompanyName = (compNo) => {
  try {
    const saved = localStorage.getItem('wms_sa_companies');
    if (saved) {
      const companies = JSON.parse(saved);
      const found = companies.find(c => c.companyNo === compNo);
      return found?.name || compNo;
    }
  } catch {}
  return compNo || '';
};

export default function WarehouseSettingModule({ currentUser }) {
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const companyNo = currentUser?.companyNo;

  const [whs, setWhs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const loadWhs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await warehouseApi.list();
      const all = data || [];
      setWhs(isSuperAdmin ? all : all.filter(w => w.companyNo === companyNo));
    } catch {
      setWhs([]);
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, companyNo]);

  useEffect(() => { loadWhs(); }, [loadWhs]);

  const openEdit = (wh) => {
    setForm({ ...wh, type: wh.type || wh.wh_type || 'General' });
    setEditId(wh.id);
    setError('');
    setShowModal(true);
  };

  const saveWh = async () => {
    if (!form.name.trim() || !form.code.trim()) { setError('กรุณากรอกชื่อและรหัส'); return; }
    try {
      const updated = await warehouseApi.update(editId, {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        province: form.province || '',
        address: form.address || '',
        icon: form.icon || '🏭',
        wh_type: form.type || 'General',
        zones: +form.zones || 0,
        staff: +form.staff || 0,
        capacity: +form.capacity || 0,
        active: form.active !== false,
      });
      setWhs(prev => prev.map(w => w.id === editId ? updated : w));
      setShowModal(false);
    } catch (e) { setError(e.message || 'บันทึกไม่สำเร็จ'); }
  };

  return (
    <div className="wms-module settings-module">
      <div className="module-header">
        <div className="header-left">
          <h1>🏭 Warehouse</h1>
          <p style={{ color: '#5a8fa8', fontSize: 13 }}>
            {isSuperAdmin
              ? `จัดการคลังสินค้าทั้งหมด (${whs.length} คลัง)`
              : `คลังสินค้าของ ${getCompanyName(companyNo)} (${whs.length} คลัง)`}
          </p>
        </div>
        {!isSuperAdmin && companyNo && (
          <div style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.25)', color: '#00E5FF', fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>
            {companyNo} — {getCompanyName(companyNo)}
          </div>
        )}
      </div>

      <div className="module-content">
        {!isSuperAdmin && (
          <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 8, background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.15)', color: '#5a8fa8', fontSize: 12 }}>
            🔒 สิทธิ์: ดูและแก้ไขข้อมูลคลังสินค้าเฉพาะของบริษัทคุณเท่านั้น — การสร้างหรือลบคลังสินค้าต้องผ่าน Super Admin
          </div>
        )}

        <div className="wh-grid">
          {loading && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#3a6a82', fontSize: 14 }}>
              กำลังโหลด...
            </div>
          )}
          {!loading && whs.map(wh => {
            const pct = wh.capacity > 0 ? Math.round(((wh.used || 0) / wh.capacity) * 100) : 0;
            const color = pct >= 85 ? '#FF6B6B' : pct >= 65 ? '#FFD700' : '#00CC88';
            return (
              <div key={wh.id} className={`wh-setting-card ${!wh.active ? 'wh-setting-inactive' : ''}`}>
                {!wh.active && <span className="wh-inactive-badge">INACTIVE</span>}
                <div style={{ marginBottom: 6 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: 'monospace', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)', color: '#FFD700' }}>
                    {wh.companyNo}
                  </span>
                  <span style={{ marginLeft: 6, fontSize: 11, color: '#5a8fa8' }}>{getCompanyName(wh.companyNo)}</span>
                </div>
                <div className="wh-card-header">
                  <span className="wh-card-icon">{wh.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="wh-name">{wh.name}</div>
                    <div className="wh-code">{wh.code}</div>
                  </div>
                  <div className="wh-actions">
                    <button className="icon-btn" title="แก้ไข" onClick={() => openEdit(wh)}>✏️</button>
                  </div>
                </div>
                <div className="wh-location-row">
                  📍 {wh.province} &nbsp;·&nbsp;
                  <span className="wh-type-tag">{wh.type || wh.wh_type}</span>
                </div>
                {wh.address && <div className="wh-address">{wh.address}</div>}
                <div className="wh-stats-mini">
                  <div className="wh-stat-mini"><span className="wh-stat-val">{wh.zones}</span><span className="wh-stat-lbl">Zones</span></div>
                  <div className="wh-stat-mini"><span className="wh-stat-val">{wh.staff}</span><span className="wh-stat-lbl">Staff</span></div>
                  <div className="wh-stat-mini"><span className="wh-stat-val" style={{ color }}>{pct}%</span><span className="wh-stat-lbl">Used</span></div>
                </div>
                <div className="wh-capacity-row">
                  <span className="wh-cap-label">ขนาด</span>
                  <span className="wh-cap-num" style={{ color }}>
                    {(Number(wh.used) || 0).toLocaleString()} / {(Number(wh.capacity) || 0).toLocaleString()} ตร.ม.
                  </span>
                </div>
                <div className="wh-bar-bg">
                  <div className="wh-bar-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
          {!loading && whs.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#3a6a82', fontSize: 14 }}>
              ไม่มีคลังสินค้า — กรุณาติดต่อ Super Admin เพื่อสร้างคลังสินค้า
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box modal-md" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ แก้ไข Warehouse</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row-2">
                <div className="form-group">
                  <label>ชื่อ Warehouse</label>
                  <input type="text" value={form.name}
                    onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setError(''); }}
                    placeholder="Warehouse Bangkok" />
                </div>
                <div className="form-group">
                  <label>รหัส</label>
                  <input type="text" value={form.code}
                    onChange={e => { setForm(p => ({ ...p, code: e.target.value.toUpperCase() })); setError(''); }}
                    placeholder="WH-BKK" />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>จังหวัด</label>
                  <input type="text" value={form.province}
                    onChange={e => setForm(p => ({ ...p, province: e.target.value }))}
                    placeholder="กรุงเทพฯ" />
                </div>
                <div className="form-group">
                  <label>ประเภท</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    <option>General</option>
                    <option>General + Cold Chain</option>
                    <option>General + Hazmat</option>
                    <option>Distribution Center</option>
                    <option>Cold Chain</option>
                    <option>Cross-Dock</option>
                    <option>Hazmat</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>ที่อยู่</label>
                <input type="text" value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="123 Logistics Park, ..." />
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label>ขนาด (ตร.ม.)</label>
                  <input type="number" min="1" value={form.capacity}
                    onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))}
                    placeholder="5000" />
                </div>
                <div className="form-group">
                  <label>Zones</label>
                  <input type="number" min="0" value={form.zones}
                    onChange={e => setForm(p => ({ ...p, zones: e.target.value }))}
                    placeholder="8" />
                </div>
                <div className="form-group">
                  <label>Staff</label>
                  <input type="number" min="0" value={form.staff}
                    onChange={e => setForm(p => ({ ...p, staff: e.target.value }))}
                    placeholder="24" />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Icon (Emoji)</label>
                  <input type="text" maxLength={4} value={form.icon}
                    onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                    placeholder="🏭" style={{ fontSize: 20 }} />
                </div>
                <div className="form-group">
                  <label>สถานะ</label>
                  <select value={form.active ? 'active' : 'inactive'}
                    onChange={e => setForm(p => ({ ...p, active: e.target.value === 'active' }))}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              {error && <div className="emp-error">{error}</div>}
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>ยกเลิก</button>
              <button className="primary-btn" onClick={saveWh}>💾 บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
