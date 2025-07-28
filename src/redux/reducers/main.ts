import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface MainState {
    currentlyPlaying: string
}

const initialState: MainState = {
    currentlyPlaying: ''
}

const mainSlice = createSlice({
    name: 'main',
    initialState,
    reducers: {
        setCurrentlyPlaying: (state, action: PayloadAction<any>) => {
            state.currentlyPlaying = action.payload
        },
    },
})

export const { setCurrentlyPlaying } = mainSlice.actions
export default mainSlice.reducer