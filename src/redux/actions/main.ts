import { apiGet, apiPost } from "../../utils/utils"
import { store } from "../store"

import { addToMyListUrl, clearMyListUrl, continueWatchingGetUrl, continueWatchingUpdateUrl, getMyListUrl, getSeriesEpisodesUrl, mylistCheckUrl, removeFromMyListUrl, searchUrl, ShowDetailsApi, signInUrl, signupUrl, TMDBBaseUrl, verifyOtpUrl } from "../../config/urls"
import { getUserTokenLocalStorage, setUserDataLocalStorage, setUserTokenLocalStorage } from "../../localStorage/mmkv"
import { setUserData, setUserToken } from "../reducers/auth"
import { useSelector } from "react-redux"
import { RootState } from "../store"

const {dispatch} = store

//api
const apiKeyForShowDetails = "79c065d3";

const apiKeyTMDB= "fef93770cb1687ee264adbfcfa83b13d";


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


//my list apis
export const addToMyListApi = async (data: any) => {
    const response = await apiPost(addToMyListUrl, data, undefined, true);
    return response;
}

export const removeFromMyList = async (data: any) => {
    const response = await apiPost(removeFromMyListUrl, data, undefined, true);
    return response;
}

export const clearMyListApi = async () => {
    const response = await apiPost(clearMyListUrl, undefined, undefined, true);
    return response;
}

export const mylistCheckApi = async (data: any) => {
    const response = await apiPost(mylistCheckUrl, data, undefined, true);
    return response;
}

export const getMyListApi = async () => {
    const response = await apiGet(getMyListUrl, undefined, true);
    return response;
}

//continue watching apis
export const continueWatchingUpdateApi = async (data: any) => {
    const response = await apiPost(continueWatchingUpdateUrl, data, undefined, true);
    return response;
}

export const continueWatchingGetApi = async () => {
    const response = await apiGet(continueWatchingGetUrl, undefined, true);
    return response;
}