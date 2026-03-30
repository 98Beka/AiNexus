import { fetchChatStream } from './chatApiStream';
import { parseSSEStream } from '../lib/sse-parser';
import type { MessageSendRequest } from './type';

export async function* streamChatRequest(access_jwt_token: string, message: MessageSendRequest) {
  const stream = await fetchChatStream(access_jwt_token, message);
  yield* parseSSEStream(stream);
}
