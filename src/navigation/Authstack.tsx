import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import PlaylistType from '../screens/auth/PlaylistType/PlaylistType';
import PlaylistSetup from '../screens/auth/PlaylistSetup/PlaylistSetup';
import { AuthStackParamList } from './NavigationsTypes';
import GeneralSettings from '../screens/main/GeneralSettings/GeneralSettings';
import PlaylistSettings from '../screens/main/PlaylistSettings/PlaylistSettings';
import AppearanceSettings from '../screens/main/AppearanceSettings /AppearanceSettings';
import PlaybackSettings from '../screens/main/PlaybackSettings/PlaybackSettings';
import RemoteControlSettings from '../screens/main/RemoteControlSettings/RemoteControlSettings';
import OtherSettings from '../screens/main/OtherSettings/OtherSettings';
import Settings from '../screens/main/Settings/Settings';
import { AddPlaylist,PlaylistProcessed } from '../screens/auth';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const Authstack = () => {
  return (
    <Stack.Navigator 
    screenOptions={{ headerShown: false }}
    >
      <Stack.Screen 
        name="AddPlaylist" 
        component={AddPlaylist}
      />
      <Stack.Screen 
        name="PlaylistType" 
        component={PlaylistType}
      />
      <Stack.Screen 
        name="PlaylistSetup" 
        component={PlaylistSetup}
      />
      <Stack.Screen 
        name="PlaylistProcessed" 
        component={PlaylistProcessed}
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
    </Stack.Navigator>
  )
}

export default Authstack

const styles = StyleSheet.create({})