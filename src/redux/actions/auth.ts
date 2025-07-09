import { apiGet, apiPost } from "../../utils/utils"
import { setAuthToken, setIsPlaylistProcessed, setSeriesData, setUserData, setMoviesData, setChannelsData } from "../reducers/auth"
import { store } from "../store"

import { CategoryDataUrl, categoryUrl, fetchMedia, getPlaylistData, loginUrl, ShowDetailsApi, TMDBBaseUrl } from "../../config/urls"
import { saveChannelsDataToMMKV, saveMoviesDataToMMKV, saveSeriesDataToMMKV, setAuthTokenLocalStorage, setIsPlaylistProcessedLocalStorage, setUserDataLocalStorage } from "../../localStorage/mmkv"

const {dispatch} = store

export const setUser = async (user: any) => {
    //local storage
    await setUserDataLocalStorage(user)

    //saving user data to redux
    dispatch(setUserData(user))
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
            await saveChannelsDataToMMKV(response.data.data.data)
            dispatch(setChannelsData(response.data.data.data))
        }else if(type === 'movies'){
            await saveMoviesDataToMMKV(response.data.data.data)
            dispatch(setMoviesData(response.data.data.data))
        }else if(type === 'series'){
            await saveSeriesDataToMMKV(response.data.data.data)
            dispatch(setSeriesData(response.data.data.data))
        }
        return response;
    }else{
        const response = await apiGet(`${categoryUrl}`);
        saveChannelsDataToMMKV(response.data.data)
        dispatch(setChannelsData(response.data.data))
        return response;
    }
}

export const getCategoryData = async (type: string, category: string) => {
    const response = await apiGet(`${CategoryDataUrl}?type=${type}&category=${encodeURIComponent(category)}`);
    return response;
}