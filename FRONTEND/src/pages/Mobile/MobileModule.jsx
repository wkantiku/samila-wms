import { useState, useRef, useEffect, useCallback } from 'react';
import './MobileModule.css';

/* ─────────────────────────────────────────────────────────────
   MobileModule — WMS Worker Interface (browser PWA simulation)
   Screens: Home | Scan | Receive | Pick | Putaway | Ship | Count
───────────────────────────────────────────────────────────────*/

const SCREENS = {
  HOME:    'home',
  SCAN:    'scan',
  RECEIVE: 'receive',
  PICK:    'pick',
  PUTAWAY: 'putaway',
  SHIP:    'ship',
  COUNT:   'count',
};

// ── Status bar clock ─────────────────────────────────────────
function StatusBarClock() {
  const [t, setT] = useState(() => new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
  useEffect(() => {
    const id = setInterval(() => setT(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })), 30000);
    return () => clearInterval(id);
  }, []);
  return <span>{t}</span>;
}

// ── Screen: Home ──────────────────────────────────────────────
function HomeScreen({ onNav, inventory, pickingOrders, putawayRecords, currentUser }) {
  const pendingPicks   = pickingOrders.filter(o => o.status === 'PENDING').length;
  const inProgressPick = pickingOrders.filter(o => o.status === 'IN_PROGRESS').length;
  const pendingPutaway = putawayRecords.filter(r => r.status === 'PENDING').length;
  const lowStock       = inventory.filter(i => i.available !== undefined && i.available <= (i.minStock || 0)).length;

  const quickActions = [
    { key: SCREENS.SCAN,    icon: '📷', label: 'สแกน',     cls: 'mq-scan'    },
    { key: SCREENS.RECEIVE, icon: '📦', label: 'รับสินค้า', cls: 'mq-receive' },
    { key: SCREENS.PICK,    icon: '🔍', label: 'Picking',   cls: 'mq-pick'    },
    { key: SCREENS.PUTAWAY, icon: '📌', label: 'Putaway',   cls: 'mq-putaway' },
    { key: SCREENS.SHIP,    icon: '🚚', label: 'จัดส่ง',    cls: 'mq-ship'    },
    { key: SCREENS.COUNT,   icon: '📱', label: 'นับสต็อก',  cls: 'mq-count'   },
  ];

  return (
    <>
      <div className="mobile-home-greeting">
        <h2>สวัสดี, {currentUser?.name?.split(' ')[0] || 'Worker'} 👋</h2>
        <p>{new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="mobile-quick-grid">
        {quickActions.map(a => (
          <button key={a.key} className={`mobile-quick-btn ${a.cls}`} onClick={() => onNav(a.key)}>
            <span className="mq-icon">{a.icon}</span>
            <span className="mq-label">{a.label}</span>
          </button>
        ))}
      </div>

      <div className="mobile-task-section">
        <div className="mobile-task-section-title">งานที่รอดำเนินการ</div>

        <div className="mobile-task-card" onClick={() => onNav(SCREENS.PICK)}>
          <span className="mtc-icon">🔍</span>
          <div className="mtc-body">
            <div className="mtc-title">Picking Tasks</div>
            <div className="mtc-meta">{pendingPicks + inProgressPick} รายการที่ต้องดำเนินการ</div>
          </div>
          <span className={`mtc-badge ${pendingPicks > 0 ? 'pending' : 'active'}`}>
            {pendingPicks} รอ
          </span>
        </div>

        <div className="mobile-task-card" onClick={() => onNav(SCREENS.PUTAWAY)}>
          <span className="mtc-icon">📌</span>
          <div className="mtc-body">
            <div className="mtc-title">Putaway Tasks</div>
            <div className="mtc-meta">{pendingPutaway} รายการรอนำเข้าชั้น</div>
          </div>
          <span className={`mtc-badge ${pendingPutaway > 0 ? 'waiting' : 'active'}`}>
            {pendingPutaway} รอ
          </span>
        </div>

        <div className="mobile-task-card" onClick={() => onNav(SCREENS.SCAN)}>
          <span className="mtc-icon">📊</span>
          <div className="mtc-body">
            <div className="mtc-title">Stock รวม</div>
            <div className="mtc-meta">{inventory.length} รายการใน Inventory</div>
          </div>
          {lowStock > 0 && (
            <span className="mtc-badge urgent">Low {lowStock}</span>
          )}
        </div>
      </div>
    </>
  );
}

// ── Screen: Scanner ───────────────────────────────────────────
function ScanScreen({ inventory }) {
  const [scanning, setScanning] = useState(false);
  const [input, setInput]       = useState('');
  const [result, setResult]     = useState(null);
  const inputRef = useRef();

  const handleScan = useCallback(() => {
    const q = input.trim();
    if (!q) return;
    const found = inventory.find(i =>
      i.sku === q || i.barcode === q || (i.product || '').toLowerCase().includes(q.toLowerCase())
    );
    setResult(found ? { type: 'found', item: found } : { type: 'not-found', q });
    setInput('');
  }, [input, inventory]);

  const toggleCamera = () => {
    setScanning(s => !s);
    if (!scanning) setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="mobile-scan-area">
      <div
        className={`scanner-viewport ${scanning ? 'scanner-viewport-active' : ''}`}
        onClick={toggleCamera}
      >
        {scanning && <div className="scanner-line" />}
        <span className="scanner-icon">📷</span>
        {scanning ? (
          <div className="scanner-active-text">กำลังสแกน... กด Enter หรือพิมพ์บาร์โค้ด</div>
        ) : (
          <div className="scanner-hint">แตะเพื่อเปิดกล้องสแกน</div>
        )}
      </div>

      <div className="scan-input-row">
        <input
          ref={inputRef}
          type="text"
          placeholder="SKU / Barcode / ชื่อสินค้า..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleScan()}
          autoComplete="off"
        />
        <button className="scan-submit-btn" onClick={handleScan}>🔍</button>
      </div>

      {result && result.type === 'found' && (
        <div className="scan-result-card found">
          <div className="src-label">สินค้าที่พบ</div>
          <div className="src-value">{result.item.product}</div>
          <div className="src-grid">
            <div className="src-item">
              <div className="src-item-label">Item Code</div>
              <div className="src-item-val">{result.item.sku}</div>
            </div>
            <div className="src-item">
              <div className="src-item-label">Barcode</div>
              <div className="src-item-val">{result.item.barcode || '-'}</div>
            </div>
            <div className="src-item">
              <div className="src-item-label">Location</div>
              <div className="src-item-val">{result.item.location}</div>
            </div>
            <div className="src-item">
              <div className="src-item-label">คงเหลือ</div>
              <div className="src-item-val" style={{ color: '#00CC88' }}>
                {result.item.available ?? result.item.quantity} {result.item.mainUnit || 'PCS'}
              </div>
            </div>
            <div className="src-item">
              <div className="src-item-label">BAT No.</div>
              <div className="src-item-val" style={{ color: '#00E5FF', fontSize: 11 }}>{result.item.batNumber || '-'}</div>
            </div>
            <div className="src-item">
              <div className="src-item-label">Lot No.</div>
              <div className="src-item-val" style={{ color: '#00CC88', fontSize: 11 }}>{result.item.lotNumber || '-'}</div>
            </div>
            <div className="src-item">
              <div className="src-item-label">หมดอายุ</div>
              <div className="src-item-val" style={{ color: '#FFD700', fontSize: 11 }}>{result.item.expiryDate || '-'}</div>
            </div>
            <div className="src-item">
              <div className="src-item-label">ลูกค้า</div>
              <div className="src-item-val" style={{ fontSize: 11 }}>{result.item.customer || '-'}</div>
            </div>
          </div>
        </div>
      )}

      {result && result.type === 'not-found' && (
        <div className="scan-result-card not-found">
          <div className="src-error">❌ ไม่พบสินค้า: "{result.q}"</div>
          <div style={{ fontSize: 11, color: '#5a8fa8', marginTop: 4 }}>
            ลองใช้ SKU, Barcode หรือชื่อสินค้า
          </div>
        </div>
      )}
    </div>
  );
}

// ── Screen: Quick Receive ─────────────────────────────────────
function ReceiveScreen({ onReceive }) {
  const today = () => new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ sku: '', product: '', barcode: '', qty: '', unit: 'PCS', customer: '', supplier: '', location: '', date: today() });
  const [success, setSuccess] = useState(null);
  const [notify, setNotify]   = useState(null);

  const setF = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = () => {
    if (!form.sku || !form.product || !form.qty) {
      setNotify({ msg: 'กรุณากรอก Item Code, ชื่อสินค้า และจำนวน', type: 'error' });
      return;
    }
    const gr = `GR-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    onReceive?.({
      sku: form.sku, barcode: form.barcode, product: form.product,
      quantity: Number(form.qty), available: Number(form.qty),
      mainUnit: form.unit, customer: form.customer,
      location: form.location || 'RECEIVING', status: 'GOOD',
      grNumber: gr, receivedDate: form.date,
    });
    setSuccess({ gr, sku: form.sku, qty: form.qty, unit: form.unit });
    setForm({ sku: '', product: '', barcode: '', qty: '', unit: 'PCS', customer: '', supplier: '', location: '', date: today() });
    setNotify(null);
    setTimeout(() => setSuccess(null), 5000);
  };

  return (
    <div className="mobile-receive-form">
      {notify && (
        <div className={`mobile-notify ${notify.type}`}>{notify.msg}</div>
      )}
      {success && (
        <div className="mrf-success">
          ✅ รับสินค้าสำเร็จ — {success.gr}
          <p>{success.sku} จำนวน {success.qty} {success.unit}</p>
        </div>
      )}

      <div className="mrf-row">
        <div className="mrf-group">
          <label className="mrf-label">Item Code *</label>
          <input className="mrf-input" placeholder="SKU001" value={form.sku} onChange={setF('sku')} />
        </div>
        <div className="mrf-group">
          <label className="mrf-label">Barcode</label>
          <input className="mrf-input" placeholder="BC001" value={form.barcode} onChange={setF('barcode')} />
        </div>
      </div>

      <div className="mrf-group">
        <label className="mrf-label">ชื่อสินค้า *</label>
        <input className="mrf-input" placeholder="Product Name" value={form.product} onChange={setF('product')} />
      </div>

      <div className="mrf-row">
        <div className="mrf-group">
          <label className="mrf-label">จำนวน *</label>
          <input className="mrf-input" type="number" placeholder="0" value={form.qty} onChange={setF('qty')} />
        </div>
        <div className="mrf-group">
          <label className="mrf-label">หน่วย</label>
          <select className="mrf-input" value={form.unit} onChange={setF('unit')}>
            {['PCS','BOX','CARTON','BAG','KG','L','BTL','PAL'].map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mrf-group">
        <label className="mrf-label">ลูกค้า</label>
        <input className="mrf-input" placeholder="Customer A" value={form.customer} onChange={setF('customer')} />
      </div>

      <div className="mrf-row">
        <div className="mrf-group">
          <label className="mrf-label">Supplier</label>
          <input className="mrf-input" placeholder="Supplier A" value={form.supplier} onChange={setF('supplier')} />
        </div>
        <div className="mrf-group">
          <label className="mrf-label">Location</label>
          <input className="mrf-input" placeholder="A-01-1-A" value={form.location} onChange={setF('location')} />
        </div>
      </div>

      <div className="mrf-group">
        <label className="mrf-label">วันที่รับ</label>
        <input className="mrf-input" type="date" value={form.date} onChange={setF('date')} />
      </div>

      <button className="mrf-submit-btn" onClick={handleSubmit}>
        📦 บันทึกการรับสินค้า
      </button>
    </div>
  );
}

// ── Screen: Pick List ─────────────────────────────────────────
function PickScreen({ pickingOrders, setPickingOrders }) {
  const [expanded, setExpanded] = useState(null);
  const [checked, setChecked]   = useState({});
  const [notify, setNotify]     = useState(null);

  const activeTasks = pickingOrders.filter(o => o.status === 'PENDING' || o.status === 'IN_PROGRESS');

  const toggleItem = (orderId, itemId) => {
    const key = `${orderId}_${itemId}`;
    setChecked(p => ({ ...p, [key]: !p[key] }));
  };

  const isChecked = (orderId, itemId) => !!checked[`${orderId}_${itemId}`];

  const confirmPick = (order) => {
    const allChecked = order.items.every(i => isChecked(order.id, i.id));
    if (!allChecked) {
      setNotify({ msg: 'กรุณาติ๊กสินค้าทุกรายการก่อน Confirm', type: 'error' });
      setTimeout(() => setNotify(null), 3000);
      return;
    }
    setPickingOrders?.(prev => prev.map(o =>
      o.id === order.id
        ? { ...o, status: 'COMPLETED', items: o.items.map(i => ({ ...i, picked: i.toPick })) }
        : o
    ));
    setNotify({ msg: `✅ Picking ${order.pickNo} เสร็จสิ้น`, type: 'success' });
    setTimeout(() => setNotify(null), 3500);
  };

  return (
    <>
      {notify && <div className={`mobile-notify ${notify.type}`}>{notify.msg}</div>}
      {activeTasks.length === 0 ? (
        <div className="mobile-empty">
          <span className="me-icon">✅</span>
          ไม่มี Picking Task ที่รอดำเนินการ
        </div>
      ) : (
        activeTasks.map(order => {
          const isOpen = expanded === order.id;
          const allDone = order.items.every(i => isChecked(order.id, i.id));
          return (
            <div key={order.id} className="mobile-pick-task">
              <div className="mpt-header" onClick={() => setExpanded(isOpen ? null : order.id)}>
                <span className="mpt-no">{order.pickNo}</span>
                <span className="mpt-cust">{order.customer}</span>
                <span className={`mpt-status ${order.status === 'IN_PROGRESS' ? 'in-progress' : ''}`}>
                  {order.status === 'IN_PROGRESS' ? 'กำลังทำ' : 'รอ'}
                </span>
                <span style={{ color: '#5a8fa8', fontSize: 14, marginLeft: 6 }}>{isOpen ? '▲' : '▼'}</span>
              </div>

              {isOpen && (
                <div className="mpt-body">
                  {order.items.map(item => (
                    <div key={item.id} className="mpt-item">
                      <button
                        className={`mpt-item-check ${isChecked(order.id, item.id) ? 'checked' : ''}`}
                        onClick={() => toggleItem(order.id, item.id)}
                      >✓</button>
                      <span className="mpt-item-sku">{item.sku}</span>
                      <div style={{ flex: 1 }}>
                        <div className="mpt-item-name">{item.productName}</div>
                        <div className="mpt-item-loc">📍 {item.location}</div>
                      </div>
                      <span className="mpt-item-qty">{item.toPick} {item.unit}</span>
                    </div>
                  ))}
                  <button
                    className={`mpt-confirm-btn ${allDone ? 'done' : ''}`}
                    onClick={() => confirmPick(order)}
                  >
                    {allDone ? '✅ Confirm Picking' : `☐ ติ๊กสินค้า ${order.items.filter(i => isChecked(order.id, i.id)).length}/${order.items.length} รายการ`}
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </>
  );
}

// ── Screen: Putaway ───────────────────────────────────────────
function PutawayScreen({ putawayRecords, setPutawayRecords }) {
  const [notify, setNotify] = useState(null);

  const pending = putawayRecords.filter(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS');

  const confirmPutaway = (record) => {
    setPutawayRecords?.(prev => prev.map(r =>
      r.id === record.id ? { ...r, status: 'COMPLETE' } : r
    ));
    setNotify({ msg: `✅ Putaway ${record.paNumber} เสร็จสิ้น`, type: 'success' });
    setTimeout(() => setNotify(null), 3500);
  };

  return (
    <>
      {notify && <div className={`mobile-notify ${notify.type}`}>{notify.msg}</div>}
      {pending.length === 0 ? (
        <div className="mobile-empty">
          <span className="me-icon">✅</span>
          ไม่มี Putaway Task ที่รอดำเนินการ
        </div>
      ) : (
        pending.map(r => (
          <div key={r.id} className="mobile-putaway-item">
            <div className="mpi-header">
              <span className="mpi-pa">{r.paNumber}</span>
              <span className={`mpi-status ${r.status === 'COMPLETE' ? 'complete' : ''}`}>
                {r.status === 'IN_PROGRESS' ? 'กำลังทำ' : r.status === 'COMPLETE' ? 'เสร็จ' : 'รอ'}
              </span>
            </div>
            <div className="mpi-row">
              <span className="mpi-lbl">SKU</span>
              <span className="mpi-val" style={{ color: '#a0c8dc', fontFamily: 'monospace' }}>{r.sku}</span>
            </div>
            <div className="mpi-row">
              <span className="mpi-lbl">ลูกค้า</span>
              <span className="mpi-val">{r.customer}</span>
            </div>
            <div className="mpi-row">
              <span className="mpi-lbl">จำนวน</span>
              <span className="mpi-val" style={{ color: '#FFD700' }}>{r.qty} {r.mainUnit}</span>
            </div>
            <div className="mpi-row">
              <span className="mpi-lbl">ย้ายจาก</span>
              <span className="mpi-val" style={{ color: '#FF8C42' }}>{r.fromLocation}</span>
              <span className="mpi-arrow">→</span>
              <span className="mpi-val" style={{ color: '#00CC88' }}>{r.toLocation}</span>
            </div>
            <button
              className={`mpi-confirm-btn ${r.status === 'COMPLETE' ? 'done' : ''}`}
              disabled={r.status === 'COMPLETE'}
              onClick={() => confirmPutaway(r)}
            >
              {r.status === 'COMPLETE' ? '✅ เสร็จสิ้น' : '📌 ยืนยัน Putaway'}
            </button>
          </div>
        ))
      )}
    </>
  );
}

// ── Screen: Ship ──────────────────────────────────────────────
function ShipScreen() {
  const [form, setForm]     = useState({ so: '', carrier: '', tracking: '', notes: '' });
  const [success, setSuccess] = useState(null);
  const [notify, setNotify]   = useState(null);

  const setF = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleConfirm = () => {
    if (!form.so || !form.carrier) {
      setNotify({ msg: 'กรุณากรอก SO Number และ Carrier', type: 'error' });
      return;
    }
    setSuccess({ so: form.so, carrier: form.carrier, tracking: form.tracking });
    setForm({ so: '', carrier: '', tracking: '', notes: '' });
    setNotify(null);
    setTimeout(() => setSuccess(null), 5000);
  };

  return (
    <div className="mobile-ship-form">
      {notify && <div className={`mobile-notify ${notify.type}`}>{notify.msg}</div>}
      {success && (
        <div className="ship-success">
          🚚 จัดส่งสำเร็จ — {success.so}
          <p style={{ fontSize: 11, color: '#7a9fb5', margin: '4px 0 0', fontWeight: 400 }}>
            {success.carrier} {success.tracking && `| ${success.tracking}`}
          </p>
        </div>
      )}

      <div className="mrf-group">
        <label className="mrf-label">SO Number *</label>
        <input className="mrf-input" placeholder="SO-2026-0001" value={form.so} onChange={setF('so')} />
      </div>

      <div className="mrf-group">
        <label className="mrf-label">Carrier / ขนส่ง *</label>
        <select className="mrf-input" value={form.carrier} onChange={setF('carrier')}>
          <option value="">-- เลือกขนส่ง --</option>
          {['Kerry Express','Flash Express','Thailand Post','DHL','SCG Express','J&T Express','Ninja Van','Line Man','In-house'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="mrf-group">
        <label className="mrf-label">Tracking No.</label>
        <input className="mrf-input" placeholder="TRACK123456" value={form.tracking} onChange={setF('tracking')} />
      </div>

      <div className="mrf-group">
        <label className="mrf-label">หมายเหตุ</label>
        <input className="mrf-input" placeholder="(ไม่บังคับ)" value={form.notes} onChange={setF('notes')} />
      </div>

      <button className="ship-confirm-btn" onClick={handleConfirm}>
        🚚 ยืนยันการจัดส่ง
      </button>
    </div>
  );
}

// ── Screen: Stock Count ───────────────────────────────────────
function CountScreen({ inventory, setInventory }) {
  const [scanInput, setScanInput] = useState('');
  const [countQty, setCountQty]   = useState('');
  const [counted, setCounted]     = useState([]);
  const [notify, setNotify]       = useState(null);

  const handleCount = () => {
    const q = scanInput.trim();
    if (!q) return;
    const found = inventory.find(i => i.sku === q || i.barcode === q);
    if (!found) {
      setNotify({ msg: `ไม่พบ SKU: ${q}`, type: 'error' });
      setTimeout(() => setNotify(null), 2500);
      return;
    }
    const qty = countQty ? Number(countQty) : found.quantity;
    if (countQty) {
      setInventory?.(prev => prev.map(i =>
        i.id === found.id ? { ...i, quantity: qty, available: qty } : i
      ));
    }
    setCounted(p => {
      const existing = p.findIndex(c => c.sku === found.sku);
      const entry = { sku: found.sku, name: found.product, location: found.location, qty, unit: found.mainUnit || 'PCS' };
      return existing >= 0 ? p.map((c, i) => i === existing ? entry : c) : [entry, ...p];
    });
    setNotify({ msg: `บันทึก ${found.sku}: ${qty} ${found.mainUnit || 'PCS'}`, type: 'success' });
    setTimeout(() => setNotify(null), 2500);
    setScanInput(''); setCountQty('');
  };

  return (
    <div className="mobile-count-form">
      {notify && <div className={`mobile-notify ${notify.type}`}>{notify.msg}</div>}

      <div className="scan-input-row">
        <input
          type="text" placeholder="SKU / Barcode..."
          value={scanInput} onChange={e => setScanInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCount()}
        />
      </div>
      <div className="mrf-row">
        <div className="mrf-group">
          <label className="mrf-label">จำนวนที่นับได้</label>
          <input
            className="mrf-input" type="number" placeholder="(ว่าง = ดูแค่ข้อมูล)"
            value={countQty} onChange={e => setCountQty(e.target.value)}
          />
        </div>
        <div className="mrf-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button className="mrf-submit-btn" style={{ margin: 0 }} onClick={handleCount}>
            📱 บันทึก
          </button>
        </div>
      </div>

      {counted.length > 0 && (
        <>
          <div className="mobile-task-section-title" style={{ marginBottom: 6, marginTop: 4 }}>
            รายการที่นับแล้ว ({counted.length})
          </div>
          <div className="count-result-list">
            {counted.map((c, i) => (
              <div key={i} className="count-result-item">
                <span className="cri-sku">{c.sku}</span>
                <div style={{ flex: 1 }}>
                  <div className="cri-name">{c.name}</div>
                  <div className="cri-loc">📍 {c.location}</div>
                </div>
                <span className="cri-qty">{c.qty}</span>
                <span className="cri-unit">{c.unit}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {counted.length === 0 && (
        <div className="mobile-empty" style={{ padding: '20px 0' }}>
          <span className="me-icon">📱</span>
          สแกน SKU หรือ Barcode เพื่อเริ่มนับ
        </div>
      )}
    </div>
  );
}

// ── Screen config ─────────────────────────────────────────────
const SCREEN_META = {
  [SCREENS.HOME]:    { title: 'WMS Worker',      icon: '🏠' },
  [SCREENS.SCAN]:    { title: 'สแกนสินค้า',       icon: '📷' },
  [SCREENS.RECEIVE]: { title: 'รับสินค้าเข้า',    icon: '📦' },
  [SCREENS.PICK]:    { title: 'Picking Task',     icon: '🔍' },
  [SCREENS.PUTAWAY]: { title: 'Putaway Task',     icon: '📌' },
  [SCREENS.SHIP]:    { title: 'จัดส่งสินค้า',     icon: '🚚' },
  [SCREENS.COUNT]:   { title: 'นับสต็อก',          icon: '📱' },
};

const NAV_ITEMS = [
  { key: SCREENS.HOME,    icon: '🏠', label: 'Home'    },
  { key: SCREENS.SCAN,    icon: '📷', label: 'Scan'    },
  { key: SCREENS.PICK,    icon: '🔍', label: 'Pick'    },
  { key: SCREENS.PUTAWAY, icon: '📌', label: 'Putaway' },
  { key: SCREENS.COUNT,   icon: '📱', label: 'Count'   },
];

// ── Main Component ────────────────────────────────────────────
export default function MobileModule({
  inventory = [], setInventory,
  pickingOrders = [], setPickingOrders,
  putawayRecords = [], setPutawayRecords,
  onReceive, currentUser,
  initialScreen, onLogout, isPWA = false,
}) {
  const [screen, setScreen] = useState(() => {
    if (initialScreen && SCREENS[initialScreen.toUpperCase()]) return SCREENS[initialScreen.toUpperCase()];
    return SCREENS.HOME;
  });
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled]         = useState(false);

  // Capture install prompt
  useEffect(() => {
    const handler = e => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => { setInstalled(true); setInstallPrompt(null); });
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  };

  const meta = SCREEN_META[screen];

  // ── Shared phone shell (used in both PWA and desktop modes) ──
  const phoneShell = (
    <div className={isPWA ? 'mobile-pwa-shell' : 'mobile-phone'}>
      {/* Status bar */}
      <div className="mobile-status-bar">
        <div className="mobile-status-left">
          <div className="mobile-status-dot" />
          <span>Samila WMS</span>
        </div>
        <div className="mobile-status-right">
          {!installed && installPrompt && !isPWA && (
            <button className="pwa-install-mini-btn" onClick={handleInstall} title="ติดตั้ง App">⬇</button>
          )}
          <span className="mobile-wifi">📶</span>
          <div className="mobile-battery"><div className="mobile-battery-fill" /></div>
          <StatusBarClock />
        </div>
      </div>

      {/* Screen header */}
      <div className="mobile-screen-header">
        {screen !== SCREENS.HOME && (
          <button className="mobile-back-btn" onClick={() => setScreen(SCREENS.HOME)}>‹</button>
        )}
        <span className="mobile-screen-icon">{meta.icon}</span>
        <span className="mobile-screen-title">{meta.title}</span>
        {onLogout && screen === SCREENS.HOME && (
          <button className="mobile-pwa-logout-btn" onClick={onLogout}>ออก</button>
        )}
      </div>

      {/* Screen body */}
      <div className="mobile-screen-body">
        {screen === SCREENS.HOME && (
          <HomeScreen
            onNav={setScreen}
            inventory={inventory}
            pickingOrders={pickingOrders}
            putawayRecords={putawayRecords}
            currentUser={currentUser}
          />
        )}
        {screen === SCREENS.SCAN && (
          <ScanScreen inventory={inventory} />
        )}
        {screen === SCREENS.RECEIVE && (
          <ReceiveScreen onReceive={onReceive} />
        )}
        {screen === SCREENS.PICK && (
          <PickScreen pickingOrders={pickingOrders} setPickingOrders={setPickingOrders} />
        )}
        {screen === SCREENS.PUTAWAY && (
          <PutawayScreen putawayRecords={putawayRecords} setPutawayRecords={setPutawayRecords} />
        )}
        {screen === SCREENS.SHIP && (
          <ShipScreen />
        )}
        {screen === SCREENS.COUNT && (
          <CountScreen inventory={inventory} setInventory={setInventory} />
        )}
      </div>

      {/* Bottom nav */}
      <div className="mobile-bottom-nav">
        {NAV_ITEMS.map(n => (
          <button
            key={n.key}
            className={`mobile-nav-item ${screen === n.key ? 'active' : ''}`}
            onClick={() => setScreen(n.key)}
          >
            <span className="nav-ico">{n.icon}</span>
            <span className="nav-lbl">{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // ── PWA full-screen mode (no desktop chrome) ──────────────────
  if (isPWA) {
    return (
      <div className="mobile-pwa-root">
        {phoneShell}
      </div>
    );
  }

  // ── Desktop embedded mode ─────────────────────────────────────
  return (
    <div className="wms-module" style={{ background: 'transparent', padding: 0 }}>
      <div className="mobile-wrapper">

        <div className="mobile-topbar">
          <span className="mobile-topbar-title">📱 Mobile Worker Interface</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!installed && installPrompt && (
              <button className="pwa-install-btn" onClick={handleInstall}>
                ⬇ ติดตั้ง App
              </button>
            )}
            {installed && (
              <span className="pwa-installed-badge">✅ ติดตั้งแล้ว</span>
            )}
            {currentUser && (
              <span className="mobile-topbar-user">{currentUser.name}</span>
            )}
          </div>
        </div>

        {phoneShell}

        <div className="mobile-outer-label">PWA Ready · Samila WMS 3PL</div>
      </div>
    </div>
  );
}
