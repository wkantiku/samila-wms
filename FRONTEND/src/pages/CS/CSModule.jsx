import { useState, useMemo, useEffect } from 'react';
import { csService } from '../../services/csService';
import './CSModule.css';

const CS_CATEGORIES   = ['Complaint', 'Inquiry', 'Return Request', 'Damage Report', 'Delivery Issue', 'Other'];
const CS_PRIORITIES   = ['Low', 'Medium', 'High', 'Urgent'];
const CS_STATUSES     = ['Open', 'In Progress', 'Resolved', 'Closed'];
const COMPLAINT_TYPES = ['สินค้าเสียหาย', 'สินค้าไม่ครบ', 'สินค้าผิดรายการ', 'ส่งสินค้าช้า', 'บรรจุภัณฑ์ชำรุด', 'สินค้าหมดอายุ', 'อื่นๆ'];
const CUSTOMERS       = ['Customer A', 'Customer B', 'Customer C', 'Customer D'];

const PRIORITY_COLOR = {
  Low:    { bg: 'rgba(90,143,168,0.15)',  color: '#5a8fa8' },
  Medium: { bg: 'rgba(0,229,255,0.12)',   color: '#00E5FF' },
  High:   { bg: 'rgba(255,215,0,0.12)',   color: '#FFD700' },
  Urgent: { bg: 'rgba(255,107,107,0.15)', color: '#FF6B6B' },
};
const STATUS_COLOR = {
  Open:          { bg: 'rgba(255,107,107,0.12)', color: '#FF6B6B' },
  'In Progress': { bg: 'rgba(255,215,0,0.12)',   color: '#FFD700' },
  Resolved:      { bg: 'rgba(0,204,136,0.15)',   color: '#00CC88' },
  Closed:        { bg: 'rgba(90,143,168,0.12)',  color: '#5a8fa8' },
};
const CAT_COLOR = {
  Complaint:       'rgba(255,107,107,0.18)',
  Inquiry:         'rgba(0,229,255,0.10)',
  'Return Request':'rgba(255,215,0,0.12)',
  'Damage Report': 'rgba(255,140,0,0.14)',
  'Delivery Issue':'rgba(180,100,255,0.14)',
  Other:           'rgba(90,143,168,0.12)',
};
const CAT_TEXT = {
  Complaint: '#FF6B6B', Inquiry: '#00E5FF', 'Return Request': '#FFD700',
  'Damage Report': '#FFA040', 'Delivery Issue': '#C080FF', Other: '#5a8fa8',
};

const genCSNo = () => {
  const d = new Date();
  return `CS-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${String(Math.floor(Math.random()*9000)+1000)}`;
};
const today = () => new Date().toISOString().slice(0, 10);
const nowStr = () => new Date().toLocaleString('th-TH', { dateStyle:'short', timeStyle:'short' });

const emptyForm = () => ({
  csNo: genCSNo(), date: today(), customer: '', orderRef: '',
  category: 'Complaint', complaintType: 'สินค้าเสียหาย',
  priority: 'High', subject: '', detail: '',
  assignTo: '', status: 'Open',
  dueDate: '', resolvedDate: '',
  rootCause: '', correctiveAction: '', preventiveAction: '', compensation: '',
  notes: [],
});

const initCS = [
  {
    id: 1, csNo: 'CS-20260311-0012', date: '2026-03-11', customer: 'Customer A',
    orderRef: 'ORD-20260310-1234', category: 'Complaint', complaintType: 'สินค้าเสียหาย',
    priority: 'High', subject: 'สินค้าเสียหายระหว่างขนส่ง', detail: 'กล่องสินค้าถูกบุบและสินค้าแตก 3 ชิ้น',
    assignTo: 'สมชาย', status: 'In Progress',
    dueDate: '2026-03-14', resolvedDate: '',
    rootCause: 'บรรจุภัณฑ์ไม่แข็งแรงพอ',
    correctiveAction: 'เปลี่ยนสินค้าใหม่ให้ลูกค้า', preventiveAction: 'ปรับปรุงวิธีบรรจุภัณฑ์',
    compensation: 'เปลี่ยนสินค้าใหม่ 3 ชิ้น',
    notes: [
      { id: 1, author: 'สมชาย', date: '2026-03-11 10:30', text: 'รับเรื่องแล้ว กำลังตรวจสอบสินค้า', type: 'update' },
      { id: 2, author: 'สมชาย', date: '2026-03-12 09:00', text: 'ยืนยันสินค้าเสียหาย 3 ชิ้น จะจัดส่งสินค้าใหม่ภายใน 2 วัน', type: 'action' },
    ],
  },
  {
    id: 2, csNo: 'CS-20260310-0008', date: '2026-03-10', customer: 'Customer B',
    orderRef: 'ORD-20260309-5678', category: 'Return Request', complaintType: '',
    priority: 'Medium', subject: 'ขอคืนสินค้า LOT-003', detail: 'สินค้าหมดอายุก่อนกำหนด',
    assignTo: 'สุภาพร', status: 'Open',
    dueDate: '2026-03-15', resolvedDate: '',
    rootCause: '', correctiveAction: '', preventiveAction: '', compensation: '',
    notes: [],
  },
  {
    id: 3, csNo: 'CS-20260309-0021', date: '2026-03-09', customer: 'Customer C',
    orderRef: '', category: 'Inquiry', complaintType: '',
    priority: 'Low', subject: 'สอบถามสต็อกสินค้า SKU005', detail: 'ต้องการทราบยอดคงเหลือ',
    assignTo: 'วิชัย', status: 'Resolved',
    dueDate: '', resolvedDate: '2026-03-10',
    rootCause: '', correctiveAction: 'แจ้งยอดสต็อกให้ลูกค้าทราบแล้ว', preventiveAction: '', compensation: '',
    notes: [{ id: 1, author: 'วิชัย', date: '2026-03-09 14:00', text: 'แจ้งยอดคงเหลือ SKU005 = 180 ชิ้น', type: 'resolved' }],
  },
  {
    id: 4, csNo: 'CS-20260308-0005', date: '2026-03-08', customer: 'Customer D',
    orderRef: 'ORD-20260307-9999', category: 'Delivery Issue', complaintType: '',
    priority: 'Urgent', subject: 'ส่งสินค้าผิด Location', detail: 'สินค้าถูกส่งไปผิดที่ ควรเป็น B-02 แต่ส่งไป A-03',
    assignTo: 'นภา', status: 'Closed',
    dueDate: '2026-03-09', resolvedDate: '2026-03-09',
    rootCause: 'พนักงานอ่าน label ผิด',
    correctiveAction: 'ย้ายสินค้าไปยัง Location ที่ถูกต้องแล้ว',
    preventiveAction: 'อบรมพนักงาน + ติด QR Code Location',
    compensation: '',
    notes: [
      { id: 1, author: 'นภา', date: '2026-03-08 16:00', text: 'รับเรื่องด่วน กำลังตรวจสอบ', type: 'update' },
      { id: 2, author: 'นภา', date: '2026-03-09 08:30', text: 'ย้ายสินค้าไป B-02 เรียบร้อยแล้ว ปิดเคส', type: 'resolved' },
    ],
  },
];

export default function CSModule({ cases, setCases }) {
  useEffect(() => {
    csService.getAll().then(data => {
      if (Array.isArray(data) && data.length > 0) setCases(data);
    }).catch(() => {});
  }, []);

  const [activeTab, setActiveTab] = useState('list');
  const [form, setForm]           = useState(emptyForm);
  const [editId, setEditId]       = useState(null);
  const [formError, setFormError] = useState('');
  const [viewCase, setViewCase]   = useState(null);
  const [deleteId, setDeleteId]   = useState(null);
  const [newNote, setNewNote]     = useState('');
  const [noteAuthor, setNoteAuthor] = useState('');

  // Filters
  const [fStatus,   setFStatus]   = useState('');
  const [fCategory, setFCategory] = useState('');
  const [fPriority, setFPriority] = useState('');
  const [fCustomer, setFCustomer] = useState('');
  const [fSearch,   setFSearch]   = useState('');

  const isOverdue = (c) => c.dueDate && c.status !== 'Resolved' && c.status !== 'Closed' && c.dueDate < today();

  const filtered = useMemo(() => cases.filter(c =>
    (!fStatus   || c.status   === fStatus) &&
    (!fCategory || c.category === fCategory) &&
    (!fPriority || c.priority === fPriority) &&
    (!fCustomer || c.customer === fCustomer) &&
    (!fSearch   || c.csNo.toLowerCase().includes(fSearch.toLowerCase()) ||
                   c.subject.toLowerCase().includes(fSearch.toLowerCase()) ||
                   (c.orderRef||'').toLowerCase().includes(fSearch.toLowerCase()) ||
                   c.customer.toLowerCase().includes(fSearch.toLowerCase()))
  ), [cases, fStatus, fCategory, fPriority, fCustomer, fSearch]);

  const openCreate = () => { setForm(emptyForm()); setEditId(null); setFormError(''); setActiveTab('create'); };
  const openEdit   = (c) => { setForm({ ...c }); setEditId(c.id); setFormError(''); setActiveTab('create'); };

  const handleSave = () => {
    if (!form.customer)      { setFormError('กรุณาเลือก Customer'); return; }
    if (!form.subject.trim()) { setFormError('กรุณากรอก Subject'); return; }
    setFormError('');
    if (editId) {
      csService.update(editId, form).catch(() => {});
      setCases(prev => prev.map(c => c.id === editId ? { ...c, ...form } : c));
      if (viewCase?.id === editId) setViewCase({ ...viewCase, ...form });
    } else {
      csService.create(form).catch(() => {});
      setCases(prev => [{ ...form, id: Date.now(), notes: [] }, ...prev]);
    }
    setActiveTab('list');
  };

  const updateStatus = (id, status) =>
    setCases(prev => prev.map(c => c.id === id ? { ...c, status } : c));

  const handleDelete = () => {
    csService.delete(deleteId).catch(() => {});
    setCases(prev => prev.filter(c => c.id !== deleteId));
    if (viewCase?.id === deleteId) setViewCase(null);
    setDeleteId(null);
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const note = { id: Date.now(), author: noteAuthor || 'Staff', date: nowStr(), text: newNote.trim(), type: 'update' };
    csService.addNote(viewCase.id, note.text, note.type).catch(() => {});
    setCases(prev => prev.map(c =>
      c.id === viewCase.id ? { ...c, notes: [...(c.notes||[]), note] } : c
    ));
    setViewCase(prev => ({ ...prev, notes: [...(prev.notes||[]), note] }));
    setNewNote('');
  };

  const counts = useMemo(() => ({
    status:   Object.fromEntries(CS_STATUSES.map(s  => [s,  cases.filter(c => c.status   === s ).length])),
    category: Object.fromEntries(CS_CATEGORIES.map(s => [s, cases.filter(c => c.category === s).length])),
    overdue:  cases.filter(isOverdue).length,
  }), [cases]);

  const NOTE_ICON = { update: '💬', action: '🔧', resolved: '✅', default: '📝' };

  /* ══════════════ RENDER ══════════════ */
  return (
    <div className="wms-module cs-module">
      <div className="module-header">
        <div className="header-left">
          <h1>🎧 Customer Service</h1>
          <p>จัดการ Complaint / Inquiry / Return / Damage จากลูกค้า</p>
        </div>
        <div className="header-right">
          <button className="create-btn" onClick={openCreate}>➕ สร้าง CS Case</button>
        </div>
      </div>

      {/* ── Summary bar ── */}
      <div className="cs-summary-bar">
        {CS_STATUSES.map(s => (
          <div key={s} className="cs-stat"
            onClick={() => setFStatus(fStatus === s ? '' : s)}
            style={{ borderColor: STATUS_COLOR[s].color, cursor:'pointer', opacity: fStatus && fStatus !== s ? 0.45 : 1 }}>
            <div className="cs-stat-val" style={{ color: STATUS_COLOR[s].color }}>{counts.status[s]}</div>
            <div className="cs-stat-lbl">{s}</div>
          </div>
        ))}
        {counts.overdue > 0 && (
          <div className="cs-stat" onClick={() => {}}
            style={{ borderColor: '#FF6B6B', background: 'rgba(255,107,107,0.08)', cursor:'default' }}>
            <div className="cs-stat-val" style={{ color: '#FF6B6B' }}>{counts.overdue}</div>
            <div className="cs-stat-lbl">⚠️ Overdue</div>
          </div>
        )}
        <div className="cs-stat" onClick={() => setFStatus('')}
          style={{ borderColor:'#cce4ef', cursor:'pointer', opacity: fStatus ? 0.6 : 1 }}>
          <div className="cs-stat-val" style={{ color:'#cce4ef' }}>{cases.length}</div>
          <div className="cs-stat-lbl">Total</div>
        </div>
      </div>

      {/* ── Category pills ── */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
        {CS_CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFCategory(fCategory === cat ? '' : cat)}
            style={{
              padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer', border:'1px solid',
              borderColor: CAT_TEXT[cat], background: fCategory === cat ? CAT_COLOR[cat] : 'rgba(0,20,40,0.4)',
              color: fCategory === cat ? CAT_TEXT[cat] : '#5a8fa8', transition:'all 0.15s',
            }}>
            {cat} <span style={{ marginLeft:4, opacity:0.8 }}>{counts.category[cat]}</span>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="module-tabs">
        <button className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
          📋 CS List
        </button>
        <button className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={openCreate}>
          ➕ {editId ? 'Edit Case' : 'Create Case'}
        </button>
      </div>

      <div className="module-content">

        {/* ══ LIST ══ */}
        {activeTab === 'list' && (
          <div>
            <div className="controls" style={{ marginBottom:14, flexWrap:'wrap', gap:8 }}>
              <input type="search" placeholder="🔍" value={fSearch}
                onChange={e => setFSearch(e.target.value)}
                style={{ width: fSearch ? '22ch' : 38, padding:'7px 10px', background:'rgba(0,20,40,0.8)', border:'1px solid rgba(0,229,255,0.25)', borderRadius:6, color:'#cce4ef', fontSize:14, transition:'width 0.2s', textAlign: fSearch?'left':'center' }} />
              <select value={fCustomer} onChange={e => setFCustomer(e.target.value)}
                style={{ padding:'7px 10px', background:'rgba(0,20,40,0.8)', border:'1px solid rgba(0,229,255,0.3)', borderRadius:6, color: fCustomer?'#cce4ef':'#5a8fa8', fontSize:12, fontWeight:600 }}>
                <option value="">🏢 Customer (All)</option>
                {[...new Set(cases.map(c => c.customer))].sort().map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={fStatus} onChange={e => setFStatus(e.target.value)}
                style={{ padding:'7px 10px', background:'rgba(0,20,40,0.8)', border:'1px solid rgba(0,229,255,0.3)', borderRadius:6, color: fStatus ? STATUS_COLOR[fStatus]?.color : '#5a8fa8', fontSize:12, fontWeight:600 }}>
                <option value="">● Status (All)</option>
                {CS_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={fPriority} onChange={e => setFPriority(e.target.value)}
                style={{ padding:'7px 10px', background:'rgba(0,20,40,0.8)', border:'1px solid rgba(0,229,255,0.3)', borderRadius:6, color: fPriority ? PRIORITY_COLOR[fPriority]?.color : '#5a8fa8', fontSize:12, fontWeight:600 }}>
                <option value="">🔺 Priority (All)</option>
                {CS_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>CS No.</th><th>วันที่</th><th>Customer</th>
                  <th>Order Ref.</th><th>Category</th><th>Subject</th>
                  <th>Priority</th><th>Due Date</th><th>Assigned To</th>
                  <th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={12} style={{ textAlign:'center', padding:28, color:'#3a6a82', fontSize:13 }}>ไม่พบรายการ</td></tr>
                )}
                {filtered.map((c, i) => {
                  const overdue = isOverdue(c);
                  return (
                    <tr key={c.id} style={{ background: overdue ? 'rgba(255,107,107,0.04)' : undefined }}>
                      <td className="row-num">{i + 1}</td>
                      <td style={{ fontFamily:'monospace', color:'#00E5FF', fontWeight:700, fontSize:12 }}>{c.csNo}</td>
                      <td style={{ fontSize:12, color:'#a0c8dc' }}>{c.date}</td>
                      <td style={{ fontWeight:600, color:'#cce4ef' }}>{c.customer}</td>
                      <td style={{ fontFamily:'monospace', fontSize:11, color:'#5a8fa8' }}>{c.orderRef || '-'}</td>
                      <td>
                        <span style={{ background: CAT_COLOR[c.category], color: CAT_TEXT[c.category], padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:700 }}>
                          {c.category}
                        </span>
                      </td>
                      <td style={{ color:'#cce4ef', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {c.category === 'Complaint' && c.complaintType && (
                          <span style={{ fontSize:10, color:'#FF6B6B', marginRight:4 }}>[{c.complaintType}]</span>
                        )}
                        {c.subject}
                      </td>
                      <td>
                        <span style={{ background: PRIORITY_COLOR[c.priority].bg, color: PRIORITY_COLOR[c.priority].color, padding:'2px 10px', borderRadius:10, fontSize:11, fontWeight:700 }}>
                          {c.priority}
                        </span>
                      </td>
                      <td style={{ fontSize:12, color: overdue ? '#FF6B6B' : '#a0c8dc', fontWeight: overdue ? 700 : 400 }}>
                        {c.dueDate ? (overdue ? `⚠️ ${c.dueDate}` : c.dueDate) : '-'}
                      </td>
                      <td style={{ fontSize:12, color:'#7a9fb5' }}>{c.assignTo || '-'}</td>
                      <td>
                        <select value={c.status} onChange={e => updateStatus(c.id, e.target.value)}
                          style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:6, border:`1px solid ${STATUS_COLOR[c.status].color}`, background: STATUS_COLOR[c.status].bg, color: STATUS_COLOR[c.status].color, cursor:'pointer' }}>
                          {CS_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        <button className="icon-btn" title="ดูรายละเอียด" onClick={() => { setViewCase(c); setNewNote(''); }}>👁️</button>
                        <button className="icon-btn edit" title="แก้ไข" onClick={() => openEdit(c)}>✏️</button>
                        <button className="icon-btn delete" title="ลบ" onClick={() => setDeleteId(c.id)}>🗑️</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ══ CREATE / EDIT ══ */}
        {activeTab === 'create' && (
          <div className="cs-form-panel">
            <div className="cs-form-card">
              <div className="cs-form-title">{editId ? '✏️ แก้ไข CS Case' : '➕ สร้าง CS Case ใหม่'}</div>

              {/* ── Header info ── */}
              <div className="cs-form-grid" style={{ marginBottom:18 }}>
                <div className="form-group">
                  <label>CS No.</label>
                  <input type="text" value={form.csNo} readOnly style={{ background:'rgba(0,229,255,0.05)', color:'#00E5FF', fontFamily:'monospace', fontWeight:700 }} />
                </div>
                <div className="form-group">
                  <label>วันที่รับเรื่อง</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>🏢 Customer *</label>
                  <select value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))}
                    style={{ borderColor: form.customer ? 'rgba(0,229,255,0.4)' : 'rgba(255,107,107,0.5)' }}>
                    <option value="">-- เลือก Customer --</option>
                    {CUSTOMERS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Order Reference</label>
                  <input type="text" placeholder="ORD-20260310-1234" value={form.orderRef}
                    onChange={e => setForm(p => ({ ...p, orderRef: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {CS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                    style={{ color: PRIORITY_COLOR[form.priority]?.color }}>
                    {CS_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Assigned To</label>
                  <input type="text" placeholder="ชื่อผู้รับผิดชอบ" value={form.assignTo}
                    onChange={e => setForm(p => ({ ...p, assignTo: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    style={{ color: STATUS_COLOR[form.status]?.color }}>
                    {CS_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date (กำหนดแก้ไข)</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Resolved Date</label>
                  <input type="date" value={form.resolvedDate} onChange={e => setForm(p => ({ ...p, resolvedDate: e.target.value }))} />
                </div>
              </div>

              {/* ── Complaint section ── */}
              <div style={{ background:'rgba(255,107,107,0.04)', border:'1px solid rgba(255,107,107,0.12)', borderRadius:10, padding:'16px 18px', marginBottom:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#FF8080', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:12 }}>
                  🚨 Complaint Details
                </div>
                <div className="cs-form-grid" style={{ marginBottom:14 }}>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label>ประเภท Complaint</label>
                    <select value={form.complaintType} onChange={e => setForm(p => ({ ...p, complaintType: e.target.value }))}>
                      <option value="">-- เลือกประเภท --</option>
                      {COMPLAINT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label>การชดเชย (Compensation)</label>
                    <input type="text" placeholder="เช่น เปลี่ยนสินค้าใหม่, คืนเงิน" value={form.compensation}
                      onChange={e => setForm(p => ({ ...p, compensation: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom:10 }}>
                  <label>สาเหตุ (Root Cause)</label>
                  <input type="text" placeholder="สาเหตุของปัญหา" value={form.rootCause}
                    onChange={e => setForm(p => ({ ...p, rootCause: e.target.value }))} />
                </div>
                <div className="form-group" style={{ marginBottom:10 }}>
                  <label>การแก้ไข (Corrective Action)</label>
                  <input type="text" placeholder="วิธีแก้ไขปัญหาที่เกิดขึ้น" value={form.correctiveAction}
                    onChange={e => setForm(p => ({ ...p, correctiveAction: e.target.value }))} />
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label>การป้องกัน (Preventive Action)</label>
                  <input type="text" placeholder="วิธีป้องกันไม่ให้เกิดซ้ำ" value={form.preventiveAction}
                    onChange={e => setForm(p => ({ ...p, preventiveAction: e.target.value }))} />
                </div>
              </div>

              {/* ── Subject & Detail ── */}
              <div className="form-group" style={{ marginBottom:12 }}>
                <label>Subject *</label>
                <input type="text" placeholder="หัวข้อปัญหา / คำร้องเรียน" value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label>รายละเอียด</label>
                <textarea rows={4} placeholder="อธิบายปัญหาโดยละเอียด..." value={form.detail}
                  onChange={e => setForm(p => ({ ...p, detail: e.target.value }))}
                  style={{ width:'100%', resize:'vertical', padding:'9px 12px', background:'rgba(0,20,40,0.8)', border:'1px solid rgba(0,188,212,0.3)', borderRadius:6, color:'#cce4ef', fontSize:13, fontFamily:'inherit', boxSizing:'border-box' }} />
              </div>

              <div className="cs-save-bar">
                {formError && <span style={{ color:'#FF6B6B', fontSize:12, flex:1 }}>{formError}</span>}
                <button className="cancel-btn" onClick={() => { setActiveTab('list'); setEditId(null); }}>✕ ยกเลิก</button>
                <button className="save-btn" onClick={handleSave}>
                  {editId ? '💾 บันทึกการแก้ไข' : '➕ สร้าง CS Case'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ VIEW / TIMELINE MODAL ══ */}
      {viewCase && (
        <div className="modal-overlay" onClick={() => setViewCase(null)}>
          <div className="modal-box" style={{ maxWidth:720 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'#cce4ef' }}>
                  🎧 <span style={{ color:'#00E5FF', fontFamily:'monospace' }}>{viewCase.csNo}</span>
                  <span style={{ marginLeft:10, padding:'2px 10px', borderRadius:10, fontSize:11, fontWeight:700, background: CAT_COLOR[viewCase.category], color: CAT_TEXT[viewCase.category] }}>{viewCase.category}</span>
                  {isOverdue(viewCase) && <span style={{ marginLeft:6, fontSize:11, color:'#FF6B6B', fontWeight:700 }}>⚠️ OVERDUE</span>}
                </div>
                <div style={{ fontSize:12, color:'#5a8fa8', marginTop:3 }}>{viewCase.customer} · {viewCase.date}</div>
              </div>
              <button className="modal-close" onClick={() => setViewCase(null)}>✕</button>
            </div>
            <div className="modal-body">

              {/* Info grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                {[
                  ['Priority',    <span style={{ color: PRIORITY_COLOR[viewCase.priority].color, fontWeight:700 }}>{viewCase.priority}</span>],
                  ['Status',      <span style={{ color: STATUS_COLOR[viewCase.status].color, fontWeight:700 }}>{viewCase.status}</span>],
                  ['Assigned To', viewCase.assignTo || '-'],
                  ['Order Ref.',  viewCase.orderRef || '-'],
                  ['Due Date',    viewCase.dueDate ? <span style={{ color: isOverdue(viewCase)?'#FF6B6B':'#FFD700' }}>{viewCase.dueDate}</span> : '-'],
                  ['Resolved',    viewCase.resolvedDate || '-'],
                ].map(([k,v],i) => (
                  <div key={i} style={{ background:'rgba(0,188,212,0.05)', border:'1px solid rgba(0,188,212,0.1)', borderRadius:8, padding:'8px 12px' }}>
                    <div style={{ fontSize:10, color:'#5a8fa8', textTransform:'uppercase', marginBottom:3 }}>{k}</div>
                    <div style={{ fontWeight:600, color:'#cce4ef', fontSize:13 }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Subject & Detail */}
              <div style={{ background:'rgba(0,188,212,0.04)', border:'1px solid rgba(0,188,212,0.1)', borderRadius:8, padding:'12px 14px' }}>
                <div style={{ fontWeight:700, color:'#cce4ef', fontSize:14, marginBottom:6 }}>
                  {viewCase.category === 'Complaint' && viewCase.complaintType && (
                    <span style={{ fontSize:11, color:'#FF6B6B', marginRight:8, padding:'2px 8px', background:'rgba(255,107,107,0.1)', borderRadius:4 }}>{viewCase.complaintType}</span>
                  )}
                  {viewCase.subject}
                </div>
                <div style={{ color:'#a0c8dc', fontSize:13, lineHeight:1.6 }}>{viewCase.detail || '-'}</div>
              </div>

              {/* Complaint CAPA */}
              {(viewCase.rootCause || viewCase.correctiveAction || viewCase.preventiveAction || viewCase.compensation) && (
                <div style={{ background:'rgba(255,107,107,0.04)', border:'1px solid rgba(255,107,107,0.12)', borderRadius:8, padding:'12px 14px' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#FF8080', textTransform:'uppercase', marginBottom:10 }}>🔍 Root Cause & Actions</div>
                  {[
                    ['สาเหตุ (Root Cause)',          viewCase.rootCause],
                    ['การแก้ไข (Corrective)',         viewCase.correctiveAction],
                    ['การป้องกัน (Preventive)',       viewCase.preventiveAction],
                    ['การชดเชย (Compensation)',       viewCase.compensation],
                  ].filter(([,v]) => v).map(([k,v]) => (
                    <div key={k} style={{ marginBottom:8 }}>
                      <span style={{ fontSize:10, color:'#5a8fa8', textTransform:'uppercase' }}>{k}: </span>
                      <span style={{ fontSize:13, color:'#cce4ef' }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Timeline */}
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'#5a8fa8', textTransform:'uppercase', marginBottom:10 }}>
                  💬 Activity Log ({(viewCase.notes||[]).length})
                </div>
                {(viewCase.notes||[]).length === 0 && (
                  <div style={{ color:'#3a6a82', fontSize:12, padding:'10px 0' }}>ยังไม่มี Activity</div>
                )}
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
                  {(viewCase.notes||[]).map(n => (
                    <div key={n.id} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                      <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{NOTE_ICON[n.type]||NOTE_ICON.default}</span>
                      <div style={{ background:'rgba(0,20,40,0.5)', border:'1px solid rgba(0,188,212,0.1)', borderRadius:8, padding:'8px 12px', flex:1 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                          <span style={{ fontWeight:700, color:'#00E5FF', fontSize:12 }}>{n.author}</span>
                          <span style={{ fontSize:11, color:'#3a6a82' }}>{n.date}</span>
                        </div>
                        <div style={{ color:'#a0c8dc', fontSize:13, lineHeight:1.5 }}>{n.text}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add note */}
                <div style={{ background:'rgba(0,20,40,0.4)', border:'1px solid rgba(0,188,212,0.15)', borderRadius:8, padding:'12px 14px' }}>
                  <div style={{ fontSize:11, color:'#5a8fa8', fontWeight:700, marginBottom:8 }}>➕ เพิ่ม Note / การดำเนินการ</div>
                  <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                    <input type="text" placeholder="ชื่อผู้บันทึก" value={noteAuthor}
                      onChange={e => setNoteAuthor(e.target.value)}
                      style={{ width:130, padding:'6px 10px', background:'rgba(0,20,40,0.8)', border:'1px solid rgba(0,229,255,0.2)', borderRadius:6, color:'#cce4ef', fontSize:12 }} />
                    <input type="text" placeholder="บันทึกการดำเนินการ / หมายเหตุ..." value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addNote()}
                      style={{ flex:1, padding:'6px 10px', background:'rgba(0,20,40,0.8)', border:'1px solid rgba(0,229,255,0.2)', borderRadius:6, color:'#cce4ef', fontSize:12 }} />
                    <button onClick={addNote}
                      style={{ padding:'6px 16px', background:'rgba(0,229,255,0.12)', border:'1px solid rgba(0,229,255,0.3)', borderRadius:6, color:'#00E5FF', fontWeight:700, fontSize:12, cursor:'pointer' }}>
                      ✓ บันทึก
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setViewCase(null)}>ปิด</button>
              <button className="save-btn" onClick={() => { setViewCase(null); openEdit(viewCase); }}>✏️ แก้ไข</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DELETE CONFIRM ══ */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-box modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🗑️ ยืนยันการลบ</h2>
              <button className="modal-close" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color:'#b0cdd8', fontSize:14 }}>
                ต้องการลบ Case <strong style={{ color:'#FF6B6B', fontFamily:'monospace' }}>
                  {cases.find(c => c.id === deleteId)?.csNo}
                </strong> ใช่หรือไม่?<br />
                <span style={{ color:'#5a8fa8', fontSize:12 }}>การลบไม่สามารถยกเลิกได้</span>
              </p>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setDeleteId(null)}>ยกเลิก</button>
              <button className="delete-confirm-btn" onClick={handleDelete}>🗑️ ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
