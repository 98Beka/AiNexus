import { fetchChatStream, startTestStream } from './chatApiStream';
import { parseSSEStream } from '../lib/sse-parser';
import type { MessageSendRequest, TestStartRequest } from './type';

export async function* streamChatRequest(message: MessageSendRequest) {
  const stream = await fetchChatStream(message);
  yield* parseSSEStream(stream);
}

export async function* streamStartTestRequest(request: TestStartRequest) {
  const stream = await startTestStream(request);
  yield* parseSSEStream(stream);
}