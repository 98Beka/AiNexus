import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '@/app/store';
import { streamChatRequest, streamStartTestRequest } from '../api';
import {
    appendResponseChunk,
    finishGeneration,
    setGenerationError,
    initMessageGeneration,
    addUserMessage,
    clearMessages
} from '@/entities/chat/model/slice';
import type { MessageSendRequest, TestStartRequest } from '../api/type';

async function consumeStream(message: MessageSendRequest, dispatch: AppDispatch) {
  for await (const chunk of streamChatRequest(message)) {
    dispatch(appendResponseChunk(chunk));
  }
}

async function consumeStartTestStream(request: TestStartRequest, dispatch: AppDispatch) {
  for await (const chunk of streamStartTestRequest(request)) {
    dispatch(appendResponseChunk(chunk));
  }
}

export const initChat = createAsyncThunk<
  void,
  { sessionId: string; topicId: number },
  { state: RootState; dispatch: AppDispatch }
>(
  'chat/sendMessage',
  async ({ sessionId, topicId }, { dispatch }) => {
    const startTestRequest: TestStartRequest = {
      SessionId: sessionId,
      TopicId: topicId,
    };

    try {
      dispatch(clearMessages());
      dispatch(initMessageGeneration());

      await consumeStartTestStream(startTestRequest, dispatch);

      dispatch(finishGeneration());
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'unknown error';
      dispatch(setGenerationError(errorMessage));
    }
  }
);

export const sendMessage = createAsyncThunk<void, string, { state: RootState; dispatch: AppDispatch }>(
  'chat/sendMessage',
  async (userText, { dispatch }) => {

    const sessionId = "";
    const userMsg = { sessionId: sessionId, content: userText } as MessageSendRequest;

    try {
      dispatch(addUserMessage(userText))
      dispatch(initMessageGeneration());
      await consumeStream(userMsg, dispatch);
      
      dispatch(finishGeneration());
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'unkown error'
      dispatch(setGenerationError(errorMessage));
    }
  }
);
