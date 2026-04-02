import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import authReducer from '../entities/auth/authSlice'
import { authApi } from '../entities/auth/authApi'
import { applicantApi } from '../entities/applicant/applicantApi'
import { chatApi } from '@/entities/chat/api/chatApi';
import chatReducer from '@/entities/chat/model/slice';
import { sessionReducer } from '@/entities/session/model/slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [applicantApi.reducerPath]: applicantApi.reducer,
    session: sessionReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, applicantApi.middleware, chatApi.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store;