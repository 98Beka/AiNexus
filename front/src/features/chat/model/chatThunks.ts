import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '@/app/store';
import { streamChatRequest, streamInitChatRequest } from '../api';
import {
    appendResponseChunk,
    finishGeneration,
    setGenerationError,
    initMessageGeneration,
    addUserMessage
} from '@/entities/chat/model/slice';
import type { InitMessageSendRequest, MessageSendRequest } from '../api/type';


export const initChatStream = createAsyncThunk<
  void,
  void,
  { state: RootState; dispatch: AppDispatch }
>(
  'chat/sendMessage',
  async (_, { dispatch, getState }) => {
    const chatState = getState().chat;
    if (chatState.isStreaming) return;

    const accessToken = getState().session.accessToken;
    const sessionId = getState().session.sessionId;
    const msgRequest = { SessionId:sessionId } as InitMessageSendRequest;

    if (!accessToken) {
      dispatch(setGenerationError('No access token'));
      return;
    }

    try {
      dispatch(initMessageGeneration());
      for await (const chunk of streamInitChatRequest(accessToken, msgRequest)) {
        dispatch(appendResponseChunk(chunk));
      }

      dispatch(finishGeneration());
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'unknown error';

      dispatch(setGenerationError(errorMessage));
    }
  }
);


export const sendMessageStream = createAsyncThunk<
  void,
  { message: string },
  { state: RootState; dispatch: AppDispatch }
>(
  'chat/sendMessage',
  async ({ message }, { dispatch, getState }) => {
    const chatState = getState().chat;
    if (chatState.isStreaming) return;

    const accessToken = getState().session.accessToken;
    const sessionId = getState().session.sessionId;
    const msgRequest = { SessionId:sessionId, content: message } as MessageSendRequest;

    if (!accessToken) {
      dispatch(setGenerationError('No access token'));
      return;
    }

    try {
      dispatch(addUserMessage(message));
      dispatch(initMessageGeneration());

      for await (const chunk of streamChatRequest(accessToken, msgRequest)) {
        dispatch(appendResponseChunk(chunk));
      }

      dispatch(finishGeneration());
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'unknown error';

      dispatch(setGenerationError(errorMessage));
    }
  }
);
