// src/entities/auth/authSlice.ts (рефакторинг-версия)

import { createSlice } from '@reduxjs/toolkit'
import { authApi } from './authApi'

interface AuthState {
  token: string | null
  refreshToken: string | null
  status: 'idle' | 'authenticated' | 'unauthenticated'
}

const initialState: AuthState = {
  token: localStorage.getItem('ainexus_token'),
  refreshToken: localStorage.getItem('ainexus_refresh_token'),
  status: localStorage.getItem('ainexus_token') ? 'authenticated' : 'unauthenticated',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null
      state.refreshToken = null
      state.status = 'unauthenticated'
      localStorage.removeItem('ainexus_token')
      localStorage.removeItem('ainexus_refresh_token')
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
      state.token = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.status = 'authenticated'
      localStorage.setItem('ainexus_token', action.payload.accessToken)
      localStorage.setItem('ainexus_refresh_token', action.payload.refreshToken)
    })
    builder.addMatcher(authApi.endpoints.getMyAccount.matchRejected, (state, action) => {
      if (action.payload?.status === 401) {
        state.token = null
        state.refreshToken = null
        state.status = 'unauthenticated'
        localStorage.removeItem('ainexus_token')
        localStorage.removeItem('ainexus_refresh_token')
      }
    })
  },
})

export const { logout } = authSlice.actions

export default authSlice.reducer