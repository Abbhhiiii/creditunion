import React from 'react';
import styles from '../styles/MessageBubble.module.css';

export default function MessageBubble({ message, onResolve, onActionClick, showResolveButton }) {
  const isUser = message.sender === 'user';
  const isError = message.isError;
  const isEscalated = message.metadata?.escalated || message.metadata?.resolution_status === 'escalated';

  return (
    <div className={`${styles.row} ${isUser ? styles.rowUser : styles.rowAi}`}>
      {!isUser && <div className={styles.avatar}>🤖</div>}
      <div className={`${styles.bubble} ${isUser ? styles.user : styles.ai} ${isError ? styles.error : ''} ${isEscalated ? styles.escalated : ''}`}>
        {isEscalated && (
          <div className={styles.badge}>🚨 Escalated</div>
        )}
        <div className={styles.content}>{message.content}</div>

        {message.suggestedActions && message.suggestedActions.length > 0 && (
          <div className={styles.actions}>
            {message.suggestedActions.map((action, idx) => (
              <button key={idx} onClick={() => onActionClick?.(action)} className={styles.actionButton}>
                {action}
              </button>
            ))}
          </div>
        )}

        <div className={styles.footer}>
          <span className={styles.timestamp}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!isUser && showResolveButton && onResolve && (
            <button className={styles.resolveBtn} onClick={onResolve} title="End conversation — issue resolved">
              ✓ Issue Resolved
            </button>
          )}
        </div>
      </div>
      {isUser && <div className={styles.avatar}>🧑</div>}
    </div>
  );
}
