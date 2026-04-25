import React from 'react';
import styles from './Analytics.module.css';

export default function Analytics({ data, loading }) {
  if (loading || !data) {
    return <div className={styles.container}>Loading analytics...</div>;
  }

  const metrics = [
    { label: 'AI Resolved', value: data.resolved_cases || 0, color: '#7a9b76' },
    { label: 'Escalated', value: data.escalated_cases || 0, color: '#b66b5f' },
    { label: 'Open Cases', value: data.pending_cases || 0, color: '#c08870' },
    { label: 'Clarifying', value: data.awaiting_context || 0, color: '#a89373' },
    { label: 'Avg Resolve', value: `${data.avg_resolution_time_seconds || 0}s`, color: '#8a9b76' },
    { label: 'Resolve Rate', value: `${data.auto_resolve_rate || 0}%`, color: '#5f7d5a' }
  ];

  const sentiments = data.sentiment_distribution || {};
  const reasons = data.escalation_reasons || {};
  const sentimentTotal = Object.values(sentiments).reduce((a, b) => a + b, 0) || 1;

  const sentimentColor = {
    positive: '#7a9b76', neutral: '#a89373', negative: '#c08870',
    frustrated: '#b66b5f', angry: '#8a4a3d', urgent: '#a8663d'
  };

  return (
    <div className={styles.container}>
      <h2>📈 Analytics</h2>

      <div className={styles.metricsGrid}>
        {metrics.map((m, idx) => (
          <div key={idx} className={styles.metricCard} style={{ borderTopColor: m.color }}>
            <div className={styles.label}>{m.label}</div>
            <div className={styles.value} style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <h3>Performance</h3>
        <div className={styles.statsList}>
          <div className={styles.statItem}>
            <span>Total Interactions</span>
            <span className={styles.percentage}>{data.total_interactions || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span>Escalation Rate</span>
            <span className={styles.percentage}>{data.escalation_rate || 0}%</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Sentiment Distribution</h3>
        <div className={styles.statsList}>
          {Object.entries(sentiments).map(([k, v]) => (
            <div key={k} className={styles.statItem}>
              <span style={{ textTransform: 'capitalize' }}>
                <span style={{
                  display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
                  background: sentimentColor[k] || '#999', marginRight: 8
                }} />
                {k}
              </span>
              <span className={styles.percentage}>
                {v} ({Math.round((v / sentimentTotal) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {Object.keys(reasons).length > 0 && (
        <div className={styles.section}>
          <h3>Top Escalation Reasons</h3>
          <div className={styles.statsList}>
            {Object.entries(reasons)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([k, v]) => (
                <div key={k} className={styles.statItem}>
                  <span style={{ textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                  <span className={styles.percentage}>{v}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
