import React, { useState, useEffect } from 'react';
import styles from './DashboardLayout.module.css';
import CaseDetail from '../components/CaseDetail';
import Analytics from '../components/Analytics';

/**
 * Staff Dashboard Layout
 * Main dashboard for support staff to manage escalated cases with summaries
 */
export default function DashboardLayout() {
  const [allCases, setAllCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [token, setToken] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Get token from localStorage on client-side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('staffToken');
      setToken(storedToken || 'demo-token');
    }
  }, []);

  // Fetch cases and analytics
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch cases
        const casesResponse = await fetch(`${API_URL}/api/cases`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const casesData = await casesResponse.json();
        // Ensure casesData is always an array
        setAllCases(Array.isArray(casesData) ? casesData : casesData?.cases || []);

        // Fetch analytics
        const analyticsResponse = await fetch(`${API_URL}/api/analytics/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setAllCases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Auto-refresh every 5 seconds so new escalations appear quickly
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [token]);

  // Three buckets: live escalations, live AI-resolved, mock seeds
  const escalatedCases = allCases.filter(c => c.escalated === true || c.status === 'escalated');
  const aiResolvedCases = allCases.filter(c => c.resolved_by === 'ai');
  const otherCases = allCases.filter(c => c.escalated !== true && c.status !== 'escalated' && c.resolved_by !== 'ai');

  const matches = (c) =>
    !filter ||
    c.issue_type?.toLowerCase().includes(filter.toLowerCase()) ||
    c.user_email?.toLowerCase().includes(filter.toLowerCase()) ||
    c.user_name?.toLowerCase().includes(filter.toLowerCase());

  const filteredEscalated = escalatedCases.filter(matches);
  const filteredAiResolved = aiResolvedCases.filter(matches);
  const filteredOthers = otherCases.filter(matches);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>📊 CreditAssist AI - Support Dashboard</h1>
          <p>Escalated Cases & Summary Overview</p>
        </div>
        <div className={styles.userInfo}>
          <span>Support Staff</span>
          <button onClick={() => localStorage.removeItem('staffToken')}>Logout</button>
        </div>
      </header>

      <div className={styles.mainContent}>
        {/* Sidebar - Analytics */}
        <aside className={styles.sidebar}>
          <Analytics data={analytics} loading={loading} />
        </aside>

        {/* Main Area */}
        <main className={styles.main}>
          {/* Search Bar */}
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search cases..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={styles.searchInput}
            />
            <button className={styles.filterButton}>🔍</button>
          </div>

          {loading ? (
            <div className={styles.loadingMessage}>Loading cases...</div>
          ) : (
            <>
              {/* ESCALATED CASES SECTION */}
              <section className={styles.escalatedSection}>
                <div className={styles.sectionHeader}>
                  <h2>🚨 Escalated Cases ({filteredEscalated.length})</h2>
                  <span className={styles.sectionBadge}>Requires Immediate Attention</span>
                </div>

                {filteredEscalated.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>✓ No escalated cases</p>
                  </div>
                ) : (
                  <div className={styles.escalatedGrid}>
                    {filteredEscalated.map(caseItem => (
                      <div
                        key={caseItem.id}
                        className={`${styles.escalatedCard} ${selectedCase?.id === caseItem.id ? styles.selected : ''}`}
                        onClick={() => setSelectedCase(caseItem)}
                      >
                        <div className={styles.cardHeader}>
                          <div>
                            <h3>{caseItem.user_name}</h3>
                            <p className={styles.email}>{caseItem.user_email}</p>
                          </div>
                          <span className={styles.escalationBadge}>ESCALATED</span>
                        </div>

                        <div className={styles.cardContent}>
                          <div className={styles.issueType}>
                            <strong>Issue</strong> {caseItem.issue_type}
                          </div>
                          <div className={styles.reason}>
                            <strong>Reason</strong> {caseItem.escalation_reason_label || caseItem.escalation_reason || 'Policy escalation'}
                          </div>
                          {caseItem.first_user_message && (
                            <div className={styles.summary}>
                              <strong>Member said</strong>
                              <p>"{caseItem.first_user_message.substring(0, 140)}{caseItem.first_user_message.length > 140 ? '…' : ''}"</p>
                            </div>
                          )}
                          {caseItem.ai_summary && (
                            <div className={styles.summary}>
                              <strong>AI summary</strong>
                              <p>{caseItem.ai_summary.substring(0, 180)}{caseItem.ai_summary.length > 180 ? '…' : ''}</p>
                            </div>
                          )}
                          {caseItem.message_count > 0 && (
                            <div className={styles.messageCount}>
                              💬 {caseItem.message_count} messages in conversation
                            </div>
                          )}
                        </div>

                        <div className={styles.cardFooter}>
                          <span className={styles.timestamp}>
                            {new Date(caseItem.created_at).toLocaleDateString()} {new Date(caseItem.created_at).toLocaleTimeString()}
                          </span>
                          <button className={styles.viewButton}>View Details →</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* AI-RESOLVED SECTION (live) */}
              {filteredAiResolved.length > 0 && (
                <section className={styles.resolvedSection}>
                  <div className={styles.sectionHeader}>
                    <h2>✓ Solved by AI ({filteredAiResolved.length})</h2>
                    <span className={styles.sectionBadge} style={{ background: '#dde3cf', color: '#3f5039' }}>
                      Auto-Resolved
                    </span>
                  </div>
                  <div className={styles.resolvedGrid}>
                    {filteredAiResolved.map(c => (
                      <div
                        key={c.id}
                        className={`${styles.resolvedCard} ${selectedCase?.id === c.id ? styles.selected : ''}`}
                        onClick={() => setSelectedCase(c)}
                      >
                        <div className={styles.cardHeader}>
                          <div>
                            <h3>{c.user_name}</h3>
                            <p className={styles.email}>{c.user_email}</p>
                          </div>
                          <span className={`${styles.statusBadge} ${styles.resolved}`}>RESOLVED</span>
                        </div>
                        <div className={styles.cardContent}>
                          <div className={styles.issueType}>
                            <strong>Issue</strong> {c.issue_type}
                          </div>
                          {c.first_user_message && (
                            <div className={styles.summary}>
                              <strong>Member said</strong>
                              <p>"{c.first_user_message.substring(0, 140)}{c.first_user_message.length > 140 ? '…' : ''}"</p>
                            </div>
                          )}
                          {c.ai_summary && (
                            <div className={styles.summary}>
                              <strong>AI's last reply</strong>
                              <p>{c.ai_summary.substring(0, 160)}{c.ai_summary.length > 160 ? '…' : ''}</p>
                            </div>
                          )}
                          <div className={styles.messageCount}>
                            💬 {c.message_count} messages · resolved by AI
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* OTHER CASES SECTION */}
              {filteredOthers.length > 0 && (
                <section className={styles.otherSection}>
                  <div className={styles.sectionHeader}>
                    <h2>📋 Other Cases ({filteredOthers.length})</h2>
                    <span className={styles.sectionBadge}>Summary View</span>
                  </div>

                  <div className={styles.otherGrid}>
                    {filteredOthers.map(caseItem => (
                      <div
                        key={caseItem.id}
                        className={`${styles.otherCard} ${selectedCase?.id === caseItem.id ? styles.selected : ''}`}
                        onClick={() => setSelectedCase(caseItem)}
                      >
                        <div className={styles.otherCardHeader}>
                          <div>
                            <h4>{caseItem.user_name}</h4>
                            <p>{caseItem.issue_type}</p>
                          </div>
                          <span className={`${styles.statusBadge} ${styles[caseItem.status]}`}>
                            {caseItem.status?.toUpperCase()}
                          </span>
                        </div>
                        <p className={styles.preview}>
                          {caseItem.ai_summary?.substring(0, 80) || 'No summary'}...
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        {/* Case Detail Panel */}
        {selectedCase && (
          <aside className={styles.detailPanel}>
            <CaseDetail
              caseData={selectedCase}
              onClose={() => setSelectedCase(null)}
              onUpdate={(updatedCase) => {
                setAllCases(allCases.map(c => c.id === updatedCase.id ? updatedCase : c));
              }}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
