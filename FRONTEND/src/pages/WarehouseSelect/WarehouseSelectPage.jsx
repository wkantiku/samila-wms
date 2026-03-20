import { useState, useEffect } from 'react';
import { warehouseApi } from '../../services/api';
import './WarehouseSelectPage.css';

const getCompanyMap = () => {
  try {
    const saved = localStorage.getItem('wms_sa_companies');
    const companies = saved ? JSON.parse(saved) : [];
    return Object.fromEntries(companies.map(c => [c.companyNo, c.name]));
  } catch { return {}; }
};

const filterForUser = (allWhs, user) => {
  if (!user) return [];
  // superadmin เห็นทุก warehouse
  if (user.role === 'superadmin') return allWhs;
  // admin เห็นทุก warehouse ของบริษัทตัวเอง (companyNo match)
  if (user.role === 'admin' && user.companyNo) {
    return allWhs.filter(w => w.companyNo === user.companyNo && w.active !== false);
  }
  // operator / user ทั่วไป: กรองตาม warehouse ที่ถูก assign
  const assigned = user.warehouses || [];
  if (assigned.includes('All')) return allWhs.filter(w => w.active !== false);
  return allWhs.filter(w => assigned.includes(w.name) || assigned.includes(w.code));
};

export default function WarehouseSelectPage({ user, onSelect, onLogout }) {
  const [hovered, setHovered]   = useState(null);
  const [allWhs,  setAllWhs]    = useState([]);
  const [loading, setLoading]   = useState(true);
  const companyMap = getCompanyMap();

  useEffect(() => {
    warehouseApi.list()
      .then(data => { setAllWhs(data || []); })
      .catch(() => { setAllWhs([]); })
      .finally(() => setLoading(false));
  }, []);

  const warehouses = filterForUser(allWhs, user).slice().sort((a, b) => {
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

        {loading && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#3a6a82', fontSize: 15 }}>
            กำลังโหลดคลังสินค้า...
          </div>
        )}
        {!loading && warehouses.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#3a6a82', fontSize: 15 }}>
            ไม่มีคลังสินค้าที่ถูก assign — กรุณาติดต่อ Super Admin
          </div>
        )}
      </div>
    </div>
  );
}
