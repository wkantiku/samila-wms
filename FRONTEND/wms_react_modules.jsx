// src/pages/Receiving/ReceivingModule.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ReceivingModule.css';

function ReceivingModule() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('list');
  const [receivingOrders, setReceivingOrders] = useState([
    {
      id: 1,
      grNumber: 'GR-2026-0001',
      poNumber: 'PO-2026-0001',
      supplier: 'Supplier A',
      date: '2026-03-03',
      receiver: 'Somchai',
      items: 50,
      pallets: 10,
      status: 'RECEIVING'
    }
  ]);

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
      const response = await fetch('/api/v1/wms/import/receiving', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      alert(`${t('messages.imported')}: ${result.imported_count} ${t('receiving.items')}`);
    } catch (error) {
      console.error('Import error:', error);
      alert(t('messages.error'));
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/v1/wms/export/receiving?warehouse_id=1&start_date=2026-03-01&end_date=2026-03-31');
      const result = await response.json();
      window.location.href = result.file_url;
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <div className="wms-module receiving-module">
      {/* Header */}
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

      {/* Tabs */}
      <div className="module-tabs">
        <button
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📋 {t('receiving.title')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'scan' ? 'active' : ''}`}
          onClick={() => setActiveTab('scan')}
        >
          📱 {t('receiving.scanItem')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'qc' ? 'active' : ''}`}
          onClick={() => setActiveTab('qc')}
        >
          ✓ {t('receiving.qc')}
        </button>
      </div>

      {/* Content */}
      <div className="module-content">
        {activeTab === 'list' && (
          <div className="receiving-list">
            <div className="controls">
              <label className="import-btn">
                📥 {t('receiving.importExcel')}
                <input type="file" accept=".xlsx,.xls" onChange={handleImport} hidden />
              </label>
              <button onClick={handleExport} className="export-btn">
                📤 {t('receiving.exportPDF')}
              </button>
              <button className="create-btn">
                ➕ {t('buttons.create')}
              </button>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('receiving.grNumber')}</th>
                  <th>{t('receiving.poNumber')}</th>
                  <th>{t('receiving.supplier')}</th>
                  <th>{t('receiving.date')}</th>
                  <th>{t('receiving.receiver')}</th>
                  <th>{t('receiving.items')}</th>
                  <th>{t('receiving.status')}</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {receivingOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.grNumber}</td>
                    <td>{order.poNumber}</td>
                    <td>{order.supplier}</td>
                    <td>{order.date}</td>
                    <td>{order.receiver}</td>
                    <td>{order.items}</td>
                    <td><span className={`status ${order.status}`}>{order.status}</span></td>
                    <td>
                      <button className="action-btn view">👁️</button>
                      <button className="action-btn edit">✏️</button>
                      <button className="action-btn delete">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'scan' && (
          <div className="receiving-scan">
            <div className="scan-container">
              <h2>📱 {t('receiving.scanItem')}</h2>
              <div className="scan-input">
                <input 
                  type="text" 
                  placeholder={t('receiving.scanItem')}
                  className="barcode-input"
                  autoFocus
                />
              </div>
              <div className="scanned-items">
                <h3>{t('receiving.items')}</h3>
                <table className="scan-table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>{t('receiving.quantity')}</th>
                      <th>{t('receiving.location')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>SKU001</td>
                      <td>100</td>
                      <td>A-01-1-A</td>
                    </tr>
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
                <label>QC Status</label>
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
    </div>
  );
}

export default ReceivingModule;

// ============================================
// src/pages/Inventory/InventoryModule.jsx
// ============================================

function InventoryModule() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('list');
  const [inventory, setInventory] = useState([
    {
      id: 1,
      sku: 'SKU001',
      product: 'Product 1',
      warehouse: 'Warehouse A',
      location: 'A-01-1-A',
      quantity: 500,
      available: 400,
      reserved: 100,
      status: 'GOOD'
    }
  ]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="wms-module inventory-module">
      <div className="module-header">
        <h1>{t('inventory.title')}</h1>
        <button onClick={toggleLanguage} className="lang-btn">
          {i18n.language === 'en' ? '🇹🇭 ไทย' : '🇬🇧 English'}
        </button>
      </div>

      <div className="module-tabs">
        <button
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📋 {t('inventory.list')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'adjust' ? 'active' : ''}`}
          onClick={() => setActiveTab('adjust')}
        >
          🔧 {t('inventory.adjust')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'count' ? 'active' : ''}`}
          onClick={() => setActiveTab('count')}
        >
          📱 {t('inventory.stockCount')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'movement' ? 'active' : ''}`}
          onClick={() => setActiveTab('movement')}
        >
          📈 {t('inventory.movement')}
        </button>
      </div>

      <div className="module-content">
        {activeTab === 'list' && (
          <div className="inventory-list">
            <div className="controls">
              <input type="search" placeholder={t('inventory.sku')} />
              <input type="search" placeholder={t('inventory.product')} />
              <button className="export-btn">📤 {t('buttons.export')}</button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('inventory.sku')}</th>
                  <th>{t('inventory.product')}</th>
                  <th>{t('inventory.warehouse')}</th>
                  <th>{t('inventory.location')}</th>
                  <th>{t('inventory.quantity')}</th>
                  <th>{t('inventory.available')}</th>
                  <th>{t('inventory.reserved')}</th>
                  <th>{t('inventory.status')}</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item.id}>
                    <td>{item.sku}</td>
                    <td>{item.product}</td>
                    <td>{item.warehouse}</td>
                    <td>{item.location}</td>
                    <td>{item.quantity}</td>
                    <td>{item.available}</td>
                    <td>{item.reserved}</td>
                    <td><span className="status">{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
                <label>Reason</label>
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

        {activeTab === 'movement' && (
          <div className="inventory-movement">
            <h2>{t('inventory.movement')}</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>{t('inventory.location')}</th>
                  <th>{t('inventory.quantity')}</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2026-03-03</td>
                  <td>RECEIVING</td>
                  <td>A-01-1-A</td>
                  <td>+500</td>
                  <td>GR-2026-0001</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// src/pages/Product/ProductModule.jsx
// ============================================

function ProductModule() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('list');

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="wms-module product-module">
      <div className="module-header">
        <h1>{t('product.title')}</h1>
        <button onClick={toggleLanguage} className="lang-btn">
          {i18n.language === 'en' ? '🇹🇭 ไทย' : '🇬🇧 English'}
        </button>
      </div>

      <div className="module-tabs">
        <button
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📋 {t('product.list')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          ➕ {t('product.create')}
        </button>
      </div>

      <div className="module-content">
        {activeTab === 'list' && (
          <div className="product-list">
            <div className="controls">
              <label className="import-btn">
                📥 {t('product.import')}
                <input type="file" accept=".xlsx" hidden />
              </label>
              <button className="export-btn">📤 {t('product.export')}</button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('product.sku')}</th>
                  <th>{t('product.barcode')}</th>
                  <th>{t('product.name')}</th>
                  <th>{t('product.category')}</th>
                  <th>{t('product.unit')}</th>
                  <th>{t('product.price')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>SKU001</td>
                  <td>BC001</td>
                  <td>Product 1</td>
                  <td>Electronics</td>
                  <td>PCS</td>
                  <td>฿1,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="product-create">
            <form className="form-container">
              <div className="form-group">
                <label>{t('product.sku')}</label>
                <input type="text" required />
              </div>
              <div className="form-group">
                <label>{t('product.barcode')}</label>
                <input type="text" />
              </div>
              <div className="form-group">
                <label>{t('product.name')}</label>
                <input type="text" required />
              </div>
              <div className="form-group">
                <label>{t('product.category')}</label>
                <select>
                  <option>Electronics</option>
                  <option>Clothing</option>
                  <option>Food</option>
                </select>
              </div>
              <button type="submit" className="save-btn">{t('buttons.save')}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// src/pages/Picking/PickingModule.jsx
// ============================================

function PickingModule() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="wms-module picking-module">
      <div className="module-header">
        <h1>{t('picking.title')}</h1>
        <button onClick={toggleLanguage} className="lang-btn">
          {i18n.language === 'en' ? '🇹🇭 ไทย' : '🇬🇧 English'}
        </button>
      </div>

      <div className="module-content">
        <div className="picking-container">
          <h2>{t('picking.pickList')}</h2>
          <div className="picking-form">
            <div className="form-group">
              <label>{t('picking.pickList')}</label>
              <input type="text" placeholder="PICK-2026-0001" />
            </div>
            <div className="picking-items">
              <h3>{t('picking.items')}</h3>
              <table className="scan-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>{t('picking.location')}</th>
                    <th>{t('picking.toPick')}</th>
                    <th>{t('picking.picked')}</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>SKU001</td>
                    <td>A-01-1-A</td>
                    <td>100</td>
                    <td>50</td>
                    <td>
                      <input type="number" placeholder="0" />
                      <button className="scan-btn">📱</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button className="complete-btn">{t('buttons.complete')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// src/pages/Shipping/ShippingModule.jsx
// ============================================

function ShippingModule() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="wms-module shipping-module">
      <div className="module-header">
        <h1>{t('shipping.title')}</h1>
        <button onClick={toggleLanguage} className="lang-btn">
          {i18n.language === 'en' ? '🇹🇭 ไทย' : '🇬🇧 English'}
        </button>
      </div>

      <div className="module-content">
        <div className="shipping-container">
          <form className="shipping-form">
            <div className="form-group">
              <label>{t('shipping.soNumber')}</label>
              <input type="text" placeholder="SO-2026-0001" />
            </div>
            <div className="form-group">
              <label>{t('shipping.carrier')}</label>
              <input type="text" placeholder="Kerry Express" />
            </div>
            <div className="form-group">
              <label>{t('shipping.tracking')}</label>
              <input type="text" placeholder="TRACK123456" />
            </div>
            <div className="form-group">
              <label>{t('shipping.weight')}</label>
              <input type="number" placeholder="0 kg" />
            </div>
            <div className="form-group">
              <label>{t('shipping.delivery')}</label>
              <textarea placeholder="Delivery address"></textarea>
            </div>
            <button type="submit" className="ship-btn">📤 {t('shipping.ship')}</button>
          </form>

          <div className="shipping-items">
            <h3>{t('shipping.shipment')}</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Box</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>SKU001</td>
                  <td>100</td>
                  <td>BOX001</td>
                  <td><button className="scan-btn">📱</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ReceivingModule, InventoryModule, ProductModule, PickingModule, ShippingModule };
