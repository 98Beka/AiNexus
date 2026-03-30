import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { type SessionState } from "./type"


const initialState: SessionState = {
    accessToken: null
}

const sessionSclice = createSlice({
    name: "session",
    initialState,
    reducers: {
        setAccessToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload
        },
        clearAccessToken: (state) => {
            state.accessToken = null
        }
    }
})


export const {setAccessToken, clearAccessToken} = sessionSclice.actions
export const sessionReducer = sessionSclice.reducer