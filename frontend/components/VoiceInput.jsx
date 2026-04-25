import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/VoiceInput.module.css';

/**
 * Web Speech API → fills the chat input as you speak.
 * Click to start, click again to stop. The user reviews and presses Send.
 */
export default function VoiceInput({ onTranscript, language = 'en', disabled }) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);
  const finalTextRef = useRef('');

  useEffect(() => {
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) setSupported(false);
  }, []);

  const stop = () => {
    try { recognitionRef.current?.stop(); } catch {}
    setIsListening(false);
  };

  const start = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SR();
    const languageMap = { en: 'en-US', hi: 'hi-IN', kn: 'kn-IN' };
    recognition.lang = languageMap[language] || 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    finalTextRef.current = '';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTextRef.current += piece + ' ';
        } else {
          interim += piece;
        }
      }
      const live = (finalTextRef.current + interim).trim();
      if (live) onTranscript(live);
    };

    recognition.onerror = (event) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        console.error('Speech error:', event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error('Could not start recognition:', e);
    }
  };

  const toggle = () => (isListening ? stop() : start());

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      className={`${styles.voiceButton} ${isListening ? styles.listening : ''}`}
      title={isListening ? 'Stop listening' : 'Speak'}
      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
    >
      {isListening ? '⏹' : '🎤'}
    </button>
  );
}
