import { apiGet, apiPost } from "../../utils/utils"
import { store } from "../store"

import { getSeriesEpisodesUrl, searchUrl, ShowDetailsApi, signInUrl, signupUrl, TMDBBaseUrl, verifyOtpUrl } from "../../config/urls"
import { getUserTokenLocalStorage, setUserDataLocalStorage, setUserTokenLocalStorage } from "../../localStorage/mmkv"
import { setUserData, setUserToken } from "../reducers/auth"

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

// for series show details
export const getSeriesShowDetailsWithTMDB = async (title: string) => {
    const response = await apiGet(`${TMDBBaseUrl}/search/tv?api_key=${apiKeyTMDB}&query=${encodeURIComponent(title)}`);
    return response?.data?.results[0]?.id;
}

export const getSeriesShowDetailsWithTMDB_ID = async (id: string) => {
    const response = await apiGet(`${TMDBBaseUrl}/tv/${id}?api_key=${apiKeyTMDB}`);
    return response;
}

export const getSeriesShowDetailsOMDB = async (title: string, season?: number, episode?: number) => {
    if(season && episode){
        const response = await apiGet(`${ShowDetailsApi}/?t=${encodeURIComponent(title)}&Season=${season}&Episode=${episode}&apikey=${apiKeyForShowDetails}`);
        return response;
    }else{
        const response = await apiGet(`${ShowDetailsApi}/?t=${encodeURIComponent(title)}&apikey=${apiKeyForShowDetails}`);
        return response;
    }
}

//getting all episodes of a series
export const getSeriesEpisodes = async (title: string) => {
    const response = await apiGet(`${getSeriesEpisodesUrl}?title=${encodeURIComponent(title)}`);
    return response;
}

//auth apis 
export const signupApi = async (data: any) => {
const response = await apiPost(signupUrl, data);
    return response;
}

export const signinApi = async (data: any) => {
    const response = await apiPost(signInUrl, data);
    return response;
}

export const verifyOtpApi = async (data: any) => {
    const response = await apiPost(verifyOtpUrl, data);
    return response;
}


// auth token
export const setUserTokenAction = async (token: string) => {
    await setUserTokenLocalStorage(token)
    dispatch(setUserToken(token))
}

//user data
export const setUserAction = async (user: any) => {
    //local storage
    await setUserDataLocalStorage(user)

    //saving user data to redux
    dispatch(setUserData(user))
}