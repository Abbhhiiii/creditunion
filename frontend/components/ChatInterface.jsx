import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/ChatInterface.module.css';
import VoiceInput from './VoiceInput';
import MessageBubble from './MessageBubble';
import SuggestedPrompts from './SuggestedPrompts';

export default function ChatInterface({ conversationId, userId, user, token }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [conversationEnded, setConversationEnded] = useState(false);
  const messagesEndRef = useRef(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const t = (key) => ({
    en: {
      placeholder: 'Ask me about your account, cards, loans, rates…',
      greeting: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm CreditAssist — I can help with balances, rates, card questions, loan status, and more. How can I help today?`,
      endedTitle: 'Conversation ended',
      endedBody: 'Glad we could help! Start a new chat anytime.',
      new: 'Start new chat'
    },
    hi: {
      placeholder: 'अपने खाते, कार्ड, ऋण के बारे में पूछें…',
      greeting: `नमस्ते ${user?.name?.split(' ')[0] || ''}! मैं क्रेडिटअसिस्ट हूं। मैं कैसे मदद कर सकता हूं?`,
      endedTitle: 'बातचीत समाप्त',
      endedBody: 'धन्यवाद! आप कभी भी नई चैट शुरू कर सकते हैं।',
      new: 'नई चैट शुरू करें'
    },
    kn: {
      placeholder: 'ನಿಮ್ಮ ಖಾತೆಯ ಬಗ್ಗೆ ಕೇಳಿ…',
      greeting: `ನಮಸ್ಕಾರ ${user?.name?.split(' ')[0] || ''}! ನಾನು ಕ್ರೆಡಿಟ್‌ಅಸಿಸ್ಟ್. ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?`,
      endedTitle: 'ಸಂಭಾಷಣೆ ಮುಗಿಯಿತು',
      endedBody: 'ಧನ್ಯವಾದಗಳು! ಯಾವಾಗ ಬೇಕಾದರೂ ಹೊಸ ಚಾಟ್ ಪ್ರಾರಂಭಿಸಿ।',
      new: 'ಹೊಸ ಚಾಟ್'
    }
  }[language][key]);

  const sendMessage = async (text) => {
    if (!text.trim() || conversationEnded) return;

    const userMessage = { id: Date.now(), content: text, sender: 'user', timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversation_id: conversationId, language })
      });
      if (!response.ok) throw new Error('Failed to send message');
      const data = await response.json();

      const aiMessage = {
        id: data.ai_response.id,
        content: data.ai_response.content,
        sender: 'ai',
        timestamp: new Date(data.ai_response.created_at),
        metadata: data.ai_response.metadata
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), content: "Sorry, I couldn't process that. Please try again.", sender: 'ai', timestamp: new Date(), isError: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resolveConversation = async () => {
    try {
      await fetch(`${API_URL}/api/chat/resolve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId })
      });
    } catch (e) {}
    setConversationEnded(true);
  };

  const startNewChat = () => {
    setMessages([]);
    setConversationEnded(false);
    setInputValue('');
    if (typeof window !== 'undefined') window.location.reload();
  };

  useEffect(() => {
    if (messages.length === 0 && !conversationEnded) {
      setMessages([{ id: 1, content: t('greeting'), sender: 'ai', timestamp: new Date() }]);
    }
  }, [language]);

  const lastAiIndex = [...messages].map((m, i) => ({ m, i })).filter((x) => x.m.sender === 'ai').pop()?.i;

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logo}>UC</div>
          <div>
            <h1>Union Credit</h1>
            <p>
              <span className={styles.dot} /> AI assistant online
            </p>
          </div>
        </div>
        <div className={styles.headerRight}>
          {user && <div className={styles.userPill}>{user.name}</div>}
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={styles.languageSelect}>
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="kn">ಕನ್ನಡ</option>
          </select>
        </div>
      </header>

      <div className={styles.messagesContainer}>
        {messages.map((msg, idx) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            showResolveButton={msg.sender === 'ai' && idx === lastAiIndex && !conversationEnded && idx !== 0}
            onResolve={resolveConversation}
          />
        ))}
        {loading && (
          <div className={styles.typing}>
            <span /> <span /> <span />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && !loading && !conversationEnded && (
        <SuggestedPrompts onPromptClick={sendMessage} />
      )}

      {conversationEnded ? (
        <div className={styles.endedCard}>
          <div className={styles.endedIcon}>✓</div>
          <div>
            <h3>{t('endedTitle')}</h3>
            <p>{t('endedBody')}</p>
          </div>
          <button onClick={startNewChat} className={styles.newChatBtn}>
            {t('new')}
          </button>
        </div>
      ) : (
        <div className={styles.inputArea}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputValue)}
              placeholder={t('placeholder')}
              className={styles.input}
              disabled={loading}
            />
            <VoiceInput onVoiceInput={sendMessage} language={language} disabled={loading} />
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || loading}
              className={styles.sendButton}
              aria-label="Send"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
