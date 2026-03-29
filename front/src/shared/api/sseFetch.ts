// Утилита для обработки Server-Sent Events через POST запрос
export const fetchPostSSE = async (
  url: string,
  body: Record<string, any>,
  token: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok || !response.body) {
      throw new Error('Failed to connect to stream');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      
      // Оставляем последний (возможно неполный) кусок в буфере
      buffer = parts.pop() || '';

      for (const part of parts) {
        if (part.startsWith('data: ')) {
          const jsonStr = part.replace('data: ', '');
          try {
            const data = JSON.parse(jsonStr);
            
            if (data.error) {
              onError(data.error);
              return;
            }

            // В C# используется System.Text.Json, обычно он выдает PascalCase или camelCase. 
            // Подстраиваемся под возможный camelCase (chunk, isComplete)
            if (data.isComplete || data.IsComplete) {
              onComplete();
            } else {
              onChunk(data.chunk || data.Chunk || '');
            }
          } catch (e) {
            console.error('Failed to parse SSE JSON', e);
          }
        }
      }
    }
  } catch (err: any) {
    onError(err.message);
  }
};