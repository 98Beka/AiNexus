import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ChatState } from './types';

const initialState: ChatState = {
  messages: [],
  isStreaming: false,
  error: null,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
      state.error = null;
      state.isStreaming = false;
    },
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({ role: 'user', content: action.payload });
    },
    initMessageGeneration: (state) => {
      state.isStreaming = true;
      state.error = null;
      state.messages.push({ role: 'assistant', content: '' });
    },
    appendResponseChunk: (state, action: PayloadAction<string>) => {
      const lastMsg = state.messages[state.messages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant') {
        lastMsg.content += action.payload;
      }
    },
    finishGeneration: (state) => {
      state.isStreaming = false;
    },
    setGenerationError: (state, action: PayloadAction<string>) => {
      state.isStreaming = false;
      state.error = action.payload;
      const lastMsg = state.messages[state.messages.length - 1];
      if (lastMsg && lastMsg.role === 'assistant') {
        lastMsg.content += `\n[Ошибка: ${action.payload}]`;
      }
    }
  },
});

export const {
  initMessageGeneration,
  appendResponseChunk,
  finishGeneration,
  setGenerationError,
  addUserMessage,
  clearMessages
} = chatSlice.actions;

export default chatSlice.reducer;