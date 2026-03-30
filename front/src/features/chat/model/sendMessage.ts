import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '@/app/store';
import { streamChatRequest } from '../api';
import {
    appendResponseChunk,
    finishGeneration,
    setGenerationError,
    initMessageGeneration,
    addUserMessage
} from '@/entities/chat/model/slice';
import type { MessageSendRequest } from '../api/type';



async function consumeStream(
  accessToken: string,
  message: MessageSendRequest,
  dispatch: AppDispatch
) {
  for await (const chunk of streamChatRequest(accessToken, message)) {
    dispatch(appendResponseChunk(chunk));
  }
}


export const sendMessage = createAsyncThunk<
  void,
  { message: string },
  { state: RootState; dispatch: AppDispatch }
>(
  'chat/sendMessage',
  async ({ message }, { dispatch, getState }) => {
    
    const accessToken = getState().session.accessToken;
    const sessionId = getState().session.sessionId;
    const userMsg = { SessionId:sessionId, content: message } as MessageSendRequest;

    if (!accessToken) {
      dispatch(setGenerationError('No access token'));
      return;
    }

    try {
      dispatch(addUserMessage(message));
      dispatch(initMessageGeneration());

      await consumeStream(accessToken, userMsg, dispatch);

      dispatch(finishGeneration());
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'unknown error';

      dispatch(setGenerationError(errorMessage));
    }
  }
);
