import React, { useState, useEffect } from 'react'
import { Image, ImageSourcePropType, StyleSheet, TouchableOpacity, TouchableOpacityProps, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { CommonColors } from '../styles/Colors'
import { moderateScale, scale, verticalScale } from '../styles/scaling'

interface MovieData {
  id: number
  title: string
  image: ImageSourcePropType
  category?: string
}

interface MovieCatCardProps extends TouchableOpacityProps {
  movie: MovieData
  hasTVPreferredFocus?: boolean
  onFocus?: (event: any) => void
  onBlur?: (event: any) => void
  onPress?: () => void
}

const MovieCatCard: React.FC<MovieCatCardProps> = ({ 
  movie, 
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
    console.log('Movie category pressed:', movie.title)
    onPress?.()
  }

  return (
    <TouchableOpacity 
      style={[
        styles.movieCard, 
        isFocused && styles.movieCardFocused,
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
          source={movie.image} 
          style={[
            styles.movieImage,
            isFocused && styles.movieImageFocused
          ]} 
        />
    </TouchableOpacity>
  )
}

export default MovieCatCard

const styles = StyleSheet.create({
  movieCard: {
    width: scale(388),
    height: verticalScale(400),
    borderRadius: scale(24),
    marginRight: moderateScale(15),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  movieCardFocused: {
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
  movieImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: scale(24),
  },
  movieImageFocused: {
    // Additional image styling when focused if needed
  },
}) 