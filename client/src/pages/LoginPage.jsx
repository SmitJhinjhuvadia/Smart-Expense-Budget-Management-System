import React, { useState } from 'react';
import axios from 'axios';
const API = "https://smart-expense-budget-management-system.onrender.com";

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!name || !email || !password)
          return setError('All fields are required');
        const res = await axios.post(`${API}/api/auth/register`, { name, email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        onLogin(res.data.user);
      } else {
        if (!email || !password)
          return setError('Email and password are required');
        const res = await axios.post(`${API}/api/auth/login`, { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        onLogin(res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  const handleGuest = async () => {
    setError('');
    setLoading(true);
    try {
      const guestEmail = `guest_${Date.now()}@guest.com`;
      const res = await axios.post(`${API}/api/auth/register`, {
        name: 'Guest User',
        email: guestEmail,
        password: 'guest1234'
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError('Guest login failed. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56,
            background: 'rgba(79,70,229,0.1)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', fontSize: 26
          }}>
            💰
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            FinFlow
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Smart Expense & Budget Management
          </p>
        </div>

        {/* Tabs: Login / Sign Up */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-sm)',
          padding: 4, marginBottom: 24,
          border: '1px solid var(--border)'
        }}>
          {['login', 'signup'].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1, padding: '9px 0',
                borderRadius: 6, border: 'none',
                cursor: 'pointer', fontSize: 13, fontWeight: 600,
                fontFamily: 'var(--font-body)',
                background: mode === m ? 'white' : 'transparent',
                color: mode === m ? 'var(--accent)' : 'var(--text-muted)',
                boxShadow: mode === m ? 'var(--shadow)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              {m === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div style={{
              background: 'var(--red-dim)',
              border: '1px solid rgba(220,38,38,0.2)',
              borderRadius: 8, padding: '10px 14px',
              marginBottom: 16, fontSize: 13,
              color: 'var(--red)', fontWeight: 500
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login to FinFlow' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          margin: '20px 0', color: 'var(--text-dim)', fontSize: 12
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Guest */}
        <button
          type="button"
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 13 }}
          onClick={handleGuest}
          disabled={loading}
        >
          👤 Continue as Guest
        </button>

        <p style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center', marginTop: 16 }}>
          Guest accounts are temporary. Data may be cleared periodically.
        </p>

      </div>
    </div>
  );
}
