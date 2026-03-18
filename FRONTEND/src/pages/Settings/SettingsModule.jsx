import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './SettingsModule.css';

function SettingsModule() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('notification');
  const [saved, setSaved] = useState(false);

  /* Notification settings */
  const [notif, setNotif] = useState({
    emailLowStock: true,
    emailOrderDelay: true,
    emailDailyReport: false,
    lineNotify: false,
    lineToken: '',
    smsAlert: false,
    smsPhone: '',
    stockThreshold: '50',
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="wms-module settings-module">
      <div className="module-header">
        <div className="header-left">
          <h1>⚙️ {t('settings.title')}</h1>
          <span className="header-sub">System Settings</span>
        </div>
        <div className="header-right">
          {saved && <span className="save-toast">✓ {t('settings.saved')}</span>}
          <button className="primary-btn" onClick={handleSave}>💾 {t('settings.save')}</button>
        </div>
      </div>

      <div className="module-tabs">
        {[
          { key: 'notification', label: t('settings.tabNotification') },
          { key: 'backup',       label: t('settings.tabBackup') },
        ].map(tab => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="module-content">

        {/* ===== NOTIFICATION ===== */}
        {activeTab === 'notification' && (
          <div className="settings-section">
            <div className="settings-grid">

              <div className="settings-card">
                <div className="settings-card-title">📧 Email Notifications</div>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <div className="toggle-label">แจ้งเตือน Stock ต่ำ</div>
                    <div className="toggle-sub">ส่ง email เมื่อ stock ต่ำกว่า threshold</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={notif.emailLowStock}
                      onChange={e => setNotif(p => ({ ...p, emailLowStock: e.target.checked }))} />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <div className="toggle-label">แจ้งเตือน Order ล่าช้า</div>
                    <div className="toggle-sub">ส่ง email เมื่อ order เกิน SLA</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={notif.emailOrderDelay}
                      onChange={e => setNotif(p => ({ ...p, emailOrderDelay: e.target.checked }))} />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <div className="toggle-label">รายงานประจำวัน</div>
                    <div className="toggle-sub">ส่งสรุปรายวันทุก 08:00 น.</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={notif.emailDailyReport}
                      onChange={e => setNotif(p => ({ ...p, emailDailyReport: e.target.checked }))} />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label>Stock Threshold (%)</label>
                  <input type="number" value={notif.stockThreshold}
                    onChange={e => setNotif(p => ({ ...p, stockThreshold: e.target.value }))} />
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">💬 LINE Notify</div>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <div className="toggle-label">เปิดใช้ LINE Notify</div>
                    <div className="toggle-sub">ส่งการแจ้งเตือนผ่าน LINE</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={notif.lineNotify}
                      onChange={e => setNotif(p => ({ ...p, lineNotify: e.target.checked }))} />
                    <span className="toggle-slider" />
                  </label>
                </div>
                {notif.lineNotify && (
                  <div className="form-group">
                    <label>LINE Notify Token</label>
                    <input type="text" placeholder="token..." value={notif.lineToken}
                      onChange={e => setNotif(p => ({ ...p, lineToken: e.target.value }))} />
                  </div>
                )}

                <div className="settings-card-title" style={{ marginTop: '16px' }}>📱 SMS Alert</div>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <div className="toggle-label">เปิดใช้ SMS</div>
                    <div className="toggle-sub">ส่ง SMS แจ้งเตือนเร่งด่วน</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={notif.smsAlert}
                      onChange={e => setNotif(p => ({ ...p, smsAlert: e.target.checked }))} />
                    <span className="toggle-slider" />
                  </label>
                </div>
                {notif.smsAlert && (
                  <div className="form-group">
                    <label>เบอร์โทร</label>
                    <input type="text" placeholder="0812345678" value={notif.smsPhone}
                      onChange={e => setNotif(p => ({ ...p, smsPhone: e.target.value }))} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== BACKUP & LOG ===== */}
        {activeTab === 'backup' && (
          <div className="settings-section">
            <div className="settings-grid">

              <div className="settings-card">
                <div className="settings-card-title">💾 Backup ข้อมูล</div>
                <div className="backup-info-row">
                  <span className="backup-info-label">Backup ล่าสุด</span>
                  <span className="backup-info-val">2026-03-11 03:00:00</span>
                </div>
                <div className="backup-info-row">
                  <span className="backup-info-label">ขนาด</span>
                  <span className="backup-info-val">124.7 MB</span>
                </div>
                <div className="backup-info-row">
                  <span className="backup-info-label">ตำแหน่ง</span>
                  <span className="backup-info-val">/backup/samila_20260311.sql</span>
                </div>
                <div className="backup-btn-row">
                  <button className="primary-btn">⬇️ ดาวน์โหลด Backup</button>
                  <button className="secondary-btn">🔄 Backup ทันที</button>
                </div>
                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label>ตั้งเวลา Auto Backup</label>
                  <select defaultValue="daily">
                    <option value="hourly">ทุกชั่วโมง</option>
                    <option value="daily">ทุกวัน (03:00)</option>
                    <option value="weekly">ทุกสัปดาห์</option>
                    <option value="manual">Manual เท่านั้น</option>
                  </select>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">📋 System Logs</div>
                <div className="log-list">
                  {[
                    { time: '09:12:34', type: 'INFO',  msg: 'User somchai logged in' },
                    { time: '09:05:11', type: 'INFO',  msg: 'Import 3 inventory items completed' },
                    { time: '08:55:00', type: 'WARN',  msg: 'Stock SKU004 below threshold (60)' },
                    { time: '08:30:22', type: 'INFO',  msg: 'Daily report generated' },
                    { time: '03:00:01', type: 'INFO',  msg: 'Auto backup completed successfully' },
                    { time: '2026-03-10 22:14', type: 'ERROR', msg: 'API timeout on /api/orders' },
                    { time: '2026-03-10 18:00', type: 'INFO',  msg: 'System maintenance completed' },
                  ].map((log, i) => (
                    <div key={i} className="log-row">
                      <span className="log-time">{log.time}</span>
                      <span className={`log-type ${log.type.toLowerCase()}`}>{log.type}</span>
                      <span className="log-msg">{log.msg}</span>
                    </div>
                  ))}
                </div>
                <button className="secondary-btn" style={{ marginTop: '10px', width: '100%' }}>📥 ดาวน์โหลด Full Log</button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsModule;
