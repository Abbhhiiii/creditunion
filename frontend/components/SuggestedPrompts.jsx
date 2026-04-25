import React from 'react';
import styles from '../styles/SuggestedPrompts.module.css';

/**
 * Suggested Prompts Component
 * Shows quick-start options for common issues
 */
export default function SuggestedPrompts({ onPromptClick }) {
  const prompts = [
    {
      icon: '💰',
      text: 'What\'s my balance?',
      category: 'balance'
    },
    {
      icon: '💳',
      text: 'I want to block my card',
      category: 'card'
    },
    {
      icon: '⚠️',
      text: 'Dispute a transaction',
      category: 'dispute'
    },
    {
      icon: '🏦',
      text: 'Loan status',
      category: 'loan'
    },
    {
      icon: '📍',
      text: 'Update my address',
      category: 'account'
    },
    {
      icon: '❓',
      text: 'Interest rates',
      category: 'rates'
    }
  ];

  return (
    <div className={styles.container}>
      <p className={styles.title}>Quick actions:</p>
      <div className={styles.promptGrid}>
        {prompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onPromptClick(prompt.text)}
            className={styles.promptButton}
          >
            <span className={styles.icon}>{prompt.icon}</span>
            <span className={styles.text}>{prompt.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
