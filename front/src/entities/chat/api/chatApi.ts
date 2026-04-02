import { createBaseQuery } from '@/entities/shared/api/baseApi';
import { createApi} from '@reduxjs/toolkit/query/react';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: createBaseQuery({
      baseUrl: `${import.meta.env.VITE_API_BASE_URL}`,
    }),
  endpoints: (builder) => ({
    getAccessToken: builder.query<any, string>({
      query: (testToken) => ({
        url: `/api/Chats/access_token/${testToken}`
      }),
    }),
    initializeTest: builder.mutation<void, { chatSessionId: any }>({
      query: (body) => ({ url: '/api/v1/test/initialize', method: 'POST', body }),
    }),
    finishTest: builder.mutation<void, undefined>({
      query: () => ({ url: '/api/v1/test/finish', method: 'POST' }),
    }),
  }),
});

export const { useGetAccessTokenQuery} = chatApi;