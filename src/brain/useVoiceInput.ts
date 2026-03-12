/**
 * ENG-041: React hook wrapping Web Speech API (webkitSpeechRecognition) for speech-to-text.
 * iPad Safari uses webkit prefix; Chrome uses unprefixed SpeechRecognition.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseVoiceInputReturn {
  /** Whether the browser supports speech recognition */
  supported: boolean;
  /** Whether currently recording */
  isListening: boolean;
  /** Interim transcript (updates as user speaks) */
  transcript: string;
  /** Start listening — triggers mic permission on first call */
  startListening: () => void;
  /** Stop listening manually (auto-stops on silence too) */
  stopListening: () => void;
  /** Last error message, if any */
  error: string | null;
}

const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed':
    "Microphone access denied. Tap the mic icon in Safari's address bar to allow.",
  network: 'Voice input needs an internet connection.',
  'no-speech': '',
  aborted: '',
};

function getErrorMessage(errorCode: string): string | null {
  const msg = ERROR_MESSAGES[errorCode];
  if (msg === '') return null;
  return msg ?? "Voice input isn't available right now. Try typing instead.";
}

export function useVoiceInput(
  onResult: (transcript: string) => void
): UseVoiceInputReturn {
  const SpeechRecognitionCtor =
    typeof window !== 'undefined'
      ? window.webkitSpeechRecognition ?? window.SpeechRecognition
      : undefined;

  const supported = !!SpeechRecognitionCtor;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const stopListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setTranscript('');
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognitionCtor) return;
    setError(null);
    setTranscript(''); // Clear previous final transcript

    const rec = new SpeechRecognitionCtor();
    recognitionRef.current = rec;

    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      const lastAlternative = lastResult[lastResult.length - 1];
      const text = lastAlternative?.transcript ?? '';

      if (lastResult.isFinal) {
        const trimmed = text.trim();
        if (trimmed) {
          onResult(trimmed);
          setTranscript(trimmed);
        }
      } else {
        setTranscript(text);
      }
    };

    rec.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
      // Keep transcript so InputField can sync; cleared on next startListening
    };

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errMsg = getErrorMessage(event.error);
      if (errMsg) {
        setError(errMsg);
      }
      recognitionRef.current = null;
      setIsListening(false);
      setTranscript('');
    };

    try {
      rec.start();
    } catch {
      setError("Voice input isn't available right now. Try typing instead.");
      setIsListening(false);
    }
  }, [SpeechRecognitionCtor, onResult]);

  useEffect(() => {
    return () => {
      const rec = recognitionRef.current;
      if (rec) {
        try {
          rec.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    supported,
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
  };
}
