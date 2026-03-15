import { useState, useEffect } from 'react';
import './KPIModule.css';

const KPI_KEY = 'wms_kpi_targets';

const TABS = [
  { id: 'summary',   label: '📊 รวม',      icon: '📊' },
  { id: 'receiving', label: '📦 Receiving', icon: '📦' },
  { id: 'picking',   label: '🔍 Picking',   icon: '🔍' },
  { id: 'putaway',   label: '🏷️ Putaway',   icon: '🏷️' },
  { id: 'shipping',  label: '🚚 Shipping',  icon: '🚚' },
];

const defaultTargets = {
  receiving: { dailyItems: 200, processingHours: 4, accuracy: 99.0, pendingDays: 1 },
  picking:   { dailyOrders: 150, pickTimeMin: 30,   accuracy: 99.5, fillRate: 98 },
  putaway:   { dailyItems: 200, putawayTimeMin: 20, accuracy: 99.0, locationUtil: 85 },
  shipping:  { dailyOrders: 120, onTimeDelivery: 95, accuracy: 99.0, returnRate: 2 },
};

// Simulated actual values (in real app → from API)
const actuals = {
  receiving: { dailyItems: 175, processingHours: 3.5, accuracy: 98.2, pendingDays: 1.2 },
  picking:   { dailyOrders: 132, pickTimeMin: 35,    accuracy: 98.7, fillRate: 96.5 },
  putaway:   { dailyItems: 190, putawayTimeMin: 22,  accuracy: 98.5, locationUtil: 82 },
  shipping:  { dailyOrders: 115, onTimeDelivery: 93, accuracy: 98.8, returnRate: 2.3 },
};

const fields = {
  receiving: [
    { key: 'dailyItems',      label: 'รับสินค้าต่อวัน',     unit: 'items',  lowerBetter: false },
    { key: 'processingHours', label: 'เวลาประมวลผล',         unit: 'ชม.',    lowerBetter: true  },
    { key: 'accuracy',        label: 'ความถูกต้อง',           unit: '%',      lowerBetter: false },
    { key: 'pendingDays',     label: 'Pending ไม่เกิน',      unit: 'วัน',    lowerBetter: true  },
  ],
  picking: [
    { key: 'dailyOrders',  label: 'Orders ต่อวัน',         unit: 'orders', lowerBetter: false },
    { key: 'pickTimeMin',  label: 'เวลา Pick (ต่อ order)', unit: 'นาที',   lowerBetter: true  },
    { key: 'accuracy',     label: 'ความถูกต้อง',            unit: '%',      lowerBetter: false },
    { key: 'fillRate',     label: 'Fill Rate',              unit: '%',      lowerBetter: false },
  ],
  putaway: [
    { key: 'dailyItems',     label: 'รายการต่อวัน',         unit: 'items', lowerBetter: false },
    { key: 'putawayTimeMin', label: 'เวลา Putaway',          unit: 'นาที',  lowerBetter: true  },
    { key: 'accuracy',       label: 'ความถูกต้อง',           unit: '%',     lowerBetter: false },
    { key: 'locationUtil',   label: 'Location Utilization', unit: '%',     lowerBetter: false },
  ],
  shipping: [
    { key: 'dailyOrders',    label: 'จัดส่งต่อวัน',        unit: 'orders', lowerBetter: false },
    { key: 'onTimeDelivery', label: 'On-time Delivery',    unit: '%',      lowerBetter: false },
    { key: 'accuracy',       label: 'ความถูกต้อง',          unit: '%',      lowerBetter: false },
    { key: 'returnRate',     label: 'Return Rate',         unit: '%',      lowerBetter: true  },
  ],
};

function loadTargets() {
  try {
    const saved = localStorage.getItem(KPI_KEY);
    if (saved) return { ...defaultTargets, ...JSON.parse(saved) };
  } catch {}
  return defaultTargets;
}

function KPIGauge({ actual, target, unit, lowerBetter }) {
  const pct = lowerBetter
    ? Math.min(100, (target / Math.max(actual, 0.01)) * 100)
    : Math.min(100, (actual / Math.max(target, 0.01)) * 100);

  const pass = lowerBetter ? actual <= target : actual >= target;
  const color = pass ? '#00CC88' : pct >= 80 ? '#FFD700' : '#FF6B6B';

  return (
    <div className="kpi-gauge">
      <div className="kpi-gauge-bar-wrap">
        <div className="kpi-gauge-bg">
          <div className="kpi-gauge-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
        <span className="kpi-gauge-pct" style={{ color }}>{pct.toFixed(0)}%</span>
      </div>
      <div className="kpi-gauge-vals">
        <span className="kpi-actual" style={{ color }}>Actual: {actual}{unit}</span>
        <span className="kpi-target">Target: {target}{unit}</span>
      </div>
    </div>
  );
}

export default function KPIModule() {
  const [activeTab, setActiveTab] = useState('receiving');
  const [targets, setTargets]     = useState(loadTargets);
  const [saved, setSaved]         = useState(false);

  const handleChange = (tab, key, val) => {
    setTargets(prev => ({
      ...prev,
      [tab]: { ...prev[tab], [key]: parseFloat(val) || 0 },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(KPI_KEY, JSON.stringify(targets));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setTargets(defaultTargets);
    localStorage.setItem(KPI_KEY, JSON.stringify(defaultTargets));
    setSaved(false);
  };

  const isSummary  = activeTab === 'summary';
  const tabFields  = isSummary ? [] : fields[activeTab];
  const tabTargets = isSummary ? {} : targets[activeTab];
  const tabActuals = isSummary ? {} : actuals[activeTab];

  // Compute overall stats for summary tab
  const MODULE_TABS = TABS.filter(t => t.id !== 'summary');
  const allKPIs = MODULE_TABS.flatMap(t =>
    fields[t.id].map(f => ({
      ...f,
      module: t.label,
      moduleId: t.id,
      moduleIcon: t.icon,
      actual: actuals[t.id][f.key],
      target: targets[t.id][f.key],
      pass: f.lowerBetter
        ? actuals[t.id][f.key] <= targets[t.id][f.key]
        : actuals[t.id][f.key] >= targets[t.id][f.key],
    }))
  );
  const totalPass  = allKPIs.filter(k => k.pass).length;
  const totalKPIs  = allKPIs.length;
  const overallPct = Math.round((totalPass / totalKPIs) * 100);
  const overallColor = overallPct === 100 ? '#00CC88' : overallPct >= 75 ? '#FFD700' : '#FF6B6B';

  return (
    <div className="kpi-module">
      {/* Header */}
      <div className="module-header">
        <div>
          <h2 className="module-title">🎯 KPI Management</h2>
          <p className="module-sub">ตั้งค่า KPI เป้าหมาย — เชื่อมต่อกับ Dashboard อัตโนมัติ</p>
        </div>
        <div className="kpi-header-actions">
          <button className="kpi-reset-btn" onClick={handleReset}>↺ Reset Default</button>
          <button className="kpi-save-btn" onClick={handleSave}>
            {saved ? '✅ บันทึกแล้ว' : '💾 บันทึก KPI'}
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="kpi-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`kpi-tab${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== SUMMARY TAB ===== */}
      {isSummary && (
        <div className="kpi-summary-tab">

          {/* Overall Score Card */}
          <div className="kpi-overall-card">
            <div className="kpi-overall-left">
              <div className="kpi-overall-label">Overall KPI Score</div>
              <div className="kpi-overall-score" style={{ color: overallColor }}>
                {totalPass}<span className="kpi-overall-denom">/{totalKPIs}</span>
              </div>
              <div className="kpi-overall-sub">ผ่าน {totalPass} จาก {totalKPIs} ตัวชี้วัด</div>
            </div>
            <div className="kpi-overall-right">
              <div className="kpi-overall-ring-wrap">
                <svg viewBox="0 0 80 80" className="kpi-overall-ring">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                  <circle
                    cx="40" cy="40" r="32"
                    fill="none"
                    stroke={overallColor}
                    strokeWidth="10"
                    strokeDasharray={`${(overallPct / 100) * 201} 201`}
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                    style={{ transition: 'stroke-dasharray 0.6s ease' }}
                  />
                  <text x="40" y="45" textAnchor="middle" fill={overallColor} fontSize="16" fontWeight="800">{overallPct}%</text>
                </svg>
              </div>
            </div>
          </div>

          {/* Per-Module Summary */}
          <div className="kpi-module-summary-grid">
            {MODULE_TABS.map(tab => {
              const tFields  = fields[tab.id];
              const tTargets = targets[tab.id];
              const tActuals = actuals[tab.id];
              const passCount = tFields.filter(f =>
                f.lowerBetter ? tActuals[f.key] <= tTargets[f.key] : tActuals[f.key] >= tTargets[f.key]
              ).length;
              const pct = Math.round((passCount / tFields.length) * 100);
              const color = pct === 100 ? '#00CC88' : pct >= 75 ? '#FFD700' : '#FF6B6B';
              return (
                <div
                  key={tab.id}
                  className="kpi-mod-sum-card"
                  style={{ borderTopColor: color }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <div className="kpi-mod-sum-head">
                    <span className="kpi-mod-sum-icon">{tab.icon}</span>
                    <span className="kpi-mod-sum-name">{tab.label.replace(/[^\w\s]/gu, '').trim()}</span>
                    <span className="kpi-mod-sum-score" style={{ color }}>{passCount}/{tFields.length}</span>
                  </div>
                  <div className="kpi-mod-sum-bar-wrap">
                    <div className="kpi-mod-sum-bar-bg">
                      <div className="kpi-mod-sum-bar-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span style={{ color, fontSize: 12, fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div className="kpi-mod-sum-items">
                    {tFields.map(f => {
                      const actual = tActuals[f.key];
                      const target = tTargets[f.key];
                      const pass   = f.lowerBetter ? actual <= target : actual >= target;
                      return (
                        <div key={f.key} className="kpi-mod-sum-row">
                          <span className="kpi-mod-sum-kpi-label">{f.label}</span>
                          <span className="kpi-mod-sum-kpi-val" style={{ color: pass ? '#00CC88' : '#FF6B6B' }}>
                            {pass ? '✓' : '✗'} {actual}{f.unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="kpi-mod-sum-footer" style={{ color }}>
                    คลิกเพื่อดูรายละเอียด →
                  </div>
                </div>
              );
            })}
          </div>

          {/* All KPI Table */}
          <div className="kpi-all-table-wrap">
            <div className="kpi-all-table-title">📋 ตัวชี้วัดทั้งหมด</div>
            <table className="kpi-all-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>KPI</th>
                  <th>ผลจริง</th>
                  <th>เป้าหมาย</th>
                  <th>%</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {allKPIs.map((k, i) => {
                  const pct = k.lowerBetter
                    ? Math.min(100, (k.target / Math.max(k.actual, 0.01)) * 100)
                    : Math.min(100, (k.actual / Math.max(k.target, 0.01)) * 100);
                  const color = k.pass ? '#00CC88' : pct >= 80 ? '#FFD700' : '#FF6B6B';
                  return (
                    <tr key={i} className={k.pass ? 'kpi-row-pass' : 'kpi-row-fail'}>
                      <td><span className="kpi-table-module">{k.moduleIcon} {k.module.replace(/[^\w\s]/gu, '').trim()}</span></td>
                      <td>{k.label}</td>
                      <td style={{ color, fontWeight: 700 }}>{k.actual}{k.unit}</td>
                      <td className="kpi-table-target">{k.target}{k.unit}</td>
                      <td>
                        <div className="kpi-table-bar-wrap">
                          <div className="kpi-table-bar-bg">
                            <div className="kpi-table-bar-fill" style={{ width: `${pct}%`, background: color }} />
                          </div>
                          <span style={{ color, fontSize: 11, minWidth: 34 }}>{pct.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`kpi-table-badge ${k.pass ? 'badge-pass' : 'badge-fail'}`}>
                          {k.pass ? '✅ ผ่าน' : '❌ ไม่ผ่าน'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KPI Cards (module tabs) */}
      {!isSummary && (
      <div className="kpi-cards-grid">
        {tabFields.map(f => {
          const actual = tabActuals[f.key];
          const target = tabTargets[f.key];
          const pass   = f.lowerBetter ? actual <= target : actual >= target;

          return (
            <div key={f.key} className={`kpi-card-item${pass ? ' pass' : ' fail'}`}>
              <div className="kpi-card-header">
                <span className="kpi-card-label">{f.label}</span>
                <span className={`kpi-card-badge ${pass ? 'badge-pass' : 'badge-fail'}`}>
                  {pass ? '✅ ผ่าน' : '❌ ไม่ผ่าน'}
                </span>
              </div>

              <KPIGauge
                actual={actual}
                target={target}
                unit={f.unit}
                lowerBetter={f.lowerBetter}
              />

              <div className="kpi-target-input">
                <label>เป้าหมาย ({f.unit})</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={target}
                  onChange={e => handleChange(activeTab, f.key, e.target.value)}
                />
                {f.lowerBetter && <span className="kpi-hint">↓ ยิ่งน้อยยิ่งดี</span>}
                {!f.lowerBetter && <span className="kpi-hint">↑ ยิ่งมากยิ่งดี</span>}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Summary Row (module tabs only) */}
      {!isSummary && (
      <div className="kpi-summary">
        <div className="kpi-summary-title">📊 สรุป KPI ทุก Module — ปัจจุบัน</div>
        <div className="kpi-summary-grid">
          {MODULE_TABS.map(t => {
            const tFields  = fields[t.id];
            const tTargets = targets[t.id];
            const tActuals = actuals[t.id];
            const passCount = tFields.filter(f =>
              f.lowerBetter ? tActuals[f.key] <= tTargets[f.key] : tActuals[f.key] >= tTargets[f.key]
            ).length;
            const pct = Math.round((passCount / tFields.length) * 100);
            const color = pct === 100 ? '#00CC88' : pct >= 75 ? '#FFD700' : '#FF6B6B';

            return (
              <div
                key={t.id}
                className={`kpi-summary-card${activeTab === t.id ? ' active' : ''}`}
                onClick={() => setActiveTab(t.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="ks-icon">{t.icon}</div>
                <div className="ks-name">{t.label.replace(/[^\w\s]/gu, '').trim()}</div>
                <div className="ks-score" style={{ color }}>{passCount}/{tFields.length}</div>
                <div className="ks-bar-wrap">
                  <div className="ks-bar-bg">
                    <div className="ks-bar-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <span className="ks-pct" style={{ color }}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      <p className="kpi-note">
        💡 ค่าเป้าหมายที่บันทึกแล้วจะแสดงบน <strong>Dashboard → Operation KPIs</strong> ทันที
      </p>
    </div>
  );
}
