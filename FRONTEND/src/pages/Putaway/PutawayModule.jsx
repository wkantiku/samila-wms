import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { customerApi } from '../../services/api';
import { MAIN_UNIT_GROUPS, SUB_UNIT_GROUPS } from '../../constants/units';
import { ZONES, ZONE_OPTIONS, locationToZone } from '../../constants/zones';
import * as XLSX from 'xlsx';
import './PutawayModule.css';

const makeEmptyForm = () => ({
  paNumber: '', grNumber: '', sku: '', barcode: '', customer: '',
  fromLocation: 'RECEIVING', toLocation: '', qty: '', mainUnit: 'PCS', subUnit: 'BOX',
  batNumber: '', lotNumber: '', manufactureDate: '', expiryDate: '',
  assignedTo: '', date: '', status: 'PENDING',
});

const statusColors = {
  PENDING:     '#FFD700',
  IN_PROGRESS: '#00BCD4',
  COMPLETE:    '#00CC88',
  CANCELLED:   '#FF6B6B',
};

const ZONE_LOCATIONS = [
  'A-01-1', 'A-01-2', 'A-02-1', 'A-02-2', 'A-03-1',
  'B-01-1', 'B-01-2', 'B-02-1', 'B-02-2', 'B-03-1',
  'C-01-1', 'C-01-2', 'C-02-1', 'C-02-2', 'C-03-1',
  'COLD-01', 'COLD-02', 'HAZMAT-01', 'BULK-01', 'BULK-02',
];

const initData = [
  {
    id: 1, paNumber: 'PA-2026-0001', grNumber: 'GR-2026-0001',
    sku: 'SKU-001', barcode: '8850000001', customer: 'Nayong Hospital',
    fromLocation: 'RECEIVING', toLocation: 'A-01-1', qty: 50,
    mainUnit: 'PCS', subUnit: 'BOX', batNumber: 'BAT-001', lotNumber: 'LOT-001',
    manufactureDate: '2025-01-15', expiryDate: '2027-01-15',
    assignedTo: 'Somchai', date: '2026-03-13', status: 'COMPLETE',
  },
  {
    id: 2, paNumber: 'PA-2026-0002', grNumber: 'GR-2026-0002',
    sku: 'SKU-002', barcode: '8850000002', customer: 'ThaiBev Co.',
    fromLocation: 'RECEIVING', toLocation: 'B-02-1', qty: 120,
    mainUnit: 'PCS', subUnit: 'CARTON', batNumber: 'BAT-002', lotNumber: 'LOT-002',
    manufactureDate: '2026-01-10', expiryDate: '2028-01-10',
    assignedTo: 'Wichai', date: '2026-03-13', status: 'IN_PROGRESS',
  },
  {
    id: 3, paNumber: 'PA-2026-0003', grNumber: 'GR-2026-0003',
    sku: 'SKU-003', barcode: '8850000003', customer: 'SCG Logistics',
    fromLocation: 'RECEIVING', toLocation: 'C-01-2', qty: 30,
    mainUnit: 'KG', subUnit: 'BAG', batNumber: 'BAT-003', lotNumber: 'LOT-003',
    manufactureDate: '2025-11-01', expiryDate: '2026-11-01',
    assignedTo: 'Malee', date: '2026-03-13', status: 'PENDING',
  },
];

function PutawayModule({ records, setRecords, inventory, setInventory, currentUser }) {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab]     = useState('list');
  const [showModal, setShowModal]     = useState(false);
  const [editId, setEditId]           = useState(null);
  const [form, setForm]               = useState(makeEmptyForm);

  const [custList, setCustList] = useState([]);
  useEffect(() => {
    customerApi.list(currentUser?.companyNo).then(data => {
      if (Array.isArray(data)) setCustList(data.map(c => c.name).filter(Boolean));
    }).catch(() => {});
  }, [currentUser?.companyNo]);
  const [formError, setFormError]     = useState('');
  const [deleteId, setDeleteId]       = useState(null);
  const [scanInput, setScanInput]     = useState('');
  const [scanResult, setScanResult]   = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [zoneFilter,   setZoneFilter]   = useState('');

  const currentUserName = currentUser?.name || localStorage.getItem('currentUser') || 'Operator';

  const downloadTemplate = () => {
    const headers = ['PA Number','GR Number','Product Name','Barcode','Customer','From Location','To Location','Qty','Main Unit','Sub Unit','BAT No.','Lot No.','MFG Date (YYYY-MM-DD)','Expiry Date (YYYY-MM-DD)','Assigned To','Status'];
    const example = ['PA-2026-0001','GR-2026-0001','SKU-001','8850000001','Customer A','RECEIVING','A-01-1','50','PCS','BOX','BAT-001','LOT-001','2025-01-15','2027-01-15','Somchai','PENDING'];
    const ws = XLSX.utils.aoa_to_sheet([headers, example]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Putaway Template');
    XLSX.writeFile(wb, 'template_putaway.xlsx');
  };

  const openCreate = () => {
    const nextNum = String(records.length + 1).padStart(4, '0');
    setForm({ ...makeEmptyForm(), paNumber: `PA-2026-${nextNum}`, date: new Date().toISOString().slice(0, 10), assignedTo: currentUserName });
    setEditId(null);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (r) => {
    setForm({ ...r });
    setEditId(r.id);
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditId(null); setFormError(''); };

  const updateInventoryLocation = (grNumber, toLocation) => {
    if (!grNumber || !toLocation) return;
    setInventory?.(prev => prev.map(inv =>
      inv.grRef === grNumber ? { ...inv, location: toLocation } : inv
    ));
  };

  const handleSave = () => {
    if (!form.grNumber.trim())    { setFormError('กรุณาระบุ GR Number'); return; }
    if (!form.sku.trim())         { setFormError('กรุณาระบุ Product Name'); return; }
    if (!form.customer.trim())    { setFormError('กรุณาระบุ Customer'); return; }
    if (!form.toLocation.trim())  { setFormError('กรุณาระบุ To Location'); return; }
    if (!form.qty || Number(form.qty) <= 0) { setFormError('กรุณาระบุจำนวน Qty'); return; }
    if (!form.batNumber.trim())   { setFormError('กรุณาระบุ BAT No.'); return; }
    if (!form.lotNumber.trim())   { setFormError('กรุณาระบุ Lot No.'); return; }
    if (editId) {
      const prevRecord = records.find(r => r.id === editId);
      const becomingComplete = form.status === 'COMPLETE' && prevRecord?.status !== 'COMPLETE';
      setRecords(prev => prev.map(r => r.id === editId ? { ...r, ...form, qty: Number(form.qty) } : r));
      if (becomingComplete) updateInventoryLocation(form.grNumber, form.toLocation);
    } else {
      setRecords(prev => [...prev, { id: Date.now(), ...form, qty: Number(form.qty) }]);
      if (form.status === 'COMPLETE') updateInventoryLocation(form.grNumber, form.toLocation);
    }
    closeModal();
  };

  const handleScan = () => {
    const found = records.find(r => r.barcode === scanInput.trim() || r.paNumber === scanInput.trim() || r.sku === scanInput.trim());
    setScanResult(found || null);
  };

  const markComplete = (id) => {
    const rec = records.find(r => r.id === id);
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'COMPLETE' } : r));
    setScanResult(prev => prev && prev.id === id ? { ...prev, status: 'COMPLETE' } : prev);
    if (rec && rec.status !== 'COMPLETE') updateInventoryLocation(rec.grNumber, rec.toLocation);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const filtered = records
    .filter(r => filterStatus === 'ALL' || r.status === filterStatus)
    .filter(r => !zoneFilter || locationToZone(r.toLocation) === zoneFilter);

  const readonlyStyle = { background: 'rgba(0,188,212,0.05)', color: '#5a8fa8', cursor: 'not-allowed', border: '1px solid rgba(0,188,212,0.15)' };
  const selectStyle   = { padding: '9px 12px', background: 'rgba(0,20,40,0.8)', border: '1px solid rgba(0,188,212,0.4)', borderRadius: 6, fontSize: 13, color: '#ffffff', fontFamily: 'inherit', width: '100%', fontWeight: 600 };

  // Summary counts
  const counts = { PENDING: 0, IN_PROGRESS: 0, COMPLETE: 0, CANCELLED: 0 };
  records.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });

  return (
    <div className="wms-module putaway-module">
      {/* Header */}
      <div className="module-header">
        <div className="header-left">
          <h1>🏷️ Putaway Management</h1>
          <p>จัดเก็บสินค้าเข้า Location — จาก Receiving Area สู่ Storage</p>
        </div>
        <div className="header-right">
          <button onClick={toggleLanguage} className="lang-btn">
            {i18n.language === 'en' ? '🇹🇭 ไทย' : '🇬🇧 English'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="pa-summary-row">
        {Object.entries(counts).map(([st, cnt]) => (
          <div
            key={st}
            className={`pa-summary-card${filterStatus === st ? ' active' : ''}`}
            style={{ borderColor: `${statusColors[st]}40` }}
            onClick={() => setFilterStatus(filterStatus === st ? 'ALL' : st)}
          >
            <div className="pa-sum-count" style={{ color: statusColors[st] }}>{cnt}</div>
            <div className="pa-sum-label">{st.replace('_', ' ')}</div>
          </div>
        ))}
        <div
          className={`pa-summary-card${filterStatus === 'ALL' ? ' active' : ''}`}
          style={{ borderColor: 'rgba(0,229,255,0.3)' }}
          onClick={() => setFilterStatus('ALL')}
        >
          <div className="pa-sum-count" style={{ color: '#00E5FF' }}>{records.length}</div>
          <div className="pa-sum-label">ALL</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="module-tabs">
        <button className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
          📋 Putaway List
        </button>
        <button className={`tab-btn ${activeTab === 'scan' ? 'active' : ''}`} onClick={() => setActiveTab('scan')}>
          📱 Scan &amp; Assign
        </button>
        <button className={`tab-btn ${activeTab === 'locations' ? 'active' : ''}`} onClick={() => setActiveTab('locations')}>
          🗺️ Location Map
        </button>
      </div>

      <div className="module-content">

        {/* ── LIST TAB ── */}
        {activeTab === 'list' && (
          <div className="pa-list">
            <div className="controls">
              <select value={zoneFilter} onChange={e => setZoneFilter(e.target.value)} style={{ padding:'7px 10px', background:'rgba(0,20,40,0.8)', border:'1px solid rgba(0,229,255,0.3)', borderRadius:6, color:'#00E5FF', fontSize:12, fontWeight:600 }}>
                {ZONE_OPTIONS.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
              </select>
              <button onClick={downloadTemplate} className="export-btn" style={{ background: 'rgba(0,204,136,0.12)', color: '#00CC88', border: '1px solid rgba(0,204,136,0.3)' }}>
                📋 Download Template
              </button>
              <button className="create-btn" onClick={openCreate}>➕ สร้าง Putaway</button>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>PA Number</th>
                  <th>GR Number</th>
                  <th>Product Name</th>
                  <th>Customer</th>
                  <th>From</th>
                  <th>Zone</th>
                  <th>To Location</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>BAT No.</th>
                  <th>Lot No.</th>
                  <th>Expiry Date</th>
                  <th>Assigned To</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'monospace', color: '#00E5FF', fontWeight: 700 }}>{r.paNumber}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.grNumber || '-'}</td>
                    <td style={{ color: '#FFD700', fontWeight: 600 }}>{r.sku}</td>
                    <td style={{ color: '#a0c8dc' }}>{r.customer}</td>
                    <td style={{ color: '#5a8fa8', fontSize: 12 }}>{r.fromLocation}</td>
                    <td>{(() => { const z = ZONES.find(z => z.id === locationToZone(r.toLocation)); return z ? <span style={{ background: `${z.color}18`, color: z.color, padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{z.label}</span> : '-'; })()}</td>
                    <td>
                      <span style={{ background: 'rgba(0,204,136,0.12)', color: '#00CC88', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                        {r.toLocation || '-'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{r.qty}</td>
                    <td>
                      <span style={{ background: 'rgba(0,188,212,0.1)', color: '#00E5FF', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>{r.mainUnit}</span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#00E5FF' }}>{r.batNumber || '-'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#00CC88' }}>{r.lotNumber || '-'}</td>
                    <td style={{ fontSize: 12, color: '#FFD700' }}>{r.expiryDate || '-'}</td>
                    <td style={{ fontSize: 12 }}>{r.assignedTo || '-'}</td>
                    <td style={{ fontSize: 12 }}>{r.date}</td>
                    <td>
                      <span style={{ color: statusColors[r.status] || '#cce4ef', background: `${statusColors[r.status]}18`, padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn view">👁️</button>
                      <button className="action-btn edit" onClick={() => openEdit(r)}>✏️</button>
                      <button className="action-btn delete" onClick={() => setDeleteId(r.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={15} style={{ textAlign: 'center', padding: 28, color: '#3a6a82', fontSize: 13 }}>ไม่พบข้อมูล Putaway</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── SCAN TAB ── */}
        {activeTab === 'scan' && (
          <div className="pa-scan">
            <div className="scan-container">
              <h2>📱 Scan &amp; Assign Location</h2>
              <p style={{ color: '#5a8fa8', fontSize: 13, margin: '0 0 18px' }}>สแกน Barcode, PA Number หรือ Product Name เพื่อดูข้อมูลและมอบหมาย Location</p>

              <div className="scan-input-row">
                <input
                  type="text"
                  className="barcode-input"
                  placeholder="สแกน Barcode / PA Number / Product Name..."
                  value={scanInput}
                  onChange={e => setScanInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleScan()}
                  autoFocus
                />
                <button className="create-btn" onClick={handleScan}>🔍 ค้นหา</button>
              </div>

              {scanResult ? (
                <div className="scan-result-card">
                  <div className="scan-result-header">
                    <span style={{ color: '#00E5FF', fontWeight: 700, fontSize: 16 }}>{scanResult.paNumber}</span>
                    <span style={{ color: statusColors[scanResult.status], background: `${statusColors[scanResult.status]}18`, padding: '3px 12px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                      {scanResult.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="scan-result-grid">
                    <div><span className="sr-label">GR Number</span><span className="sr-val">{scanResult.grNumber}</span></div>
                    <div><span className="sr-label">Product Name</span><span className="sr-val" style={{ color: '#FFD700' }}>{scanResult.sku}</span></div>
                    <div><span className="sr-label">Customer</span><span className="sr-val">{scanResult.customer}</span></div>
                    <div><span className="sr-label">Qty</span><span className="sr-val" style={{ color: '#00CC88', fontWeight: 700 }}>{scanResult.qty} {scanResult.mainUnit}</span></div>
                    <div><span className="sr-label">From</span><span className="sr-val">{scanResult.fromLocation}</span></div>
                    <div><span className="sr-label">To Location</span><span className="sr-val" style={{ color: '#00CC88', fontWeight: 700 }}>{scanResult.toLocation}</span></div>
                    <div><span className="sr-label">BAT No.</span><span className="sr-val">{scanResult.batNumber}</span></div>
                    <div><span className="sr-label">Lot No.</span><span className="sr-val">{scanResult.lotNumber}</span></div>
                    <div><span className="sr-label">Expiry</span><span className="sr-val" style={{ color: '#FFD700' }}>{scanResult.expiryDate}</span></div>
                    <div><span className="sr-label">Assigned To</span><span className="sr-val">{scanResult.assignedTo}</span></div>
                  </div>
                  {scanResult.status !== 'COMPLETE' && scanResult.status !== 'CANCELLED' && (
                    <button className="pa-complete-btn" onClick={() => markComplete(scanResult.id)}>
                      ✅ Mark COMPLETE
                    </button>
                  )}
                </div>
              ) : scanInput && (
                <div style={{ textAlign: 'center', padding: 32, color: '#FF6B6B', fontSize: 14 }}>
                  ❌ ไม่พบข้อมูล: <strong>{scanInput}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── LOCATION MAP TAB ── */}
        {activeTab === 'locations' && (
          <div className="pa-locations">
            <h2>🗺️ Location Map</h2>
            <p style={{ color: '#5a8fa8', fontSize: 13, margin: '0 0 18px' }}>แสดงสถานะการใช้งาน Location — คลิกเพื่อดูรายละเอียด</p>
            <div className="pa-loc-legend">
              <span><span className="loc-dot" style={{ background: '#00CC88' }}></span> ว่าง</span>
              <span><span className="loc-dot" style={{ background: '#FFD700' }}></span> มีสินค้า</span>
              <span><span className="loc-dot" style={{ background: '#00BCD4' }}></span> กำลัง Putaway</span>
            </div>
            <div className="pa-loc-grid">
              {ZONE_LOCATIONS.map(loc => {
                const inProgress = records.find(r => r.toLocation === loc && r.status === 'IN_PROGRESS');
                const complete   = records.find(r => r.toLocation === loc && r.status === 'COMPLETE');
                const color = inProgress ? '#00BCD4' : complete ? '#FFD700' : '#00CC88';
                const item  = inProgress || complete;
                return (
                  <div key={loc} className="pa-loc-cell" style={{ borderColor: `${color}50`, background: `${color}10` }}>
                    <div className="pa-loc-name" style={{ color }}>{loc}</div>
                    {item ? (
                      <>
                        <div style={{ fontSize: 10, color: '#a0c8dc', marginTop: 2 }}>{item.sku}</div>
                        <div style={{ fontSize: 10, color: '#5a8fa8' }}>{item.qty} {item.mainUnit}</div>
                      </>
                    ) : (
                      <div style={{ fontSize: 10, color: '#3a6a82', marginTop: 2 }}>ว่าง</div>
                    )}
                    <span className="loc-status-dot" style={{ background: color }}></span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      {showModal && (
        <div className="rcv-modal-overlay" onClick={closeModal}>
          <div className="rcv-modal-box" onClick={e => e.stopPropagation()}>
            <div className="rcv-modal-header">
              <h2>{editId ? '✏️ แก้ไข Putaway' : '➕ สร้าง Putaway Task'}</h2>
              <button className="rcv-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="rcv-modal-body">

              {/* PA / GR */}
              <div className="rcv-form-row2">
                <div className="rcv-form-group">
                  <label>PA Number <span style={{ fontSize: 10, color: '#5a8fa8' }}>(Auto)</span></label>
                  <input type="text" value={form.paNumber} readOnly style={readonlyStyle} />
                </div>
                <div className="rcv-form-group">
                  <label>GR Number <span style={{ color: '#FF6B6B' }}>*</span></label>
                  <input type="text" value={form.grNumber} onChange={e => { setForm(p => ({ ...p, grNumber: e.target.value })); setFormError(''); }} placeholder="GR-2026-0001" />
                </div>
              </div>

              {/* Product Name / Barcode */}
              <div className="rcv-form-row2">
                <div className="rcv-form-group">
                  <label>Product Name <span style={{ color: '#FF6B6B' }}>*</span></label>
                  <input type="text" value={form.sku} onChange={e => { setForm(p => ({ ...p, sku: e.target.value })); setFormError(''); }} placeholder="Product Name" />
                </div>
                <div className="rcv-form-group">
                  <label>Barcode</label>
                  <input type="text" value={form.barcode} onChange={e => setForm(p => ({ ...p, barcode: e.target.value }))} placeholder="8850000001" />
                </div>
              </div>

              {/* Customer */}
              <div className="rcv-form-group">
                <label>Customer <span style={{ color: '#FF6B6B' }}>*</span></label>
                <select value={form.customer} onChange={e => { setForm(p => ({ ...p, customer: e.target.value })); setFormError(''); }}>
                  <option value="">-- เลือก Customer --</option>
                  {custList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* From / To Location */}
              <div className="rcv-form-row2">
                <div className="rcv-form-group">
                  <label>From Location</label>
                  <input type="text" value={form.fromLocation} onChange={e => setForm(p => ({ ...p, fromLocation: e.target.value }))} placeholder="RECEIVING" />
                </div>
                <div className="rcv-form-group">
                  <label>To Location <span style={{ color: '#FF6B6B' }}>*</span></label>
                  <select value={form.toLocation} onChange={e => { setForm(p => ({ ...p, toLocation: e.target.value })); setFormError(''); }} style={selectStyle}>
                    <option value="">-- เลือก Location --</option>
                    {ZONE_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Qty / Units */}
              <div className="rcv-form-row2">
                <div className="rcv-form-group">
                  <label>Qty <span style={{ color: '#FF6B6B' }}>*</span></label>
                  <input type="number" min="1" value={form.qty} onChange={e => { setForm(p => ({ ...p, qty: e.target.value })); setFormError(''); }} placeholder="0" />
                </div>
                <div className="rcv-form-group">
                  <label>Main Unit</label>
                  <select value={form.mainUnit} onChange={e => setForm(p => ({ ...p, mainUnit: e.target.value }))} style={selectStyle}>
                    {MAIN_UNIT_GROUPS.map(g => (
                      <optgroup key={g.group} label={g.group}>
                        {g.units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sub Unit */}
              <div className="rcv-form-group">
                <label>Sub Unit</label>
                <select value={form.subUnit} onChange={e => setForm(p => ({ ...p, subUnit: e.target.value }))} style={selectStyle}>
                  {SUB_UNIT_GROUPS.map(g => (
                    <optgroup key={g.group} label={g.group}>
                      {g.units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* BAT / LOT */}
              <div className="rcv-form-row2">
                <div className="rcv-form-group">
                  <label>BAT No. <span style={{ color: '#FF6B6B' }}>*</span></label>
                  <input type="text" value={form.batNumber} onChange={e => { setForm(p => ({ ...p, batNumber: e.target.value })); setFormError(''); }} placeholder="BAT-001" />
                </div>
                <div className="rcv-form-group">
                  <label>Lot No. <span style={{ color: '#FF6B6B' }}>*</span></label>
                  <input type="text" value={form.lotNumber} onChange={e => { setForm(p => ({ ...p, lotNumber: e.target.value })); setFormError(''); }} placeholder="LOT-001" />
                </div>
              </div>

              {/* MFG / Expiry */}
              <div className="rcv-form-row2">
                <div className="rcv-form-group">
                  <label>MFG Date</label>
                  <input type="date" value={form.manufactureDate} onChange={e => setForm(p => ({ ...p, manufactureDate: e.target.value }))} />
                </div>
                <div className="rcv-form-group">
                  <label>Expiry Date</label>
                  <input type="date" value={form.expiryDate} onChange={e => setForm(p => ({ ...p, expiryDate: e.target.value }))} />
                </div>
              </div>

              {/* Assigned To / Date */}
              <div className="rcv-form-row2">
                <div className="rcv-form-group">
                  <label>Assigned To <span style={{ fontSize: 10, color: '#5a8fa8' }}>(Auto)</span></label>
                  <input type="text" value={form.assignedTo} readOnly style={readonlyStyle} />
                </div>
                <div className="rcv-form-group">
                  <label>Date <span style={{ fontSize: 10, color: '#5a8fa8' }}>(Auto)</span></label>
                  <input type="date" value={form.date} readOnly style={readonlyStyle} />
                </div>
              </div>

              {/* Status */}
              <div className="rcv-form-group">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={selectStyle}>
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="COMPLETE">COMPLETE</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              {formError && <div className="rcv-form-error">{formError}</div>}
            </div>
            <div className="rcv-modal-footer">
              <button className="rcv-cancel-btn" onClick={closeModal}>ยกเลิก</button>
              <button className="rcv-save-btn" onClick={handleSave}>{editId ? '💾 บันทึก' : '➕ สร้าง Putaway'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteId && (
        <div className="rcv-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="rcv-modal-box rcv-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="rcv-modal-header">
              <h2>🗑️ ยืนยันการลบ</h2>
              <button className="rcv-modal-close" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="rcv-modal-body">
              <p style={{ color: '#b0cdd8', fontSize: 14 }}>
                ต้องการลบ Putaway Task <strong style={{ color: '#FF6B6B' }}>{records.find(r => r.id === deleteId)?.paNumber}</strong> ใช่หรือไม่?
              </p>
            </div>
            <div className="rcv-modal-footer">
              <button className="rcv-cancel-btn" onClick={() => setDeleteId(null)}>ยกเลิก</button>
              <button className="rcv-danger-btn" onClick={() => { setRecords(prev => prev.filter(r => r.id !== deleteId)); setDeleteId(null); }}>
                🗑️ ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PutawayModule;
