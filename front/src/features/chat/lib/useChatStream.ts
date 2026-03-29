import { useState, useRef, useCallback } from 'react';
import { fetchPostSSE } from '@/shared/api/sseFetch';
import type { Message } from '@/entities/chat/model/types';

export const useChatStream = (jwtToken?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStream, setCurrentStream] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const sessionId = useRef<string>(crypto.randomUUID()); // Генерация SessionId на фронте

  const startTest = useCallback(async () => {
    if (!jwtToken) return;
    setIsStreaming(true);
    setCurrentStream('');

    await fetchPostSSE(
      '/api/chats/start_test',
      { sessionId: sessionId.current },
      jwtToken,
      (chunk) => setCurrentStream((prev) => prev + chunk),
      () => {
        setIsStreaming(false);
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: setCurrentStreamValue() }
        ]);
        setCurrentStream('');
      },
      (error) => {
        console.error(error);
        setIsStreaming(false);
      }
    );
  }, [jwtToken]);

  const sendMessage = useCallback(async (content: string) => {
    if (!jwtToken || !content.trim()) return;

    // Добавляем сообщение пользователя в UI
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content }
    ]);
    
    setIsStreaming(true);
    setCurrentStream('');

    await fetchPostSSE(
      '/api/chats/stream',
      { sessionId: sessionId.current, content },
      jwtToken,
      (chunk) => setCurrentStream((prev) => prev + chunk),
      () => {
        setIsStreaming(false);
        setMessages((prev) => {
          // Трюк для получения актуального стейта currentStream в callback
          let finalContent = '';
          setCurrentStream((streamVal) => {
            finalContent = streamVal;
            return streamVal;
          });
          return [...prev, { id: crypto.randomUUID(), role: 'assistant', content: finalContent }];
        });
        setCurrentStream('');
      },
      (error) => {
        console.error(error);
        setIsStreaming(false);
      }
    );
  }, [jwtToken]);

  // Вспомогательная функция для startTest
  let tempStream = '';
  const setCurrentStreamValue = () => tempStream;
  
  // Переопределяем setState для перехвата значения (хак для замыканий)
  const safeSetCurrentStream = (val: any) => {
    setCurrentStream((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      tempStream = next;
      return next;
    });
  };

  return {
    messages,
    currentStream,
    isStreaming,
    startTest,
    sendMessage,
    setCurrentStream: safeSetCurrentStream 
  };
};