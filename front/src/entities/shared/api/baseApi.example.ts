/**
 * Пример использования baseApi для создания новых API модулей
 * 
 * Мигрируйте существующие API endpoints, следуя этому паттерну
 */

import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from './baseApi'
import type { TokenProvider } from './baseApi'

// Пример 1: Использование с дефолтным token provider
export const exampleApi1 = createApi({
  reducerPath: 'exampleApi1',
  baseQuery: createBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'}/api/v1/example`,
  }),
  endpoints: (builder) => ({
    getExample: builder.query<any, void>({
      query: () => '/data',
    }),
  }),
})

// Пример 2: Использование с custom token provider
const customTokenProvider: TokenProvider = {
  getToken: () => localStorage.getItem('custom_token'),
  setToken: (token: string) => localStorage.setItem('custom_token', token),
  clearToken: () => localStorage.removeItem('custom_token'),
}

export const exampleApi2 = createApi({
  reducerPath: 'exampleApi2',
  baseQuery: createBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'}/api/v1/other`,
    tokenProvider: customTokenProvider,
  }),
  endpoints: (builder) => ({
    getOther: builder.query<any, void>({
      query: () => '/data',
    }),
  }),
})

// Пример 3: Использование с custom prepareHeaders
export const exampleApi3 = createApi({
  reducerPath: 'exampleApi3',
  baseQuery: createBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'}/api/v1/special`,
    prepareHeaders: (headers) => {
      // Добавьте custom headers
      headers.set('X-Custom-Header', 'custom-value')
      headers.set('X-API-Version', '2.0')
      return headers
    },
  }),
  endpoints: (builder) => ({
    getSpecial: builder.query<any, void>({
      query: () => '/data',
    }),
  }),
})
