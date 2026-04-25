import React from 'react';
import styles from './CaseList.module.css';

/**
 * Case List Component
 * Displays all cases in a sortable, filterable list
 */
export default function CaseList({ cases, onCaseSelect, selectedCaseId }) {
  const getPriorityColor = (priority) => {
    const colors = {
      'high': '#e74c3c',
      'medium': '#f39c12',
      'low': '#27ae60'
    };
    return colors[priority] || '#95a5a6';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'resolved': '✅',
      'escalated': '🔴',
      'pending': '⏳',
      'in_progress': '⚙️'
    };
    return icons[status] || '❓';
  };

  return (
    <div className={styles.caseList}>
      {cases.map((caseItem) => (
        <div
          key={caseItem.id}
          className={`${styles.caseCard} ${selectedCaseId === caseItem.id ? styles.selected : ''}`}
          onClick={() => onCaseSelect(caseItem)}
        >
          {/* Status Indicator */}
          <div className={styles.statusIndicator}>
            <span className={styles.statusIcon}>{getStatusIcon(caseItem.status)}</span>
            <span className={styles.caseId}>#{caseItem.id}</span>
          </div>

          {/* User & Issue */}
          <div className={styles.caseInfo}>
            <p className={styles.userEmail}>{caseItem.user_email}</p>
            <p className={styles.issueType}>{caseItem.issue_type}</p>
          </div>

          {/* Priority Badge */}
          <div
            className={styles.priorityBadge}
            style={{ borderLeft: `4px solid ${getPriorityColor(caseItem.priority)}` }}
          >
            {caseItem.priority.toUpperCase()}
          </div>

          {/* Sentiment & Sentiment Score */}
          {caseItem.sentiment && (
            <div className={`${styles.sentimentBadge} ${styles[caseItem.sentiment]}`}>
              {caseItem.sentiment}
            </div>
          )}

          {/* Message Count */}
          <div className={styles.metaInfo}>
            <span>💬 {caseItem.message_count || 0}</span>
            <span className={styles.time}>
              {new Date(caseItem.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
