import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { User } from '../../constants/commonTypes'

interface AuthState {
    user: User | null
    auth_token: string
    isplaylistprocessed: boolean
    seriesData: any
    moviesData: any
    channelsData: any
}

const initialState: AuthState = {
    user: null,
    auth_token: '',
    isplaylistprocessed: false,
    seriesData: null,
    moviesData: null,
    channelsData: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUserData: (state, action: PayloadAction<User>) => {
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
        setMoviesData: (state, action: PayloadAction<any>) => {
            state.moviesData = action.payload
        },
        setChannelsData: (state, action: PayloadAction<any>) => {
            state.channelsData = action.payload
        },
    },
})

export const { setUserData, setAuthToken, setIsPlaylistProcessed, setSeriesData, setMoviesData, setChannelsData } = authSlice.actions
export default authSlice.reducer