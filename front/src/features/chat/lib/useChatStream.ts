import { useState, useRef, useCallback } from 'react';
import type { Message } from '@/entities/chat/model/types';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import { generateId } from '@/shared/utils/const';

export const fetchPostSSE = async (
  url: string,
  body: any,
  jwtToken: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (err: any) => void
) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.body) throw new Error('ReadableStream not supported');

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop()!;

      for (const line of lines) {
        if (!line.startsWith('data:')) continue;

        const jsonStr = line.replace(/^data:\s*/, '');
        if (!jsonStr) continue;

        try {
          const data = JSON.parse(jsonStr);
          if (data.Content) onChunk(data.Content);
        } catch (err) {
          console.error('SSE parse error', err);
        }
      }
    }

    if (buffer.trim()) {
      try {
        const data = JSON.parse(buffer.replace(/^data:\s*/, ''));
        if (data.Content) onChunk(data.Content);
      } catch {}
    }

    onComplete();

  } catch (err) {
    onError(err);
  }
};

export const useChatStream = (jwtToken?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStream, setCurrentStream] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const currentStreamRef = useRef<string>('');

  const updateStream = useCallback((chunk: string) => {
    setCurrentStream((prev) => {
      const next = prev + chunk;
      currentStreamRef.current = next;
      return next;
    });
  }, []);

  const resetStream = useCallback(() => {
    currentStreamRef.current = '';
    setCurrentStream('');
  }, []);

  const commitAssistantMessage = useCallback(() => {
    const content = currentStreamRef.current;
    if (!content) return;

    setMessages((prev) => [
      ...prev,
      { id: generateId(), role: 'assistant', content },
    ]);
    resetStream();
  }, [resetStream]);

  const sendMessage = useCallback(async (content: string) => {
    if (!jwtToken || !content.trim()) return;

    const sessionId = useSelector((state:RootState) => state.session.sessionId)

    setMessages((prev) => [
      ...prev,
      { id: generateId(), role: 'user', content },
    ]);

    setIsStreaming(true);
    resetStream();

    await fetchPostSSE(
      `${import.meta.env.VITE_API_BASE_URL}/api/Chats/stream`,
      { sessionId: sessionId, content },
      jwtToken,
      updateStream,
      () => {
        commitAssistantMessage();
        setIsStreaming(false);
      },
      (error) => {
        console.error(error);
        setIsStreaming(false);
      }
    );
  }, [jwtToken, updateStream, commitAssistantMessage, resetStream]);

  return { messages, currentStream, isStreaming, sendMessage};
};