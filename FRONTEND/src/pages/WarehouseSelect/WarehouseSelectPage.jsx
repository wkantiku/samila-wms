import { useState } from 'react';
import './WarehouseSelectPage.css';

const warehouses = [
  {
    id: 1, code: 'WH-BKK', name: 'Warehouse Bangkok',
    location: 'กรุงเทพฯ (ลาดกระบัง)',
    address: '123 Logistics Park, ลาดกระบัง กรุงเทพฯ 10520',
    province: 'กรุงเทพฯ',
    capacity: 5000, used: 3200,
    zones: 8, staff: 24,
    status: 'active', type: 'General + Cold Chain',
    icon: '🏙️',
  },
  {
    id: 2, code: 'WH-NTB', name: 'Warehouse Nonthaburi',
    location: 'นนทบุรี (บางใหญ่)',
    address: '88 Industrial Zone, บางใหญ่ นนทบุรี 11140',
    province: 'นนทบุรี',
    capacity: 3000, used: 1800,
    zones: 5, staff: 12,
    status: 'active', type: 'General',
    icon: '🏭',
  },
  {
    id: 3, code: 'WH-PTN', name: 'Warehouse Pathum Thani',
    location: 'ปทุมธานี (คลองหลวง)',
    address: '55 Free Trade Zone, คลองหลวง ปทุมธานี 12120',
    province: 'ปทุมธานี',
    capacity: 8000, used: 2100,
    zones: 12, staff: 18,
    status: 'active', type: 'General + Hazmat',
    icon: '🌿',
  },
  {
    id: 4, code: 'WH-TRG', name: 'Warehouse Trang',
    location: 'ตรัง (โรงพยาบาลนายอง)',
    address: '99 Hospital Rd, เมือง ตรัง 92000',
    province: 'ตรัง',
    capacity: 2000, used: 1400,
    zones: 4, staff: 8,
    status: 'active', type: 'Medical Supply',
    icon: '🏥',
  },
  {
    id: 5, code: 'WH-CNX', name: 'Warehouse Chiang Mai',
    location: 'เชียงใหม่ (สันกำแพง)',
    address: '200 Northern Hub, สันกำแพง เชียงใหม่ 50130',
    province: 'เชียงใหม่',
    capacity: 4000, used: 500,
    zones: 6, staff: 10,
    status: 'active', type: 'General',
    icon: '⛰️',
  },
  {
    id: 6, code: 'WH-HYD', name: 'Warehouse Hat Yai',
    location: 'สงขลา (หาดใหญ่)',
    address: '15 Southern Logistics, หาดใหญ่ สงขลา 90110',
    province: 'สงขลา',
    capacity: 3500, used: 0,
    zones: 0, staff: 0,
    status: 'inactive', type: 'General',
    icon: '🌊',
  },
];

export default function WarehouseSelectPage({ user, onSelect, onLogout }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="wh-select-page">
      <div className="wh-bg-grid" />

      {/* Top bar */}
      <div className="wh-topbar">
        <div className="wh-topbar-logo">
          <img src="/logo.png" alt="BB Innovation" className="wh-logo-img" />
          <span className="wh-logo-text">BB Innovation</span>
        </div>
        <div className="wh-topbar-user">
          <div className="wh-user-info">
            <span className="wh-user-name">{user.name}</span>
            <span className={`wh-user-role role-${user.role}`}>{user.roleLabel}</span>
          </div>
          <button className="wh-logout-btn" onClick={onLogout}>ออกจากระบบ</button>
        </div>
      </div>

      {/* Title */}
      <div className="wh-select-title-area">
        <h1 className="wh-select-title">เลือกคลังสินค้า</h1>
        <p className="wh-select-sub">กรุณาเลือกคลังสินค้าที่ต้องการจัดการ</p>
      </div>

      {/* Grid */}
      <div className="wh-cards-grid">
        {warehouses.map(wh => {
          const pct = Math.round((wh.used / wh.capacity) * 100);
          const barColor = pct >= 85 ? '#FF6B6B' : pct >= 65 ? '#FFD700' : '#00CC88';
          const isInactive = wh.status === 'inactive';

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
                  <div className="wh-card-name">{wh.name}</div>
                  <div className="wh-card-code">{wh.code}</div>
                </div>
              </div>

              <div className="wh-card-location">
                <span className="wh-loc-pin">📍</span> {wh.location}
              </div>
              <div className="wh-card-address">{wh.address}</div>

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
                  <span>Capacity</span>
                  <span style={{ color: barColor }}>{wh.used.toLocaleString()} / {wh.capacity.toLocaleString()} ลัง</span>
                </div>
                <div className="wh-cap-bar-bg">
                  <div className="wh-cap-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                </div>
              </div>

              {!isInactive && (
                <div className="wh-select-btn">
                  เข้าใช้งาน →
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
