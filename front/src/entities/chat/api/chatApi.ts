import { createBaseQuery } from '@/entities/shared/api/baseApi';
import { createApi} from '@reduxjs/toolkit/query/react';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: createBaseQuery({
      baseUrl: `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'}/api/Chats`,
    }),
  endpoints: (builder) => ({
    getAccessToken: builder.query<any, string>({
      query: (testToken) => ({
        url: `access_token/${testToken}`
      }),
    }),
  }),
});

export const { useGetAccessTokenQuery } = chatApi;