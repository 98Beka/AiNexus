import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

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
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/v1/authentication/`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('ainexus_token')
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthenticateResponse, LoginRequest>({
      query: (credentials) => ({
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
