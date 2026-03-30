import type { StreamChunkDto } from '../api/type';

export async function* parseSSEStream(stream: ReadableStream<Uint8Array>): AsyncGenerator<string, void, unknown> {
  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        if (part.startsWith('data: ')) {
          const jsonStr = part.replace('data: ', '').trim();

          if (!jsonStr || jsonStr === '[DONE]') continue;

          try {
            const data = JSON.parse(jsonStr) as StreamChunkDto;

            if (data.error) {
              throw new Error(data.error);
            }
            const content = data.content || data.Content;

            if (content) {
              yield content;
            }
          } catch (e) {
            if (e instanceof Error && !e.message.includes('JSON')) {
              throw e;
            }
            console.warn('Skipping invalid JSON chunk', e);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}