import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SUB_UNIT_GROUPS, MAIN_UNIT_GROUPS } from '../../constants/units';
import { ZONES, ZONE_OPTIONS, locationToZone } from '../../constants/zones';
import * as XLSX from 'xlsx';
import './InventoryModule.css';

function InventoryModule() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('list');
  const [inventory, setInventory] = useState([
    { id: 1, entryNumber: 'EN-2026-0001', sku: 'SKU001', product: 'Product 1', customer: 'Customer A', warehouse: 'Warehouse A', location: 'A-01-1-A', quantity: 500, available: 400, minStock: 100, mainUnit: 'PCS', subUnit: 'BOX', batNumber: 'BAT-001', lotNumber: 'LOT-001', manufactureDate: '2025-01-15', expiryDate: '2027-01-15', status: 'GOOD' }
  ]);
  const [zoneFilter, setZoneFilter] = useState('');
  const [importStatus, setImportStatus] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const fileRef = useRef();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportStatus('preview');
    setImportPreview([
      { sku: 'SKU002', product: 'Product 2', customer: 'Customer A', warehouse: 'Warehouse A', location: 'A-02-1-A', quantity: 300, available: 250, minStock: 50,  mainUnit: 'PCS', subUnit: 'BOX',    batNumber: 'BAT-002', lotNumber: 'LOT-002', manufactureDate: '2025-02-01', expiryDate: '2027-02-01', status: 'GOOD' },
      { sku: 'SKU003', product: 'Product 3', customer: 'Customer B', warehouse: 'Warehouse B', location: 'B-01-1-A', quantity: 150, available: 150, minStock: 80,  mainUnit: 'KG',  subUnit: 'BAG',    batNumber: 'BAT-003', lotNumber: 'LOT-003', manufactureDate: '2025-03-01', expiryDate: '2027-03-01', status: 'GOOD' },
      { sku: 'SKU004', product: 'Product 4', customer: 'Customer B', warehouse: 'Warehouse A', location: 'A-03-2-B', quantity: 80,  available: 60,  minStock: 100, mainUnit: 'BTL', subUnit: 'CARTON', batNumber: 'BAT-004', lotNumber: 'LOT-004', manufactureDate: '2025-04-01', expiryDate: '2026-04-01', status: 'LOW'  },
    ]);
    setImportResult({ filename: file.name, size: (file.size / 1024).toFixed(1) });
  };

  const handleImportConfirm = async () => {
    setImportStatus('loading');
    setTimeout(() => {
      const newRows = importPreview.map((row, i) => ({ ...row, id: inventory.length + i + 1 }));
      setInventory(prev => [...prev, ...newRows]);
      setImportStatus('success');
      setImportResult(prev => ({ ...prev, count: newRows.length }));
      setImportPreview([]);
    }, 1200);
  };

  const handleImportReset = () => {
    setImportStatus(null);
    setImportResult(null);
    setImportPreview([]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDownloadTemplate = () => {
    const headers = ['SKU','Product Name','Customer','Warehouse','Location','Quantity','Available','Min. Stock','Main Unit','Sub Unit','BAT No.','Lot No.','MFG Date (YYYY-MM-DD)','Expiry Date (YYYY-MM-DD)','Status'];
    const example = ['SKU001','Product 1','Customer A','Warehouse A','A-01-1-A','500','400','100','PCS','BOX','BAT-001','LOT-001','2025-01-15','2027-01-15','GOOD'];
    const ws = XLSX.utils.aoa_to_sheet([headers, example]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory Template');
    XLSX.writeFile(wb, 'template_inventory.xlsx');
  };


  return (
    <div className="wms-module inventory-module">
      <div className="module-header">
        <div className="header-left">
          <h1>{t('inventory.title')}</h1>
        </div>
        <div className="header-right">
          <button onClick={toggleLanguage} className="lang-btn">
            {i18n.language === 'en' ? '🇹🇭 ไทย' : '🇬🇧 English'}
          </button>
        </div>
      </div>

      <div className="module-tabs">
        <button className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
          📋 {t('inventory.list')}
        </button>
        <button className={`tab-btn ${activeTab === 'import' ? 'active' : ''}`} onClick={() => setActiveTab('import')}>
          📥 {t('inventory.importExcel')}
        </button>
        <button className={`tab-btn ${activeTab === 'adjust' ? 'active' : ''}`} onClick={() => setActiveTab('adjust')}>
          🔧 {t('inventory.adjust')}
        </button>
        <button className={`tab-btn ${activeTab === 'count' ? 'active' : ''}`} onClick={() => setActiveTab('count')}>
          📱 {t('inventory.stockCount')}
        </button>
        <button className={`tab-btn ${activeTab === 'movement' ? 'active' : ''}`} onClick={() => setActiveTab('movement')}>
          📈 {t('inventory.movement')}
        </button>
      </div>

      <div className="module-content">

        {/* ===== LIST ===== */}
        {activeTab === 'list' && (
          <div className="inventory-list">
            <div className="controls">
              <select value={zoneFilter} onChange={e => setZoneFilter(e.target.value)} style={{ padding:'7px 10px', background:'rgba(0,20,40,0.8)', border:'1px solid rgba(0,229,255,0.3)', borderRadius:6, color:'#00E5FF', fontSize:12, fontWeight:600 }}>
                {ZONE_OPTIONS.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
              </select>
              <input type="search" placeholder={t('inventory.sku')} />
              <input type="search" placeholder={t('inventory.product')} />
              <input type="search" placeholder="Customer" />
              <button className="import-btn" onClick={() => setActiveTab('import')}>📥 {t('inventory.importExcel')}</button>
              <button className="export-btn">📤 {t('buttons.export')}</button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Entry No.</th>
                  <th>{t('inventory.sku')}</th>
                  <th>{t('inventory.product')}</th>
                  <th>Customer</th>
                  <th>{t('inventory.warehouse')}</th>
                  <th>Zone</th>
                  <th>{t('inventory.location')}</th>
                  <th>{t('inventory.quantity')}</th>
                  <th>Main Unit</th>
                  <th>Sub Unit</th>
                  <th>{t('inventory.available')}</th>
                  <th>Min. Stock</th>
                  <th>BAT No.</th>
                  <th>Lot No.</th>
                  <th>MFG Date</th>
                  <th>Expiry Date</th>
                  <th>{t('inventory.status')}</th>
                </tr>
              </thead>
              <tbody>
                {(zoneFilter ? inventory.filter(i => locationToZone(i.location) === zoneFilter) : inventory).map(item => {
                  const zId = locationToZone(item.location);
                  const z   = ZONES.find(z => z.id === zId);
                  return (
                  <tr key={item.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#FFD700', fontWeight: 700 }}>{item.entryNumber || '-'}</td>
                    <td>{item.sku}</td>
                    <td>{item.product}</td>
                    <td style={{ color: '#a0c8dc', fontWeight: 600 }}>{item.customer || '-'}</td>
                    <td>{item.warehouse}</td>
                    <td>{z ? <span style={{ background: `${z.color}18`, color: z.color, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{z.label}</span> : '-'}</td>
                    <td>{item.location}</td>
                    <td>{item.quantity}</td>
                    <td><span style={{ background: 'rgba(0,188,212,0.1)', color: '#00E5FF', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{item.mainUnit || '-'}</span></td>
                    <td><span style={{ background: 'rgba(0,204,136,0.1)', color: '#00CC88', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{item.subUnit || '-'}</span></td>
                    <td>{item.available}</td>
                    <td style={{ color: item.available <= item.minStock ? '#FF6B6B' : '#cce4ef', fontWeight: item.available <= item.minStock ? 700 : 400 }}>{item.minStock ?? '-'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#00E5FF' }}>{item.batNumber || '-'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#00CC88' }}>{item.lotNumber || '-'}</td>
                    <td style={{ fontSize: 12 }}>{item.manufactureDate || '-'}</td>
                    <td style={{ fontSize: 12, color: item.expiryDate ? '#FFD700' : undefined }}>{item.expiryDate || '-'}</td>
                    <td><span className={`status ${item.status}`}>{item.status}</span></td>
                  </tr>
                  );
                })}
                {inventory.length === 0 && (
                  <tr><td colSpan={16} style={{ textAlign: 'center', padding: 28, color: '#3a6a82', fontSize: 13 }}>{t('inventory.noItems')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== IMPORT EXCEL ===== */}
        {activeTab === 'import' && (
          <div className="import-panel">
            <div className="import-steps">
              <div className={`step ${importStatus ? 'done' : 'active'}`}>
                <span className="step-num">1</span>
                <span className="step-label">{t('inventory.stepSelect')}</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${importStatus === 'preview' || importStatus === 'loading' || importStatus === 'success' ? (importStatus === 'success' ? 'done' : 'active') : ''}`}>
                <span className="step-num">2</span>
                <span className="step-label">{t('inventory.stepVerify')}</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${importStatus === 'success' ? 'done' : ''}`}>
                <span className="step-num">3</span>
                <span className="step-label">{t('inventory.stepDone')}</span>
              </div>
            </div>

            {!importStatus && (
              <div className="import-zone">
                <div className="import-zone-inner" onClick={() => fileRef.current.click()}>
                  <div className="import-icon">📊</div>
                  <div className="import-zone-title">{t('inventory.selectFile')}</div>
                  <div className="import-zone-sub">{t('inventory.fileFormats')}</div>
                  <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} hidden />
                </div>
                <div className="import-template">
                  <span>{t('inventory.noTemplate')}</span>
                  <button className="template-btn" onClick={handleDownloadTemplate}>
                    ⬇️ {t('inventory.downloadTemplate')}
                  </button>
                </div>
                <div className="import-format">
                  <div className="format-title">{t('inventory.fileFormatTitle')}</div>
                  <table className="format-table">
                    <thead>
                      <tr><th>Column</th><th>Header</th><th>Example</th><th>{t('common.required')}</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>A</td><td>SKU</td><td>SKU001</td><td className="req">✓</td></tr>
                      <tr><td>B</td><td>Product Name</td><td>Product 1</td><td className="req">✓</td></tr>
                      <tr><td>C</td><td>Customer</td><td>Customer A</td><td className="req">✓</td></tr>
                      <tr><td>D</td><td>Warehouse</td><td>Warehouse A</td><td className="req">✓</td></tr>
                      <tr><td>E</td><td>Location</td><td>A-01-1-A</td><td className="req">✓</td></tr>
                      <tr><td>F</td><td>Quantity</td><td>500</td><td className="req">✓</td></tr>
                      <tr><td>G</td><td>Available</td><td>400</td><td></td></tr>
                      <tr><td>H</td><td>Min. Stock</td><td>100</td><td></td></tr>
                      <tr><td>I</td><td>Main Unit</td><td>PCS</td><td></td></tr>
                      <tr><td>J</td><td>Sub Unit</td><td>BOX</td><td></td></tr>
                      <tr><td>K</td><td>BAT No.</td><td>BAT-001</td><td></td></tr>
                      <tr><td>L</td><td>Lot No.</td><td>LOT-001</td><td></td></tr>
                      <tr><td>M</td><td>MFG Date</td><td>2025-01-15</td><td></td></tr>
                      <tr><td>N</td><td>Expiry Date</td><td>2027-01-15</td><td></td></tr>
                      <tr><td>O</td><td>Status</td><td>GOOD</td><td></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {importStatus === 'preview' && (
              <div className="import-preview">
                <div className="preview-header">
                  <div className="preview-file-info">
                    <span className="file-icon">📄</span>
                    <div>
                      <div className="file-name">{importResult?.filename}</div>
                      <div className="file-size">{importResult?.size} KB &nbsp;|&nbsp; {importPreview.length} {t('inventory.rowsReady')}</div>
                    </div>
                  </div>
                  <div className="preview-actions">
                    <button className="cancel-import-btn" onClick={handleImportReset}>✕ {t('inventory.cancelImport')}</button>
                    <button className="confirm-import-btn" onClick={handleImportConfirm}>✓ {t('inventory.confirmImport')} {importPreview.length} {t('receiving.items')}</button>
                  </div>
                </div>
                <div className="preview-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Entry No.</th>
                        <th>{t('inventory.sku')}</th><th>{t('inventory.product')}</th><th>Customer</th><th>{t('inventory.warehouse')}</th>
                        <th>{t('inventory.location')}</th><th>{t('inventory.quantity')}</th><th>{t('inventory.available')}</th><th>Min. Stock</th>
                        <th>Main Unit</th><th>Sub Unit</th><th>BAT No.</th><th>Lot No.</th><th>MFG Date</th><th>Expiry Date</th>
                        <th>{t('inventory.status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((row, i) => (
                        <tr key={i}>
                          <td className="row-num">{i + 1}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#FFD700', fontWeight: 700 }}>{row.entryNumber || '-'}</td>
                          <td>{row.sku}</td><td>{row.product}</td><td>{row.customer || '-'}</td><td>{row.warehouse}</td>
                          <td>{row.location}</td><td>{row.quantity}</td><td>{row.available}</td>
                          <td>{row.minStock ?? '-'}</td>
                          <td>{row.mainUnit || '-'}</td><td>{row.subUnit || '-'}</td>
                          <td>{row.batNumber || '-'}</td><td>{row.lotNumber || '-'}</td>
                          <td>{row.manufactureDate || '-'}</td><td>{row.expiryDate || '-'}</td>
                          <td><span className={`status ${row.status}`}>{row.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {importStatus === 'loading' && (
              <div className="import-loading">
                <div className="loading-spinner"></div>
                <div className="loading-text">{t('inventory.importing')}</div>
              </div>
            )}

            {importStatus === 'success' && (
              <div className="import-success">
                <div className="success-icon">✓</div>
                <div className="success-title">{t('inventory.importSuccess')}</div>
                <div className="success-desc">{t('messages.imported')} <strong>{importResult?.count}</strong> {t('inventory.importSuccessDesc')}</div>
                <div className="success-actions">
                  <button className="view-btn" onClick={() => { handleImportReset(); setActiveTab('list'); }}>📋 {t('inventory.viewList')}</button>
                  <button className="again-btn" onClick={handleImportReset}>📥 {t('inventory.importMore')}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== ADJUST ===== */}
        {activeTab === 'adjust' && (
          <div className="inventory-adjust">
            <div className="form-container">
              <h2>{t('inventory.adjust')}</h2>
              <div className="form-group">
                <label>{t('inventory.sku')}</label>
                <input type="text" placeholder="SKU001" />
              </div>
              <div className="form-group">
                <label>{t('inventory.quantity')}</label>
                <input type="number" placeholder="0" />
              </div>
              <div className="form-group">
                <label>Main Unit (หน่วยหลัก)</label>
                <select style={{ padding: '9px 12px', background: 'rgba(0,20,40,0.8)', border: '1px solid rgba(0,188,212,0.4)', borderRadius: 6, fontSize: 13, color: '#ffffff', fontFamily: 'inherit', fontWeight: 600 }}>
                  <option value="">-- เลือกหน่วยหลัก --</option>
                  {MAIN_UNIT_GROUPS.map(g => (
                    <optgroup key={g.group} label={g.group}>
                      {g.units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Sub Unit (หน่วยรอง)</label>
                <select style={{ padding: '9px 12px', background: 'rgba(0,20,40,0.8)', border: '1px solid rgba(0,188,212,0.4)', borderRadius: 6, fontSize: 13, color: '#ffffff', fontFamily: 'inherit', fontWeight: 600 }}>
                  <option value="">-- เลือกหน่วยรอง --</option>
                  {SUB_UNIT_GROUPS.map(g => (
                    <optgroup key={g.group} label={g.group}>
                      {g.units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>{t('inventory.reason')}</label>
                <select>
                  <option>Damage</option>
                  <option>Expired</option>
                  <option>Correction</option>
                </select>
              </div>
              <button className="save-btn">{t('buttons.save')}</button>
            </div>
          </div>
        )}

        {/* ===== STOCK COUNT ===== */}
        {activeTab === 'count' && (
          <div className="inventory-count">
            <div className="count-container">
              <h2>📱 {t('inventory.stockCount')}</h2>
              <input type="text" placeholder={t('inventory.sku')} className="scan-input" />
              <input type="number" placeholder={t('inventory.quantity')} className="quantity-input" />
              <button className="scan-btn">📱 {t('buttons.scan')}</button>
            </div>
          </div>
        )}

        {/* ===== MOVEMENT ===== */}
        {activeTab === 'movement' && (
          <div className="inventory-movement">
            <h2>{t('inventory.movement')}</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('receiving.date')}</th><th>Type</th>
                  <th>{t('inventory.location')}</th>
                  <th>{t('inventory.quantity')}</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2026-03-03</td><td>RECEIVING</td>
                  <td>A-01-1-A</td><td>+500</td><td>GR-2026-0001</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default InventoryModule;
