import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { authApi } from './authApi'
import type { AuthenticateResponse, MyAccountInfo } from './authApi'

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: MyAccountInfo | null
  status: 'idle' | 'authenticated' | 'unauthenticated'
}

const initialState: AuthState = {
  token: localStorage.getItem('ainexus_token'),
  refreshToken: localStorage.getItem('ainexus_refresh_token'),
  user: null,
  status: localStorage.getItem('ainexus_token') ? 'authenticated' : 'unauthenticated',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthenticateResponse>) => {
      state.token = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.user = {
        id: action.payload.id,
        surname: action.payload.surname,
        name: action.payload.name,
        patronymic: action.payload.patronymic,
        email: action.payload.email,
        role: action.payload.role,
      }
      state.status = 'authenticated'
      localStorage.setItem('ainexus_token', action.payload.accessToken)
      localStorage.setItem('ainexus_refresh_token', action.payload.refreshToken)
    },
    logout: (state) => {
      state.token = null
      state.refreshToken = null
      state.user = null
      state.status = 'unauthenticated'
      localStorage.removeItem('ainexus_token')
      localStorage.removeItem('ainexus_refresh_token')
    },
    setMyAccount: (state, action: PayloadAction<MyAccountInfo>) => {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
      state.token = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.user = {
        id: action.payload.id,
        surname: action.payload.surname,
        name: action.payload.name,
        patronymic: action.payload.patronymic,
        email: action.payload.email,
        role: action.payload.role,
      }
      state.status = 'authenticated'
      localStorage.setItem('ainexus_token', action.payload.accessToken)
      localStorage.setItem('ainexus_refresh_token', action.payload.refreshToken)
    })
  },
})

export const { setCredentials, logout, setMyAccount } = authSlice.actions

export default authSlice.reducer
