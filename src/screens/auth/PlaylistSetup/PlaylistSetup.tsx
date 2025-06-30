// 1. React Native core imports
import { Text, View, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'

// 2. Global styles and utilities
import CommonStyles from '../../../styles/CommonStyles'
import { CommonColors } from '../../../styles/Colors'
import { moderateScale, verticalScale } from '../../../styles/scaling'

// 3. Component imports
import WrapperContainer from '../../../components/WrapperContainer'
import InputComp from '../../../components/InputComp'
import CheckboxComp from '../../../components/CheckboxComp'
import { NavigationProp, RouteProp, useNavigation } from '@react-navigation/native'
import { AuthStackParamList } from '../../../navigation/NavigationsTypes'
import imagepath from '../../../constants/imagepath'

// 4. Local styles import (ALWAYS LAST)
import { styles } from './styles'

const PlaylistSetup = ({ route }: { route: RouteProp<AuthStackParamList, 'PlaylistSetup'> }) => {
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>()
  const { type } = route.params
  
  // General playlist states
  const [playlistUrl, setPlaylistUrl] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  // Stalker Portal specific states
  const [serverAddress, setServerAddress] = useState('')
  const [macAddress, setMacAddress] = useState('00:01a:79:d0:C5:Db')
  const [deviceId1, setDeviceId1] = useState('')
  const [deviceId2, setDeviceId2] = useState('')
  const [includeTvChannels, setIncludeTvChannels] = useState(true)
  const [includeVod, setIncludeVod] = useState(true)

  // Focus state for buttons
  const [focused, setFocused] = useState<string | null>(null)

  const handleNext = () => {
    // Navigate to next screen or handle form submission
    navigation.navigate('PlaylistProcessed', { type , playlistUrl})
  }

  const handleCancel = () => {
    navigation.goBack()
  }

  const handleNextFocus = () => {
    setFocused('next')
  }

  const handleCancelFocus = () => {
    setFocused('cancel')
  }

  const handleBlur = () => {
    setFocused(null)
  }

  return (
    <WrapperContainer containerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.LeftContainer}>
          <View style={styles.iconContainer}>
            <Image source={imagepath.PlaylistIcon} style={styles.iconPlaceholder}/>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={CommonStyles.Heading}>Playlist Setup</Text>
            <Text style={CommonStyles.SubHeading}>{type}</Text>
          </View>
      </View>

      {/* Main Content Section */}
      <View style={styles.contentContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Playlist Setup</Text>
          
          <View style={styles.inputsContainer}>
            {type === 'Stalker Portal' ? (
              <>
                {/* Server Address Input */}
                <InputComp
                  label="Server address"
                  placeholder="Enter Your Server Address"
                  value={serverAddress}
                  onChangeText={setServerAddress}
                  containerStyle={styles.inputContainer}
                />

                {/* MAC Address Input */}
                <InputComp
                  label="MAC Address"
                  placeholder="00:01a:79:d0:C5:Db"
                  value={macAddress}
                  onChangeText={setMacAddress}
                  containerStyle={styles.inputContainer}
                />

                {/* Username Input */}
                <InputComp
                  label="Username (Optional)"
                  placeholder="Enter Your Password"
                  value={username}
                  onChangeText={setUsername}
                  containerStyle={styles.inputContainer}
                />

                {/* Password Input */}
                <InputComp
                  label="Password"
                  placeholder="Enter Your Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  containerStyle={styles.inputContainer}
                />

                {/* Device ID 1 Input */}
                <InputComp
                  label="Device ID 1"
                  placeholder="Enter Device ID"
                  value={deviceId1}
                  onChangeText={setDeviceId1}
                  containerStyle={styles.inputContainer}
                />

                {/* Device ID 2 Input */}
                <InputComp
                  label="Device ID 2"
                  placeholder="Enter Device ID"
                  value={deviceId2}
                  onChangeText={setDeviceId2}
                  containerStyle={styles.inputContainer}
                />

                {/* Checkboxes */}
                <View style={styles.checkboxContainer}>
                  <CheckboxComp
                    label="Include TV channels"
                    isChecked={includeTvChannels}
                    onToggle={setIncludeTvChannels}
                  />
                  <CheckboxComp
                    label="Include VOD"
                    isChecked={includeVod}
                    onToggle={setIncludeVod}
                  />
                </View>
              </>
            ) : 
            type === 'M3U Playlist' ?
            (
              <>
                {/* Playlist URL Input */}
                <InputComp
                  label={`${type} playlist URL`}
                  placeholder="Enter your Playlist URL"
                  value={playlistUrl}
                  onChangeText={setPlaylistUrl}
                  containerStyle={styles.inputContainer}
                />

                {/* Username Input */}
                {/* <InputComp
                  label="Username"
                  placeholder="Enter your Username"
                  value={username}
                  onChangeText={setUsername}
                  containerStyle={styles.inputContainer}
                /> */}

                {/* Password Input */}
                {/* <InputComp
                  label="Password"
                  placeholder="Enter your Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  containerStyle={styles.inputContainer}
                /> */}
              </>
            ) :

            (
              <>
                {/* Playlist URL Input */}
                <InputComp
                  label={`${type} playlist URL`}
                  placeholder="Enter your Playlist URL"
                  value={playlistUrl}
                  onChangeText={setPlaylistUrl}
                  containerStyle={styles.inputContainer}
                />

                {/* Username Input */}
                <InputComp
                  label="Username"
                  placeholder="Enter your Username"
                  value={username}
                  onChangeText={setUsername}
                  containerStyle={styles.inputContainer}
                />

                {/* Password Input */}
                <InputComp
                  label="Password"
                  placeholder="Enter your Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  containerStyle={styles.inputContainer}
                />
              </>
            )
          }
          </View>
        </View>

        <View style={styles.rightContainer}>
        {/* Separator Line */}
        <View style={styles.separator} />

        {/* Bottom Buttons */}
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity 
            onPress={handleNext}
            activeOpacity={1}
            onFocus={handleNextFocus}
            onBlur={handleBlur}
            hasTVPreferredFocus={true}
          >
            <Text style={[
              styles.nextButtonText,
              focused === 'next' && styles.nextButtonTextFocused
            ]}>Next</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleCancel}
            activeOpacity={1}
            onFocus={handleCancelFocus}
            onBlur={handleBlur}
          >
            <Text style={[
              styles.cancelButtonText,
              focused === 'cancel' && styles.cancelButtonTextFocused
            ]}>Cancel</Text>
          </TouchableOpacity>
        </View>
        </View>
      </View>
    </WrapperContainer>
  )
}

export default PlaylistSetup 