import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/login.module.css';

/**
 * Login Page
 * Members can login with their credentials
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('john.doe@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTestAccounts, setShowTestAccounts] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Test accounts for demo
  const testAccounts = [
    { email: 'john.doe@example.com', name: 'John Doe', risk: 'Low', balance: '$20,432.50' },
    { email: 'sarah.smith@example.com', name: 'Sarah Smith', risk: 'Medium', balance: '$12,345.67' },
    { email: 'michael.johnson@example.com', name: 'Michael Johnson', risk: 'Medium', balance: '$8,234.50' },
    { email: 'emily.davis@example.com', name: 'Emily Davis', risk: 'High', balance: '$450.00' },
    { email: 'robert.wilson@example.com', name: 'Robert Wilson', risk: 'Low', balance: '$170,234.50' },
    { email: 'jessica.martinez@example.com', name: 'Jessica Martinez', risk: 'Medium', balance: '$34,567.89' },
    { email: 'david.martinez@example.com', name: 'David Martinez', risk: 'High', balance: '$2,100.00' },
    { email: 'alice.brown@example.com', name: 'Alice Brown', risk: 'Low', balance: '$56,789.00' },
    { email: 'william.taylor@example.com', name: 'William Taylor', risk: 'Medium', balance: '$23,456.78' },
    { email: 'sophia.brown@example.com', name: 'Sophia Brown', risk: 'High', balance: '$1,234.50' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/chat');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (testEmail) => {
    setEmail(testEmail);
    setPassword('password123');
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        {/* Logo/Header */}
        <div className={styles.header}>
          <h1>💳 CreditAssist AI</h1>
          <p>Credit Union Member Portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} className={styles.loginButton}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Test Accounts Toggle */}
        <div className={styles.testSection}>
          <button
            type="button"
            onClick={() => setShowTestAccounts(!showTestAccounts)}
            className={styles.toggleButton}
          >
            {showTestAccounts ? '▼ Hide' : '▶ Show'} Test Accounts
          </button>

          {showTestAccounts && (
            <div className={styles.testAccounts}>
              <p className={styles.testInfo}>Click to quick-select a test account (password: password123)</p>
              <div className={styles.accountsList}>
                {testAccounts.map((account, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickLogin(account.email)}
                    className={`${styles.accountButton} ${email === account.email ? styles.selected : ''}`}
                  >
                    <div className={styles.accountName}>{account.name}</div>
                    <div className={styles.accountEmail}>{account.email}</div>
                    <div className={styles.accountDetails}>
                      <span className={`${styles.riskBadge} ${styles[account.risk.toLowerCase()]}`}>
                        {account.risk}
                      </span>
                      <span className={styles.balance}>{account.balance}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p>🔒 100% Open-Source | 🤖 AI-Powered | 💰 Zero Limits</p>
        </div>
      </div>
    </div>
  );
}
