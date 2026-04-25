import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ChatInterface from '../components/ChatInterface';
import styles from '../styles/chat.module.css';

/**
 * Member Chat Page
 * Main interface for credit union members with personalized account info
 */
export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Initialize on page load
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
          // Redirect to login if not authenticated
          router.push('/login');
          return;
        }

        const userData = JSON.parse(userStr);
        setUser(userData);

        // Create conversation
        const convId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setConversationId(convId);
      } catch (error) {
        console.error('Initialization error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>⏳</div>
        <p>Loading CreditAssist AI...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* User Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.profileInfo}>
          <h1>👤 {user?.name || 'Member'}</h1>
          <p className={styles.email}>{user?.email}</p>
          {user?.profile && (
            <div className={styles.accountStatus}>
              <span className={styles.statusBadge} style={{
                backgroundColor: user.profile.accountStatus === 'active' ? '#7a9b76' : '#b66b5f'
              }}>
                {user.profile.accountStatus.toUpperCase()}
              </span>
              <span className={styles.riskScore}>Risk: {user.profile.riskScore}</span>
            </div>
          )}
        </div>
        <div className={styles.headerButtons}>
          <button 
            className={styles.profileToggle}
            onClick={() => setShowProfile(!showProfile)}
          >
            {showProfile ? '↓ Hide' : '↑ Show'} Accounts
          </button>
          <button 
            className={styles.logoutButton}
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.push('/login');
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Account Overview (when expanded) */}
      {showProfile && user?.accounts && (
        <div className={styles.accountsOverview}>
          <h3>💰 Your Accounts</h3>
          <div className={styles.accountsList}>
            {user.accounts.map(acc => (
              <div key={acc.id} className={styles.accountCard}>
                <p className={styles.accountType}>{acc.type}</p>
                <p className={styles.accountBalance}>${acc.balance.toFixed(2)}</p>
                <p className={styles.accountNumber}>{acc.accountNumber}</p>
              </div>
            ))}
          </div>

          {user.loans && user.loans.length > 0 && (
            <>
              <h3>🏦 Your Loans</h3>
              <div className={styles.loansList}>
                {user.loans.map(loan => (
                  <div key={loan.id} className={styles.loanCard}>
                    <p className={styles.loanType}>{loan.type}</p>
                    <p>Remaining: ${loan.remaining.toFixed(2)}</p>
                    <p>Monthly Payment: ${loan.monthlyPayment.toFixed(2)}</p>
                    {loan.daysOverdue > 0 && (
                      <p className={styles.warning}>⚠️ {loan.daysOverdue} days overdue</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Main Chat Interface */}
      <ChatInterface
        conversationId={conversationId}
        userId={user?.id}
        user={user}
        token={localStorage.getItem('token')}
      />
    </div>
  );
}
