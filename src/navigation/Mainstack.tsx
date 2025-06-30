import React from 'react'
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

const Stack = createNativeStackNavigator<MainStackParamList>();

const Mainstack = () => {
  return (
    <Stack.Navigator 
    screenOptions={{ headerShown: false }}
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
    </Stack.Navigator>
  )
}

export default Mainstack
