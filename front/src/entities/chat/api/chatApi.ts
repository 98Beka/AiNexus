import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/chats/' }),
  endpoints: (builder) => ({
    getAccessToken: builder.query<string, string>({
      query: (testToken) => ({
        url: `access_token/${testToken}`
      }),
    }),
  }),
});

export const { useGetAccessTokenQuery } = chatApi;