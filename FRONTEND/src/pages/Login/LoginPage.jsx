import { useState } from 'react';
import { authService } from '../../services/authService';
import './LoginPage.css';

export default function LoginPage({ onLogin, users = [] }) {
  const [form, setForm]         = useState({ username: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const activeUsers = users.filter(u => u.status === 'active');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { setError('กรุณากรอก Username และ Password'); return; }
    setLoading(true);
    setError('');

    // Try API login first
    try {
      const apiUser = await authService.login(form.username.trim(), form.password);
      onLogin(apiUser);
      return;
    } catch (apiErr) {
      // API not available or wrong credentials — check if it's auth error
      const msg = apiErr?.detail || apiErr?.message || '';
      if (msg && !msg.toLowerCase().includes('network') && !msg.toLowerCase().includes('timeout') && !msg.toLowerCase().includes('econnrefused')) {
        setError(msg || 'Username หรือ Password ไม่ถูกต้อง');
        setLoading(false);
        return;
      }
      // API offline — fallback to local users
    }

    // Fallback: local user list
    setTimeout(() => {
      const u = users.find(u =>
        u.username.toLowerCase() === form.username.trim().toLowerCase() &&
        u.password === form.password &&
        u.status === 'active'
      );
      if (u) {
        onLogin(u);
      } else {
        setError('Username หรือ Password ไม่ถูกต้อง หรือบัญชีถูกระงับ');
        setLoading(false);
      }
    }, 400);
  };

  const fillDemo = (u) => setForm({ username: u.username, password: u.password });

  return (
    <div className="login-page">
      <div className="login-bg-grid" />

      {/* wider card — 2 columns */}
      <div className="login-card login-card-wide">

        {/* ── LEFT: form ── */}
        <div className="login-form-col">
          <div className="login-logo-area">
            <img src="/logo.png" alt="Samila WMS 3PL" className="login-logo-img" />
            <div className="login-logo-title">Samila WMS 3PL</div>
            <div className="login-logo-sub">Warehouse Management System</div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label>Username</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">👤</span>
                <input
                  type="text"
                  placeholder="กรอก Username"
                  value={form.username}
                  onChange={e => { setForm(p => ({ ...p, username: e.target.value })); setError(''); }}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div className="login-field">
              <label>Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">🔒</span>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="กรอก Password"
                  value={form.password}
                  onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setError(''); }}
                  autoComplete="current-password"
                />
                <button type="button" className="login-show-pass" onClick={() => setShowPass(v => !v)}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <span className="login-spinner" /> : '🔑 เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="login-footer">
            Samila Innovation Co., Ltd. &nbsp;·&nbsp; v1.0.0
          </div>
        </div>

        {/* ── RIGHT: demo accounts table ── */}
        <div className="login-accounts-col">
          <div className="login-accounts-title">👥 บัญชีผู้ใช้งาน (คลิกเพื่อกรอกอัตโนมัติ)</div>
          <table className="login-accounts-table">
            <thead>
              <tr>
                <th>ชื่อ</th>
                <th>Username</th>
                <th>Password</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map(u => (
                <tr key={u.username} className="login-accounts-row" onClick={() => fillDemo(u)}
                  title="คลิกเพื่อกรอกอัตโนมัติ">
                  <td>{u.name}</td>
                  <td><span className="acc-username">{u.username}</span></td>
                  <td><span className="acc-password">{u.password}</span></td>
                </tr>
              ))}
              {activeUsers.length === 0 && (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: '#3a6a82', padding: 12 }}>ไม่มีบัญชีผู้ใช้</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
