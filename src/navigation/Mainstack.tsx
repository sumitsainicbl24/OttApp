import React, { useEffect } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { MainStackParamList } from './NavigationsTypes';
import Home from '../screens/main/Home/Home';
import Movies from '../screens/main/Movies/Movies';
import Shows from '../screens/main/Shows/Shows';
import Favorites from '../screens/main/Favorites/Favorites';
import Search from '../screens/main/Search/Search';
import Settings from '../screens/main/Settings/Settings';
import GeneralSettings from '../screens/main/GeneralSettings/GeneralSettings';
import PlaylistSettings from '../screens/main/PlaylistSettings/PlaylistSettings';
import AppearanceSettings from '../screens/main/AppearanceSettings /AppearanceSettings';
import PlaybackSettings from '../screens/main/PlaybackSettings/PlaybackSettings';
import RemoteControlSettings from '../screens/main/RemoteControlSettings/RemoteControlSettings';
import OtherSettings from '../screens/main/OtherSettings/OtherSettings';
import Tv from '../screens/main/Tv/Tv';
import MoviePlayScreen from '../screens/main/MoviePlayScreen/MoviePlayScreen';
import LiveChannelPlayScreen from '../screens/main/LiveChannelPlayScreen/LiveChannelPlayScreen';
import LoginScreen from '../screens/appAuth/LoginScreen';
import SignupScreen from '../screens/appAuth/SignupScreen';
import VerifyOtp from '../screens/appAuth/VerifyOtp/VerifyOtp';
import BuySubscription from '../screens/main/BuySubscription/BuySubscription';
import { getChannelsDataFromMMKV, getMoviesDataFromMMKV, getSeriesDataFromMMKV } from '../localStorage/mmkv';
import { setChannelsData, setMoviesData, setSeriesData } from '../redux/reducers/auth';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../redux/hooks';
import { RootState } from '../redux/store';


const Mainstack = () => {
  const dispatch = useDispatch();
  const Stack = createNativeStackNavigator<MainStackParamList>();

useEffect(()=>{
   const loadAllData = async () => {
    const {channelsData, moviesData, seriesData} = useAppSelector((state: RootState) => state.rootReducer.auth);
    if(!channelsData){
      const channelsData = await getChannelsDataFromMMKV();
      if(channelsData){
        dispatch(setChannelsData(channelsData))
      }
    }
    if(!moviesData){
      const moviesData = await getMoviesDataFromMMKV();
      if(moviesData){
        dispatch(setMoviesData(moviesData))
      }
    }
    if(!seriesData){
      const seriesData = await getSeriesDataFromMMKV();
      if(seriesData){
        dispatch(setSeriesData(seriesData))
      }
    }
  }
  loadAllData();
},[])


  return (
    <Stack.Navigator 
    screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Stack.Screen 
        name="Home" 
        component={Home}
      />
      <Stack.Screen 
        name="Movies" 
        component={Movies}
      />
      <Stack.Screen 
        name="Shows" 
        component={Shows}
      />  
      <Stack.Screen 
        name="Favorites" 
        component={Favorites}
      />
      <Stack.Screen 
        name="Search" 
        component={Search}
      />
      <Stack.Screen 
        name="Settings" 
        component={Settings}
      />
      <Stack.Screen 
        name="GeneralSettings" 
        component={GeneralSettings}
      />
      <Stack.Screen 
        name="PlaylistSettings" 
        component={PlaylistSettings}
      />
      <Stack.Screen 
        name="AppearanceSettings" 
        component={AppearanceSettings}
      />
      <Stack.Screen 
        name="PlaybackSettings" 
        component={PlaybackSettings}
      />
      <Stack.Screen 
        name="RemoteControlSettings" 
        component={RemoteControlSettings}
      />
      <Stack.Screen 
        name="OtherSettings" 
        component={OtherSettings}
      />
      <Stack.Screen 
        name="Tv" 
        component={Tv}
      />
      <Stack.Screen 
        name="MoviePlayScreen" 
        component={MoviePlayScreen}
      />
      <Stack.Screen 
        name="LiveChannelPlayScreen" 
        component={LiveChannelPlayScreen}
      />
      <Stack.Screen 
        name="LoginScreen" 
        component={LoginScreen}
      />
      <Stack.Screen 
        name="SignupScreen" 
        component={SignupScreen}
      />
      <Stack.Screen 
        name="VerifyOtp" 
        component={VerifyOtp}
      />
      <Stack.Screen 
        name="BuySubscription" 
        component={BuySubscription}
      />
    </Stack.Navigator>
  )
}

export default Mainstack
