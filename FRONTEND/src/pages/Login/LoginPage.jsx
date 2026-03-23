import { useState } from 'react';
import { authService } from '../../services/authService';
import './LoginPage.css';

export default function LoginPage({ onLogin, users = [] }) {
  const [form, setForm]         = useState({ username: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { setError('กรุณากรอก Username / Email และ Password'); return; }
    setLoading(true);
    setError('');

    const input = form.username.trim();

    // ถ้าเป็น email → ลอง Supabase ก่อน
    if (isEmail(input)) {
      try {
        const sbUser = await authService.loginWithSupabase(input, form.password);
        onLogin(sbUser);
        return;
      } catch (sbErr) {
        const msg = sbErr?.message || '';
        if (!msg.toLowerCase().includes('network') && !msg.toLowerCase().includes('fetch')) {
          setError(msg || 'Email หรือ Password ไม่ถูกต้อง');
          setLoading(false);
          return;
        }
      }
    }

    // ลอง FastAPI (username หรือ email)
    try {
      const apiUser = await authService.login(input, form.password);
      onLogin(apiUser);
      return;
    } catch (apiErr) {
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
        u.username.toLowerCase() === input.toLowerCase() &&
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

  return (
    <div className="login-page">
      <div className="login-bg-grid" />

      <div className="login-card">

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
                  placeholder="กรอก Username หรือ Email"
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

      </div>
    </div>
  );
}
