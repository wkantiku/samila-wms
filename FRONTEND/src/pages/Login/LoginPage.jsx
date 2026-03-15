import { useState } from 'react';
import './LoginPage.css';

const DEMO_USERS = [
  { username: 'admin',    password: 'admin123',   name: 'ผู้ดูแลระบบ',         role: 'admin',          roleLabel: 'Admin' },
  { username: 'manager',  password: 'manager123', name: 'คุณวิชัย สุวรรณ',    role: 'manager',        roleLabel: 'Manager' },
  { username: 'super1',   password: 'super123',   name: 'คุณสุภาพร รักดี',    role: 'supervisor',     roleLabel: 'Supervisor' },
  { username: 'whadmin',  password: 'wh1234',     name: 'คุณนภา ศรีสว่าง',    role: 'warehouse_admin',roleLabel: 'WH Admin' },
  { username: 'leader1',  password: 'lead123',    name: 'คุณธนา พรหมมา',      role: 'leader',         roleLabel: 'Leader' },
  { username: 'operator', password: 'op1234',     name: 'คุณปรีชา มีสุข',     role: 'operator',       roleLabel: 'Operator' },
];

export default function LoginPage({ onLogin }) {
  const [form, setForm]       = useState({ username: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { setError('กรุณากรอก Username และ Password'); return; }
    setLoading(true);
    setError('');
    setTimeout(() => {
      const user = DEMO_USERS.find(u => u.username === form.username.trim().toLowerCase() && u.password === form.password);
      if (user) {
        onLogin(user);
      } else {
        setError('Username หรือ Password ไม่ถูกต้อง');
        setLoading(false);
      }
    }, 800);
  };

  const fillDemo = (u) => setForm({ username: u.username, password: u.password });

  return (
    <div className="login-page">
      {/* Background grid */}
      <div className="login-bg-grid" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo-area">
          <div className="login-logo-img-wrap">
            <img src="/logo.png" alt="BB Innovation" className="login-logo-img" />
          </div>
          <div className="login-logo-text">BB Innovation</div>
          <div className="login-logo-sub">3PL Warehouse Management System</div>
        </div>

        {/* Form */}
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

        {/* Demo accounts */}
        <div className="login-demo">
          <div className="login-demo-title">Demo Accounts</div>
          <div className="login-demo-list">
            {DEMO_USERS.map(u => (
              <button key={u.username} className="login-demo-btn" onClick={() => fillDemo(u)} type="button">
                <span className={`demo-role-badge role-${u.role}`}>{u.roleLabel}</span>
                <span className="demo-user">{u.username}</span>
                <span className="demo-sep">·</span>
                <span className="demo-pass">{u.password}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="login-footer">
          BB Innovation Co., Ltd. &nbsp;·&nbsp; v1.0.0
        </div>
      </div>
    </div>
  );
}
