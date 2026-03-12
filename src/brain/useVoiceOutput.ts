/**
 * ENG-042: React hook wrapping SpeechSynthesis API for text-to-speech.
 * Reads Sam's tutor messages aloud with child-friendly voice settings.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseVoiceOutputReturn {
  /** Whether the browser supports speech synthesis */
  supported: boolean;
  /** Whether voice output is enabled */
  enabled: boolean;
  /** Toggle voice output on/off */
  toggleEnabled: () => void;
  /** Speak text aloud. Cancels any in-progress speech. */
  speak: (text: string) => void;
  /** Stop any in-progress speech */
  stop: () => void;
  /** Whether currently speaking */
  isSpeaking: boolean;
}

function cleanForSpeech(text: string): string {
  let cleaned = text;
  // Strip markdown bold/italic
  cleaned = cleaned.replace(/\*+/g, '');
  // Strip underscores (markdown italic)
  cleaned = cleaned.replace(/_+/g, '');
  // Replace common fractions with spoken form
  cleaned = cleaned.replace(/\b1\/2\b/g, 'one half');
  cleaned = cleaned.replace(/\b1\/3\b/g, 'one third');
  cleaned = cleaned.replace(/\b2\/3\b/g, 'two thirds');
  cleaned = cleaned.replace(/\b1\/4\b/g, 'one quarter');
  cleaned = cleaned.replace(/\b3\/4\b/g, 'three quarters');
  cleaned = cleaned.replace(/\b2\/4\b/g, 'two fourths');
  cleaned = cleaned.replace(/\b3\/6\b/g, 'three sixths');
  cleaned = cleaned.replace(/\b2\/6\b/g, 'two sixths');
  cleaned = cleaned.replace(/\b6\/8\b/g, 'six eighths');
  // Generic fraction fallback: n/d → "n over d"
  cleaned = cleaned.replace(/\b(\d+)\/(\d+)\b/g, '$1 over $2');
  return cleaned.trim();
}

export function useVoiceOutput(): UseVoiceOutputReturn {
  const [supported] = useState(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window
  );
  const [enabled, setEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (!supported) return;
    const pickVoice = () => {
      const voices = speechSynthesis.getVoices();
      voiceRef.current =
        voices.find((v) => v.name === 'Samantha') ??
        voices.find((v) => v.lang === 'en-US') ??
        voices.find((v) => v.lang.startsWith('en')) ??
        null;
    };
    pickVoice();
    speechSynthesis.addEventListener('voiceschanged', pickVoice);
    return () => speechSynthesis.removeEventListener('voiceschanged', pickVoice);
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !enabled) return;
      speechSynthesis.cancel();

      const cleaned = cleanForSpeech(text);
      if (!cleaned) return;

      const utterance = new SpeechSynthesisUtterance(cleaned);
      if (voiceRef.current) {
        utterance.voice = voiceRef.current;
      }
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      speechSynthesis.speak(utterance);
    },
    [supported, enabled]
  );

  const stop = useCallback(() => {
    if (!supported) return;
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [supported]);

  const toggleEnabled = useCallback(() => {
    setEnabled((prev) => {
      if (prev) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return !prev;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (supported) {
        speechSynthesis.cancel();
      }
    };
  }, [supported]);

  return {
    supported,
    enabled,
    toggleEnabled,
    speak,
    stop,
    isSpeaking,
  };
}
