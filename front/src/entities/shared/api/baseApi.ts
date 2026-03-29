import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

/**
 * Interface для конфигурации token источника
 */
export interface TokenProvider {
  getToken: () => string | null
  setToken: (token: string) => void
  clearToken: () => void
}

/**
 * Default token provider использующий localStorage
 */
export const defaultTokenProvider: TokenProvider = {
  getToken: () => localStorage.getItem('ainexus_token'),
  setToken: (token: string) => localStorage.setItem('ainexus_token', token),
  clearToken: () => localStorage.removeItem('ainexus_token'),
}

/**
 * Конфигурация для базового API
 */
export interface BaseApiConfig {
  baseUrl?: string
  tokenProvider?: TokenProvider
  prepareHeaders?: (
    headers: Headers,
    token: string | null
  ) => Headers | PromiseLike<Headers>
}

/**
 * Создает базовый query с инъекцией зависимостей
 */
export const createBaseQuery = (config?: BaseApiConfig) => {
  const {
    baseUrl = `${API_BASE_URL}/api/v1`,
    tokenProvider = defaultTokenProvider,
    prepareHeaders,
  } = config || {}

  return fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = tokenProvider.getToken()

      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      if (prepareHeaders) {
        return prepareHeaders(headers, token)
      }

      return headers
    },
  })
}

/**
 * Простой helper для получения token из localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('ainexus_token')
}

/**
 * Простой helper для удаления token
 */
export const clearAuthToken = (): void => {
  localStorage.removeItem('ainexus_token')
}
