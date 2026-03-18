import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MAIN_UNIT_GROUPS, SUB_UNIT_GROUPS } from '../../constants/units';
import { ZONES, ZONE_OPTIONS } from '../../constants/zones';
import * as XLSX from 'xlsx';
import './ReceivingModule.css';

const emptyForm = {
  entryNumber: '', grNumber: '', poNumber: '', supplier: '', customer: '', date: '', receiver: '', items: '', mainUnit: 'PCS', subUnit: 'BOX', status: 'PENDING',
  batNumber: '', lotNumber: '', manufactureDate: '', expiryDate: '', zone: 'A'
};

const toPutawayTask = (order) => {
  const num = (order.grNumber || '').replace('GR-', '') || String(Date.now()).slice(-4);
  return {
    paNumber:        `PA-${num}`,
    grNumber:        order.grNumber,
    sku:             order.supplier || order.grNumber,
    barcode:         '',
    customer:        order.customer,
    fromLocation:    'RECEIVING',
    toLocation:      '',
    qty:             Number(order.items) || 0,
    mainUnit:        order.mainUnit || 'PCS',
    subUnit:         order.subUnit  || 'BOX',
    batNumber:       order.batNumber       || '',
    lotNumber:       order.lotNumber       || '',
    manufactureDate: order.manufactureDate || '',
    expiryDate:      order.expiryDate      || '',
    assignedTo:      '',
    date:            new Date().toISOString().slice(0, 10),
    status:          'PENDING',
  };
};

const toInventoryItem = (order) => ({
  sku:             order.grNumber,
  barcode:         '',
  product:         `${order.supplier || 'Received'} (${order.grNumber})`,
  description:     `รับจาก ${order.supplier || '-'} | PO: ${order.poNumber || '-'}`,
  customer:        order.customer,
  warehouse:       'Warehouse A',
  location:        `${order.zone || 'A'}-01-1-A`,
  quantity:        Number(order.items) || 0,
  available:       Number(order.items) || 0,
  minStock:        0,
  mainUnit:        order.mainUnit,
  subUnit:         order.subUnit,
  batNumber:       order.batNumber,
  lotNumber:       order.lotNumber,
  manufactureDate: order.manufactureDate,
  expiryDate:      order.expiryDate,
  status:          'GOOD',
  grRef:           order.grNumber,
});

function ReceivingModule({ onReceive, onPutaway, receivingOrders, setReceivingOrders }) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('list');

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [zoneFilter, setZoneFilter] = useState('');

  const INLINE_COUNT = 10;
  const emptyInlineRow = () => ({ entryNumber: '', poNumber: '', supplier: '', customer: '', items: '', mainUnit: 'PCS', subUnit: 'BOX', batNumber: '', lotNumber: '', manufactureDate: '', expiryDate: '', zone: 'A', status: 'PENDING' });
  const [inlineRows, setInlineRows] = useState(() => Array.from({ length: INLINE_COUNT }, emptyInlineRow));

  const updateInlineRow = (idx, field, value) => {
    setInlineRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const saveInlineRow = (idx) => {
    const row = inlineRows[idx];
    if (!row.customer.trim()) { alert('กรุณาระบุ Customer'); return; }
    if (!row.items || Number(row.items) <= 0) { alert('กรุณาระบุ Item Quantity'); return; }
    const nextNum = String(receivingOrders.length + 1).padStart(4, '0');
    const newOrder = {
      id: Date.now() + idx,
      grNumber: `GR-2026-${nextNum}`,
      date: new Date().toISOString().slice(0, 10),
      receiver: currentUser,
      ...row,
      items: Number(row.items) || 0,
      addedToInventory: row.status === 'COMPLETE',
    };
    setReceivingOrders(prev => [...prev, newOrder]);
    if (row.status === 'COMPLETE') {
      onReceive?.(toInventoryItem(newOrder));
      onPutaway?.(toPutawayTask(newOrder));
    }
    setInlineRows(prev => prev.map((r, i) => i === idx ? emptyInlineRow() : r));
  };

  const currentUser = localStorage.getItem('currentUser') || 'Current User';

  const downloadTemplate = () => {
    const headers = ['GR Number','PO Number','Supplier','Customer','Date (YYYY-MM-DD)','Receiver','Items (Qty)','Main Unit','Sub Unit','Status','Batch Number','Lot Number','Manufacture Date (YYYY-MM-DD)','Expiry Date (YYYY-MM-DD)'];
    const example = ['GR-2026-0001','PO-2026-0001','Supplier A','Customer A','2026-03-13','Somchai','50','PCS','BOX','PENDING','BAT-001','LOT-001','2025-01-15','2027-01-15'];
    const ws = XLSX.utils.aoa_to_sheet([headers, example]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Receiving Template');
    XLSX.writeFile(wb, 'template_receiving.xlsx');
  };

  const openCreate = () => {
    const nextNum = String(receivingOrders.length + 1).padStart(4, '0');
    setForm({ ...emptyForm, grNumber: `GR-2026-${nextNum}`, date: new Date().toISOString().slice(0, 10), receiver: currentUser });
    setEditId(null);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (order) => {
    setForm({ ...order });
    setEditId(order.id);
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditId(null); setFormError(''); };

  const handleSave = () => {
    if (!form.grNumber.trim())      { setFormError('กรุณาระบุ GR Number'); return; }
    if (!form.customer.trim())      { setFormError('กรุณาระบุ Customer *'); return; }
    if (!form.items || Number(form.items) <= 0) { setFormError('กรุณาระบุ Item Quantity *'); return; }
    if (editId) {
      const prevOrder = receivingOrders.find(o => o.id === editId);
      const updatedOrder = { ...prevOrder, ...form, items: Number(form.items) || 0 };
      setReceivingOrders(prev => prev.map(o => o.id === editId ? updatedOrder : o));
      // ถ้าเปลี่ยน status เป็น COMPLETE ครั้งแรก → เพิ่มเข้า Inventory + สร้าง Putaway
      if (form.status === 'COMPLETE' && prevOrder?.status !== 'COMPLETE' && !prevOrder?.addedToInventory) {
        onReceive?.(toInventoryItem(updatedOrder));
        onPutaway?.(toPutawayTask(updatedOrder));
        setReceivingOrders(prev => prev.map(o => o.id === editId ? { ...o, addedToInventory: true } : o));
      }
    } else {
      const newOrder = { id: Date.now(), ...form, items: Number(form.items) || 0, addedToInventory: form.status === 'COMPLETE' };
      setReceivingOrders(prev => [...prev, newOrder]);
      if (form.status === 'COMPLETE') {
        onReceive?.(toInventoryItem(newOrder));
        onPutaway?.(toPutawayTask(newOrder));
      }
    }
    closeModal();
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('/api/v1/wms/import/receiving', { method: 'POST', body: formData });
      const result = await response.json();
      alert(`${t('messages.imported')}: ${result.imported_count} ${t('receiving.items')}`);
    } catch (error) {
      /* import error handled by alert below */
      alert(t('messages.error'));
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/v1/wms/export/receiving?warehouse_id=1&start_date=2026-03-01&end_date=2026-03-31');
      const result = await response.json();
      window.location.href = result.file_url;
    } catch (error) {
      /* export error — silently ignore */
    }
  };

  const statusColors = { PENDING: '#FFD700', RECEIVING: '#00BCD4', COMPLETE: '#00CC88', CANCELLED: '#FF6B6B' };

  const readonlyStyle = { background: 'rgba(0,188,212,0.05)', color: '#5a8fa8', cursor: 'not-allowed', border: '1px solid rgba(0,188,212,0.15)' };
  const selectStyle = { padding: '9px 12px', background: 'rgba(0,20,40,0.8)', border: '1px solid rgba(0,188,212,0.4)', borderRadius: 6, fontSize: 13, color: '#ffffff', fontFamily: 'inherit', width: '100%', fontWeight: 600 };

  return (
    <div className="wms-module receiving-module">
      <div className="module-header">
        <div className="header-left">
          <h1>{t('receiving.title')}</h1>
          <p>{t('receiving.newOrder')}</p>
        </div>
        <div className="header-right">
          <button onClick={toggleLanguage} className="lang-btn">
            {i18n.language === 'en' ? '🇹🇭 ไทย' : '🇬🇧 English'}
          </button>
        </div>
      </div>

      <div className="module-tabs">
        <button className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
          📋 {t('receiving.title')}
        </button>
        <button className={`tab-btn ${activeTab === 'scan' ? 'active' : ''}`} onClick={() => setActiveTab('scan')}>
          📱 {t('receiving.scanItem')}
        </button>
        <button className={`tab-btn ${activeTab === 'qc' ? 'active' : ''}`} onClick={() => setActiveTab('qc')}>
          ✓ {t('receiving.qc')}
        </button>
      </div>

      <div className="module-content">
        {activeTab === 'list' && (
          <div className="receiving-list">
            <div className="controls">
              <select value={zoneFilter} onChange={e => setZoneFilter(e.target.value)} style={{ padding:'7px 10px', background:'rgba(0,20,40,0.8)', border:'1px solid rgba(0,229,255,0.3)', borderRadius:6, color:'#00E5FF', fontSize:12, fontWeight:600 }}>
                {ZONE_OPTIONS.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
              </select>
              <label className="import-btn">
                📥 {t('receiving.importExcel')}
                <input type="file" accept=".xlsx,.xls" onChange={handleImport} hidden />
              </label>
              <button onClick={handleExport} className="export-btn">📤 {t('receiving.exportPDF')}</button>
              <button onClick={downloadTemplate} className="export-btn" style={{background:'rgba(0,204,136,0.12)',color:'#00CC88',border:'1px solid rgba(0,204,136,0.3)'}}>📋 Download Template</button>
              <button className="create-btn" onClick={openCreate}>➕ {t('buttons.create')}</button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Entry No.</th>
                  <th>{t('receiving.grNumber')}</th>
                  <th>{t('receiving.poNumber')}</th>
                  <th>{t('receiving.supplier')}</th>
                  <th>Customer</th>
                  <th>{t('receiving.date')}</th>
                  <th>{t('receiving.receiver')}</th>
                  <th>{t('receiving.items')}</th>
                  <th>Main Unit</th>
                  <th>Sub Unit</th>
                  <th>BAT No.</th>
                  <th>Lot No.</th>
                  <th>MFG Date</th>
                  <th>Expiry Date</th>
                  <th>Zone</th>
                  <th>{t('receiving.status')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {(zoneFilter ? receivingOrders.filter(o => o.zone === zoneFilter) : receivingOrders).map(order => (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#FFD700', fontWeight: 700 }}>{order.entryNumber || '-'}</td>
                    <td>{order.grNumber}</td>
                    <td>{order.poNumber || '-'}</td>
                    <td>{order.supplier || '-'}</td>
                    <td style={{ color: '#a0c8dc', fontWeight: 600 }}>{order.customer || '-'}</td>
                    <td>{order.date}</td>
                    <td>{order.receiver || '-'}</td>
                    <td>{order.items}</td>
                    <td><span style={{ background: 'rgba(0,188,212,0.1)', color: '#00E5FF', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{order.mainUnit || '-'}</span></td>
                    <td><span style={{ background: 'rgba(0,204,136,0.1)', color: '#00CC88', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{order.subUnit || '-'}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#00E5FF' }}>{order.batNumber || '-'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#00CC88' }}>{order.lotNumber || '-'}</td>
                    <td style={{ fontSize: 12 }}>{order.manufactureDate || '-'}</td>
                    <td style={{ fontSize: 12, color: order.expiryDate ? '#FFD700' : undefined }}>{order.expiryDate || '-'}</td>
                    <td>{(() => { const z = ZONES.find(z => z.id === order.zone); return z ? <span style={{ background: `${z.color}18`, color: z.color, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{z.label}</span> : '-'; })()}</td>
                    <td>
                      <span className={`status ${order.status}`} style={{ color: statusColors[order.status] || '#cce4ef', background: `${statusColors[order.status]}18`, padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn view">👁️</button>
                      <button className="action-btn edit" onClick={() => openEdit(order)}>✏️</button>
                      <button className="action-btn delete" onClick={() => setDeleteId(order.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {receivingOrders.length === 0 && inlineRows.every(r => !r.customer && !r.items) && (
                  <tr><td colSpan={17} style={{ textAlign: 'center', padding: 28, color: '#3a6a82', fontSize: 13 }}>{t('receiving.noOrders')}</td></tr>
                )}
                {/* ── 10 Inline Input Rows ── */}
                {inlineRows.map((row, idx) => {
                  const iStyle = { background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.18)', borderRadius: 4, color: '#cce4ef', padding: '4px 6px', fontSize: 11, width: '100%', minWidth: 50, boxSizing: 'border-box' };
                  const selStyle = { ...iStyle, cursor: 'pointer' };
                  return (
                    <tr key={`inline-${idx}`} style={{ background: 'rgba(0,229,255,0.02)' }}>
                      <td><input value={row.entryNumber} onChange={e => updateInlineRow(idx, 'entryNumber', e.target.value)} placeholder="EN-..." style={{ ...iStyle, borderColor: 'rgba(255,215,0,0.35)', color: '#FFD700', fontFamily: 'monospace' }} /></td>
                      <td style={{ color: '#3a6a82', fontSize: 11, fontStyle: 'italic' }}>Auto</td>
                      <td><input value={row.poNumber} onChange={e => updateInlineRow(idx, 'poNumber', e.target.value)} placeholder="PO-..." style={iStyle} /></td>
                      <td><input value={row.supplier} onChange={e => updateInlineRow(idx, 'supplier', e.target.value)} placeholder="Supplier" style={iStyle} /></td>
                      <td><input value={row.customer} onChange={e => updateInlineRow(idx, 'customer', e.target.value)} placeholder="Customer *" style={{ ...iStyle, borderColor: 'rgba(0,229,255,0.35)' }} /></td>
                      <td style={{ color: '#3a6a82', fontSize: 11, fontStyle: 'italic' }}>Today</td>
                      <td style={{ color: '#3a6a82', fontSize: 11, fontStyle: 'italic' }}>Auto</td>
                      <td><input type="number" min="1" value={row.items} onChange={e => updateInlineRow(idx, 'items', e.target.value)} placeholder="Qty *" style={{ ...iStyle, maxWidth: 60 }} /></td>
                      <td>
                        <select value={row.mainUnit} onChange={e => updateInlineRow(idx, 'mainUnit', e.target.value)} style={selStyle}>
                          {MAIN_UNIT_GROUPS.map(g => <optgroup key={g.group} label={g.group}>{g.units.map(u => <option key={u.value} value={u.value}>{u.value}</option>)}</optgroup>)}
                        </select>
                      </td>
                      <td>
                        <select value={row.subUnit} onChange={e => updateInlineRow(idx, 'subUnit', e.target.value)} style={selStyle}>
                          {SUB_UNIT_GROUPS.map(g => <optgroup key={g.group} label={g.group}>{g.units.map(u => <option key={u.value} value={u.value}>{u.value}</option>)}</optgroup>)}
                        </select>
                      </td>
                      <td><input value={row.batNumber} onChange={e => updateInlineRow(idx, 'batNumber', e.target.value)} placeholder="BAT-001" style={iStyle} /></td>
                      <td><input value={row.lotNumber} onChange={e => updateInlineRow(idx, 'lotNumber', e.target.value)} placeholder="LOT-001" style={iStyle} /></td>
                      <td><input type="date" value={row.manufactureDate} onChange={e => updateInlineRow(idx, 'manufactureDate', e.target.value)} style={iStyle} /></td>
                      <td><input type="date" value={row.expiryDate} onChange={e => updateInlineRow(idx, 'expiryDate', e.target.value)} style={iStyle} /></td>
                      <td>
                        <select value={row.zone} onChange={e => updateInlineRow(idx, 'zone', e.target.value)} style={selStyle}>
                          {ZONES.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
                        </select>
                      </td>
                      <td>
                        <select value={row.status} onChange={e => updateInlineRow(idx, 'status', e.target.value)} style={selStyle}>
                          <option value="PENDING">PENDING</option>
                          <option value="RECEIVING">RECEIVING</option>
                          <option value="COMPLETE">COMPLETE</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td>
                        <button onClick={() => saveInlineRow(idx)} style={{ background: 'rgba(0,204,136,0.15)', color: '#00CC88', border: '1px solid rgba(0,204,136,0.3)', borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>+ Save</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'scan' && (
          <div className="receiving-scan">
            <div className="scan-container">
              <h2>📱 {t('receiving.scanItem')}</h2>
              <div className="scan-input">
                <input type="text" placeholder={t('receiving.scanItem')} className="barcode-input" autoFocus />
              </div>
              <div className="scanned-items">
                <h3>{t('receiving.items')}</h3>
                <table className="scan-table">
                  <thead>
                    <tr>
                      <th>{t('common.sku')}</th>
                      <th>{t('receiving.quantity')}</th>
                      <th>{t('receiving.location')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>SKU001</td><td>100</td><td>A-01-1-A</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'qc' && (
          <div className="receiving-qc">
            <h2>✓ {t('receiving.qc')}</h2>
            <div className="qc-form">
              <div className="form-group">
                <label>{t('receiving.grNumber')}</label>
                <input type="text" placeholder="GR-2026-0001" />
              </div>
              <div className="form-group">
                <label>{t('receiving.scanItem')}</label>
                <input type="text" placeholder={t('receiving.scanItem')} />
              </div>
              <div className="form-group">
                <label>{t('receiving.qcStatus')}</label>
                <select>
                  <option>PENDING</option>
                  <option>PASS</option>
                  <option>FAIL</option>
                </select>
              </div>
              <button className="save-btn">{t('buttons.save')}</button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="rcv-modal-overlay" onClick={closeModal}>
          <div className="rcv-modal-box" onClick={e => e.stopPropagation()}>
            <div className="rcv-modal-header">
              <h2>{editId ? `✏️ ${t('receiving.editOrder')}` : `➕ ${t('receiving.createOrder')}`}</h2>
              <button className="rcv-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="rcv-modal-body">

              {/* Entry No. / GR / PO */}
              <div className="rcv-form-row2">
                <div className="rcv-form-group">
                  <label>Entry No.</label>
                  <input type="text" value={form.entryNumber} onChange={e => setForm(p => ({ ...p, entryNumber: e.target.value }))} placeholder="EN-2026-0001" style={{ fontFamily: 'monospace', fontWeight: 700, color: '#FFD700' }} />
                </div>
                <div className="rcv-form-group">
                  <label>GR Number <span style={{ color: '#00E5FF' }}>*</span> <span style={{ fontSize: 10, color: '#5a8fa8' }}>(Auto)</span></label>
                  <input type="text" value={form.grNumber} readOnly style={readonlyStyle} />
                </div>
              </div>
              <div className="rcv-form-group">
                <label>PO Number</label>
                <input type="text" value={form.poNumber} onChange={e => setForm(p => ({ ...p, poNumber: e.target.value }))} placeholder="PO-2026-0001" />
              </div>

              {/* Supplier / Customer */}
              <div className="rcv-form-row2">
                <div className="rcv-form-group">
                  <label>Supplier</label>
                  <input type="text" value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))} placeholder="Supplier name" />
                </div>
                <div className="rcv-form-group">
                  <label>Customer <span style={{ color: '#FF6B6B' }}>*</span></label>
                  <input type="text" value={form.customer} onChange={e => { setForm(p => ({ ...p, customer: e.target.value })); setFormError(''); }} placeholder="Customer name" />
                </div>
              </div>

              {/* Date / Receiver */}
              <div className="rcv-form-row2">
                <div className="rcv-form-group">
                  <label>Receive Date <span style={{ fontSize: 10, color: '#5a8fa8' }}>(Auto)</span></label>
                  <input type="date" value={form.date} readOnly style={readonlyStyle} />
                </div>
                <div className="rcv-form-group">
                  <label>Receiver <span style={{ fontSize: 10, color: '#5a8fa8' }}>(Auto)</span></label>
                  <input type="text" value={form.receiver} readOnly style={readonlyStyle} />
                </div>
              </div>

              {/* Item Qty */}
              <div className="rcv-form-group">
                <label>Item Quantity <span style={{ color: '#FF6B6B' }}>*</span></label>
                <input type="number" min="1" value={form.items} onChange={e => { setForm(p => ({ ...p, items: e.target.value })); setFormError(''); }} placeholder="0" />
              </div>

              {/* Main Unit / Sub Unit */}
              <div className="rcv-form-row2">
                <div className="rcv-form-group">
                  <label>Main Unit</label>
                  <select value={form.mainUnit} onChange={e => { setForm(p => ({ ...p, mainUnit: e.target.value })); setFormError(''); }} style={selectStyle}>
                    <option value="">-- Select Main Unit --</option>
                    {MAIN_UNIT_GROUPS.map(g => (
                      <optgroup key={g.group} label={g.group}>
                        {g.units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="rcv-form-group">
                  <label>Sub Unit</label>
                  <select value={form.subUnit} onChange={e => { setForm(p => ({ ...p, subUnit: e.target.value })); setFormError(''); }} style={selectStyle}>
                    <option value="">-- Select Sub Unit --</option>
                    {SUB_UNIT_GROUPS.map(g => (
                      <optgroup key={g.group} label={g.group}>
                        {g.units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* BAT / LOT */}
              <div className="rcv-form-row2">
                <div className="rcv-form-group">
                  <label>BAT No.</label>
                  <input type="text" value={form.batNumber} onChange={e => { setForm(p => ({ ...p, batNumber: e.target.value })); setFormError(''); }} placeholder="BAT-001" />
                </div>
                <div className="rcv-form-group">
                  <label>Lot No.</label>
                  <input type="text" value={form.lotNumber} onChange={e => { setForm(p => ({ ...p, lotNumber: e.target.value })); setFormError(''); }} placeholder="LOT-001" />
                </div>
              </div>

              {/* MFG / Expiry */}
              <div className="rcv-form-row2">
                <div className="rcv-form-group">
                  <label>MFG Date</label>
                  <input type="date" value={form.manufactureDate} onChange={e => { setForm(p => ({ ...p, manufactureDate: e.target.value })); setFormError(''); }} />
                </div>
                <div className="rcv-form-group">
                  <label>Expiry Date</label>
                  <input type="date" value={form.expiryDate} onChange={e => { setForm(p => ({ ...p, expiryDate: e.target.value })); setFormError(''); }} />
                </div>
              </div>

              {/* Zone */}
              <div className="rcv-form-group">
                <label>Zone</label>
                <select value={form.zone || 'A'} onChange={e => setForm(p => ({ ...p, zone: e.target.value }))} style={selectStyle}>
                  {ZONES.map(z => <option key={z.id} value={z.id}>{z.label} — {z.description}</option>)}
                </select>
              </div>

              {/* Status */}
              <div className="rcv-form-group">
                <label>{t('receiving.statusLabel')}</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="PENDING">PENDING</option>
                  <option value="RECEIVING">RECEIVING</option>
                  <option value="COMPLETE">COMPLETE</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              {formError && <div className="rcv-form-error">{formError}</div>}
            </div>
            <div className="rcv-modal-footer">
              <button className="rcv-cancel-btn" onClick={closeModal}>{t('buttons.cancel')}</button>
              <button className="rcv-save-btn" onClick={handleSave}>{editId ? `💾 ${t('buttons.save')}` : `➕ ${t('receiving.createOrderBtn')}`}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="rcv-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="rcv-modal-box rcv-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="rcv-modal-header">
              <h2>🗑️ {t('receiving.confirmDelete')}</h2>
              <button className="rcv-modal-close" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="rcv-modal-body">
              <p style={{ color: '#b0cdd8', fontSize: 14 }}>
                {t('receiving.confirmDeleteMsg')} <strong style={{ color: '#FF6B6B' }}>{receivingOrders.find(o => o.id === deleteId)?.grNumber}</strong> {t('receiving.confirmDeleteQ')}
              </p>
            </div>
            <div className="rcv-modal-footer">
              <button className="rcv-cancel-btn" onClick={() => setDeleteId(null)}>{t('buttons.cancel')}</button>
              <button className="rcv-danger-btn" onClick={() => { setReceivingOrders(prev => prev.filter(o => o.id !== deleteId)); setDeleteId(null); }}>
                🗑️ {t('buttons.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceivingModule;
