import { apiGet, apiPost } from "../../utils/utils"
import { setAuthToken, setIsPlaylistProcessed, setSeriesData, setUserData, setMoviesData, setChannelsData } from "../reducers/auth"
import { store } from "../store"

import { CategoryDataUrl, categoryUrl, fetchMedia, getPlaylistData, loginUrl, ShowDetailsApi, TMDBBaseUrl } from "../../config/urls"
import { saveChannelsDataToMMKV, saveMoviesDataToMMKV, saveSeriesDataToMMKV, setAuthTokenLocalStorage, setIsPlaylistProcessedLocalStorage, setUserDataLocalStorage } from "../../localStorage/mmkv"

const {dispatch} = store

export const setUser = async (user: any) => {
    //local storage
    await setUserDataLocalStorage(user)
    await setAuthTokenLocalStorage(user.token)

    //saving user data to redux
    dispatch(setUserData(user))
    dispatch(setAuthToken(user.token))
}

export const setAuthTokenAction = async (token: string) => {
    //local storage
    await setAuthTokenLocalStorage(token)

    //saving auth token to redux
    dispatch(setAuthToken(token))
}

export const setIsPlaylistProcessedAction = async (isplaylistprocessed: boolean) => {

    await setIsPlaylistProcessedLocalStorage(isplaylistprocessed)
    dispatch(setIsPlaylistProcessed(isplaylistprocessed))
}


//api
const apiKeyForShowDetails = "79c065d3";

const apiKeyTMDB= "ab0623f200520bab43cd0b39873cbad8";


export const LoginApi = async (m3uUrl: string) => {
    const response = await apiPost(loginUrl, {
        m3uUrl:m3uUrl
    });
    return response;
}

export const getAllPlaylistData = async () => {
    const response = await apiPost(getPlaylistData, {
        m3uUrl: "http://line.cloud-ott.net/get.php?username=GKBELS&password=JT93E4&type=m3u_plus&output=ts%22"
    });
    return response;
}

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

export const getMediaData = async (type?: string) => {
    if(!!type){
        const response = await apiGet(`${fetchMedia}?type=${type}`);
        if(type === 'series'){
            await saveSeriesDataToMMKV(response.data)
            dispatch(setSeriesData(response.data))
        }else if(type === 'movies'){
            await saveMoviesDataToMMKV(response.data)
            dispatch(setMoviesData(response.data))
        }else if(type === 'channel'){
            await saveChannelsDataToMMKV(response.data)
            dispatch(setChannelsData(response.data))
        }
        return response;
    }

    const response = await apiGet(`${fetchMedia}`);
    saveChannelsDataToMMKV(response.data)
    dispatch(setChannelsData(response.data))
    return response;
}

export const getCategoryApi = async (type: string) => {

    if(!!type){
        const response = await apiGet(`${categoryUrl}?type=${type}`);
        if(type === 'live'){
            await saveChannelsDataToMMKV(response.data.data)
            dispatch(setChannelsData(response.data.data))
        }else if(type === 'movies'){
            await saveMoviesDataToMMKV(response.data.data)
            dispatch(setMoviesData(response.data.data))
        }else if(type === 'series'){
            await saveSeriesDataToMMKV(response.data.data)
            dispatch(setSeriesData(response.data.data))
        }
        return response;
    }else{
        const response = await apiGet(`${categoryUrl}`);
        saveChannelsDataToMMKV(response.data)
        dispatch(setChannelsData(response.data))
        return response;
    }
}

export const getCategoryData = async (type: string, category: string) => {
    const response = await apiGet(`${CategoryDataUrl}?type=${type}&category=${encodeURIComponent(category)}`);
    return response;
}