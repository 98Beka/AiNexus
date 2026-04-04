import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { type SessionState } from "./type"


const initialState: SessionState = {
    accessToken: "",
    sessionId: ""
}

const sessionSclice = createSlice({
    name: "session",
    initialState,
    reducers: {
        setAccessToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload
        },
        setSessionId: (state, action: PayloadAction<string>) => {
            state.sessionId = action.payload
        },
        clearSessionId: (state) => {
            state.sessionId = ""
        },
        clearAccessToken: (state) => {
            state.accessToken = ""
        }
    }
})


export const {setAccessToken, clearAccessToken, setSessionId, clearSessionId} = sessionSclice.actions
export const sessionReducer = sessionSclice.reducer