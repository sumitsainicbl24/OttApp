import React, { useState } from 'react'
import { Image, ImageSourcePropType, StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native'
import { CommonColors } from '../styles/Colors'
import { moderateScale, scale, verticalScale } from '../styles/scaling'

interface ContinueWatchingData {
  id: number
  title: string
  image: ImageSourcePropType
  logo?: ImageSourcePropType
}

interface ContinueWatchingCardProps extends TouchableOpacityProps {
  data: ContinueWatchingData
  hasTVPreferredFocus?: boolean
  onFocus?: (event: any) => void
  onBlur?: (event: any) => void
  onPress?: () => void
}

const ContinueWatchingCard: React.FC<ContinueWatchingCardProps> = ({ 
  data, 
  hasTVPreferredFocus,
  style,
  onFocus,
  onBlur,
  onPress,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = (event: any) => {
    setIsFocused(true)
    onFocus?.(event)
  }

  const handleBlur = (event: any) => {
    setIsFocused(false)
    onBlur?.(event)
  }

  const handlePress = () => {
    console.log('Continue watching pressed:', data.title)
    onPress?.()
  }

  console.log('data from continue watching card', data);

  return (
    <TouchableOpacity 
      style={[
        styles.continueWatchingCard, 
        isFocused && styles.continueWatchingCardFocused,
        style
      ]}
      hasTVPreferredFocus={hasTVPreferredFocus}
      activeOpacity={0.8}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onPress={handlePress}
      {...props}
    >
      <Image 
        source={data.image? data.image : {uri: data.logo}} 
        style={[
          styles.continueWatchingImage,
          isFocused && styles.continueWatchingImageFocused
        ]} 
      />
    </TouchableOpacity>
  )
}

export default ContinueWatchingCard

const styles = StyleSheet.create({
  continueWatchingCard: {
    height: verticalScale(242),
    borderRadius: scale(18),
    width: scale(388),
    overflow: 'hidden',
    position: 'relative',
    marginRight: moderateScale(7.5),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  continueWatchingCardFocused: {
    borderColor: CommonColors.white,
    transform: [{ scale: 1.05 }],
    shadowColor: CommonColors.white,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  continueWatchingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: scale(18),
  },
  continueWatchingImageFocused: {
    // Additional image styling when focused if needed
  },
}) 