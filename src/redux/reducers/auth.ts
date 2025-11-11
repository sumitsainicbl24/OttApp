import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface AuthState {
    user: any
    auth_token: string
    isplaylistprocessed: boolean
    seriesData: any
    moviesData: string[]
    channelsData: any
    userToken: string
    heavyData: any
}

const initialState: AuthState = {
    user: null,
    auth_token: '',
    isplaylistprocessed: false,
    seriesData: null,
    moviesData: [],
    channelsData: null,
    userToken: '',
    heavyData: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUserData: (state, action: PayloadAction<any>) => {
            state.user = action.payload
        },
        setAuthToken: (state, action: PayloadAction<string>) => {
            state.auth_token = action.payload
        },
        setIsPlaylistProcessed: (state, action: PayloadAction<boolean>) => {
            state.isplaylistprocessed = action.payload
        },
        setSeriesData: (state, action: PayloadAction<any>) => {
            state.seriesData = action.payload
        },
        setMoviesData: (state, action: PayloadAction<string[]>) => {
            state.moviesData = action.payload
        },
        setChannelsData: (state, action: PayloadAction<any>) => {
            state.channelsData = action.payload
        },
        setUserToken: (state, action: PayloadAction<string>) => {
            state.userToken = action.payload
        },
        setHeavyData: (state, action: PayloadAction<any>) => {
            state.heavyData = action.payload
        },
    },
})

export const { setUserData, setAuthToken, setIsPlaylistProcessed, setSeriesData, setMoviesData, setChannelsData, setUserToken, setHeavyData } = authSlice.actions
export default authSlice.reducer