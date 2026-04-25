import React, { useState } from 'react';
import styles from '../styles/VoiceInput.module.css';

/**
 * Voice Input Component
 * Web Speech API for voice-to-text
 */
export default function VoiceInput({ onVoiceInput, language = 'en', disabled }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = () => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in your browser');
      return;
    }

    const recognition = new SpeechRecognition();
    
    // Language mapping
    const languageMap = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'kn': 'kn-IN'
    };

    recognition.language = languageMap[language] || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          setTranscript(prev => prev + transcript);
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      alert(`Error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-send if transcript is available
      if (transcript.trim()) {
        onVoiceInput(transcript);
        setTranscript('');
      }
    };

    recognition.start();
  };

  return (
    <div className={styles.voiceInputContainer}>
      <button
        onClick={startListening}
        disabled={isListening || disabled}
        className={`${styles.voiceButton} ${isListening ? styles.listening : ''}`}
        title="Use voice input"
      >
        🎤 {isListening ? 'Listening...' : 'Voice'}
      </button>
      
      {transcript && (
        <span className={styles.transcript}>{transcript}</span>
      )}
    </div>
  );
}
