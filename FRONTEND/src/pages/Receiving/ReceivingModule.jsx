import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MAIN_UNIT_GROUPS, SUB_UNIT_GROUPS } from '../../constants/units';
import * as XLSX from 'xlsx';
import { customerApi } from '../../services/api';
import './ReceivingModule.css';

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  entryNumber: '', grNumber: '', poNumber: '', supplier: '', customer: '', date: '', items: '', mainUnit: 'PCS', subUnit: 'BOX', status: 'PENDING',
  batNumber: '', lotNumber: '', manufactureDate: '', expiryDate: '',
};

const toPutawayTask = (order) => {
  const num = (order.grNumber || '').replace('GR-', '') || String(Date.now()).slice(-4);
  return {
    paNumber:        `PA-${num}`,
    grNumber:        order.grNumber,
    sku:             order.customer || order.grNumber,
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
    date:            today(),
    status:          'PENDING',
  };
};

const toInventoryItem = (order) => ({
  sku:             order.grNumber,
  barcode:         '',
  product:         `${order.customer || 'Received'} (${order.grNumber})`,
  description:     `รับจาก ${order.customer || '-'} | PO: ${order.poNumber || '-'}`,
  customer:        order.customer,
  warehouse:       'Warehouse A',
  location:        'A-01-1-A',
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

function ReceivingModule({ onReceive, onPutaway, receivingOrders, setReceivingOrders, currentUser }) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('list');

  const [custList, setCustList] = useState([]);
  useEffect(() => {
    customerApi.list(currentUser?.companyNo).then(data => {
      if (Array.isArray(data)) setCustList(data.map(c => c.name).filter(Boolean));
    }).catch(() => {});
  }, [currentUser?.companyNo]);

  // ── GR Header (entered once, shared by all inline rows) ──────────────────
  const [header, setHeader] = useState({ poNumber: '', supplier: '', customer: '', date: today() });

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const INLINE_COUNT = 10;
  const emptyInlineRow = () => ({ items: '', mainUnit: 'PCS', subUnit: 'BOX', batNumber: '', lotNumber: '', manufactureDate: '', expiryDate: '', status: 'PENDING' });
  const [inlineRows, setInlineRows] = useState(() => Array.from({ length: INLINE_COUNT }, emptyInlineRow));

  const updateInlineRow = (idx, field, value) => {
    setInlineRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const saveInlineRow = (idx) => {
    const row = inlineRows[idx];
    if (!header.customer.trim()) { alert('กรุณาระบุ Customer ในส่วน Header'); return; }
    if (!row.items || Number(row.items) <= 0) { alert('กรุณาระบุ Item Quantity'); return; }
    const nextNum = String(receivingOrders.length + 1).padStart(4, '0');
    const newOrder = {
      id: Date.now() + idx,
      grNumber: `GR-2026-${nextNum}`,
      poNumber: header.poNumber,
      supplier: header.supplier,
      customer: header.customer,
      date: header.date || today(),
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

  const downloadTemplate = () => {
    const headers = ['GR Number','PO Number','Supplier','Customer','Date (YYYY-MM-DD)','Items (Qty)','Main Unit','Sub Unit','Status','Batch Number','Lot Number','Manufacture Date (YYYY-MM-DD)','Expiry Date (YYYY-MM-DD)'];
    const example = ['GR-2026-0001','PO-2026-0001','Supplier A','Customer A','2026-03-13','50','PCS','BOX','PENDING','BAT-001','LOT-001','2025-01-15','2027-01-15'];
    const ws = XLSX.utils.aoa_to_sheet([headers, example]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Receiving Template');
    XLSX.writeFile(wb, 'template_receiving.xlsx');
  };

  const openCreate = () => {
    const nextNum = String(receivingOrders.length + 1).padStart(4, '0');
    setForm({ ...emptyForm, grNumber: `GR-2026-${nextNum}`, date: today(), poNumber: header.poNumber, supplier: header.supplier, customer: header.customer });
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
    if (!form.customer.trim())      { setFormError('กรุณาระบุ Customer'); return; }
    if (!form.items || Number(form.items) <= 0) { setFormError('กรุณาระบุ Item Quantity *'); return; }
    if (editId) {
      const prevOrder = receivingOrders.find(o => o.id === editId);
      const updatedOrder = { ...prevOrder, ...form, items: Number(form.items) || 0 };
      setReceivingOrders(prev => prev.map(o => o.id === editId ? updatedOrder : o));
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

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (rows.length < 2) { alert('ไม่พบข้อมูลในไฟล์'); return; }
        const imported = rows.slice(1).filter(r => r[0] || r[3]).map((r, i) => ({
          id: Date.now() + i,
          grNumber:        String(r[0] || '').trim() || `GR-IMP-${String(Date.now() + i).slice(-4)}`,
          poNumber:        String(r[1] || '').trim(),
          supplier:        String(r[2] || '').trim(),
          customer:        String(r[3] || '').trim(),
          date:            String(r[4] || today()).trim(),
          items:           Number(r[5]) || 0,
          mainUnit:        String(r[6] || 'PCS').trim(),
          subUnit:         String(r[7] || 'BOX').trim(),
          status:          String(r[8] || 'PENDING').trim(),
          batNumber:       String(r[9] || '').trim(),
          lotNumber:       String(r[10] || '').trim(),
          manufactureDate: String(r[11] || '').trim(),
          expiryDate:      String(r[12] || '').trim(),
          addedToInventory: false,
        }));
        setReceivingOrders(prev => [...prev, ...imported]);
        alert(`นำเข้าสำเร็จ ${imported.length} รายการ`);
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
    event.target.value = '';
  };

  const handleExport = () => {
    const rows = receivingOrders.map(o => ({
      'GR Number':        o.grNumber,
      'PO Number':        o.poNumber || '',
      'Supplier':         o.supplier || '',
      'Customer':         o.customer || '',
      'Date':             o.date || '',
      'Items (Qty)':      o.items,
      'Main Unit':        o.mainUnit || '',
      'Sub Unit':         o.subUnit || '',
      'Status':           o.status,
      'BAT No.':          o.batNumber || '',
      'Lot No.':          o.lotNumber || '',
      'MFG Date':         o.manufactureDate || '',
      'Expiry Date':      o.expiryDate || '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Receiving');
    XLSX.writeFile(wb, `receiving_export_${today()}.xlsx`);
  };

  // ── Scan tab state ────────────────────────────────────────────────────────
  const [scan, setScan] = useState({ customer: '', supplier: '', poNumber: '' });
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanQty, setScanQty] = useState(1);
  const [scannedItems, setScannedItems] = useState([]);

  const handleBarcodeScan = (e) => {
    if (e.key !== 'Enter' && e.type !== 'click') return;
    const code = barcodeInput.trim();
    if (!code) return;
    setScannedItems(prev => {
      const existing = prev.find(i => i.barcode === code);
      if (existing) return prev.map(i => i.barcode === code ? { ...i, qty: i.qty + Number(scanQty || 1) } : i);
      return [...prev, { id: Date.now(), barcode: code, qty: Number(scanQty || 1) }];
    });
    setBarcodeInput('');
    setScanQty(1);
  };

  const removeScanItem = (id) => setScannedItems(prev => prev.filter(i => i.id !== id));

  const saveScanAsGR = () => {
    if (!scan.customer) { alert('กรุณาเลือก Customer'); return; }
    if (scannedItems.length === 0) { alert('ยังไม่มีสินค้าที่สแกน'); return; }
    const totalQty = scannedItems.reduce((s, i) => s + i.qty, 0);
    const nextNum = String(receivingOrders.length + 1).padStart(4, '0');
    const newOrder = {
      id: Date.now(),
      grNumber: `GR-2026-${nextNum}`,
      poNumber: scan.poNumber,
      supplier: scan.supplier,
      customer: scan.customer,
      date: today(),
      items: totalQty,
      mainUnit: 'PCS', subUnit: 'BOX',
      batNumber: '', lotNumber: '', manufactureDate: '', expiryDate: '',
      status: 'RECEIVING',
      addedToInventory: false,
      scanItems: scannedItems,
    };
    setReceivingOrders(prev => [...prev, newOrder]);
    setScannedItems([]);
    setScan({ customer: '', supplier: '', poNumber: '' });
    alert(`บันทึก GR สำเร็จ: ${newOrder.grNumber} (${totalQty} รายการ)`);
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

            {/* ── GR Header ── */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.18)', borderRadius: 8, padding: '12px 16px', marginBottom: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
                <label style={{ fontSize: 11, color: '#5a8fa8', fontWeight: 600 }}>PO No.</label>
                <input
                  value={header.poNumber}
                  onChange={e => setHeader(p => ({ ...p, poNumber: e.target.value }))}
                  placeholder="PO-2026-0001"
                  style={{ padding: '7px 10px', background: 'rgba(0,20,40,0.8)', border: '1px solid rgba(0,229,255,0.3)', borderRadius: 5, color: '#cce4ef', fontSize: 13, fontFamily: 'monospace' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 180 }}>
                <label style={{ fontSize: 11, color: '#5a8fa8', fontWeight: 600 }}>Supplier</label>
                <input
                  value={header.supplier}
                  onChange={e => setHeader(p => ({ ...p, supplier: e.target.value }))}
                  placeholder="Supplier name"
                  style={{ padding: '7px 10px', background: 'rgba(0,20,40,0.8)', border: '1px solid rgba(0,229,255,0.3)', borderRadius: 5, color: '#cce4ef', fontSize: 13 }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 200 }}>
                <label style={{ fontSize: 11, color: '#5a8fa8', fontWeight: 600 }}>Customer <span style={{ color: '#FF6B6B' }}>*</span></label>
                <select
                  value={header.customer}
                  onChange={e => setHeader(p => ({ ...p, customer: e.target.value }))}
                  style={{ padding: '7px 10px', background: 'rgba(0,20,40,0.8)', border: `1px solid ${header.customer ? 'rgba(0,229,255,0.3)' : 'rgba(255,107,107,0.5)'}`, borderRadius: 5, color: '#cce4ef', fontSize: 13 }}
                >
                  <option value="">-- เลือก Customer --</option>
                  {custList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
                <label style={{ fontSize: 11, color: '#5a8fa8', fontWeight: 600 }}>Date <span style={{ color: '#5a8fa8', fontWeight: 400 }}>(Auto)</span></label>
                <input
                  value={header.date}
                  readOnly
                  style={{ padding: '7px 10px', background: 'rgba(0,188,212,0.05)', border: '1px solid rgba(0,188,212,0.15)', borderRadius: 5, color: '#5a8fa8', fontSize: 13, cursor: 'default' }}
                />
              </div>
            </div>

            <div className="controls">
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
                  <th>{t('receiving.grNumber')}</th>
                  <th>{t('receiving.poNumber')}</th>
                  <th>Supplier</th>
                  <th>Customer</th>
                  <th>{t('receiving.date')}</th>
                  <th>{t('receiving.items')}</th>
                  <th>Main Unit</th>
                  <th>Sub Unit</th>
                  <th>{t('receiving.status')}</th>
                  <th>Batch Number</th>
                  <th>Lot Number</th>
                  <th>MFG Date</th>
                  <th>EXP Date</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {receivingOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.grNumber}</td>
                    <td>{order.poNumber || '-'}</td>
                    <td>{order.supplier || '-'}</td>
                    <td style={{ color: '#a0c8dc', fontWeight: 600 }}>{order.customer || '-'}</td>
                    <td>{order.date}</td>
                    <td>{order.items}</td>
                    <td><span style={{ background: 'rgba(0,188,212,0.1)', color: '#00E5FF', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{order.mainUnit || '-'}</span></td>
                    <td><span style={{ background: 'rgba(0,204,136,0.1)', color: '#00CC88', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{order.subUnit || '-'}</span></td>
                    <td>
                      <span className={`status ${order.status}`} style={{ color: statusColors[order.status] || '#cce4ef', background: `${statusColors[order.status]}18`, padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#00E5FF' }}>{order.batNumber || '-'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#00CC88' }}>{order.lotNumber || '-'}</td>
                    <td style={{ fontSize: 12 }}>{order.manufactureDate || '-'}</td>
                    <td style={{ fontSize: 12, color: order.expiryDate ? '#FFD700' : undefined }}>{order.expiryDate || '-'}</td>
                    <td>
                      <button className="action-btn view">👁️</button>
                      <button className="action-btn edit" onClick={() => openEdit(order)}>✏️</button>
                      <button className="action-btn delete" onClick={() => setDeleteId(order.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {receivingOrders.length === 0 && inlineRows.every(r => !r.items) && (
                  <tr><td colSpan={14} style={{ textAlign: 'center', padding: 28, color: '#3a6a82', fontSize: 13 }}>{t('receiving.noOrders')}</td></tr>
                )}
                {/* ── 10 Inline Input Rows ── */}
                {inlineRows.map((row, idx) => {
                  const iStyle = { background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.18)', borderRadius: 4, color: '#cce4ef', padding: '4px 6px', fontSize: 11, width: '100%', minWidth: 50, boxSizing: 'border-box' };
                  const selStyle = { ...iStyle, cursor: 'pointer' };
                  return (
                    <tr key={`inline-${idx}`} style={{ background: 'rgba(0,229,255,0.02)' }}>
                      <td style={{ color: '#3a6a82', fontSize: 11, fontStyle: 'italic' }}>Auto</td>
                      <td style={{ color: '#5a8fa8', fontSize: 11 }}>{header.poNumber || '-'}</td>
                      <td style={{ color: '#5a8fa8', fontSize: 11 }}>{header.supplier || '-'}</td>
                      <td style={{ color: '#5a8fa8', fontSize: 11 }}>{header.customer || <span style={{ color: '#FF6B6B', fontSize: 10 }}>⚠ Set Header</span>}</td>
                      <td style={{ color: '#5a8fa8', fontSize: 11 }}>{header.date}</td>
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
                      <td>
                        <select value={row.status} onChange={e => updateInlineRow(idx, 'status', e.target.value)} style={selStyle}>
                          <option value="PENDING">PENDING</option>
                          <option value="RECEIVING">RECEIVING</option>
                          <option value="COMPLETE">COMPLETE</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td><input value={row.batNumber} onChange={e => updateInlineRow(idx, 'batNumber', e.target.value)} placeholder="BAT-001" style={iStyle} /></td>
                      <td><input value={row.lotNumber} onChange={e => updateInlineRow(idx, 'lotNumber', e.target.value)} placeholder="LOT-001" style={iStyle} /></td>
                      <td><input type="date" value={row.manufactureDate} onChange={e => updateInlineRow(idx, 'manufactureDate', e.target.value)} style={iStyle} /></td>
                      <td><input type="date" value={row.expiryDate} onChange={e => updateInlineRow(idx, 'expiryDate', e.target.value)} style={iStyle} /></td>
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

              {/* ── Session Header ── */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.18)', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
                  <label style={{ fontSize: 11, color: '#5a8fa8', fontWeight: 600 }}>PO No.</label>
                  <input
                    value={scan.poNumber}
                    onChange={e => setScan(p => ({ ...p, poNumber: e.target.value }))}
                    placeholder="PO-2026-0001"
                    style={{ padding: '7px 10px', background: 'rgba(0,20,40,0.8)', border: '1px solid rgba(0,229,255,0.3)', borderRadius: 5, color: '#cce4ef', fontSize: 13, fontFamily: 'monospace' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 180 }}>
                  <label style={{ fontSize: 11, color: '#5a8fa8', fontWeight: 600 }}>Supplier</label>
                  <input
                    value={scan.supplier}
                    onChange={e => setScan(p => ({ ...p, supplier: e.target.value }))}
                    placeholder="Supplier name"
                    style={{ padding: '7px 10px', background: 'rgba(0,20,40,0.8)', border: '1px solid rgba(0,229,255,0.3)', borderRadius: 5, color: '#cce4ef', fontSize: 13 }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 200 }}>
                  <label style={{ fontSize: 11, color: '#5a8fa8', fontWeight: 600 }}>Customer <span style={{ color: '#FF6B6B' }}>*</span></label>
                  <select
                    value={scan.customer}
                    onChange={e => setScan(p => ({ ...p, customer: e.target.value }))}
                    style={{ padding: '7px 10px', background: 'rgba(0,20,40,0.8)', border: `1px solid ${scan.customer ? 'rgba(0,229,255,0.3)' : 'rgba(255,107,107,0.5)'}`, borderRadius: 5, color: '#cce4ef', fontSize: 13 }}
                  >
                    <option value="">-- เลือก Customer --</option>
                    {custList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* ── Barcode + Qty input ── */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 220 }}>
                  <label style={{ fontSize: 11, color: '#5a8fa8', fontWeight: 600 }}>Barcode / SKU</label>
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={e => setBarcodeInput(e.target.value)}
                    onKeyDown={handleBarcodeScan}
                    placeholder="สแกน Barcode หรือพิมพ์ SKU แล้วกด Enter"
                    className="barcode-input"
                    autoFocus
                    style={{ padding: '10px 14px', background: 'rgba(0,20,40,0.9)', border: '2px solid rgba(0,229,255,0.5)', borderRadius: 6, color: '#00E5FF', fontSize: 14, fontFamily: 'monospace', letterSpacing: 1 }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 110 }}>
                  <label style={{ fontSize: 11, color: '#5a8fa8', fontWeight: 600 }}>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={scanQty}
                    onChange={e => setScanQty(e.target.value)}
                    style={{ padding: '10px 10px', background: 'rgba(0,20,40,0.8)', border: '1px solid rgba(0,229,255,0.3)', borderRadius: 6, color: '#FFD700', fontSize: 15, fontWeight: 700, textAlign: 'center', width: '100%' }}
                  />
                </div>
                <button
                  onClick={handleBarcodeScan}
                  style={{ padding: '10px 20px', background: 'rgba(0,229,255,0.15)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.4)', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  ➕ Add
                </button>
              </div>

              {/* ── Scanned items table ── */}
              <div className="scanned-items">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ margin: 0 }}>{t('receiving.items')} ({scannedItems.length})</h3>
                  {scannedItems.length > 0 && (
                    <span style={{ fontSize: 12, color: '#5a8fa8' }}>
                      รวม: <strong style={{ color: '#00CC88' }}>{scannedItems.reduce((s, i) => s + i.qty, 0)}</strong> รายการ
                    </span>
                  )}
                </div>
                <table className="scan-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Barcode / SKU</th>
                      <th style={{ textAlign: 'right' }}>Qty</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {scannedItems.length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: '#3a6a82', padding: 20, fontSize: 13 }}>ยังไม่มีสินค้าที่สแกน — สแกน Barcode หรือพิมพ์ SKU แล้วกด Enter</td></tr>
                    )}
                    {scannedItems.map((item, i) => (
                      <tr key={item.id}>
                        <td style={{ color: '#5a8fa8', fontSize: 12 }}>{i + 1}</td>
                        <td style={{ fontFamily: 'monospace', color: '#00E5FF', fontWeight: 700 }}>{item.barcode}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#FFD700' }}>{item.qty}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button onClick={() => removeScanItem(item.id)} style={{ background: 'rgba(255,107,107,0.1)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 4, padding: '2px 8px', fontSize: 12, cursor: 'pointer' }}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Save as GR ── */}
              {scannedItems.length > 0 && (
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button onClick={() => setScannedItems([])} style={{ padding: '9px 18px', background: 'rgba(255,107,107,0.1)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
                    🗑️ ล้างรายการ
                  </button>
                  <button onClick={saveScanAsGR} style={{ padding: '9px 22px', background: 'rgba(0,204,136,0.15)', color: '#00CC88', border: '1px solid rgba(0,204,136,0.4)', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    💾 บันทึก GR
                  </button>
                </div>
              )}
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

              {/* GR Number */}
              <div className="rcv-form-group">
                <label>GR Number <span style={{ color: '#00E5FF' }}>*</span> <span style={{ fontSize: 10, color: '#5a8fa8' }}>(Auto)</span></label>
                <input type="text" value={form.grNumber} readOnly style={readonlyStyle} />
              </div>

              {/* PO Number */}
              <div className="rcv-form-group">
                <label>PO Number</label>
                <input type="text" value={form.poNumber} onChange={e => setForm(p => ({ ...p, poNumber: e.target.value }))} placeholder="PO-2026-0001" />
              </div>

              {/* Supplier (vendor) */}
              <div className="rcv-form-group">
                <label>Supplier</label>
                <input type="text" value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))} placeholder="Supplier name" />
              </div>

              {/* Customer (3PL client) */}
              <div className="rcv-form-group">
                <label>Customer <span style={{ color: '#FF6B6B' }}>*</span></label>
                <select value={form.customer} onChange={e => { setForm(p => ({ ...p, customer: e.target.value })); setFormError(''); }}>
                  <option value="">-- เลือก Customer --</option>
                  {custList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Date (Auto) */}
              <div className="rcv-form-group">
                <label>Receive Date <span style={{ fontSize: 10, color: '#5a8fa8' }}>(Auto)</span></label>
                <input type="date" value={form.date} readOnly style={readonlyStyle} />
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
                  <select value={form.mainUnit} onChange={e => setForm(p => ({ ...p, mainUnit: e.target.value }))} style={selectStyle}>
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
                  <select value={form.subUnit} onChange={e => setForm(p => ({ ...p, subUnit: e.target.value }))} style={selectStyle}>
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
                  <input type="text" value={form.batNumber} onChange={e => setForm(p => ({ ...p, batNumber: e.target.value }))} placeholder="BAT-001" />
                </div>
                <div className="rcv-form-group">
                  <label>Lot No.</label>
                  <input type="text" value={form.lotNumber} onChange={e => setForm(p => ({ ...p, lotNumber: e.target.value }))} placeholder="LOT-001" />
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
