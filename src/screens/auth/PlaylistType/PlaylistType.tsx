// 1. React Native core imports
import { Text, View, Pressable, TouchableOpacity, TouchableHighlight } from 'react-native'
import React, { useState } from 'react'

import { styles } from './styles'
import WrapperContainer from '../../../components/WrapperContainer'
import imagepath from '../../../constants/imagepath'
import { Image } from 'react-native'
import CommonStyles from '../../../styles/CommonStyles'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { AuthStackParamList } from '../../../navigation/NavigationsTypes'
import { CommonColors } from '../../../styles/Colors'

const PlaylistType = () => {
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>()
  const [selectedType, setSelectedType] = useState('M3U Playlist')
  const [focused, setFocused] = useState<string | null>(null)

  const playlistTypes = [
    'M3U Playlist',
    'Xtream Codes',
    'Stalker Portal'
  ]

  const handleTypeSelect = (type: string) => {
    setSelectedType(type)
  }

  const handleFocus = () => {
    setFocused('cancel')
  }

  const handleBlur = () => {
    setFocused('')
  }

  return (
    <WrapperContainer containerStyle={styles.container}>
      <View style={styles.LeftContainer}>
          <View style={styles.iconContainer}>
            <Image source={imagepath.PlaylistIcon} style={styles.iconPlaceholder}/>
          </View>
          <Text style={CommonStyles.Heading}>Playlist Type</Text>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.optionsContainer}>
          {playlistTypes.map((type, index) => (
            <TouchableHighlight
              underlayColor={CommonColors.white}
              activeOpacity={1}
              key={index}
              style={[
                styles.optionButton,
                selectedType === type && styles.selectedOption
              ]}
              onFocus={() => handleTypeSelect(type)}
              onBlur={() => handleTypeSelect('')}
              onPress={() => {
                navigation.navigate('PlaylistSetup', { type: type })
              }}
            >
              <Text style={[
                styles.optionText,
                selectedType === type && styles.selectedOptionText
              ]}>
                {type}
              </Text>
            </TouchableHighlight>
          ))}
        </View>

        {/* Cancel Section */}
        <View style={styles.cancelContainer}>
          <View style={styles.separator} />
          <TouchableOpacity
          onPress={() => {
            navigation.goBack()
          }}
          activeOpacity={1}
          onFocus={() => handleFocus()}
          onBlur={() => handleBlur()}
          // hasTVPreferredFocus={true}
          >
            <Text style={[
              styles.cancelText,
              focused === 'cancel' && styles.cancelTextFocused
            ]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </WrapperContainer>
  )
}

export default PlaylistType 