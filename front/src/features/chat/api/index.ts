import { fetchChatStream, fetchInitChatStream } from './chatApiStream';
import { parseSSEStream } from '../lib/sse-parser';
import type { InitMessageSendRequest, MessageSendRequest } from './type';


export async function* streamInitChatRequest(access_jwt_token: string, message: InitMessageSendRequest) {
  const stream = await fetchInitChatStream(access_jwt_token, message);
  yield* parseSSEStream(stream);
}

export async function* streamChatRequest(access_jwt_token: string, message: MessageSendRequest) {
  const stream = await fetchChatStream(access_jwt_token, message);
  yield* parseSSEStream(stream);
}
