import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ZONES, ZONE_OPTIONS } from '../../constants/zones';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MAIN_UNIT_GROUPS as UNIT_GROUPS } from '../../constants/units';
import {
  revenueData, throughputData, customerRevenue, customers, reportCategories,
  recentReports, typeColor, demoExpiryItems, allNonMovementItems, NON_MOVE_THRESHOLD_MONTHS,
} from './reportData';
import PdfPreviewModal from './PdfPreviewModal';
import './ReportsModule.css';

/* ── Customer Search Combobox ── */
function CustomerCombobox({ value, onChange }) {
  const [inputVal, setInputVal] = useState('');
  const [open, setOpen]         = useState(false);
  const [focused, setFocused]   = useState(false);
  const wrapRef                 = useRef();

  const selected = customers.find(c => c.key === value);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setFocused(false);
        if (!value) setInputVal('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [value]);

  const filtered = inputVal.trim() === ''
    ? customers
    : customers.filter(c =>
        c.name.toLowerCase().includes(inputVal.toLowerCase()) ||
        c.code.toLowerCase().includes(inputVal.toLowerCase())
      );

  const handleSelect = (c) => { onChange(c.key); setInputVal(''); setOpen(false); setFocused(false); };
  const handleInputChange = (e) => { setInputVal(e.target.value); onChange(''); setOpen(true); };
  const handleFocus = () => { setFocused(true); setOpen(true); };
  const handleClear = () => { onChange(''); setInputVal(''); setOpen(false); };
  const displayValue = focused ? inputVal : (selected ? `${selected.name}  [${selected.code}]` : inputVal);

  return (
    <div className="cbox-wrap" ref={wrapRef}>
      <div className={`cbox-input-row ${open ? 'open' : ''} ${selected && !focused ? 'has-value' : ''}`}>
        <span className="cbox-icon">🔍</span>
        <input className="cbox-input" type="text" placeholder="พิมพ์ชื่อลูกค้า หรือ รหัสลูกค้า..."
          value={displayValue} onChange={handleInputChange} onFocus={handleFocus} autoComplete="off" />
        {(selected || inputVal) && <button className="cbox-clear" onClick={handleClear} type="button">✕</button>}
        <span className="cbox-arrow">{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className="cbox-dropdown">
          {filtered.length === 0 ? (
            <div className="cbox-empty">ไม่พบลูกค้า "{inputVal}"</div>
          ) : (
            filtered.map(c => (
              <div key={c.key} className={`cbox-option ${value === c.key ? 'active' : ''}`} onMouseDown={() => handleSelect(c)}>
                <span className="cbox-opt-avatar">{c.name[0]}</span>
                <div className="cbox-opt-body">
                  <div className="cbox-opt-name">{c.name}</div>
                  <div className="cbox-opt-meta">{c.code} &nbsp;·&nbsp; {c.contact} &nbsp;·&nbsp; {c.phone}</div>
                </div>
                {value === c.key && <span className="cbox-check">✓</span>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Component ── */
function ReportsModule({
  inventory = [], receivingOrders = [], putawayRecords = [],
  pickingOrders = [], salesOrders = [], csCases = [],
}) {
  const { t } = useTranslation();

  /* ── Live derived values ── */
  const todayDate     = new Date();
  const inboundCount  = receivingOrders.length;
  const outboundCount = pickingOrders.filter(o => o.status === 'COMPLETED').length;
  const complaintList = csCases.filter(c => c.category === 'Complaint');
  const activeCS      = csCases.filter(c => c.status === 'Open' || c.status === 'In Progress').length;
  const complaintRate = csCases.length > 0
    ? ((complaintList.length / csCases.length) * 100).toFixed(1) : '0.0';

  /* Expiry items from live inventory (fallback to demo data) */
  const liveExpiryItems = inventory
    .filter(inv => inv.expiryDate)
    .map(inv => {
      const exp      = new Date(inv.expiryDate);
      const daysLeft = Math.floor((exp - todayDate) / (1000 * 60 * 60 * 24));
      let status = 'OK';
      if (daysLeft < 0)        status = 'EXPIRED';
      else if (daysLeft < 30)  status = 'CRITICAL';
      else if (daysLeft < 60)  status = 'WARNING';
      else if (daysLeft < 90)  status = 'CAUTION';
      return { sku: inv.sku, name: inv.product, customer: inv.customer,
        warehouse: inv.warehouse || 'Warehouse A', location: inv.location,
        qty: inv.quantity || inv.qty || 0, mainUnit: inv.mainUnit || 'PCS',
        batNumber: inv.batNumber || '-', lotNumber: inv.lotNumber || '-',
        mfgDate: inv.manufactureDate || '-', expiryDate: inv.expiryDate, daysLeft, status };
    })
    .filter(i => i.status !== 'OK');

  const expiryData = liveExpiryItems.length > 0 ? liveExpiryItems : demoExpiryItems;

  /* Live customer list from inventory + CS */
  const liveCustomerNames = [...new Set(
    [...inventory.map(i => i.customer), ...csCases.map(c => c.customer)].filter(Boolean)
  )].sort();
  const liveCustomers = liveCustomerNames.map((name, i) => ({
    key: name.toLowerCase().replace(/\s+/g, '_') + i, name, code: '', contact: '', phone: '',
  }));

  const [customer, setCustomer]           = useState('');
  const [selectedType, setSelectedType]   = useState(null);
  const [generating, setGenerating]       = useState(false);
  const [pdfReport, setPdfReport]         = useState(null);
  const [dateFrom, setDateFrom]           = useState('2026-03-01');
  const [dateTo, setDateTo]               = useState('2026-03-31');
  const [nmFilter, setNmFilter]           = useState('all');
  const [nmMinMonths, setNmMinMonths]     = useState(6);
  const [nmUnitFilter, setNmUnitFilter]   = useState('');
  const [exFilter, setExFilter]           = useState('all');
  const [exStatusFilter, setExStatusFilter] = useState('all');
  const [zoneFilter, setZoneFilter]       = useState('');

  const canSelectType = !!customer;
  const canGenerate   = !!customer && !!selectedType;

  const handleGenerate = () => {
    if (!canGenerate) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      const cat  = reportCategories.find(r => r.key === selectedType);
      const cust = customers.find(c => c.key === customer);
      setPdfReport({ type: selectedType, name: `${cat?.label} – ${cust?.name}` });
    }, 1200);
  };

  const handleReset = () => { setSelectedType(null); setPdfReport(null); setGenerating(false); };

  return (
    <div className="wms-module reports-module">

      {/* Header */}
      <div className="module-header">
        <div className="header-left">
          <h1>📈 {t('reports.title')}</h1>
          <p>{t('reports.subtitle')}</p>
        </div>
      </div>

      {/* ── KPI Summary ── */}
      <div className="report-kpi-row">
        {[
          { label: 'สินค้าใน Inventory',  value: inventory.length.toLocaleString(),       change: 'รายการ',            up: null,                       icon: '📦' },
          { label: 'รายการ Inbound (GR)', value: inboundCount.toLocaleString(),           change: 'ใบรับสินค้า',       up: null,                       icon: '📥' },
          { label: 'Picking Completed',   value: outboundCount.toLocaleString(),          change: 'รายการจ่ายสินค้า',  up: null,                       icon: '📤' },
          { label: 'Complaint Cases',     value: complaintList.length.toString(),         change: `${complaintRate}% ของ CS ทั้งหมด`, up: complaintList.length === 0, icon: '⚠️' },
          { label: 'CS Active',           value: activeCS.toString(),                     change: `รวม ${csCases.length} เคส`, up: activeCS === 0,       icon: '🎧' },
          { label: 'Putaway Tasks',       value: putawayRecords.length.toLocaleString(),  change: `${putawayRecords.filter(r => r.status === 'COMPLETE').length} complete`, up: null, icon: '🏷️' },
        ].map((k, i) => (
          <div key={i} className="rpt-kpi-card">
            <div className="rpt-kpi-icon">{k.icon}</div>
            <div className="rpt-kpi-body">
              <div className="rpt-kpi-label">{k.label}</div>
              <div className="rpt-kpi-value">{k.value}</div>
              <div className={`rpt-kpi-change ${k.up === true ? 'up' : k.up === false ? 'down' : 'neutral'}`}>{k.change}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="reports-charts-row">
        <div className="rpt-chart-card">
          <div className="rpt-card-title">Revenue vs Cost <span className="rpt-card-sub">฿ / 6 เดือน</span></div>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={9}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#8eafc0', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fill: '#8eafc0', fontSize: 9 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={{ background: '#0a2030', border: '1px solid rgba(0,188,212,0.3)', borderRadius: 6, fontSize: 11 }} formatter={v => `฿${v.toLocaleString()}`} labelStyle={{ color: '#a0c8dc' }} />
              <Bar dataKey="revenue" name="Revenue" fill="#00A8CC" radius={[2,2,0,0]} />
              <Bar dataKey="cost"    name="Cost"    fill="rgba(255,107,107,0.5)" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rpt-chart-card">
          <div className="rpt-card-title">In / Out Throughput <span className="rpt-card-sub">6 เดือน</span></div>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={throughputData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#8eafc0', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8eafc0', fontSize: 9 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={{ background: '#0a2030', border: '1px solid rgba(0,188,212,0.3)', borderRadius: 6, fontSize: 11 }} labelStyle={{ color: '#a0c8dc' }} />
              <Line type="monotone" dataKey="inbound"  stroke="#00E5FF" strokeWidth={1.5} dot={false} name="Inbound" />
              <Line type="monotone" dataKey="outbound" stroke="#00CC88" strokeWidth={1.5} dot={false} name="Outbound" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rpt-chart-card">
          <div className="rpt-card-title">Revenue by Customer <span className="rpt-card-sub">มี.ค. 2026</span></div>
          <div className="customer-rev-list">
            {customerRevenue.map(c => {
              const pct = Math.round((c.value / customerRevenue[0].value) * 100);
              return (
                <div key={c.name} className="crev-row">
                  <div className="crev-row-top">
                    <span className="crev-name"><span className="crev-dot" style={{ background: c.color }}></span>{c.name}</span>
                    <span className="crev-value">฿{(c.value/1000).toFixed(0)}k</span>
                  </div>
                  <div className="crev-bar-wrap">
                    <div className="crev-bar-bg">
                      <div className="crev-bar-fill" style={{ width: `${pct}%`, background: c.color }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom: Generator + Recent ── */}
      <div className="reports-bottom-grid">

        {/* Report Generator */}
        <div className="rpt-generator-card">
          <div className="rpt-card-title">👥 Report by Customer</div>

          {!generating && !pdfReport && (
            <>
              <div className="gen-step">
                <div className="gen-step-label">
                  <span className="gen-step-num">1</span> {t('reports.selectCustomer')} <span className="gen-step-required">*</span>
                </div>
                <CustomerCombobox value={customer} onChange={(key) => { setCustomer(key); if (!key) setSelectedType(null); }} />
                {customer && (() => {
                  const c = customers.find(x => x.key === customer);
                  return (
                    <div className="cbox-selected-info">
                      <span className="csi-avatar">{c.name[0]}</span>
                      <span className="csi-name">{c.name}</span>
                      <span className="csi-sep">·</span>
                      <span className="csi-code">{c.code}</span>
                      <span className="csi-sep">·</span>
                      <span className="csi-contact">{c.contact}</span>
                    </div>
                  );
                })()}
              </div>

              <div className={`gen-step ${!canSelectType ? 'gen-step-disabled' : ''}`}>
                <div className="gen-step-label">
                  <span className="gen-step-num">2</span> {t('reports.selectReport')}
                  {!canSelectType && <span className="gen-step-hint"> ← เลือกลูกค้าก่อน</span>}
                </div>
                <div className="rpt-cat-grid">
                  {reportCategories.map(r => (
                    <div key={r.key}
                      className={`rpt-cat-item ${selectedType === r.key ? 'selected' : ''} ${!canSelectType ? 'rpt-cat-locked' : ''}`}
                      onClick={() => canSelectType && setSelectedType(r.key)}
                      style={selectedType === r.key ? { borderColor: r.color, background: `${r.color}15` } : {}}>
                      <span className="rpt-cat-icon">{r.icon}</span>
                      <span className="rpt-cat-label">{r.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`gen-step ${!canSelectType ? 'gen-step-disabled' : ''}`}>
                <div className="gen-step-label"><span className="gen-step-num">3</span> ช่วงวันที่ &amp; Zone</div>
                <div className="rpt-filters" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 8 }}>
                  <div className="rpt-filter-group">
                    <label>{t('reports.dateFrom')}</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} disabled={!canSelectType} />
                  </div>
                  <div className="rpt-filter-group">
                    <label>{t('reports.dateTo')}</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} disabled={!canSelectType} />
                  </div>
                </div>
                <div className="rpt-filter-group">
                  <label>🗺️ Zone (ไม่บังคับ)</label>
                  <select value={zoneFilter} onChange={e => setZoneFilter(e.target.value)} disabled={!canSelectType}
                    style={{ padding:'8px 10px', background:'rgba(0,20,40,0.8)', border:'1px solid rgba(0,229,255,0.3)', borderRadius:6, color: zoneFilter ? '#00E5FF' : '#5a8fa8', fontSize:12, fontWeight:600, width:'100%' }}>
                    <option value="">ทุก Zone</option>
                    {ZONES.map(z => <option key={z.id} value={z.id}>{z.label} — {z.description}</option>)}
                  </select>
                </div>
              </div>

              <button className={`generate-btn ${!canGenerate ? 'disabled' : ''}`} onClick={handleGenerate} disabled={!canGenerate} style={{ marginTop: '14px' }}>
                {!customer ? `← ${t('reports.selectCustomer')}` : !selectedType ? `← ${t('reports.selectReport')}` : `📄 ${t('reports.preview')}`}
              </button>
            </>
          )}

          {generating && (
            <div className="rpt-generating">
              <div className="rpt-spinner"></div>
              <div className="rpt-gen-text">กำลังประมวลผล...</div>
              <div className="rpt-gen-sub">กรุณารอสักครู่</div>
            </div>
          )}

          {pdfReport && !generating && (
            <div className="rpt-done">
              <div className="rpt-done-icon">✓</div>
              <div className="rpt-done-title">PDF พร้อมแสดงผล!</div>
              <div className="rpt-done-card">
                <div className="rpt-done-name">{pdfReport.name}</div>
                <div className="rpt-done-meta">
                  <span>📅 {dateFrom} – {dateTo}</span>
                  <span className="fmt-badge">PDF</span>
                </div>
              </div>
              <div className="rpt-done-actions">
                <button className="dl-btn" onClick={() => setPdfReport({ ...pdfReport, show: true })}>👁️ ดู PDF Preview</button>
                <button className="again-btn" onClick={handleReset}>🔄 สร้างใหม่</button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Reports */}
        <div className="rpt-recent-card">
          <div className="rpt-card-title">🕐 {t('reports.recent')}</div>
          <div className="recent-list">
            {recentReports.map(r => (
              <div key={r.id} className="recent-row">
                <div className="recent-icon" style={{ color: typeColor[r.type] || '#7aafc8' }}>
                  {r.type === 'inventory' ? '📦' : r.type === 'billing' ? '💰' : r.type === 'kpi' ? '📊' : r.type === 'receiving' ? '📥' : r.type === 'shipping' ? '🚚' : r.type === 'nonmovement' ? '🔴' : '📄'}
                </div>
                <div className="recent-body">
                  <div className="recent-name">{r.name}</div>
                  <div className="recent-meta">{r.date} · {r.size}</div>
                </div>
                <div className="recent-actions">
                  <span className="fmt-tag pdf">PDF</span>
                  <button className="dl-mini" title="ดู PDF" onClick={() => setPdfReport({ ...r, show: true })}>👁</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Expiry Report ── */}
      <div className="nm-report-card" style={{ borderColor: 'rgba(255,215,0,0.25)', marginBottom: 20 }}>
        <div className="nm-report-header">
          <div className="nm-report-title-row">
            <span className="nm-report-icon">⏰</span>
            <div>
              <div className="nm-report-title">Expiry Report</div>
              <div className="nm-report-sub">สินค้าใกล้หมดอายุและหมดอายุแล้ว — EXPIRED / CRITICAL (&lt;30 วัน) / WARNING (&lt;60 วัน) / CAUTION (&lt;90 วัน)</div>
            </div>
          </div>
          <div className="nm-report-controls">
            <div className="nm-ctrl-group">
              <label>ลูกค้า</label>
              <select value={exFilter} onChange={e => setExFilter(e.target.value)}>
                <option value="all">ทั้งหมด</option>
                {liveCustomers.map(c => <option key={c.key} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="nm-ctrl-group">
              <label>สถานะ</label>
              <select value={exStatusFilter} onChange={e => setExStatusFilter(e.target.value)}>
                <option value="all">ทั้งหมด</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="CRITICAL">CRITICAL (&lt;30 วัน)</option>
                <option value="WARNING">WARNING (&lt;60 วัน)</option>
                <option value="CAUTION">CAUTION (&lt;90 วัน)</option>
              </select>
            </div>
            <button className="nm-print-btn" style={{ background: 'rgba(255,215,0,0.15)', borderColor: 'rgba(255,215,0,0.4)', color: '#FFD700' }} onClick={() => {
              const filtered = expiryData.filter(i => (exFilter === 'all' || i.customer === exFilter) && (exStatusFilter === 'all' || i.status === exStatusFilter));
              const w = window.open('', '_blank');
              w.document.write(`<html><head><title>Expiry Report</title><style>
                body{font-family:Arial,sans-serif;margin:0;padding:24px;font-size:12px;color:#222;}
                table{width:100%;border-collapse:collapse;margin-bottom:12px;}
                th{background:#b8860b;color:white;padding:8px 10px;text-align:left;font-size:11px;}
                td{padding:7px 10px;border-bottom:1px solid #eee;font-size:11px;}
                tr:nth-child(even) td{background:#fafafa;}
                .expired{color:#c00;font-weight:700;} .critical{color:#e65100;font-weight:700;}
                .warning{color:#f57f17;font-weight:600;} .caution{color:#827717;}
                .footer{font-size:10px;color:#888;border-top:1px solid #ddd;padding-top:8px;margin-top:8px;}
              </style></head><body>
              <h2>⏰ Expiry Report — SAMILA 3PL</h2>
              <p>วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}</p>
              <table><thead><tr><th>#</th><th>SKU</th><th>ชื่อสินค้า</th><th>ลูกค้า</th><th>Location</th><th>Qty</th><th>BAT No.</th><th>Lot No.</th><th>MFG</th><th>Expiry</th><th>คงเหลือ</th><th>สถานะ</th></tr></thead>
              <tbody>${filtered.map((i,idx) => `<tr><td>${idx+1}</td><td>${i.sku}</td><td>${i.name}</td><td>${i.customer}</td><td>${i.location}</td><td>${i.qty} ${i.mainUnit}</td><td>${i.batNumber}</td><td>${i.lotNumber}</td><td>${i.mfgDate}</td><td>${i.expiryDate}</td><td class="${i.status.toLowerCase()}">${i.daysLeft < 0 ? 'หมดอายุแล้ว' : i.daysLeft + ' วัน'}</td><td class="${i.status.toLowerCase()}">${i.status}</td></tr>`).join('')}
              </tbody></table>
              <div class="footer">รวม ${filtered.length} รายการ | ${new Date().toLocaleString('th-TH')}</div>
              </body></html>`);
              w.document.close(); w.focus(); setTimeout(() => w.print(), 400);
            }}>🖨️ พิมพ์ PDF</button>
          </div>
        </div>

        {(() => {
          const filtered = expiryData.filter(i =>
            (exFilter === 'all' || i.customer === exFilter) &&
            (exStatusFilter === 'all' || i.status === exStatusFilter)
          );
          const expiredCount  = filtered.filter(i => i.status === 'EXPIRED').length;
          const criticalCount = filtered.filter(i => i.status === 'CRITICAL').length;
          const warningCount  = filtered.filter(i => i.status === 'WARNING').length;
          const cautionCount  = filtered.filter(i => i.status === 'CAUTION').length;
          const statusStyle = {
            EXPIRED:  { color: '#FF4444', bg: 'rgba(255,68,68,0.15)' },
            CRITICAL: { color: '#FF8C42', bg: 'rgba(255,140,66,0.15)' },
            WARNING:  { color: '#FFD700', bg: 'rgba(255,215,0,0.15)' },
            CAUTION:  { color: '#00CC88', bg: 'rgba(0,204,136,0.15)' },
          };
          return (
            <>
              <div className="nm-summary-row">
                <div className="nm-stat"><span className="nm-stat-val" style={{ color: '#FF4444' }}>{expiredCount}</span><span className="nm-stat-lbl">EXPIRED</span></div>
                <div className="nm-stat"><span className="nm-stat-val" style={{ color: '#FF8C42' }}>{criticalCount}</span><span className="nm-stat-lbl">CRITICAL (&lt;30 วัน)</span></div>
                <div className="nm-stat"><span className="nm-stat-val" style={{ color: '#FFD700' }}>{warningCount}</span><span className="nm-stat-lbl">WARNING (&lt;60 วัน)</span></div>
                <div className="nm-stat"><span className="nm-stat-val" style={{ color: '#00CC88' }}>{cautionCount}</span><span className="nm-stat-lbl">CAUTION (&lt;90 วัน)</span></div>
              </div>
              <div className="nm-table-wrap">
                <table className="nm-table">
                  <thead>
                    <tr>
                      <th>#</th><th>SKU</th><th>ชื่อสินค้า</th><th>ลูกค้า</th>
                      <th>คลัง / Location</th><th>Qty</th><th>BAT No.</th><th>Lot No.</th>
                      <th>MFG Date</th><th>Expiry Date</th><th>คงเหลือ (วัน)</th><th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item, i) => {
                      const s = statusStyle[item.status] || {};
                      return (
                        <tr key={item.sku + i} className={i % 2 === 1 ? 'nm-tr-alt' : ''}>
                          <td className="nm-td-num">{i + 1}</td>
                          <td><span className="nm-sku">{item.sku}</span></td>
                          <td className="nm-td-name">{item.name}</td>
                          <td className="nm-td-cust">{item.customer}</td>
                          <td><span className="nm-wh">{item.warehouse}</span> <span className="nm-loc">{item.location}</span></td>
                          <td>{item.qty} <span className="nm-unit">{item.mainUnit}</span></td>
                          <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#00E5FF' }}>{item.batNumber}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#00CC88' }}>{item.lotNumber}</td>
                          <td className="nm-td-date">{item.mfgDate}</td>
                          <td className="nm-td-date" style={{ color: '#FFD700' }}>{item.expiryDate}</td>
                          <td><span style={{ background: s.bg, color: s.color, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{item.daysLeft < 0 ? 'หมดอายุแล้ว' : `${item.daysLeft} วัน`}</span></td>
                          <td><span style={{ background: s.bg, color: s.color, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{item.status}</span></td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr><td colSpan={12} className="nm-empty">✅ ไม่พบสินค้าในเงื่อนไขที่เลือก</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          );
        })()}
      </div>

      {/* ── Non Movement Report ── */}
      <div className="nm-report-card">
        <div className="nm-report-header">
          <div className="nm-report-title-row">
            <span className="nm-report-icon">🔴</span>
            <div>
              <div className="nm-report-title">Non Movement Report</div>
              <div className="nm-report-sub">สินค้าที่ไม่มีการเคลื่อนไหว (ตั้งแต่วันรับสินค้าเข้า)</div>
            </div>
          </div>
          <div className="nm-report-controls">
            <div className="nm-ctrl-group">
              <label>ลูกค้า</label>
              <select value={nmFilter} onChange={e => setNmFilter(e.target.value)}>
                <option value="all">ทั้งหมด</option>
                {liveCustomers.map(c => <option key={c.key} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="nm-ctrl-group">
              <label>ขั้นต่ำ (เดือน)</label>
              <select value={nmMinMonths} onChange={e => setNmMinMonths(+e.target.value)}>
                <option value={6}>6 เดือนขึ้นไป</option>
                <option value={9}>9 เดือนขึ้นไป</option>
                <option value={12}>12 เดือนขึ้นไป</option>
              </select>
            </div>
            <div className="nm-ctrl-group">
              <label>หน่วยนับ</label>
              <select value={nmUnitFilter} onChange={e => setNmUnitFilter(e.target.value)}>
                <option value="">ทุกหน่วย</option>
                {UNIT_GROUPS.map(g => (
                  <optgroup key={g.group} label={g.group}>
                    {g.units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <button className="nm-print-btn" onClick={() => {
              const filtered = allNonMovementItems.filter(i => (nmFilter === 'all' || i.customer === nmFilter) && i.ageMonths >= nmMinMonths && (!nmUnitFilter || i.unit === nmUnitFilter));
              const w = window.open('', '_blank');
              w.document.write(`<html><head><title>Non Movement Report</title><style>
                body{font-family:Arial,sans-serif;margin:0;padding:24px;font-size:12px;color:#222;}
                table{width:100%;border-collapse:collapse;margin-bottom:12px;}
                th{background:#c00;color:white;padding:8px 10px;text-align:left;font-size:11px;}
                td{padding:7px 10px;border-bottom:1px solid #eee;font-size:11px;}
                tr:nth-child(even) td{background:#fafafa;}
                .age-high{color:#c00;font-weight:700;}
                .footer{font-size:10px;color:#888;border-top:1px solid #ddd;padding-top:8px;margin-top:8px;}
              </style></head><body>
              <h2>🔴 Non Movement Report — SAMILA 3PL</h2>
              <p>สินค้าค้างสต็อก ≥ ${nmMinMonths} เดือน | วันที่พิมพ์: ${new Date().toLocaleDateString('th-TH')}</p>
              <table><thead><tr><th>#</th><th>SKU</th><th>ชื่อสินค้า</th><th>ลูกค้า</th><th>คลัง</th><th>Location</th><th>จำนวน</th><th>วันรับเข้า</th><th>อายุ (เดือน)</th><th>มูลค่า</th></tr></thead>
              <tbody>${filtered.map((i,idx) => `<tr><td>${idx+1}</td><td>${i.sku}</td><td>${i.name}</td><td>${i.customer}</td><td>${i.warehouse}</td><td>${i.location}</td><td>${i.qty} ${i.unit}</td><td>${i.receivedDate}</td><td class="age-high">${i.ageMonths} เดือน</td><td>${i.value}</td></tr>`).join('')}
              </tbody></table>
              <div class="footer">รวม ${filtered.length} รายการ | ${new Date().toLocaleString('th-TH')}</div>
              </body></html>`);
              w.document.close(); w.focus(); setTimeout(() => w.print(), 400);
            }}>🖨️ พิมพ์ PDF</button>
          </div>
        </div>

        {(() => {
          const filtered = allNonMovementItems.filter(i =>
            (nmFilter === 'all' || i.customer === nmFilter) &&
            i.ageMonths >= nmMinMonths &&
            (!nmUnitFilter || i.unit === nmUnitFilter)
          );
          const totalValue = filtered.reduce((s, i) => s + parseFloat(i.value.replace(/[฿,]/g, '')), 0);
          return (
            <>
              <div className="nm-summary-row">
                <div className="nm-stat"><span className="nm-stat-val" style={{ color: '#FF4444' }}>{filtered.length}</span><span className="nm-stat-lbl">รายการค้างสต็อก</span></div>
                <div className="nm-stat"><span className="nm-stat-val" style={{ color: '#FFD700' }}>{nmMinMonths}+</span><span className="nm-stat-lbl">เดือน (ขั้นต่ำ)</span></div>
                <div className="nm-stat"><span className="nm-stat-val" style={{ color: '#FF8C42' }}>฿{totalValue.toLocaleString()}</span><span className="nm-stat-lbl">มูลค่ารวม</span></div>
                <div className="nm-stat"><span className="nm-stat-val" style={{ color: '#9B7FFF' }}>{[...new Set(filtered.map(i => i.warehouse))].length}</span><span className="nm-stat-lbl">คลังสินค้า</span></div>
              </div>
              <div className="nm-table-wrap">
                <table className="nm-table">
                  <thead>
                    <tr>
                      <th>#</th><th>SKU</th><th>ชื่อสินค้า</th><th>ลูกค้า</th>
                      <th>คลัง / Location</th><th>จำนวน</th><th>วันที่รับเข้า</th><th>อายุ (เดือน)</th><th>มูลค่า</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item, i) => (
                      <tr key={item.sku} className={i % 2 === 1 ? 'nm-tr-alt' : ''}>
                        <td className="nm-td-num">{i + 1}</td>
                        <td><span className="nm-sku">{item.sku}</span></td>
                        <td className="nm-td-name">{item.name}</td>
                        <td className="nm-td-cust">{item.customer}</td>
                        <td><span className="nm-wh">{item.warehouse}</span> <span className="nm-loc">{item.location}</span></td>
                        <td>{item.qty} <span className="nm-unit">{item.unit}</span></td>
                        <td className="nm-td-date">{item.receivedDate}</td>
                        <td><span className={`nm-age-badge ${item.ageMonths >= 12 ? 'age-critical' : item.ageMonths >= 9 ? 'age-high' : 'age-medium'}`}>{item.ageMonths} เดือน</span></td>
                        <td className="nm-td-value">{item.value}</td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={9} className="nm-empty">✅ ไม่พบสินค้าค้างสต็อกในเงื่อนไขที่เลือก</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          );
        })()}
      </div>

      {/* PDF Preview Modal */}
      {pdfReport?.show && (
        <PdfPreviewModal
          report={pdfReport}
          customer={customer}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onClose={() => setPdfReport(p => ({ ...p, show: false }))}
        />
      )}
    </div>
  );
}

export default ReportsModule;
