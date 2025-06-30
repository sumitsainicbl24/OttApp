import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import Authstack from './Authstack'
import { useAppSelector } from '../redux/hooks'
import { RootState } from '../redux/store'
import Mainstack from './Mainstack'
import { getChannelsDataFromMMKV, getIsPlaylistProcessedLocalStorage, getMoviesDataFromMMKV, getSeriesDataFromMMKV } from '../localStorage/mmkv'
import { setChannelsData, setMoviesData, setSeriesData } from '../redux/reducers/auth'
import { useDispatch } from 'react-redux'

const Routes = () => {
  const dispatch = useDispatch();

  const {isplaylistprocessed} = useAppSelector((state: RootState) => state.rootReducer.auth)

  const loadAllData = async () => {
    const channelsData = await getChannelsDataFromMMKV();
    const moviesData = await getMoviesDataFromMMKV();
    const seriesData = await getSeriesDataFromMMKV();
    dispatch(setChannelsData(channelsData));
    dispatch(setMoviesData(moviesData));
    dispatch(setSeriesData(seriesData));
  }
  useEffect(()=>{
    loadAllData();
  },[])

  return (
    <NavigationContainer>
        {isplaylistprocessed ? <Mainstack/> : <Authstack/>}
    </NavigationContainer>
  )
}

export default Routes

const styles = StyleSheet.create({})