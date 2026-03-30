import { httpClient } from '@/shared/api/http-client'; // Импорт обертки
import type { MessageSendRequest, TestStartRequest } from './type';

export async function fetchChatStream(message: MessageSendRequest): Promise<ReadableStream<Uint8Array>> {
  console.log("message:", message)
  const response = await httpClient('/Chats/stream', {
    method: 'POST',
    headers: {
      'Accept': 'text/event-stream',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`Chat API Error: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('ReadableStream not supported');
  }

  return response.body;
}

export async function startTestStream(request: TestStartRequest): Promise<ReadableStream<Uint8Array>> {
  const response = await httpClient('/Chats/start_test', {
    method: 'POST',
    headers: {
      'Accept': 'text/event-stream',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Start Test API Error: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('ReadableStream not supported');
  }

  return response.body;
}