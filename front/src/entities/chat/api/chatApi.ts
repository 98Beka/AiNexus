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
    })
  }),
});

export const { useGetAccessTokenQuery} = chatApi;