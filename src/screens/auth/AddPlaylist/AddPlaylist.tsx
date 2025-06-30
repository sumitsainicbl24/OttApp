import React, { useState } from 'react'
import { Text, View, TouchableOpacity } from 'react-native'
import ButtonComp from '../../../components/ButtonComp'
import CommonStyles from '../../../styles/CommonStyles'
import { styles } from './styles'
import { AuthStackParamList } from '../../../navigation/NavigationsTypes'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import WrapperContainer from '../../../components/WrapperContainer'

const AddPlaylist = () => {
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>()
  const [isAddPlaylistFocused, setIsAddPlaylistFocused] = useState(false)
  const [isSettingsFocused, setIsSettingsFocused] = useState(false)
  
  return (
    <WrapperContainer containerStyle={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={CommonStyles.Title}>Start streaming with Lora Digital!</Text>
          <Text style={CommonStyles.SubTitle}>
            Just add a playlist from your IPTV provider to unlock{'\n'}your channels.
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.addPlaylistButton,
              isAddPlaylistFocused && styles.addPlaylistButtonFocused
            ]}
            onPress={() => {
                navigation.navigate('PlaylistType')
            }}
            activeOpacity={1}
            onFocus={() => setIsAddPlaylistFocused(true)}
            onBlur={() => setIsAddPlaylistFocused(false)}
            hasTVPreferredFocus={true}
          >
            <Text style={[
              styles.addPlaylistButtonText,
              isAddPlaylistFocused && styles.addPlaylistButtonTextFocused
            ]}>
              Add Playlist
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.settingsButton,
              isSettingsFocused && styles.settingsButtonFocused
            ]}
            onPress={() => {
                // Add navigation to settings screen when available
                console.log('Settings pressed')
                navigation.navigate('Settings')
            }}
            activeOpacity={1}
            onFocus={() => setIsSettingsFocused(true)}
            onBlur={() => setIsSettingsFocused(false)}
            hasTVPreferredFocus={true}
          >
            <Text style={[
              styles.settingsButtonText,
              isSettingsFocused && styles.settingsButtonTextFocused
            ]}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </WrapperContainer>
  )
}

export default AddPlaylist 