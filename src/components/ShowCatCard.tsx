import React, { useState, useEffect } from 'react'
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { CommonColors } from '../styles/Colors'
import { moderateScale, scale, verticalScale } from '../styles/scaling'
import FontFamily from '../constants/FontFamily'
import imagepath from '../constants/imagepath'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { MainStackParamList } from '../navigation/NavigationsTypes'
import { imageResolutionHandlerForUrl } from '../utils/CommonFunctions'

interface ShowData {
  group?: string
  title?: string
  logo?: string
  url?: string
}

interface ShowCatCardProps extends TouchableOpacityProps {
  show: ShowData
  hasTVPreferredFocus?: boolean
  onFocus?: (event: any) => void
  onBlur?: (event: any) => void
  onPress?: () => void
}

const ShowCatCard: React.FC<ShowCatCardProps> = ({ 
  show, 
  hasTVPreferredFocus,
  style,
  onFocus,
  onBlur,
  onPress,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [imageError, setImageError] = useState(false)
  const navigation = useNavigation<NavigationProp<MainStackParamList>>()
  // Reset image error state when show changes
  useEffect(() => {
    setImageError(false)
  }, [show.title, show.logo])

  const handleFocus = (event: any) => {
    setIsFocused(true)
    onFocus?.(event)
  }

  const handleBlur = (event: any) => {
    setIsFocused(false)
    onBlur?.(event)
  }

  const handlePress = () => {
    onPress?.()
  }

  const handleSource = () => {
    if (imageError) {
      return imagepath.VideoPlaceHolder
    }
    
    if(show?.logo?.toString().includes('https://')){
      return {uri: imageResolutionHandlerForUrl(show?.logo?.toString())}
    }
    return imagepath.VideoPlaceHolder
  }

  const handleImageError = () => {
    console.log('Image failed to load, showing placeholder for:', show.title)
    setImageError(true)
  }

  return (
    <TouchableOpacity 
      style={[
        styles.showCard, 
        isFocused && styles.showCardFocused,
        style
      ]}
      hasTVPreferredFocus={hasTVPreferredFocus}
      activeOpacity={1}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onPress={handlePress}
      {...props}
    >
        <Image 
          source={handleSource()} 
          style={[
            styles.showImage,
            isFocused && styles.showImageFocused,
          ]} 
          onError={handleImageError}
        />
        <View style={styles.showTitleContainer}>
          <Text numberOfLines={1} style={styles.showTitle}>{show.title}</Text>
        </View>
    </TouchableOpacity>
  )
}

export default ShowCatCard

const styles = StyleSheet.create({
  showCard: {
    width: scale(250),
    height: verticalScale(400),
    borderRadius: scale(24),
    marginVertical: verticalScale(15),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: verticalScale(25),
    backgroundColor: CommonColors.backgroundGrey,
  },
  showCardFocused: {
    borderColor: CommonColors.white,
    transform: [{ scale: 1.05 }],
    shadowColor: CommonColors.white,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    zIndex: 1000,
  },
  showImage: {
    width: '100%',
    height: '90%',
    resizeMode: 'cover',
    borderTopLeftRadius: scale(12),
    borderTopRightRadius: scale(12),
  },
  showImageFocused: {
    // Additional image styling when focused if needed
  },
  showTitleContainer: {
    flex: 1,
    backgroundColor: CommonColors.backgroundGrey,
    borderBottomLeftRadius: scale(12),
    borderBottomRightRadius: scale(12),
    justifyContent: 'center',
    paddingHorizontal: moderateScale(10),
  },
  showTitle: {
    fontSize: moderateScale(16),
    fontFamily: FontFamily.PublicSans_Regular,
    color: CommonColors.textWhite,
  },
}) 