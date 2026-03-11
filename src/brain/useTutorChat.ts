/**
 * ENG-014: React hook for Claude-powered tutor.
 * Sends messages to /api/chat, parses SSE, dispatches TUTOR_RESPONSE and SET_LOADING.
 */

import { useCallback, useRef } from 'react';
import type { LessonState, LessonAction } from '../state/types';
import type { ChatMessage } from '../state/types';

const MAX_HISTORY_MESSAGES = 20;
const FRIENDLY_ERROR =
  "Hmm, my magic fizzled! Let's try that again.";

function buildMessageHistory(
  chatMessages: ChatMessage[],
  newMessage: string
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const messages = chatMessages
    .slice(-MAX_HISTORY_MESSAGES)
    .map((msg) => ({
      role: (msg.sender === 'student' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.content,
    }));
  messages.push({ role: 'user', content: newMessage });
  return messages;
}

const WORKSPACE_DEBOUNCE_MS = 500;

export function useTutorChat(
  state: LessonState,
  dispatch: React.Dispatch<LessonAction>
): {
  sendMessage: (text: string) => void;
  notifySam: (description: string) => void;
  isLoading: boolean;
} {
  const isStreamingRef = useRef(false);
  const pendingContextRef = useRef<string[]>([]);
  const autoSendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      if (isStreamingRef.current) return;
      isStreamingRef.current = true;

      dispatch({ type: 'STUDENT_RESPONSE', value: text });
      dispatch({ type: 'SET_LOADING', loading: true });

      let accumulatedContent = '';

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: buildMessageHistory(state.chatMessages, text),
            lessonState: state,
          }),
        });

        if (!response.ok || !response.body) {
          dispatch({
            type: 'TUTOR_RESPONSE',
            content: FRIENDLY_ERROR,
            isStreaming: false,
          });
          dispatch({ type: 'SET_LOADING', loading: false });
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let currentEvent: string | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith('data: ') && currentEvent) {
              try {
                const data = JSON.parse(line.slice(6)) as Record<string, unknown>;
                switch (currentEvent) {
                  case 'text_delta': {
                    const content = (data.content as string) ?? '';
                    accumulatedContent += content;
                    dispatch({
                      type: 'TUTOR_RESPONSE',
                      content: accumulatedContent,
                      isStreaming: true,
                    });
                    break;
                  }
                  case 'tool_use':
                    console.debug('[useTutorChat] tool_use:', data.name, data.input);
                    break;
                  case 'tool_result':
                    console.debug('[useTutorChat] tool_result:', data.id, data.result);
                    break;
                  case 'done':
                    dispatch({
                      type: 'TUTOR_RESPONSE',
                      content: accumulatedContent,
                      isStreaming: false,
                    });
                    dispatch({ type: 'SET_LOADING', loading: false });
                    break;
                  case 'error': {
                    const message = (data.message as string) ?? FRIENDLY_ERROR;
                    dispatch({
                      type: 'TUTOR_RESPONSE',
                      content: message,
                      isStreaming: false,
                    });
                    dispatch({ type: 'SET_LOADING', loading: false });
                    break;
                  }
                  default:
                    break;
                }
              } catch {
                // ignore parse errors for single line
              }
              currentEvent = null;
            }
          }
        }

        if (currentEvent === null && !accumulatedContent) {
          dispatch({
            type: 'TUTOR_RESPONSE',
            content: FRIENDLY_ERROR,
            isStreaming: false,
          });
        }
        if (accumulatedContent) {
          dispatch({
            type: 'TUTOR_RESPONSE',
            content: accumulatedContent,
            isStreaming: false,
          });
        }
        dispatch({ type: 'SET_LOADING', loading: false });
      } catch {
        dispatch({
          type: 'TUTOR_RESPONSE',
          content: FRIENDLY_ERROR,
          isStreaming: false,
        });
        dispatch({ type: 'SET_LOADING', loading: false });
      } finally {
        isStreamingRef.current = false;
      }
    },
    [state, dispatch]
  );

  const notifySam = useCallback(
    (description: string) => {
      pendingContextRef.current.push(description);
      if (autoSendTimerRef.current !== null) {
        clearTimeout(autoSendTimerRef.current);
      }
      autoSendTimerRef.current = setTimeout(() => {
        const context = pendingContextRef.current.join('. ');
        pendingContextRef.current = [];
        autoSendTimerRef.current = null;
        if (context) sendMessage(`[${context}]`);
      }, WORKSPACE_DEBOUNCE_MS);
    },
    [sendMessage]
  );

  return {
    sendMessage,
    notifySam,
    isLoading: state.isLoading,
  };
}
