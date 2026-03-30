import type { MessageSendRequest } from "./type";

export async function fetchChatStream(
  accessToken: string,
  message: MessageSendRequest
): Promise<ReadableStream<Uint8Array>> {

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/Chats/stream`, {
    method: 'POST',
    headers: {
      'Accept': 'text/event-stream',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
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