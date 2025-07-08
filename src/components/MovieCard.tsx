import React, { useState, useEffect } from 'react'
import { Image, ImageSourcePropType, StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native'
import { CommonColors } from '../styles/Colors'
import { moderateScale, scale, verticalScale } from '../styles/scaling'
import imagepath from '../constants/imagepath'

interface MovieData {
  id: number
  title: string
  image?: ImageSourcePropType
  logo?: ImageSourcePropType
  url?: string
  groupTitle?: string
}

interface MovieCardProps extends TouchableOpacityProps {
  movie: MovieData
  hasTVPreferredFocus?: boolean
  onFocus?: (event: any) => void
  onBlur?: (event: any) => void
  onPress?: () => void
}

const MovieCard: React.FC<MovieCardProps> = ({ 
  movie, 
  hasTVPreferredFocus,
  style,
  onFocus,
  onBlur,
  onPress,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Reset image error state when movie changes
  useEffect(() => {
    setImageError(false)
  }, [movie.id, movie.image, movie.logo])

  const handleFocus = (event: any) => {
    setIsFocused(true)
    onFocus?.(event)
  }

  const handleBlur = (event: any) => {
    setIsFocused(false)
    onBlur?.(event)
  }

  const handlePress = () => {
    console.log('Movie pressed:', movie.title)
    onPress?.()
  }

  const handleSource = () => {
    if (imageError) {
      return imagepath.VideoPlaceHolder
    }
    
    const imageSource = movie.logo || movie.image
    if (imageSource && (imageSource.toString().includes('https://') || imageSource.toString().includes('http://'))) {
      return { uri: imageSource.toString() }
    }
    return imagepath.VideoPlaceHolder
  }

  const handleImageError = () => {
    console.log('Image failed to load, showing placeholder for:', movie.title)
    setImageError(true)
  }

  return (
    <TouchableOpacity 
      style={[
        styles.movieCard, 
        isFocused && styles.movieCardFocused,
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
        source={handleSource()} 
        style={[
          styles.movieImage,
          isFocused && styles.movieImageFocused
        ]} 
        onError={handleImageError}
      />
    </TouchableOpacity>
  )
}

export default MovieCard

const styles = StyleSheet.create({
  movieCard: {
    width: scale(388),
    height: verticalScale(642),
    borderRadius: scale(24),
    marginRight: moderateScale(24),
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
    // elevation: 1,
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