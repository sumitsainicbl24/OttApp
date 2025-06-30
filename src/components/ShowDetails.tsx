import React, { useState } from 'react'
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import imagepath from '../constants/imagepath'
import { CommonColors } from '../styles/Colors'
import { moderateScale, verticalScale, scale } from '../styles/scaling'
import FontFamily from '../constants/FontFamily'

interface ShowData {
  title: string
  year: string
  duration: string
  genre: string
  rating: string
  description: string
  image: ImageSourcePropType
}

interface ShowDetailsProps {
  onPlayPress?: () => void
  onMyListPress?: () => void
  showDetails?: ShowData
  onFocus?: () => void
}

const ShowDetails: React.FC<ShowDetailsProps> = ({ 
  onPlayPress, 
  onMyListPress,
  showDetails,
  onFocus
}) => {
  const [focused, setFocused] = useState<string | null>(null)

  const handleFocus = (item: string) => {
    setFocused(item)
    onFocus?.()
  }

  const handleBlur = () => {
    setFocused(null)
  }

  return (
    <View style={styles.featuredContainer}>
      <Image source={showDetails?.image} style={styles.featuredImagePlaceholder} />

      <View style={styles.metadataContainer}>
        <Text style={styles.metadataText}>{showDetails?.year}</Text>
        <Text style={styles.metadataText}>{showDetails?.duration}</Text>
        <Text style={styles.metadataText}>{showDetails?.genre}</Text>
        <Text style={styles.metadataText}>{showDetails?.rating}</Text>
      </View>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
        style={[styles.playButton, focused === 'play' && styles.playButtonFocused]} 
        onPress={onPlayPress}
        activeOpacity={1}
        onFocus={() => handleFocus('play')}
        onBlur={handleBlur}
        >
          <Image source={imagepath.playIconWhite} style={styles.playIconPlaceholder} />
          <Text style={styles.playButtonText}>Play Now</Text>
        </TouchableOpacity>

        <TouchableOpacity 
        style={[styles.myListButton, focused === 'myList' && styles.myListButtonFocused]} 
        onPress={onMyListPress}
        activeOpacity={1}
        onFocus={() => handleFocus('myList')}
        onBlur={handleBlur}
        >
          <Text style={styles.plusSymbol}>+</Text>
          <Text style={styles.myListButtonText}>My List</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          {showDetails?.description}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  // Featured Content Styles
  featuredContainer: {
    width: scale(665),
    height: verticalScale(350),
    zIndex: 10,
    marginLeft: moderateScale(40),
    justifyContent: 'space-between',
  },
  
  featuredImagePlaceholder: {
    height: '33%',
    width: '40%',
    resizeMode: 'contain',
  },
  
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(36),
  },
  
  metadataText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(20),
    color: CommonColors.white,
  },
  
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '5%',
    width: '100%',
  },
  
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CommonColors.buttonPrimary,
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(12),
    width: scale(252),
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    gap: scale(10),
    borderWidth: 2,
    borderColor: 'transparent',
  },

  playButtonFocused: {
    borderColor: CommonColors.white,
    shadowColor: CommonColors.white,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  
  playIconPlaceholder: {
    width: moderateScale(24),
    height: moderateScale(24),
    resizeMode: 'contain',
  },
  
  playButtonText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(20),
    color: CommonColors.white,
  },
  
  myListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    width: scale(252),
    justifyContent: 'center',
    gap: moderateScale(12),
    borderWidth: 2,
    borderColor: 'transparent',
  },

  myListButtonFocused: {
    borderColor: CommonColors.white,
    shadowColor: CommonColors.white,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  
  plusSymbol: {
    fontFamily: FontFamily.PublicSans_Bold,
    fontSize: scale(26),
    color: CommonColors.white,
  },
  
  myListButtonText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(20),
    color: CommonColors.white,
  },
  
  descriptionContainer: {
    width: '100%',
  },
  
  description: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(20),
    lineHeight: scale(30),
    color: CommonColors.white,
    textAlign: 'left',
  },
})

export default ShowDetails 