import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface MainState {
    currentlyPlaying: any,
    currentSeriesEpisodes: any,
    playingChannel: boolean,
}

const initialState: MainState = {
    currentlyPlaying: '',
    currentSeriesEpisodes: [],
    playingChannel: false,
}

const mainSlice = createSlice({
    name: 'main',
    initialState,
    reducers: {
        setCurrentlyPlaying: (state, action: PayloadAction<any>) => {
            state.currentlyPlaying = action.payload
        },
        setCurrentSeriesEpisodes: (state, action: PayloadAction<any>) => {
            state.currentSeriesEpisodes = action.payload
        },
        setPlayingChannel: (state, action: PayloadAction<boolean>) => {
            state.playingChannel = action.payload
        },
    },
})

export const { setCurrentlyPlaying, setCurrentSeriesEpisodes, setPlayingChannel } = mainSlice.actions
export default mainSlice.reducer