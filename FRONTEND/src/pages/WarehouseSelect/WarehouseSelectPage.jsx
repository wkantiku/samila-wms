import { useState } from 'react';
import './WarehouseSelectPage.css';

const FALLBACK_WH = [
  { id: 1, companyNo: 'COMP-001', code: 'WH-BKK', name: 'Warehouse Bangkok',      location: 'กรุงเทพฯ (ลาดกระบัง)', address: '123 Logistics Park, ลาดกระบัง กรุงเทพฯ 10520', capacity: 5000, used: 3200, zones: 8,  staff: 24, active: true,  type: 'General + Cold Chain', icon: '🏙️' },
  { id: 2, companyNo: 'COMP-001', code: 'WH-NTB', name: 'Warehouse Nonthaburi',   location: 'นนทบุรี (บางใหญ่)',     address: '88 Industrial Zone, บางใหญ่ นนทบุรี 11140',   capacity: 3000, used: 1800, zones: 5,  staff: 12, active: true,  type: 'General',              icon: '🏭' },
  { id: 3, companyNo: 'COMP-001', code: 'WH-PTN', name: 'Warehouse Pathum Thani', location: 'ปทุมธานี (คลองหลวง)',   address: '55 Free Trade Zone, คลองหลวง ปทุมธานี 12120', capacity: 8000, used: 2100, zones: 12, staff: 18, active: true,  type: 'General + Hazmat',     icon: '🌿' },
  { id: 4, companyNo: 'COMP-001', code: 'WH-TRG', name: 'Warehouse Trang',        location: 'ตรัง',                  address: '99 Hospital Rd, เมือง ตรัง 92000',             capacity: 2000, used: 1400, zones: 4,  staff: 8,  active: true,  type: 'Medical Supply',       icon: '🏥' },
  { id: 5, companyNo: 'COMP-001', code: 'WH-CNX', name: 'Warehouse Chiang Mai',   location: 'เชียงใหม่ (สันกำแพง)', address: '200 Northern Hub, สันกำแพง เชียงใหม่ 50130',   capacity: 4000, used: 500,  zones: 6,  staff: 10, active: true,  type: 'General',              icon: '⛰️' },
  { id: 6, companyNo: 'COMP-001', code: 'WH-HYD', name: 'Warehouse Hat Yai',      location: 'สงขลา (หาดใหญ่)',       address: '15 Southern Logistics, หาดใหญ่ สงขลา 90110',  capacity: 3500, used: 0,    zones: 0,  staff: 0,  active: false, type: 'General',              icon: '🌊' },
];

const getCompanyMap = () => {
  try {
    const saved = localStorage.getItem('wms_sa_companies');
    const companies = saved ? JSON.parse(saved) : [];
    return Object.fromEntries(companies.map(c => [c.companyNo, c.name]));
  } catch { return {}; }
};

const getVisibleWarehouses = (user) => {
  try {
    const saved = localStorage.getItem('wms_sa_whs');
    const allWhs = saved ? JSON.parse(saved) : FALLBACK_WH;

    // superadmin เห็นทุก warehouse
    if (user?.role === 'superadmin') return allWhs;

    // user มี company: แสดงเฉพาะ warehouse ใน company ของตัวเอง
    if (user?.companyNo) {
      const assigned = user.warehouses || [];
      return allWhs.filter(w =>
        w.companyNo === user.companyNo &&
        assigned.includes(w.name)
      );
    }

    // legacy: filter ตาม assigned names
    const assigned = user?.warehouses || [];
    if (assigned.includes('All')) return allWhs.filter(w => w.active !== false);
    return allWhs.filter(w => assigned.includes(w.name));
  } catch {
    return FALLBACK_WH;
  }
};

export default function WarehouseSelectPage({ user, onSelect, onLogout }) {
  const [hovered, setHovered] = useState(null);
  const companyMap = getCompanyMap();
  const warehouses = getVisibleWarehouses(user).slice().sort((a, b) => {
    const ca = companyMap[a.companyNo] || a.companyNo || '';
    const cb = companyMap[b.companyNo] || b.companyNo || '';
    const cmp = ca.localeCompare(cb, 'th');
    return cmp !== 0 ? cmp : a.name.localeCompare(b.name, 'th');
  });

  return (
    <div className="wh-select-page">
      <div className="wh-bg-grid" />

      {/* Top bar */}
      <div className="wh-topbar">
        <div className="wh-topbar-logo">
          <img src="/logo.png" alt="Samila WMS 3PL" className="wh-logo-img" />
          <span className="wh-logo-text">Samila WMS 3PL</span>
        </div>
        <div className="wh-topbar-user">
          <div className="wh-user-info">
            <span className="wh-user-name">{user.name}</span>
            {user.role === 'superadmin' && (
              <span style={{ fontSize: 11, color: '#FFD700', fontWeight: 700, marginLeft: 6 }}>👑 Super Admin</span>
            )}
            {user.companyNo && (
              <span style={{ fontSize: 11, color: '#00E5FF', fontFamily: 'monospace', marginLeft: 6 }}>{user.companyNo}</span>
            )}
          </div>
          <button className="wh-logout-btn" onClick={onLogout}>ออกจากระบบ</button>
        </div>
      </div>

      {/* Title */}
      <div className="wh-select-title-area">
        <h1 className="wh-select-title">เลือกคลังสินค้า</h1>
        <p className="wh-select-sub">
          {user.role === 'superadmin'
            ? `Super Admin — แสดงทุกคลัง (${warehouses.length} คลัง)`
            : `กรุณาเลือกคลังสินค้าที่ต้องการจัดการ (${warehouses.length} คลัง)`}
        </p>
      </div>

      {/* Grid */}
      <div className="wh-cards-grid">
        {warehouses.map(wh => {
          const cap = wh.capacity || 0;
          const used = wh.used || 0;
          const pct = cap > 0 ? Math.round((used / cap) * 100) : 0;
          const barColor = pct >= 85 ? '#FF6B6B' : pct >= 65 ? '#FFD700' : '#00CC88';
          const isInactive = wh.active === false;

          return (
            <div
              key={wh.id}
              className={`wh-card ${isInactive ? 'wh-card-inactive' : ''} ${hovered === wh.id ? 'wh-card-hovered' : ''}`}
              onMouseEnter={() => !isInactive && setHovered(wh.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => !isInactive && onSelect(wh)}
            >
              {isInactive && <div className="wh-inactive-badge">ปิดใช้งาน</div>}

              <div className="wh-card-header">
                <div className="wh-card-icon">{wh.icon}</div>
                <div className="wh-card-title-block">
                  {wh.companyNo && (
                    <div className="wh-card-company">
                      🏢 {companyMap[wh.companyNo] || wh.companyNo}
                    </div>
                  )}
                  <div className="wh-card-name">{wh.name}</div>
                  <div className="wh-card-code">{wh.code}</div>
                </div>
              </div>

              <div className="wh-card-location">
                <span className="wh-loc-pin">📍</span> {wh.location || wh.province}
              </div>
              {wh.address && <div className="wh-card-address">{wh.address}</div>}

              <div className="wh-card-type">
                <span className="wh-type-badge">{wh.type}</span>
              </div>

              <div className="wh-stats-row">
                <div className="wh-stat">
                  <div className="wh-stat-val">{wh.zones}</div>
                  <div className="wh-stat-label">Zones</div>
                </div>
                <div className="wh-stat">
                  <div className="wh-stat-val">{wh.staff}</div>
                  <div className="wh-stat-label">Staff</div>
                </div>
                <div className="wh-stat">
                  <div className="wh-stat-val" style={{ color: barColor }}>{pct}%</div>
                  <div className="wh-stat-label">ใช้งาน</div>
                </div>
              </div>

              <div className="wh-cap-bar-wrap">
                <div className="wh-cap-bar-label">
                  <span>ขนาด</span>
                  <span style={{ color: barColor }}>{used.toLocaleString()} / {cap.toLocaleString()} ตร.ม.</span>
                </div>
                <div className="wh-cap-bar-bg">
                  <div className="wh-cap-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                </div>
              </div>

              {!isInactive && <div className="wh-select-btn">เข้าใช้งาน →</div>}
            </div>
          );
        })}

        {warehouses.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#3a6a82', fontSize: 15 }}>
            ไม่มีคลังสินค้าที่ถูก assign — กรุณาติดต่อ Super Admin
          </div>
        )}
      </div>
    </div>
  );
}
