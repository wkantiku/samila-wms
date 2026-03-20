import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { customerApi } from '../../services/api';
import { UNIT_GROUPS } from '../../constants/units';
import { ZONES, ZONE_OPTIONS, locationToZone } from '../../constants/zones';
import * as XLSX from 'xlsx';

const initOrders = [
  {
    id: 1,
    pickNo: 'PICK-2026-0001',
    date: '2026-03-16',
    customer: 'Customer A',
    warehouse: 'Warehouse A',
    status: 'PENDING',
    items: [
      { id: 1, sku: 'SKU001', productName: 'Product 1', barcode: 'BC001', location: 'A-01-1-A', batNumber: 'BAT-001', lotNumber: 'LOT-001', toPick: 100, picked: 0, unit: 'PCS' },
      { id: 2, sku: 'SKU002', productName: 'Product 2', barcode: 'BC002', location: 'A-02-1-A', batNumber: 'BAT-002', lotNumber: 'LOT-002', toPick: 50,  picked: 0, unit: 'BOX' },
    ],
  },
];

const emptyOrder = () => ({
  pickNo: `PICK-2026-${String(Date.now()).slice(-4)}`,
  date: new Date().toISOString().slice(0, 10),
  customer: '',
  warehouse: '',
  status: 'PENDING',
  items: [],
});

const emptyItem = () => ({ sku: '', productName: '', barcode: '', location: '', batNumber: '', lotNumber: '', toPick: '', picked: 0, unit: 'PCS' });

function PickingSlipPrint({ order, onClose }) {
  const handlePrint = () => window.print();
  return (
    <div className="slip-overlay" onClick={onClose}>
      <div className="slip-modal" onClick={e => e.stopPropagation()}>
        {/* Print controls - hidden on print */}
        <div className="slip-controls no-print">
          <button className="slip-print-btn" onClick={handlePrint}>🖨️ Print</button>
          <button className="slip-close-btn" onClick={onClose}>✕ Close</button>
        </div>

        {/* ===== PICKING SLIP DOCUMENT ===== */}
        <div className="slip-doc" id="picking-slip">
          {/* Header */}
          <div className="slip-header">
            <div className="slip-company">
              <div className="slip-company-name">Samila WMS 3PL</div>
              <div className="slip-company-sub">Warehouse Management System</div>
            </div>
            <div className="slip-title-block">
              <div className="slip-title">PICKING SLIP</div>
              <div className="slip-no">No. {order.pickNo}</div>
            </div>
          </div>

          <hr className="slip-divider" />

          {/* Info Row */}
          <div className="slip-info-row">
            <div className="slip-info-group">
              <span className="slip-label">Date:</span>
              <span className="slip-value">{order.date}</span>
            </div>
            <div className="slip-info-group">
              <span className="slip-label">Customer:</span>
              <span className="slip-value">{order.customer || '-'}</span>
            </div>
            <div className="slip-info-group">
              <span className="slip-label">Warehouse:</span>
              <span className="slip-value">{order.warehouse || '-'}</span>
            </div>
            <div className="slip-info-group">
              <span className="slip-label">Status:</span>
              <span className="slip-value">{order.status}</span>
            </div>
          </div>

          {/* Items Table */}
          <table className="slip-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Item Code</th>
                <th>Barcode</th>
                <th>Product Name</th>
                <th>Location</th>
                <th>Zone</th>
                <th>BAT No.</th>
                <th>Lot No.</th>
                <th>Unit</th>
                <th>To Pick</th>
                <th>Picked</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => {
                const zId = locationToZone(item.location);
                const z = ZONES.find(z => z.id === zId);
                return (
                  <tr key={item.id}>
                    <td className="slip-center">{i + 1}</td>
                    <td className="slip-mono">{item.sku}</td>
                    <td className="slip-mono">{item.barcode || '-'}</td>
                    <td className="slip-bold">{item.productName}</td>
                    <td className="slip-mono">{item.location}</td>
                    <td className="slip-center">{z ? z.label : '-'}</td>
                    <td className="slip-mono">{item.batNumber || '-'}</td>
                    <td className="slip-mono">{item.lotNumber || '-'}</td>
                    <td className="slip-center">{item.unit}</td>
                    <td className="slip-center slip-bold">{item.toPick}</td>
                    <td className="slip-center">{item.picked}</td>
                    <td></td>
                  </tr>
                );
              })}
              {/* Empty rows for manual filling */}
              {Array.from({ length: Math.max(0, 5 - order.items.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="slip-empty-row">
                  <td className="slip-center">{order.items.length + i + 1}</td>
                  <td></td><td></td><td></td><td></td><td></td>
                  <td></td><td></td><td></td><td></td><td></td><td></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={9} className="slip-total-label">Total Items:</td>
                <td className="slip-center slip-bold">{order.items.reduce((s, i) => s + Number(i.toPick), 0)}</td>
                <td className="slip-center slip-bold">{order.items.reduce((s, i) => s + Number(i.picked), 0)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          {/* Signature */}
          <div className="slip-signature-row">
            <div className="slip-sign-box">
              <div className="slip-sign-line"></div>
              <div className="slip-sign-label">Picker / ผู้หยิบสินค้า</div>
              <div className="slip-sign-date">Date: ___________</div>
            </div>
            <div className="slip-sign-box">
              <div className="slip-sign-line"></div>
              <div className="slip-sign-label">Checker / ผู้ตรวจสอบ</div>
              <div className="slip-sign-date">Date: ___________</div>
            </div>
            <div className="slip-sign-box">
              <div className="slip-sign-line"></div>
              <div className="slip-sign-label">Supervisor / หัวหน้างาน</div>
              <div className="slip-sign-date">Date: ___________</div>
            </div>
          </div>

          <div className="slip-footer">
            Samila Innovation Co., Ltd. &nbsp;·&nbsp; Samila WMS 3PL v1.0.0 &nbsp;·&nbsp; Printed: {new Date().toLocaleString('th-TH')}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #picking-slip, #picking-slip * { visibility: visible; }
          #picking-slip { position: fixed; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
        .slip-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.75);
          display: flex; align-items: flex-start; justify-content: center;
          overflow-y: auto; padding: 20px;
        }
        .slip-modal {
          background: #fff; border-radius: 8px;
          width: 100%; max-width: 860px; padding: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        }
        .slip-controls {
          display: flex; gap: 10px; justify-content: flex-end; margin-bottom: 16px;
        }
        .slip-print-btn {
          background: #0087B3; color: #fff; border: none;
          border-radius: 6px; padding: 8px 20px; font-size: 14px;
          font-weight: 700; cursor: pointer;
        }
        .slip-close-btn {
          background: #eee; color: #333; border: none;
          border-radius: 6px; padding: 8px 16px; font-size: 14px; cursor: pointer;
        }
        .slip-doc { font-family: Arial, sans-serif; color: #111; font-size: 13px; }
        .slip-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 10px;
        }
        .slip-company-name { font-size: 20px; font-weight: 900; color: #006080; }
        .slip-company-sub  { font-size: 11px; color: #666; margin-top: 2px; }
        .slip-title-block  { text-align: right; }
        .slip-title { font-size: 22px; font-weight: 900; color: #003d5c; letter-spacing: 1px; }
        .slip-no    { font-size: 14px; font-weight: 700; color: #0087B3; margin-top: 4px; }
        .slip-divider { border: none; border-top: 2px solid #003d5c; margin: 10px 0; }
        .slip-info-row {
          display: flex; gap: 24px; flex-wrap: wrap; margin-bottom: 14px;
          background: #f5f9fc; padding: 10px 14px; border-radius: 6px;
        }
        .slip-info-group { display: flex; gap: 6px; align-items: center; }
        .slip-label { font-weight: 700; color: #555; font-size: 12px; }
        .slip-value { font-size: 13px; color: #111; }
        .slip-table {
          width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;
        }
        .slip-table th {
          background: #003d5c; color: #fff; padding: 7px 8px;
          text-align: left; font-size: 11px; white-space: nowrap;
        }
        .slip-table td { padding: 6px 8px; border-bottom: 1px solid #ddd; }
        .slip-table tbody tr:nth-child(even) { background: #f8f9fa; }
        .slip-empty-row td { height: 26px; }
        .slip-table tfoot td {
          background: #e8f4f8; font-weight: 700; border-top: 2px solid #003d5c;
          padding: 7px 8px;
        }
        .slip-total-label { text-align: right; color: #003d5c; font-size: 12px; }
        .slip-center { text-align: center; }
        .slip-bold   { font-weight: 700; }
        .slip-mono   { font-family: 'Courier New', monospace; }
        .slip-signature-row {
          display: flex; gap: 20px; margin-top: 24px; margin-bottom: 16px;
        }
        .slip-sign-box  { flex: 1; text-align: center; }
        .slip-sign-line {
          border-bottom: 1px solid #333; margin: 0 10px 6px; height: 40px;
        }
        .slip-sign-label { font-weight: 700; font-size: 12px; color: #333; }
        .slip-sign-date  { font-size: 11px; color: #666; margin-top: 4px; }
        .slip-footer {
          text-align: center; font-size: 10px; color: #999;
          border-top: 1px solid #eee; padding-top: 8px; margin-top: 10px;
        }
      `}</style>
    </div>
  );
}

function PickingModule({ inventory, setInventory, pickingOrders: orders, setPickingOrders: setOrders, currentUser }) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab]   = useState('list');

  const [custList, setCustList] = useState([]);
  useEffect(() => {
    customerApi.list(currentUser?.companyNo).then(data => {
      if (Array.isArray(data)) setCustList(data.map(c => c.name).filter(Boolean));
    }).catch(() => {});
  }, [currentUser?.companyNo]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showSlip, setShowSlip]     = useState(false);
  const [slipOrder, setSlipOrder]   = useState(null);

  // New order form
  const [newOrder, setNewOrder]     = useState(emptyOrder);
  const [newItems, setNewItems]     = useState([emptyItem()]);

  const [zoneFilter, setZoneFilter] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [pickSearch, setPickSearch] = useState('');

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
  };

  const unitSelectStyle = {
    padding: '7px 10px', background: '#0a2030',
    border: '1px solid rgba(0,188,212,0.5)', borderRadius: 5,
    fontSize: 14, color: '#e0f4ff', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 700,
    letterSpacing: '0.3px',
  };

  const openSlip = (order) => { setSlipOrder(order); setShowSlip(true); };

  const addNewItemRow = () => setNewItems(prev => [...prev, emptyItem()]);

  const updateNewItem = (idx, field, value) =>
    setNewItems(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));

  const removeNewItem = (idx) =>
    setNewItems(prev => prev.filter((_, i) => i !== idx));

  const saveOrder = () => {
    const validItems = newItems.filter(r => r.sku.trim() && r.toPick > 0);
    if (!validItems.length) { alert('กรุณาเพิ่มรายการสินค้า'); return; }
    const order = {
      id: Date.now(),
      ...newOrder,
      items: validItems.map((r, i) => ({ ...r, id: i + 1, picked: 0 })),
    };
    setOrders(prev => [...prev, order]);
    setNewOrder(emptyOrder());
    setNewItems([emptyItem()]);
    setActiveTab('list');
  };

  const updatePickedQty = (orderId, itemId, value) => {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? {
        ...o,
        items: o.items.map(it => it.id === itemId ? { ...it, picked: Number(value) } : it)
      } : o
    ));
  };

  const completeOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'COMPLETED' } : o));
    if (order && order.status !== 'COMPLETED') {
      setInventory?.(prev => prev.map(inv => {
        const pickedItem = order.items.find(it =>
          it.sku === inv.sku || (it.barcode && it.barcode === inv.barcode)
        );
        if (!pickedItem) return inv;
        const deduct = Number(pickedItem.toPick) || 0;
        const curQty = inv.quantity || inv.qty || 0;
        const curAvail = inv.available || curQty;
        return { ...inv, quantity: Math.max(0, curQty - deduct), available: Math.max(0, curAvail - deduct) };
      }));
    }
  };

  const downloadTemplate = () => {
    const headers = ['Item Code','Barcode','Product Name','Location','BAT No.','Lot No.','To Pick (Qty)','Unit'];
    const example = ['SKU001','BC001','Product 1','A-01-1-A','BAT-001','LOT-001','100','PCS'];
    const ws = XLSX.utils.aoa_to_sheet([headers, example]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Picking Template');
    XLSX.writeFile(wb, 'template_picking.xlsx');
  };

  const iStyle = {
    background: '#0a2030', border: '1px solid rgba(0,229,255,0.3)',
    borderRadius: 4, color: '#e0f4ff', padding: '6px 10px', fontSize: 14,
    width: '100%', boxSizing: 'border-box', fontWeight: 600, letterSpacing: '0.3px',
  };

  return (
    <div className="wms-module picking-module">
      {showSlip && slipOrder && (
        <PickingSlipPrint order={slipOrder} onClose={() => setShowSlip(false)} />
      )}

      <div className="module-header">
        <h1>{t('picking.title')}</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={downloadTemplate} className="export-btn" style={{ background: 'rgba(0,204,136,0.12)', color: '#00CC88', border: '1px solid rgba(0,204,136,0.3)' }}>
            📋 Download Template
          </button>
          <button onClick={toggleLanguage} className="lang-btn">
            {i18n.language === 'en' ? '🇹🇭 ไทย' : '🇬🇧 English'}
          </button>
        </div>
      </div>

      <div className="module-tabs">
        <button className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
          📋 Pick List
        </button>
        <button className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
          ➕ Create Picking Order
        </button>
      </div>

      <div className="module-content">

        {/* ===== PICK LIST ===== */}
        {activeTab === 'list' && (
          <div className="picking-container">
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <select value={zoneFilter} onChange={e => setZoneFilter(e.target.value)} style={unitSelectStyle}>
                {ZONE_OPTIONS.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
              </select>
              <input type="search" placeholder="Search Pick No. / Customer" value={pickSearch} onChange={e => setPickSearch(e.target.value)} style={{ ...iStyle, maxWidth: 220 }} />
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Pick No.</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Warehouse</th>
                  <th style={{ textAlign: 'center' }}>Items</th>
                  <th style={{ textAlign: 'center' }}>To Pick</th>
                  <th style={{ textAlign: 'center' }}>Picked</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .filter(o => !pickSearch || o.pickNo.toLowerCase().includes(pickSearch.toLowerCase()) || (o.customer||'').toLowerCase().includes(pickSearch.toLowerCase()))
                  .map(order => {
                  const totalToPick = order.items.reduce((s, i) => s + Number(i.toPick), 0);
                  const totalPicked = order.items.reduce((s, i) => s + Number(i.picked), 0);
                  return (
                    <tr key={order.id}>
                      <td style={{ fontFamily: 'monospace', color: '#FFD700', fontWeight: 700 }}>{order.pickNo}</td>
                      <td style={{ fontSize: 12 }}>{order.date}</td>
                      <td style={{ color: '#a0c8dc', fontWeight: 600 }}>{order.customer || '-'}</td>
                      <td style={{ fontSize: 12 }}>{order.warehouse || '-'}</td>
                      <td style={{ textAlign: 'center' }}>{order.items.length}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{totalToPick}</td>
                      <td style={{ textAlign: 'center', color: totalPicked >= totalToPick ? '#00CC88' : '#FFD700', fontWeight: 700 }}>{totalPicked}</td>
                      <td><span className={`status ${order.status}`}>{order.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button
                            onClick={() => { setSelectedOrder(order); setActiveTab('process'); }}
                            style={{ background: 'rgba(0,188,212,0.15)', color: '#00E5FF', border: '1px solid rgba(0,188,212,0.3)', borderRadius: 4, padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}
                          >✏️ Pick</button>
                          <button
                            onClick={() => openSlip(order)}
                            style={{ background: 'rgba(255,215,0,0.12)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 4, padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}
                          >🖨️ Slip</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: 28, color: '#3a6a82', fontSize: 13 }}>No picking orders</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== CREATE ORDER ===== */}
        {activeTab === 'create' && (
          <div className="picking-container">
            <h2 style={{ marginBottom: 16 }}>➕ Create Picking Order</h2>

            {/* Order Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 12, marginBottom: 20, background: 'rgba(0,188,212,0.05)', border: '1px solid rgba(0,188,212,0.12)', borderRadius: 8, padding: 16 }}>
              <div className="rcv-form-group" style={{ marginBottom: 0 }}>
                <label>Pick No.</label>
                <input value={newOrder.pickNo} onChange={e => setNewOrder(p => ({ ...p, pickNo: e.target.value }))} style={iStyle} />
              </div>
              <div className="rcv-form-group" style={{ marginBottom: 0 }}>
                <label>Date</label>
                <input type="date" value={newOrder.date} onChange={e => setNewOrder(p => ({ ...p, date: e.target.value }))} style={iStyle} />
              </div>
              <div className="rcv-form-group" style={{ marginBottom: 0 }}>
                <label>Customer</label>
                <select value={newOrder.customer} onChange={e => setNewOrder(p => ({ ...p, customer: e.target.value }))} style={iStyle}>
                  <option value="">-- เลือก Customer --</option>
                  {custList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="rcv-form-group" style={{ marginBottom: 0 }}>
                <label>Warehouse</label>
                <input value={newOrder.warehouse} onChange={e => setNewOrder(p => ({ ...p, warehouse: e.target.value }))} placeholder="Warehouse A" style={iStyle} />
              </div>
            </div>

            {/* Items Table */}
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 14, color: '#7aafc8' }}>Picking Items</h3>
              <button onClick={addNewItemRow} style={{ background: 'rgba(0,204,136,0.15)', color: '#00CC88', border: '1px solid rgba(0,204,136,0.3)', borderRadius: 4, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>
                + Add Row
              </button>
            </div>

            <table className="data-table" style={{ marginBottom: 16 }}>
              <thead>
                <tr>
                  <th>Item Code *</th>
                  <th>Barcode</th>
                  <th>Product Name *</th>
                  <th>Location</th>
                  <th>BAT No.</th>
                  <th>Lot No.</th>
                  <th>Unit</th>
                  <th>To Pick *</th>
                  <th style={{ textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {newItems.map((row, idx) => (
                  <tr key={idx}>
                    <td><input value={row.sku} onChange={e => updateNewItem(idx, 'sku', e.target.value)} placeholder="SKU001" style={{ ...iStyle, borderColor: 'rgba(0,229,255,0.35)' }} /></td>
                    <td><input value={row.barcode} onChange={e => updateNewItem(idx, 'barcode', e.target.value)} placeholder="BC001" style={iStyle} /></td>
                    <td><input value={row.productName} onChange={e => updateNewItem(idx, 'productName', e.target.value)} placeholder="Product Name" style={{ ...iStyle, borderColor: 'rgba(0,229,255,0.35)' }} /></td>
                    <td><input value={row.location} onChange={e => updateNewItem(idx, 'location', e.target.value)} placeholder="A-01-1-A" style={iStyle} /></td>
                    <td><input value={row.batNumber} onChange={e => updateNewItem(idx, 'batNumber', e.target.value)} placeholder="BAT-001" style={iStyle} /></td>
                    <td><input value={row.lotNumber} onChange={e => updateNewItem(idx, 'lotNumber', e.target.value)} placeholder="LOT-001" style={iStyle} /></td>
                    <td>
                      <select value={row.unit} onChange={e => updateNewItem(idx, 'unit', e.target.value)} style={{ ...iStyle, cursor: 'pointer' }}>
                        {UNIT_GROUPS.map(g => (
                          <optgroup key={g.group} label={g.group}>
                            {g.units.map(u => <option key={u.value} value={u.value}>{u.value}</option>)}
                          </optgroup>
                        ))}
                      </select>
                    </td>
                    <td><input type="number" min="1" value={row.toPick} onChange={e => updateNewItem(idx, 'toPick', e.target.value)} placeholder="0" style={{ ...iStyle, maxWidth: 70, borderColor: 'rgba(0,229,255,0.35)' }} /></td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => removeNewItem(idx)} style={{ background: 'rgba(255,107,107,0.12)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 4, padding: '2px 8px', fontSize: 12, cursor: 'pointer' }}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={saveOrder} className="rcv-save-btn">💾 Save Order</button>
              <button onClick={() => openSlip({ ...newOrder, items: newItems.filter(r => r.sku) })} style={{ background: 'rgba(255,215,0,0.12)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 6, padding: '10px 20px', fontSize: 14, cursor: 'pointer', fontWeight: 700 }}>
                🖨️ Preview Picking Slip
              </button>
              <button onClick={() => setActiveTab('list')} className="rcv-cancel-btn">{t('buttons.cancel')}</button>
            </div>
          </div>
        )}

        {/* ===== PROCESS PICKING ===== */}
        {activeTab === 'process' && selectedOrder && (
          <div className="picking-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0, color: '#FFD700' }}>{selectedOrder.pickNo}</h2>
                <span style={{ fontSize: 12, color: '#5a8fa8' }}>{selectedOrder.customer} · {selectedOrder.warehouse}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openSlip(orders.find(o => o.id === selectedOrder.id) || selectedOrder)}
                  style={{ background: 'rgba(255,215,0,0.12)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 6, padding: '7px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>
                  🖨️ Print Picking Slip
                </button>
                <button onClick={() => { completeOrder(selectedOrder.id); setActiveTab('list'); }}
                  style={{ background: 'rgba(0,204,136,0.15)', color: '#00CC88', border: '1px solid rgba(0,204,136,0.3)', borderRadius: 6, padding: '7px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>
                  ✓ Complete
                </button>
                <button onClick={() => setActiveTab('list')} className="rcv-cancel-btn" style={{ padding: '7px 14px' }}>← Back</button>
              </div>
            </div>

            <table className="scan-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item Code</th>
                  <th>Product Name</th>
                  <th>Location</th>
                  <th>Zone</th>
                  <th>BAT No.</th>
                  <th>Lot No.</th>
                  <th>Unit</th>
                  <th>To Pick</th>
                  <th>Picked Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(orders.find(o => o.id === selectedOrder.id)?.items || []).map((item, i) => {
                  const zId = locationToZone(item.location);
                  const z   = ZONES.find(z => z.id === zId);
                  const done = item.picked >= item.toPick;
                  return (
                    <tr key={item.id} style={{ opacity: done ? 0.7 : 1 }}>
                      <td style={{ textAlign: 'center', color: '#5a8fa8' }}>{i + 1}</td>
                      <td style={{ fontFamily: 'monospace', color: '#a0c8dc' }}>{item.sku}</td>
                      <td style={{ fontWeight: 600 }}>{item.productName}</td>
                      <td style={{ fontFamily: 'monospace' }}>{item.location}</td>
                      <td>{z ? <span style={{ background: `${z.color}18`, color: z.color, padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{z.label}</span> : '-'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#00E5FF' }}>{item.batNumber || '-'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#00CC88' }}>{item.lotNumber || '-'}</td>
                      <td style={{ textAlign: 'center' }}>{item.unit}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{item.toPick}</td>
                      <td>
                        <input
                          type="number" min="0" max={item.toPick}
                          value={item.picked}
                          onChange={e => updatePickedQty(selectedOrder.id, item.id, e.target.value)}
                          style={{ width: 70, background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.3)', borderRadius: 4, color: '#cce4ef', padding: '4px 8px', fontSize: 13, textAlign: 'center' }}
                        />
                      </td>
                      <td>
                        <span style={{ color: done ? '#00CC88' : '#FFD700', fontWeight: 700, fontSize: 11 }}>
                          {done ? '✓ DONE' : 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default PickingModule;
