import { useState, useMemo, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import './OrderModule.css';

const ORDER_STATUSES = ['Draft', 'Confirmed', 'Picking', 'Shipped', 'Cancelled'];

const STATUS_COLOR = {
  Draft:     { bg: 'rgba(90,143,168,0.15)',  color: '#5a8fa8' },
  Confirmed: { bg: 'rgba(0,229,255,0.12)',   color: '#00E5FF' },
  Picking:   { bg: 'rgba(255,215,0,0.12)',   color: '#FFD700' },
  Shipped:   { bg: 'rgba(0,204,136,0.15)',   color: '#00CC88' },
  Cancelled: { bg: 'rgba(255,107,107,0.12)', color: '#FF6B6B' },
};

const genOrderNo = () => {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rnd = String(Math.floor(Math.random() * 9000) + 1000);
  return `ORD-${yy}${mm}${dd}-${rnd}`;
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyOrderForm = () => ({
  orderNo:   genOrderNo(),
  orderDate: today(),
  customer:  '',
  reference: '',
  remark:    '',
});

export default function OrderModule({ orders, setOrders, inventory }) {
  useEffect(() => {
    orderService.getAll().then(data => {
      if (Array.isArray(data) && data.length > 0) setOrders(data);
    }).catch(() => {});
  }, []);

  const [activeTab, setActiveTab] = useState('list');

  // Create-order form state
  const [form, setForm]         = useState(emptyOrderForm);
  const [invFilter, setInvFilter] = useState('');   // search filter on inventory table
  const [orderLines, setOrderLines] = useState([]);  // selected lines

  // View / Edit order
  const [viewOrder, setViewOrder] = useState(null);
  const [deleteId, setDeleteId]   = useState(null);
  const [orderError, setOrderError] = useState('');

  /* ── Derived ── */
  const customers = useMemo(() =>
    [...new Set(inventory.map(i => i.customer).filter(Boolean))].sort(), [inventory]);

  const filteredInv = useMemo(() => {
    const base = form.customer
      ? inventory.filter(i => i.customer === form.customer)
      : inventory;
    if (!invFilter) return base;
    const q = invFilter.toLowerCase();
    return base.filter(i =>
      i.sku.toLowerCase().includes(q) ||
      i.product.toLowerCase().includes(q) ||
      (i.barcode || '').toLowerCase().includes(q) ||
      i.location.toLowerCase().includes(q)
    );
  }, [inventory, form.customer, invFilter]);

  /* ── Add / Remove line ── */
  const addLine = (item) => {
    if (orderLines.find(l => l.invId === item.id)) return;
    setOrderLines(prev => [...prev, {
      invId:         item.id,
      sku:           item.sku,
      barcode:       item.barcode,
      product:       item.product,
      location:      item.location,
      available:     item.available,
      mainUnit:      item.mainUnit,
      subUnit:       item.subUnit,
      batNumber:     item.batNumber,
      lotNumber:     item.lotNumber,
      manufactureDate: item.manufactureDate,
      expiryDate:    item.expiryDate,
      orderQty:      1,
    }]);
  };

  const removeLine = (invId) =>
    setOrderLines(prev => prev.filter(l => l.invId !== invId));

  const updateQty = (invId, val) => {
    const item = inventory.find(i => i.id === invId);
    const max  = item ? item.available : 9999;
    const qty  = Math.max(1, Math.min(Number(val) || 1, max));
    setOrderLines(prev => prev.map(l => l.invId === invId ? { ...l, orderQty: qty } : l));
  };

  /* ── Save order ── */
  const handleSave = (status = 'Draft') => {
    if (!form.customer)          { setOrderError('กรุณาเลือก Customer'); return; }
    if (orderLines.length === 0) { setOrderError('กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ'); return; }
    setOrderError('');
    const newOrder = {
      id:        Date.now(),
      orderNo:   form.orderNo,
      orderDate: form.orderDate,
      customer:  form.customer,
      reference: form.reference,
      remark:    form.remark,
      status,
      lines:     orderLines,
      createdAt: new Date().toLocaleString('th-TH'),
    };
    orderService.create({
      customer: form.customer,
      orderDate: form.orderDate,
      dueDate: '',
      notes: form.remark,
      items: orderLines.map(l => ({ sku: l.sku, product: l.product, qty: l.orderQty, unit: l.mainUnit || 'PCS', price: 0 })),
    }).catch(() => {});
    setOrders(prev => [newOrder, ...prev]);
    setForm(emptyOrderForm());
    setOrderLines([]);
    setInvFilter('');
    setActiveTab('list');
  };

  const updateOrderStatus = (id, status) => {
    orderService.updateStatus(id, status).catch(() => {});
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const handleDelete = () => {
    orderService.delete(deleteId).catch(() => {});
    setOrders(prev => prev.filter(o => o.id !== deleteId));
    setDeleteId(null);
    if (viewOrder?.id === deleteId) setViewOrder(null);
  };

  const openCreate = () => {
    setForm(emptyOrderForm());
    setOrderLines([]);
    setInvFilter('');
    setOrderError('');
    setActiveTab('create');
  };

  /* ── Download Template ── */
  const downloadTemplate = () => {
    const headers = [
      'Order No.', 'Order Date', 'Customer', 'Reference', 'Remark',
      'Item Code (SKU)', 'Barcode', 'Product Name', 'Location',
      'Order Qty', 'Main Unit', 'Sub Unit',
      'BAT No.', 'Lot No.', 'MFG Date', 'Expiry Date',
    ];
    const example = [
      genOrderNo(), today(), 'Customer A', 'PO-2026-0001', 'หมายเหตุ',
      'SKU001', 'BC001', 'Product Name', 'A-01-1-A',
      '10', 'PCS', 'BOX',
      'BAT-001', 'LOT-001', '2025-01-15', '2027-01-15',
    ];
    const csvContent = [headers, example]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const bom = '\uFEFF'; // UTF-8 BOM for Excel Thai support
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Order_Template_${today()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ══════════════════════════ RENDER ══════════════════════════ */
  return (
    <div className="wms-module order-module">
      <div className="module-header">
        <div className="header-left">
          <h1>🛒 Order Management</h1>
          <p>สร้างและจัดการคำสั่งซื้อจาก Inventory</p>
        </div>
        <div className="header-right">
          <button className="template-btn" onClick={downloadTemplate}>⬇️ Download Template</button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="order-summary-bar">
        {ORDER_STATUSES.map(s => {
          const cnt = orders.filter(o => o.status === s).length;
          return (
            <div key={s} className="order-stat" style={{ borderColor: STATUS_COLOR[s].color }}>
              <div className="order-stat-val" style={{ color: STATUS_COLOR[s].color }}>{cnt}</div>
              <div className="order-stat-lbl">{s}</div>
            </div>
          );
        })}
        <div className="order-stat" style={{ borderColor: '#cce4ef' }}>
          <div className="order-stat-val" style={{ color: '#cce4ef' }}>{orders.length}</div>
          <div className="order-stat-lbl">Total</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="module-tabs">
        <button className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
          📋 Order List
        </button>
        <button className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={openCreate}>
          ➕ Create Order
        </button>
      </div>

      <div className="module-content">

        {/* ══ ORDER LIST ══ */}
        {activeTab === 'list' && (
          <div className="order-list-panel">
            {orders.length === 0 ? (
              <div className="order-empty">
                <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
                <div style={{ color: '#5a8fa8', fontSize: 14 }}>ยังไม่มี Order — กด "สร้าง Order" เพื่อเริ่มต้น</div>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Order No.</th>
                    <th>วันที่</th>
                    <th>Customer</th>
                    <th>Reference</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, i) => (
                    <tr key={o.id}>
                      <td className="row-num">{i + 1}</td>
                      <td style={{ fontFamily: 'monospace', color: '#00E5FF', fontWeight: 700 }}>{o.orderNo}</td>
                      <td style={{ fontSize: 12, color: '#a0c8dc' }}>{o.orderDate}</td>
                      <td style={{ fontWeight: 600, color: '#cce4ef' }}>{o.customer}</td>
                      <td style={{ fontSize: 12, color: '#7a9fb5' }}>{o.reference || '-'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ background: 'rgba(0,188,212,0.1)', color: '#00E5FF', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                          {o.lines.length} items
                        </span>
                      </td>
                      <td>
                        <select value={o.status}
                          onChange={e => updateOrderStatus(o.id, e.target.value)}
                          style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, border: `1px solid ${STATUS_COLOR[o.status].color}`, background: STATUS_COLOR[o.status].bg, color: STATUS_COLOR[o.status].color, cursor: 'pointer' }}>
                          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        <button className="icon-btn" title="ดูรายละเอียด" onClick={() => setViewOrder(o)}>👁️</button>
                        <button className="icon-btn delete" title="ลบ" onClick={() => setDeleteId(o.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ══ CREATE ORDER ══ */}
        {activeTab === 'create' && (
          <div className="order-create-panel">

            {/* ── Header form ── */}
            <div className="order-form-card">
              <div className="order-form-title">📝 ข้อมูล Order</div>
              <div className="order-form-grid">
                <div className="form-group">
                  <label>Order No.</label>
                  <input type="text" value={form.orderNo} readOnly
                    style={{ background: 'rgba(0,229,255,0.05)', color: '#00E5FF', fontFamily: 'monospace', fontWeight: 700 }} />
                </div>
                <div className="form-group">
                  <label>วันที่ Order</label>
                  <input type="date" value={form.orderDate}
                    onChange={e => setForm(p => ({ ...p, orderDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>🏢 Customer *</label>
                  <select value={form.customer}
                    onChange={e => { setForm(p => ({ ...p, customer: e.target.value })); setOrderLines([]); }}
                    style={{ borderColor: form.customer ? 'rgba(0,229,255,0.4)' : 'rgba(255,107,107,0.5)' }}>
                    <option value="">-- เลือก Customer --</option>
                    {customers.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Reference</label>
                  <input type="text" placeholder="เลขอ้างอิง / PO No." value={form.reference}
                    onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>หมายเหตุ</label>
                  <input type="text" placeholder="Remark (optional)" value={form.remark}
                    onChange={e => setForm(p => ({ ...p, remark: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* ── Inventory picker ── */}
            <div className="order-form-card">
              <div className="order-form-title" style={{ marginBottom: 10 }}>
                🔍 ค้นหา
              </div>
              {!form.customer ? (
                <div style={{ padding: '28px 0', textAlign: 'center', color: '#3a6a82', fontSize: 13 }}>
                  🏢 กรุณาเลือก Customer ก่อน
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 10 }}>
                    <input type="search" placeholder="🔍"
                      value={invFilter} onChange={e => setInvFilter(e.target.value)}
                      style={{ width: '30ch', padding: '7px 10px', background: 'rgba(0,20,40,0.8)', border: '1px solid rgba(0,229,255,0.25)', borderRadius: 6, color: '#cce4ef', fontSize: 14 }} />
                  </div>
                  <div className="order-inv-table-wrap">
                    <table className="data-table order-inv-table">
                      <thead>
                        <tr>
                          <th>+</th>
                          <th>Item Code</th>
                          <th>Barcode</th>
                          <th>Product Name</th>
                          <th>Location</th>
                          <th>Available</th>
                          <th>Main Unit</th>
                          <th>Sub Unit</th>
                          <th>BAT No.</th>
                          <th>Lot No.</th>
                          <th>MFG</th>
                          <th>Expiry</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInv.length === 0 && (
                          <tr><td colSpan={12} style={{ textAlign: 'center', padding: 20, color: '#3a6a82' }}>ไม่พบรายการ</td></tr>
                        )}
                        {filteredInv.map(item => {
                          const isAdded = !!orderLines.find(l => l.invId === item.id);
                          return (
                            <tr key={item.id} className={isAdded ? 'inv-row-added' : ''}>
                              <td>
                                <button
                                  onClick={() => isAdded ? removeLine(item.id) : addLine(item)}
                                  style={{
                                    width: 26, height: 26, borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14,
                                    background: isAdded ? 'rgba(255,107,107,0.2)' : 'rgba(0,204,136,0.15)',
                                    color: isAdded ? '#FF6B6B' : '#00CC88',
                                  }}
                                  title={isAdded ? 'ลบออก' : 'เพิ่ม'}>
                                  {isAdded ? '−' : '+'}
                                </button>
                              </td>
                              <td style={{ fontFamily: 'monospace', color: '#a0c8dc', fontWeight: 700 }}>{item.sku}</td>
                              <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{item.barcode || '-'}</td>
                              <td style={{ fontWeight: 600, color: '#cce4ef' }}>{item.product}</td>
                              <td style={{ fontSize: 12 }}>{item.location}</td>
                              <td style={{ textAlign: 'center', color: item.available <= item.minStock ? '#FF6B6B' : '#00CC88', fontWeight: 700 }}>{item.available}</td>
                              <td><span className="unit-badge main">{item.mainUnit || '-'}</span></td>
                              <td><span className="unit-badge sub">{item.subUnit || '-'}</span></td>
                              <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#00E5FF' }}>{item.batNumber || '-'}</td>
                              <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#00CC88' }}>{item.lotNumber || '-'}</td>
                              <td style={{ fontSize: 11 }}>{item.manufactureDate || '-'}</td>
                              <td style={{ fontSize: 11, color: item.expiryDate ? '#FFD700' : undefined }}>{item.expiryDate || '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* ── Order Lines (selected) ── */}
            {orderLines.length > 0 && (
              <div className="order-form-card">
                <div className="order-form-title">
                  🛒 รายการสินค้าใน Order
                  <span style={{ marginLeft: 10, fontSize: 12, color: '#00CC88', fontWeight: 400 }}>
                    {orderLines.length} รายการ
                  </span>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Item Code</th>
                      <th>Barcode</th>
                      <th>Product Name</th>
                      <th>Location</th>
                      <th>Available</th>
                      <th>Order Qty *</th>
                      <th>Main Unit</th>
                      <th>Sub Unit</th>
                      <th>BAT No.</th>
                      <th>Lot No.</th>
                      <th>MFG</th>
                      <th>Expiry</th>
                      <th>ลบ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderLines.map((l, i) => (
                      <tr key={l.invId}>
                        <td className="row-num">{i + 1}</td>
                        <td style={{ fontFamily: 'monospace', color: '#a0c8dc', fontWeight: 700 }}>{l.sku}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{l.barcode || '-'}</td>
                        <td style={{ fontWeight: 600, color: '#cce4ef' }}>{l.product}</td>
                        <td style={{ fontSize: 12 }}>{l.location}</td>
                        <td style={{ textAlign: 'center', color: '#00CC88', fontWeight: 700 }}>{l.available}</td>
                        <td>
                          <input type="number" min={1} max={l.available} value={l.orderQty}
                            onChange={e => updateQty(l.invId, e.target.value)}
                            style={{ width: 72, padding: '4px 8px', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.35)', borderRadius: 5, color: '#00E5FF', fontWeight: 700, fontSize: 13, textAlign: 'center' }} />
                        </td>
                        <td><span className="unit-badge main">{l.mainUnit || '-'}</span></td>
                        <td><span className="unit-badge sub">{l.subUnit || '-'}</span></td>
                        <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#00E5FF' }}>{l.batNumber || '-'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#00CC88' }}>{l.lotNumber || '-'}</td>
                        <td style={{ fontSize: 11 }}>{l.manufactureDate || '-'}</td>
                        <td style={{ fontSize: 11, color: l.expiryDate ? '#FFD700' : undefined }}>{l.expiryDate || '-'}</td>
                        <td>
                          <button onClick={() => removeLine(l.invId)}
                            style={{ background: 'rgba(255,107,107,0.15)', color: '#FF6B6B', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontSize: 13 }}>
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Save buttons */}
                {orderError && (
                  <div style={{ margin: '8px 0', padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.35)', color: '#FF6B6B' }}>
                    {orderError}
                  </div>
                )}
                <div className="order-save-bar">
                  <button className="cancel-btn" onClick={() => { setForm(emptyOrderForm()); setOrderLines([]); setOrderError(''); setActiveTab('list'); }}>
                    ✕ ยกเลิก
                  </button>
                  <button className="btn-draft" onClick={() => handleSave('Draft')}>
                    💾 บันทึก Draft
                  </button>
                  <button className="btn-confirm" onClick={() => handleSave('Confirmed')}>
                    ✓ Confirm Order
                  </button>
                </div>
              </div>
            )}

            {/* Save bar when no lines yet */}
            {orderLines.length === 0 && form.customer && (
              <div className="order-save-bar" style={{ marginTop: 0 }}>
                <button className="cancel-btn" onClick={() => setActiveTab('list')}>✕ ยกเลิก</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ VIEW ORDER MODAL ══ */}
      {viewOrder && (
        <div className="modal-overlay" onClick={() => setViewOrder(null)}>
          <div className="modal-box" style={{ maxWidth: 900 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👁️ Order Detail — <span style={{ color: '#00E5FF', fontFamily: 'monospace' }}>{viewOrder.orderNo}</span></h2>
              <button className="modal-close" onClick={() => setViewOrder(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 16 }}>
                {[
                  ['Customer',  viewOrder.customer],
                  ['Order Date', viewOrder.orderDate],
                  ['Reference', viewOrder.reference || '-'],
                  ['Status',    viewOrder.status],
                  ['Created',   viewOrder.createdAt],
                  ['Remark',    viewOrder.remark || '-'],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: 'rgba(0,188,212,0.05)', border: '1px solid rgba(0,188,212,0.1)', borderRadius: 8, padding: '10px 14px' }}>
                    <div style={{ fontSize: 10, color: '#5a8fa8', textTransform: 'uppercase', marginBottom: 4 }}>{k}</div>
                    <div style={{ fontWeight: 700, color: '#cce4ef', fontSize: 13 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th><th>Item Code</th><th>Barcode</th><th>Product Name</th>
                      <th>Location</th><th>Order Qty</th><th>Main Unit</th><th>Sub Unit</th>
                      <th>BAT No.</th><th>Lot No.</th><th>MFG</th><th>Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewOrder.lines.map((l, i) => (
                      <tr key={l.invId}>
                        <td className="row-num">{i + 1}</td>
                        <td style={{ fontFamily: 'monospace', color: '#a0c8dc', fontWeight: 700 }}>{l.sku}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{l.barcode || '-'}</td>
                        <td style={{ fontWeight: 600, color: '#cce4ef' }}>{l.product}</td>
                        <td>{l.location}</td>
                        <td style={{ textAlign: 'center', color: '#00E5FF', fontWeight: 700 }}>{l.orderQty}</td>
                        <td><span className="unit-badge main">{l.mainUnit || '-'}</span></td>
                        <td><span className="unit-badge sub">{l.subUnit || '-'}</span></td>
                        <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#00E5FF' }}>{l.batNumber || '-'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#00CC88' }}>{l.lotNumber || '-'}</td>
                        <td style={{ fontSize: 11 }}>{l.manufactureDate || '-'}</td>
                        <td style={{ fontSize: 11, color: l.expiryDate ? '#FFD700' : undefined }}>{l.expiryDate || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setViewOrder(null)}>ปิด</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DELETE CONFIRM ══ */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-box modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🗑️ ยืนยันการลบ Order</h2>
              <button className="modal-close" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#b0cdd8', fontSize: 14 }}>
                ต้องการลบ Order <strong style={{ color: '#FF6B6B', fontFamily: 'monospace' }}>
                  {orders.find(o => o.id === deleteId)?.orderNo}
                </strong> ใช่หรือไม่?<br />
                <span style={{ color: '#5a8fa8', fontSize: 12 }}>การลบไม่สามารถยกเลิกได้</span>
              </p>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setDeleteId(null)}>ยกเลิก</button>
              <button className="delete-confirm-btn" onClick={handleDelete}>🗑️ ลบ Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
