import { useState, useEffect, memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar
} from 'recharts';
import './Dashboard.css';
import { ZONES } from '../../constants/zones';

const KPI_KEY = 'wms_kpi_targets';

const kpiActuals = {
  receiving: { dailyItems: 175, processingHours: 3.5, accuracy: 98.2, pendingDays: 1.2 },
  picking:   { dailyOrders: 132, pickTimeMin: 35,    accuracy: 98.7, fillRate: 96.5 },
  putaway:   { dailyItems: 190, putawayTimeMin: 22,  accuracy: 98.5, locationUtil: 82 },
  shipping:  { dailyOrders: 115, onTimeDelivery: 93, accuracy: 98.8, returnRate: 2.3 },
};

const kpiFields = {
  receiving: [
    { key: 'dailyItems',      label: 'รับสินค้า/วัน',  unit: '', lowerBetter: false },
    { key: 'processingHours', label: 'เวลาประมวลผล',    unit: 'h', lowerBetter: true  },
    { key: 'accuracy',        label: 'ความถูกต้อง',      unit: '%', lowerBetter: false },
    { key: 'pendingDays',     label: 'Pending',          unit: 'd', lowerBetter: true  },
  ],
  picking: [
    { key: 'dailyOrders', label: 'Orders/วัน',   unit: '', lowerBetter: false },
    { key: 'pickTimeMin', label: 'เวลา Pick',     unit: 'm', lowerBetter: true  },
    { key: 'accuracy',    label: 'ความถูกต้อง',   unit: '%', lowerBetter: false },
    { key: 'fillRate',    label: 'Fill Rate',     unit: '%', lowerBetter: false },
  ],
  putaway: [
    { key: 'dailyItems',     label: 'รายการ/วัน',   unit: '', lowerBetter: false },
    { key: 'putawayTimeMin', label: 'เวลา Putaway', unit: 'm', lowerBetter: true  },
    { key: 'accuracy',       label: 'ความถูกต้อง',  unit: '%', lowerBetter: false },
    { key: 'locationUtil',   label: 'Loc. Util.',   unit: '%', lowerBetter: false },
  ],
  shipping: [
    { key: 'dailyOrders',    label: 'จัดส่ง/วัน',       unit: '', lowerBetter: false },
    { key: 'onTimeDelivery', label: 'On-time',            unit: '%', lowerBetter: false },
    { key: 'accuracy',       label: 'ความถูกต้อง',        unit: '%', lowerBetter: false },
    { key: 'returnRate',     label: 'Return Rate',        unit: '%', lowerBetter: true  },
  ],
};

const kpiDefaults = {
  receiving: { dailyItems: 200, processingHours: 4, accuracy: 99.0, pendingDays: 1 },
  picking:   { dailyOrders: 150, pickTimeMin: 30,   accuracy: 99.5, fillRate: 98 },
  putaway:   { dailyItems: 200, putawayTimeMin: 20, accuracy: 99.0, locationUtil: 85 },
  shipping:  { dailyOrders: 120, onTimeDelivery: 95, accuracy: 99.0, returnRate: 2 },
};

// Simulated zone utilization data
const zoneStats = {
  A:      { used: 1850, total: 2400, receiving: 42, picking: 68, putaway: 31, shipping: 55 },
  B:      { used: 960,  total: 1600, receiving: 18, picking: 24, putaway: 15, shipping: 20 },
  C:      { used: 420,  total: 900,  receiving: 10, picking: 35, putaway: 8,  shipping: 14 },
  COLD:   { used: 310,  total: 400,  receiving: 6,  picking: 12, putaway: 5,  shipping: 9  },
  HAZMAT: { used: 90,   total: 300,  receiving: 2,  picking: 3,  putaway: 2,  shipping: 2  },
  BULK:   { used: 640,  total: 1200, receiving: 8,  picking: 10, putaway: 6,  shipping: 8  },
};

const kpiModules = [
  { id: 'receiving', label: 'Receiving', icon: '📦', color: '#00E5FF' },
  { id: 'picking',   label: 'Picking',   icon: '🔍', color: '#00CC88' },
  { id: 'putaway',   label: 'Putaway',   icon: '🏷️', color: '#FFD700' },
  { id: 'shipping',  label: 'Shipping',  icon: '🚚', color: '#FF8C42' },
];

const customerCapacity = [
  { name: 'Nayong Hospital',  used: 1240, allocated: 1500, pallets: 248,  sku: 312,  color: '#00E5FF' },
  { name: 'ThaiBev Co.',      used: 980,  allocated: 1200, pallets: 196,  sku: 145,  color: '#00CC88' },
  { name: 'SCG Logistics',    used: 760,  allocated: 800,  pallets: 152,  sku: 89,   color: '#FFD700' },
  { name: 'Lotus Express',    used: 540,  allocated: 1000, pallets: 108,  sku: 234,  color: '#FF8C42' },
  { name: 'CPF Thailand',     used: 420,  allocated: 600,  pallets: 84,   sku: 67,   color: '#9B7FFF' },
  { name: 'AIS Warehouse',    used: 310,  allocated: 500,  pallets: 62,   sku: 43,   color: '#FF6B6B' },
];

const deliveryData = [
  { day: '1', current: 0.82, prev: 0.78 }, { day: '3', current: 0.84, prev: 0.80 },
  { day: '5', current: 0.83, prev: 0.79 }, { day: '7', current: 0.86, prev: 0.81 },
  { day: '9', current: 0.85, prev: 0.82 }, { day: '11', current: 0.87, prev: 0.83 },
  { day: '13', current: 0.86, prev: 0.84 }, { day: '15', current: 0.88, prev: 0.83 },
  { day: '17', current: 0.87, prev: 0.85 }, { day: '19', current: 0.86, prev: 0.84 },
  { day: '21', current: 0.88, prev: 0.86 }, { day: '23', current: 0.87, prev: 0.85 },
  { day: '25', current: 0.86, prev: 0.84 }, { day: '27', current: 0.87, prev: 0.85 },
  { day: '30', current: 0.8554, prev: 0.84 },
];

const complaintData = [
  { day: '1', current: 0.14, prev: 0.16 }, { day: '3', current: 0.15, prev: 0.15 },
  { day: '5', current: 0.13, prev: 0.14 }, { day: '7', current: 0.12, prev: 0.15 },
  { day: '9', current: 0.14, prev: 0.16 }, { day: '11', current: 0.13, prev: 0.14 },
  { day: '13', current: 0.12, prev: 0.13 }, { day: '15', current: 0.11, prev: 0.14 },
  { day: '17', current: 0.12, prev: 0.13 }, { day: '19', current: 0.11, prev: 0.12 },
  { day: '21', current: 0.10, prev: 0.12 }, { day: '23', current: 0.11, prev: 0.13 },
  { day: '25', current: 0.12, prev: 0.13 }, { day: '27', current: 0.11, prev: 0.12 },
  { day: '30', current: 0.1177, prev: 0.12 },
];

const complaintReasons = [
  { name: 'Missing parts',       value: 59, color: '#00BCD4' },
  { name: 'Damaged Packaging',   value: 16, color: '#FF6B35' },
  { name: 'Delayed',             value: 18, color: '#FFD700' },
  { name: 'Other',               value: 7,  color: '#4CAF50' },
];

const newComplaints = [
  { id: 1, color: '#FFD700', date: '2026-03-12', time: '10:30:40', text: 'It was delivered in the wrong order. Was hard to find the right parts afterwards.' },
  { id: 2, color: '#00BCD4', date: '2026-03-12', time: '09:28:12', text: 'The package was damaged on one side. Content was ok.' },
  { id: 3, color: '#00BCD4', date: '2026-03-11', time: '14:20:21', text: 'The delivery was needed already on Monday.' },
  { id: 4, color: '#FF6B35', date: '2026-03-11', time: '11:47:22', text: 'Only 4 of 8 wine were delivered.' },
  { id: 5, color: '#4CAF50', date: '2026-03-10', time: '08:32:15', text: 'Only half the order came in time.' },
  { id: 6, color: '#00BCD4', date: '2026-03-10', time: '13:00:00', text: 'Please keep an eye on the little things, 2 out of 3 items were incomplete.' },
  { id: 7, color: '#4CAF50', date: '2026-03-09', time: '17:21:43', text: "Don't forget the wine please. We need it :)" },
  { id: 8, color: '#FF6B35', date: '2026-03-09', time: '09:15:00', text: 'Broken wine box and one broken bottle.' },
  { id: 9, color: '#FFD700', date: '2026-03-08', time: '16:45:12', text: 'Apples were not delivered.' },
  { id: 10, color: '#00BCD4', date: '2026-03-08', time: '11:09:27', text: '2 out of 3 items were incomplete.' },
];

// Isolated clock component — only this re-renders every second
const LiveClock = memo(() => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const dateStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <>
      <span className="dash-date">{dateStr}</span>
      <span className="dash-time-inline">{now.toLocaleTimeString('th-TH')}</span>
    </>
  );
});

const KpiCard = ({ label, value, change, changePositive }) => (
  <div className="kpi-card">
    <div className="kpi-label">{label}</div>
    <div className="kpi-row">
      <div className="kpi-value">{value}</div>
      <div className={`kpi-change ${changePositive ? 'positive' : 'negative'}`}>
        <span className="kpi-change-label">Change</span>
        <span className="kpi-change-value">{change}</span>
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p>Day {label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {(p.value * 100).toFixed(2)}%</p>
        ))}
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const { t } = useTranslation();
  const [kpiTargets, setKpiTargets] = useState(() => {
    try {
      const s = localStorage.getItem(KPI_KEY);
      return s ? { ...kpiDefaults, ...JSON.parse(s) } : kpiDefaults;
    } catch { return kpiDefaults; }
  });

  // Refresh KPI targets when tab becomes visible (user may have saved from KPI module)
  useEffect(() => {
    const onVisible = () => {
      try {
        const s = localStorage.getItem(KPI_KEY);
        if (s) setKpiTargets({ ...kpiDefaults, ...JSON.parse(s) });
      } catch {}
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, []);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-header">
        <div className="dash-title-block">
          <h1 className="dash-title">{t('dashboard.title')}</h1>
          <LiveClock />
        </div>
      </div>

      {/* Row 1 */}
      <div className="dash-row dash-row-top">

        {/* KPI Block */}
        <div className="dash-card kpi-block">
          <div className="card-title">{t('dashboard.monthlyKPIs')} <span className="card-sub">2026/03</span></div>
          <div className="kpi-grid">
            <KpiCard label="Tonnage"             value="491,898"  change="-28.11%" changePositive={false} />
            <KpiCard label="Parts per Delivery"  value="794.91"   change="-10.17%" changePositive={false} />
            <KpiCard label="Throughput"          value="15,030"   change="-22.70%" changePositive={false} />
            <KpiCard label="Complaint Rate"      value="11.07%"   change="-22.06%" changePositive={true}  />
            <KpiCard label="Delivery Reliability" value="86.65%"  change="+7.20%"  changePositive={true}  />
          </div>
        </div>

        {/* Pie Chart */}
        <div className="dash-card pie-block">
          <div className="card-title">{t('dashboard.complaintReasons')} <span className="card-sub">Last 100 complaints</span></div>
          <div className="pie-wrapper">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={complaintReasons}
                  cx="45%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="value"
                  label={({ value }) => value}
                  labelLine={false}
                >
                  {complaintReasons.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => <span style={{ color: '#ccc', fontSize: 12 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* New Complaints */}
        <div className="dash-card complaints-block">
          <div className="card-title">{t('dashboard.newComplaints')}</div>
          <div className="complaints-list">
            {newComplaints.map(c => (
              <div key={c.id} className="complaint-item">
                <span className="complaint-dot" style={{ background: c.color }}></span>
                <div className="complaint-body">
                  <div className="complaint-meta">{c.date} {c.time}</div>
                  <div className="complaint-text">{c.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="dash-row dash-row-bottom">

        {/* Delivery Reliability Chart */}
        <div className="dash-card chart-block">
          <div className="card-title">
            {t('dashboard.deliveryReliability')}
            <span className="card-metric">85.54%</span>
            <span className="card-sub">{t('dashboard.last30Days')} &nbsp;|&nbsp; {t('dashboard.avgLast30Days')}</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={deliveryData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#8eafc0', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0.78, 0.92]} tickFormatter={v => (v * 100).toFixed(0) + '%'} tick={{ fill: '#8eafc0', fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="current" stroke="#00E5FF" strokeWidth={2} dot={false} name="Current" />
              <Line type="monotone" dataKey="prev"    stroke="#ffffff" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="30d Before" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Complaint Rate Chart */}
        <div className="dash-card chart-block">
          <div className="card-title">
            {t('dashboard.complaintRate')}
            <span className="card-metric">11.77%</span>
            <span className="card-sub">{t('dashboard.last30Days')} &nbsp;|&nbsp; {t('dashboard.avgLast30Days')}</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={complaintData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#8eafc0', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0.08, 0.18]} tickFormatter={v => (v * 100).toFixed(0) + '%'} tick={{ fill: '#8eafc0', fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="current" stroke="#00E5FF" strokeWidth={2} dot={false} name="Current" />
              <Line type="monotone" dataKey="prev"    stroke="#ffffff" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="30d Before" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3 — Operation KPIs */}
      <div className="dash-row dash-row-kpi">
        <div className="dash-card kpi-ops-block">
          <div className="card-title">
            🎯 {t('dashboard.operationKPIs')}
            <span className="card-sub">{t('dashboard.actualVsTarget')}</span>
          </div>
          <div className="kpi-ops-grid">
            {kpiModules.map(mod => {
              const flds    = kpiFields[mod.id];
              const targets = kpiTargets[mod.id];
              const acts    = kpiActuals[mod.id];
              const passCount = flds.filter(f =>
                f.lowerBetter ? acts[f.key] <= targets[f.key] : acts[f.key] >= targets[f.key]
              ).length;
              const overallPct = Math.round((passCount / flds.length) * 100);
              const overallColor = overallPct === 100 ? '#00CC88' : overallPct >= 75 ? '#FFD700' : '#FF6B6B';

              return (
                <div key={mod.id} className="kpi-ops-card">
                  <div className="kpi-ops-head">
                    <span className="kpi-ops-icon">{mod.icon}</span>
                    <span className="kpi-ops-name">{mod.label}</span>
                    <span className="kpi-ops-score" style={{ color: overallColor }}>
                      {passCount}/{flds.length}
                    </span>
                  </div>
                  <div className="kpi-ops-overall-bar">
                    <div className="kpi-ops-bar-bg">
                      <div className="kpi-ops-bar-fill" style={{ width: `${overallPct}%`, background: overallColor }} />
                    </div>
                    <span style={{ color: overallColor, fontSize: 11, fontWeight: 700 }}>{overallPct}%</span>
                  </div>
                  <div className="kpi-ops-items">
                    {flds.map(f => {
                      const actual = acts[f.key];
                      const target = targets[f.key];
                      const pass   = f.lowerBetter ? actual <= target : actual >= target;
                      const pct    = f.lowerBetter
                        ? Math.min(100, (target / Math.max(actual, 0.01)) * 100)
                        : Math.min(100, (actual / Math.max(target, 0.01)) * 100);
                      const col    = pass ? '#00CC88' : pct >= 80 ? '#FFD700' : '#FF6B6B';
                      return (
                        <div key={f.key} className="kpi-ops-item">
                          <div className="kpi-ops-item-row">
                            <span className="kpi-ops-item-label">{f.label}</span>
                            <span className="kpi-ops-item-vals" style={{ color: col }}>
                              {actual}{f.unit} / {target}{f.unit}
                            </span>
                          </div>
                          <div className="kpi-ops-item-bar-bg">
                            <div className="kpi-ops-item-bar-fill" style={{ width: `${pct}%`, background: col }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 4 — Zone Utilization */}
      <div className="dash-row dash-row-kpi">
        <div className="dash-card kpi-ops-block">
          <div className="card-title">🗺️ {t('dashboard.zoneUtilization')} <span className="card-sub">{t('dashboard.storageActivity')}</span></div>
          <div className="kpi-ops-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {ZONES.map(zone => {
              const s   = zoneStats[zone.id] || { used: 0, total: 1, receiving: 0, picking: 0, putaway: 0, shipping: 0 };
              const pct = Math.round((s.used / s.total) * 100);
              const warn = pct >= 90 ? '#FF6B6B' : pct >= 75 ? '#FFD700' : zone.color;
              return (
                <div key={zone.id} className="kpi-ops-card" style={{ borderColor: `${zone.color}30` }}>
                  <div className="kpi-ops-head">
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: zone.color, display: 'inline-block', marginRight: 4 }}></span>
                    <span className="kpi-ops-name">{zone.label}</span>
                    <span style={{ fontSize: 10, color: '#5a8fa8' }}>{zone.description}</span>
                  </div>
                  <div className="kpi-ops-overall-bar" style={{ marginBottom: 8 }}>
                    <div className="kpi-ops-bar-bg">
                      <div className="kpi-ops-bar-fill" style={{ width: `${pct}%`, background: warn }} />
                    </div>
                    <span style={{ color: warn, fontSize: 11, fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#5a8fa8', marginBottom: 8 }}>{s.used.toLocaleString()} / {s.total.toLocaleString()} units</div>
                  <div className="kpi-ops-items">
                    {[['📦 Receiving', s.receiving], ['🔍 Picking', s.picking], ['🏷️ Putaway', s.putaway], ['🚚 Shipping', s.shipping]].map(([lbl, cnt]) => (
                      <div key={lbl} className="kpi-ops-item-row" style={{ fontSize: 11, marginBottom: 2 }}>
                        <span className="kpi-ops-item-label">{lbl}</span>
                        <span style={{ color: zone.color, fontWeight: 700 }}>{cnt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 5 — Customer Capacity */}
      <div className="dash-row dash-row-capacity">
        <div className="dash-card capacity-block">
          <div className="card-title">
            {t('dashboard.customerCapacity')}
            <span className="card-sub">{t('dashboard.storagePerCustomer')} &nbsp;|&nbsp; Total: 5,600 / 5,600 m²</span>
            <span className="capacity-total-badge">78.6% {t('dashboard.usedBadge')}</span>
          </div>

          <div className="capacity-grid">
            {customerCapacity.map((c) => {
              const pct = Math.round((c.used / c.allocated) * 100);
              const warn = pct >= 90 ? 'critical' : pct >= 75 ? 'warn' : 'ok';
              return (
                <div key={c.name} className="capacity-row">
                  <div className="capacity-info">
                    <div className="capacity-name">
                      <span className="capacity-dot" style={{ background: c.color }}></span>
                      {c.name}
                    </div>
                    <div className="capacity-stats">
                      <span>{c.pallets} Pallets</span>
                      <span>{c.sku} Products</span>
                      <span className={`capacity-pct ${warn}`}>{pct}%</span>
                    </div>
                  </div>
                  <div className="capacity-bar-wrap">
                    <div className="capacity-bar-bg">
                      <div
                        className={`capacity-bar-fill ${warn}`}
                        style={{ width: `${pct}%`, background: warn === 'ok' ? c.color : warn === 'warn' ? '#FFD700' : '#FF6B6B' }}
                      ></div>
                    </div>
                    <span className="capacity-label">{c.used.toLocaleString()} / {c.allocated.toLocaleString()} m²</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Capacity Bar Chart */}
        <div className="dash-card capacity-chart-block">
          <div className="card-title">{t('dashboard.customerCapacity')} <span className="card-sub">m² Used vs Allocated</span></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={customerCapacity} margin={{ top: 5, right: 10, left: 0, bottom: 40 }} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#8eafc0', fontSize: 10 }}
                axisLine={false} tickLine={false}
                angle={-30} textAnchor="end" interval={0}
              />
              <YAxis tick={{ fill: '#8eafc0', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{ background: '#0a2030', border: '1px solid rgba(0,188,212,0.3)', borderRadius: 6, fontSize: 12 }}
                labelStyle={{ color: '#a0c8dc' }}
                itemStyle={{ color: '#cce4ef' }}
              />
              <Bar dataKey="allocated" name="Allocated" fill="rgba(0,188,212,0.15)" radius={[3,3,0,0]} />
              <Bar dataKey="used"      name="Used"      radius={[3,3,0,0]}>
                {customerCapacity.map((c, i) => <Cell key={i} fill={c.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
