import React, { useState } from 'react';
import styles from './CaseDetail.module.css';

/**
 * Case Detail Component
 * Shows full conversation and actions for a specific case
 */
export default function CaseDetail({ caseData, onClose, onUpdate }) {
  const [resolution, setResolution] = useState(caseData.resolution || '');
  const [notes, setNotes] = useState(caseData.notes || '');
  const [newStatus, setNewStatus] = useState(caseData.status);
  const [saving, setSaving] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('staffToken');

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/api/cases/${caseData.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          resolution,
          notes
        })
      });

      if (response.ok) {
        const updated = await response.json();
        onUpdate(updated);
      }
    } catch (error) {
      console.error('Error saving case:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.detailPanel}>
      <div className={styles.header}>
        <h2>Case #{caseData.id}</h2>
        <button onClick={onClose} className={styles.closeButton}>✕</button>
      </div>

      {/* Case Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.label}>User:</span>
          <span className={styles.value}>{caseData.user_email}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.label}>Issue Type:</span>
          <span className={styles.value}>{caseData.issue_type}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.label}>Sentiment:</span>
          <span className={`${styles.value} ${styles[caseData.sentiment]}`}>
            {caseData.sentiment}
          </span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.label}>Created:</span>
          <span className={styles.value}>
            {new Date(caseData.created_at).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Conversation Transcript (real escalations) */}
      {caseData.conversation_transcript && (
        <div className={styles.aiSummary}>
          <h3>💬 Conversation Transcript</h3>
          <pre className={styles.transcript}>{caseData.conversation_transcript}</pre>
        </div>
      )}

      {/* Escalation Summary */}
      {(caseData.escalation_reason_label || caseData.ai_summary) && (
        <div className={styles.aiSummary}>
          <h3>🤖 AI Summary</h3>
          <div className={styles.summaryContent}>
            {caseData.escalation_reason_label && (
              <p><strong>Reason:</strong> {caseData.escalation_reason_label}</p>
            )}
            {caseData.first_user_message && (
              <p><strong>Member said:</strong> "{caseData.first_user_message}"</p>
            )}
            {caseData.ai_summary && (
              <div className={styles.conversationSummary}>
                <strong>AI response:</strong>
                <p>{caseData.ai_summary}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI-Generated Summary (mock cases) */}
      {caseData.summary && (
        <div className={styles.aiSummary}>
          <h3>🤖 AI Analysis & Summary</h3>
          <div className={styles.summaryContent}>
            <p>
              <strong>Issue Category:</strong> {caseData.summary.issue_category}
            </p>
            <p>
              <strong>Customer Sentiment:</strong> <span className={styles[caseData.summary.user_sentiment]}>{caseData.summary.user_sentiment}</span> (Score: {caseData.summary.sentiment_score?.toFixed(2)})
            </p>
            <p>
              <strong>Initial Message:</strong> "{caseData.summary.message_snippet}"
            </p>
            
            {caseData.summary.conversation_summary && (
              <div className={styles.conversationSummary}>
                <strong>Full Conversation Summary:</strong>
                <p>{caseData.summary.conversation_summary}</p>
              </div>
            )}
            
            {caseData.summary.escalation_reason && (
              <p>
                <strong>Escalation Reason:</strong> <span className={styles.escalationReason}>{caseData.summary.escalation_reason.replace(/_/g, ' ').toUpperCase()}</span>
              </p>
            )}
            
            {caseData.summary.team_assigned && (
              <p>
                <strong>Assigned Team:</strong> {caseData.summary.team_assigned}
              </p>
            )}
            
            {caseData.summary.sla && (
              <p>
                <strong>SLA:</strong> {caseData.summary.sla}
              </p>
            )}
            
            {caseData.summary.requires_immediate_attention && (
              <p className={styles.warning}>⚠️ Requires immediate attention</p>
            )}
          </div>
        </div>
      )}

      {/* Status Update */}
      <div className={styles.section}>
        <label>Status</label>
        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="escalated">Escalated</option>
        </select>
      </div>

      {/* Resolution Text */}
      <div className={styles.section}>
        <label>Resolution</label>
        <textarea
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          placeholder="Enter how this case was resolved..."
          rows="3"
        />
      </div>

      {/* Staff Notes */}
      <div className={styles.section}>
        <label>Staff Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add internal notes..."
          rows="3"
        />
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button
          onClick={handleSave}
          disabled={saving}
          className={styles.saveButton}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button onClick={onClose} className={styles.cancelButton}>
          Close
        </button>
      </div>
    </div>
  );
}
