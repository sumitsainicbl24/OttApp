import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface MainState {
    currentlyPlaying: any,
    currentSeriesEpisodes: any,
}

const initialState: MainState = {
    currentlyPlaying: '',
    currentSeriesEpisodes: []
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
    },
})

export const { setCurrentlyPlaying, setCurrentSeriesEpisodes } = mainSlice.actions
export default mainSlice.reducer