import { apiGet, apiPost } from "../../utils/utils"
import { setAuthToken, setIsPlaylistProcessed, setSeriesData, setUserData, setMoviesData, setChannelsData } from "../reducers/auth"
import { store } from "../store"

import { CategoryDataUrl, categoryUrl, fetchMedia, getPlaylistData, loginUrl, searchUrl, ShowDetailsApi, TMDBBaseUrl } from "../../config/urls"
import { saveChannelsDataToMMKV, saveMoviesDataToMMKV, saveSeriesDataToMMKV } from "../../localStorage/mmkv"

const {dispatch} = store

//api
const apiKeyForShowDetails = "79c065d3";

const apiKeyTMDB= "ab0623f200520bab43cd0b39873cbad8";


export const getShowDetailsApi = async (title: string, season?: number, episode?: number) => {

    if(season && episode){                          
        const response = await apiGet(`${ShowDetailsApi}/?t=${encodeURIComponent(title)}&Season=${season}&Episode=${episode}&apikey=${apiKeyForShowDetails}`);
        return response;
    }else{
        const response = await apiGet(`${ShowDetailsApi}/?t=${encodeURIComponent(title)}&apikey=${apiKeyForShowDetails}`);
        return response;
    }
}

export const getShowDetailsApiTMDB = async (title: string, season?: number, episode?: number) => {
    
    if(season && episode){
        // For TV shows with specific season/episode, use TV search first then get season details
        const searchResponse = await apiGet(`${TMDBBaseUrl}/search/tv?api_key=${apiKeyTMDB}&query=${encodeURIComponent(title)}`);
        return searchResponse;
    }else{
        // For movies or general TV show search
        const movieResponse = await apiGet(`${TMDBBaseUrl}/search/multi?api_key=${apiKeyTMDB}&query=${encodeURIComponent(title)}`);
        return movieResponse;
    }
}

export const getMovieDetailsWithTMDB_ID = async (id: string) => {
    const response = await apiGet(`${TMDBBaseUrl}/movie/${id}?api_key=${apiKeyTMDB}`);
    return response;
}

export const getMovieCastAndCrewWithTMDB_ID = async (id: string) => {
    const response = await apiGet(`${TMDBBaseUrl}/movie/${id}/credits?api_key=${apiKeyTMDB}`);
    return response;
}


export const getSearchData = async (type: string, title: string) => {
    const response = await apiGet(`${searchUrl}?type=${type}&query=${encodeURIComponent(title)}`);
    return response;
}