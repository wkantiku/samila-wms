import { useState, useEffect, Fragment } from 'react';
import { packingApi, customerApi } from '../../services/api';
import './PackingModule.css';

const INIT_ORDERS = [
  {
    id: 1,
    packNo: 'PACK-2026-0001',
    date: '2026-03-19',
    customer: 'Customer A',
    warehouse: 'Warehouse A',
    status: 'PENDING',
    totalBoxes: 0,
    items: [
      { id: 1, sku: 'SKU001', productName: 'Product 1', barcode: 'BC001', batNumber: 'BAT-001', lotNumber: 'LOT-001', toPack: 100, packed: 0, unit: 'PCS', boxNumber: '', packStatus: 'PENDING' },
      { id: 2, sku: 'SKU002', productName: 'Product 2', barcode: 'BC002', batNumber: 'BAT-002', lotNumber: 'LOT-002', toPack: 50,  packed: 0, unit: 'BOX', boxNumber: '', packStatus: 'PENDING' },
    ],
  },
];

const emptyForm = () => ({ customer: '', warehouse: '', pickingId: '', salesOrderId: '' });
const emptyItem = () => ({ sku: '', productName: '', barcode: '', toPack: '', unit: 'PCS', batNumber: '', lotNumber: '' });

function statusBadge(s) {
  const cls = s === 'COMPLETED' ? 'completed' : s === 'IN_PROGRESS' ? 'in_progress' : s === 'CANCELLED' ? 'cancelled' : 'pending';
  return <span className={`badge-pack ${cls}`}>{s}</span>;
}

function PackingSlipPrint({ order, onClose }) {
  return (
    <div className="slip-overlay" onClick={onClose}>
      <div className="slip-modal" onClick={e => e.stopPropagation()}>
        <div className="slip-controls no-print">
          <button className="slip-print-btn" onClick={() => window.print()}>Print</button>
          <button className="slip-close-btn" onClick={onClose}>Close</button>
        </div>
        <div className="slip-doc">
          <div className="slip-header">
            <div>
              <div className="slip-company-name">Samila WMS 3PL</div>
              <div className="slip-company-sub">Warehouse Management System</div>
            </div>
            <div className="slip-title-block">
              <div className="slip-title">PACKING SLIP</div>
              <div className="slip-no">No. {order.packNo}</div>
            </div>
          </div>
          <hr className="slip-divider" />
          <div className="slip-info-grid">
            <div className="slip-info-row"><span className="slip-info-label">Pack No:</span> {order.packNo}</div>
            <div className="slip-info-row"><span className="slip-info-label">Date:</span> {order.date}</div>
            <div className="slip-info-row"><span className="slip-info-label">Customer:</span> {order.customer}</div>
            <div className="slip-info-row"><span className="slip-info-label">Warehouse:</span> {order.warehouse}</div>
            <div className="slip-info-row"><span className="slip-info-label">Total Boxes:</span> {order.totalBoxes}</div>
            <div className="slip-info-row"><span className="slip-info-label">Status:</span> {order.status}</div>
          </div>
          <table className="slip-items-table">
            <thead>
              <tr>
                <th>#</th><th>SKU</th><th>Product</th><th>Batch</th><th>Lot</th>
                <th>Qty</th><th>Unit</th><th>Box No.</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>{item.sku}</td>
                  <td>{item.productName}</td>
                  <td>{item.batNumber}</td>
                  <td>{item.lotNumber}</td>
                  <td>{item.toPack}</td>
                  <td>{item.unit}</td>
                  <td>{item.boxNumber || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="slip-footer">
            <span>Printed: {new Date().toLocaleString()}</span>
            <span>Samila WMS 3PL &copy; 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PackingModule({ pickingOrders = [], currentUser }) {
  const [orders, setOrders] = useState(INIT_ORDERS);
  const [notify, setNotify] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [custList, setCustList] = useState([]);
  useEffect(() => {
    customerApi.list(currentUser?.companyNo).then(data => {
      if (Array.isArray(data)) setCustList(data.map(c => c.name).filter(Boolean));
    }).catch(() => {});
  }, [currentUser?.companyNo]);
  const [expandedId, setExpandedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [formItems, setFormItems] = useState([emptyItem()]);
  const [submitting, setSubmitting] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const [confirmItems, setConfirmItems] = useState([]);
  const [slipOrder, setSlipOrder] = useState(null);

  useEffect(() => {
    packingApi.list()
      .then(data => { if (Array.isArray(data) && data.length > 0) setOrders(data); })
      .catch(() => {});
  }, []);

  const showNotify = (msg, type = 'success') => {
    setNotify({ msg, type });
    setTimeout(() => setNotify(null), 3500);
  };

  const setField = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }));

  const setItemField = (idx, f) => (e) => {
    setFormItems(prev => prev.map((it, i) => i === idx ? { ...it, [f]: e.target.value } : it));
  };

  const addItem = () => setFormItems(prev => [...prev, emptyItem()]);
  const removeItem = (idx) => setFormItems(prev => prev.filter((_, i) => i !== idx));

  // Pre-fill form items from a selected picking order
  const handlePickingSelect = (e) => {
    const pickId = Number(e.target.value);
    setForm(prev => ({ ...prev, pickingId: e.target.value }));
    if (!pickId) { setFormItems([emptyItem()]); return; }
    const pick = pickingOrders.find(p => p.id === pickId);
    if (pick) {
      setForm(prev => ({ ...prev, customer: pick.customer || prev.customer, warehouse: pick.warehouse || prev.warehouse }));
      setFormItems((pick.items || []).map(it => ({
        sku: it.sku || '', productName: it.productName || '', barcode: it.barcode || '',
        toPack: String(it.toPick || it.picked || ''), unit: it.unit || 'PCS',
        batNumber: it.batNumber || '', lotNumber: it.lotNumber || '',
      })));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.customer.trim()) { showNotify('กรุณากรอก Customer', 'error'); return; }
    const validItems = formItems.filter(it => it.sku && it.toPack);
    if (!validItems.length) { showNotify('กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ', 'error'); return; }
    setSubmitting(true);
    try {
      const payload = {
        customer: form.customer,
        warehouse: form.warehouse,
        pickingId: form.pickingId ? Number(form.pickingId) : null,
        salesOrderId: form.salesOrderId ? Number(form.salesOrderId) : null,
        items: validItems.map(it => ({
          sku: it.sku, productName: it.productName, barcode: it.barcode || null,
          toPack: Number(it.toPack), unit: it.unit,
          batNumber: it.batNumber || null, lotNumber: it.lotNumber || null,
        })),
      };
      const created = await packingApi.create(payload);
      setOrders(prev => [created, ...prev]);
      showNotify(`สร้าง Packing Order ${created.packNo} สำเร็จ`);
      setShowCreate(false);
      setForm(emptyForm());
      setFormItems([emptyItem()]);
    } catch (err) {
      showNotify(err.message || 'เกิดข้อผิดพลาด', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openConfirm = (order) => {
    setConfirmingId(order.id);
    setConfirmItems(order.items.map(it => ({ ...it })));
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await packingApi.confirm(confirmingId, { items: confirmItems });
      setOrders(prev => prev.map(o => o.id !== confirmingId ? o : {
        ...o, status: 'COMPLETED',
        totalBoxes: [...new Set(confirmItems.map(i => i.boxNumber).filter(Boolean))].length,
        items: confirmItems.map(ci => ({ ...ci, packStatus: 'PACKED' })),
      }));
      showNotify('ยืนยัน Packing เรียบร้อย');
      setConfirmingId(null);
      setConfirmItems([]);
    } catch (err) {
      showNotify(err.message || 'เกิดข้อผิดพลาด', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ต้องการลบ Packing Order นี้?')) return;
    try {
      await packingApi.remove(id);
      setOrders(prev => prev.filter(o => o.id !== id));
      showNotify('ลบเรียบร้อย');
    } catch (err) {
      showNotify(err.message || 'เกิดข้อผิดพลาด', 'error');
    }
  };

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchText = !q || o.packNo?.toLowerCase().includes(q) || o.customer?.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'ALL' || o.status === filterStatus;
    return matchText && matchStatus;
  });

  const counts = { ALL: orders.length, PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 };
  orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });

  return (
    <div className="wms-module packing-module">
      <div className="module-header">
        <h1>📦 Packing Management</h1>
        <button className="btn-pack-primary" onClick={() => { setShowCreate(true); setForm(emptyForm()); setFormItems([emptyItem()]); }}>
          + New Packing Order
        </button>
      </div>

      {notify && <div className={`pack-notify ${notify.type}`}>{notify.msg}</div>}

      {/* Stats */}
      <div className="packing-stats">
        {['ALL','PENDING','IN_PROGRESS','COMPLETED','CANCELLED'].map(s => (
          <div key={s} className="packing-stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilterStatus(s)}>
            <div className="stat-num">{counts[s] ?? 0}</div>
            <div className="stat-label">{s}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="packing-toolbar">
        <input
          placeholder="ค้นหา Pack No, Customer..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: 240 }}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          {['ALL','PENDING','IN_PROGRESS','COMPLETED','CANCELLED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="packing-table-wrap">
        <table className="packing-table">
          <thead>
            <tr>
              <th></th>
              <th>Pack No.</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Warehouse</th>
              <th>Items</th>
              <th>Boxes</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: 'rgba(224,247,255,0.4)', padding: 28 }}>ไม่มีข้อมูล</td></tr>
            )}
            {filtered.map(order => (
              <Fragment key={order.id}>
                <tr>
                  <td style={{ width: 30, textAlign: 'center', cursor: 'pointer' }}
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}>
                    {expandedId === order.id ? '▾' : '▸'}
                  </td>
                  <td style={{ fontWeight: 700, color: '#00BCD4' }}>{order.packNo}</td>
                  <td>{order.date}</td>
                  <td>{order.customer}</td>
                  <td>{order.warehouse}</td>
                  <td style={{ textAlign: 'center' }}>{order.items?.length ?? 0}</td>
                  <td style={{ textAlign: 'center' }}>{order.totalBoxes}</td>
                  <td>{statusBadge(order.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                        <button className="btn-pack-confirm" onClick={() => openConfirm(order)}>Confirm</button>
                      )}
                      <button className="btn-pack-print" onClick={() => setSlipOrder(order)}>Slip</button>
                      <button className="btn-pack-danger" onClick={() => handleDelete(order.id)}>Del</button>
                    </div>
                  </td>
                </tr>
                {expandedId === order.id && (
                  <tr className="pack-items-row">
                    <td colSpan={9}>
                      <div className="pack-items-inner">
                        <table className="pack-items-table">
                          <thead>
                            <tr>
                              <th>SKU</th><th>Product</th><th>Barcode</th>
                              <th>Batch</th><th>Lot</th><th>To Pack</th>
                              <th>Packed</th><th>Unit</th><th>Box No.</th><th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(order.items || []).map(it => (
                              <tr key={it.id}>
                                <td>{it.sku}</td>
                                <td>{it.productName}</td>
                                <td>{it.barcode}</td>
                                <td>{it.batNumber}</td>
                                <td>{it.lotNumber}</td>
                                <td>{it.toPack}</td>
                                <td>{it.packed}</td>
                                <td>{it.unit}</td>
                                <td>{it.boxNumber || '-'}</td>
                                <td>{statusBadge(it.packStatus || 'PENDING')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="pack-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="pack-modal" onClick={e => e.stopPropagation()}>
            <h2>+ New Packing Order</h2>
            <form onSubmit={handleCreate}>
              <label>Customer *</label>
              <select value={form.customer} onChange={setField('customer')}>
                <option value="">-- เลือก Customer --</option>
                {custList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <label>Warehouse</label>
              <input value={form.warehouse} onChange={setField('warehouse')} placeholder="Warehouse" />
              {pickingOrders.length > 0 && (
                <>
                  <label>From Picking Order (optional)</label>
                  <select value={form.pickingId} onChange={handlePickingSelect}>
                    <option value="">-- Select Picking Order --</option>
                    {pickingOrders.filter(p => p.status === 'COMPLETED').map(p => (
                      <option key={p.id} value={p.id}>{p.pickNo} — {p.customer}</option>
                    ))}
                  </select>
                </>
              )}
              <label>Sales Order ID (optional)</label>
              <input value={form.salesOrderId} onChange={setField('salesOrderId')} placeholder="SO ID" />

              <div style={{ margin: '4px 0 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#00BCD4', fontWeight: 700 }}>Items</span>
                <button type="button" className="btn-pack-primary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={addItem}>+ Add Item</button>
              </div>

              {formItems.map((it, idx) => (
                <div key={idx} style={{ background: 'rgba(0,30,55,0.6)', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 8 }}>
                    <div><label>SKU</label><input value={it.sku} onChange={setItemField(idx,'sku')} placeholder="SKU" /></div>
                    <div><label>Product Name</label><input value={it.productName} onChange={setItemField(idx,'productName')} placeholder="Product" /></div>
                    <div><label>Qty</label><input type="number" value={it.toPack} onChange={setItemField(idx,'toPack')} placeholder="0" min="0" /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                    <div><label>Unit</label>
                      <select value={it.unit} onChange={setItemField(idx,'unit')} style={{ width: '100%', padding: '9px 8px', borderRadius: 8, background: 'rgba(0,20,40,0.85)', border: '1px solid rgba(0,188,212,0.35)', color: '#e0f7ff', marginBottom: 14 }}>
                        {['PCS','BOX','CARTON','PALLET','KG','SET'].map(u => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                    <div><label>Batch</label><input value={it.batNumber} onChange={setItemField(idx,'batNumber')} placeholder="BAT-" /></div>
                    <div><label>Lot</label><input value={it.lotNumber} onChange={setItemField(idx,'lotNumber')} placeholder="LOT-" /></div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 14 }}>
                      <button type="button" className="btn-pack-danger" style={{ width: '100%' }} onClick={() => removeItem(idx)}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pack-modal-actions">
                <button type="button" className="btn-pack-danger" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn-pack-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Packing Modal */}
      {confirmingId !== null && (
        <div className="pack-modal-overlay" onClick={() => setConfirmingId(null)}>
          <div className="pack-modal" onClick={e => e.stopPropagation()} style={{ width: 680 }}>
            <h2>Confirm Packing</h2>
            <p style={{ color: 'rgba(224,247,255,0.6)', fontSize: 13, marginTop: -10, marginBottom: 14 }}>
              กรอก Box Number และยืนยันจำนวนที่แพ็คแล้ว
            </p>
            <table className="pack-items-table" style={{ width: '100%', marginBottom: 16 }}>
              <thead>
                <tr><th>SKU</th><th>Product</th><th>To Pack</th><th>Packed Qty</th><th>Box No.</th></tr>
              </thead>
              <tbody>
                {confirmItems.map((it, idx) => (
                  <tr key={it.id}>
                    <td>{it.sku}</td>
                    <td>{it.productName}</td>
                    <td>{it.toPack}</td>
                    <td>
                      <input type="number" value={it.toPack} min="0"
                        onChange={e => setConfirmItems(prev => prev.map((ci, i) => i === idx ? { ...ci, toPack: Number(e.target.value) } : ci))}
                      />
                    </td>
                    <td>
                      <input type="text" value={it.boxNumber || ''} placeholder="BOX-001"
                        onChange={e => setConfirmItems(prev => prev.map((ci, i) => i === idx ? { ...ci, boxNumber: e.target.value } : ci))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pack-modal-actions">
              <button className="btn-pack-danger" onClick={() => setConfirmingId(null)}>Cancel</button>
              <button className="btn-pack-confirm" disabled={submitting} onClick={handleConfirm}>
                {submitting ? 'Saving...' : 'Confirm Packing'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Packing Slip */}
      {slipOrder && <PackingSlipPrint order={slipOrder} onClose={() => setSlipOrder(null)} />}
    </div>
  );
}

export default PackingModule;
