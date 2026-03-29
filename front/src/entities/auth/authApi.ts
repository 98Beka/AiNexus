import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '../shared/api/baseApi'

export type LoginRequest = { email: string; password: string }
export type AuthenticateResponse = {
  id: string
  accessToken: string
  refreshToken: string
  surname: string
  name: string
  patronymic?: string
  email: string
  role: string
}

export type MyAccountInfo = {
  id: string
  surname: string
  name: string
  patronymic?: string
  email: string
  role: string
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: createBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'}/api/v1/authentication`,
  }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthenticateResponse, LoginRequest>({
      query: (credentials: LoginRequest) => ({
        url: 'login',
        method: 'POST',
        body: { email: credentials.email, password: credentials.password },
      }),
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: 'logout',
        method: 'GET',
      }),
    }),
    getMyAccount: builder.query<MyAccountInfo, void>({
      query: () => ({
        url: 'get-my-account',
        method: 'GET',
      }),
    }),
  }),
})

export const { useLoginMutation, useLogoutMutation, useGetMyAccountQuery } = authApi
