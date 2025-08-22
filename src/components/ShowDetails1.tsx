import React, { useState, useEffect } from 'react'
import { Image, StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { CommonColors } from '../styles/Colors'
import { moderateScale, verticalScale, scale, height } from '../styles/scaling'
import FontFamily from '../constants/FontFamily'
import { getMovieDetails, getSeriesShowDetails, imageResolutionHandlerForUrl } from '../utils/CommonFunctions'

interface ShowData {
  title: string,
  rating: string, 
  Year: string,
  Runtime: string,
  Genre: string,
  Actors: string,
  Director: string,
  Plot: string,
  Poster: string,
}

interface ShowDetails1Props {
  movieName?: string,
  showName?: string
}

const ShowDetails1: React.FC<ShowDetails1Props> = ({ 
  movieName,
  showName
}) => {
  const [showDetails, setShowDetails] = useState<any | null>(null)

  useEffect(() => {
    if (movieName) {
      fetchMovieDetails()
    }
    if (showName) {
      fetchShowDetails()
    }
  }, [movieName, showName])

  const fetchMovieDetails = async () => {
    if (!movieName) return
    
    try {
      const details = await getMovieDetails(movieName)
      setShowDetails(details)
    } catch (error) {
      console.error('Error fetching movie details:', error)
    }
  }

  const fetchShowDetails = async () => {
    if (!showName) return
    
    try {
      const details = await getSeriesShowDetails(showName)
      setShowDetails(details)
    } catch (error) {
      console.error('Error fetching show details:', error)
    }
  }

  return (
    <View style={styles.backgroundImagePlaceholder}>
      <Image 
        source={showDetails?.Poster ? { uri: imageResolutionHandlerForUrl(showDetails?.Poster) } : undefined} 
        style={styles.backgroundImageStyle} 
      />
      
      {/* Horizontal gradient overlay - dark on left, transparent on right */}
      <LinearGradient
        colors={[CommonColors.themeMain, 'rgba(19, 22, 25, 1)', 'rgba(19, 22, 25, 0.75)', 'transparent', CommonColors.themeMain]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1.5, y: 0 }}
        style={styles.horizontalGradientOverlay}
      />

      <LinearGradient
        colors={[CommonColors.themeMain, 'rgba(19, 22, 25, 0.75)', 'transparent']}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.horizontalGradientOverlay}
      />

      <View style={styles.container}>
        {/* Title */}
        <Text
          numberOfLines={1}
        style={styles.title}>
          {showDetails?.title}
        </Text>

        {/* Metadata Row */}
        <View style={styles.metadataContainer}>
          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>
              {/* {showDetails?.rating} */}
              {showDetails?.rating}
            </Text>
          </View>
          
          <Text style={styles.metadataText}>
            {showDetails?.Year} .
          </Text>
          
          <Text style={styles.metadataText}>
            {showDetails?.Runtime} .
          </Text>
          
          <Text style={styles.metadataText}> 
            {showDetails?.Genre}
          </Text>
        </View>

        {/* Cast and Director */}
        <View style={{gap: moderateScale(5)}}>
          <View style={styles.metadataContainer}>
            {showDetails?.Actors && (
              <View style={{flexDirection: 'row', gap: moderateScale(5)}}>
                <Text style={{...styles.metadataText, width: scale(115)}}>
                  Cast:
                </Text>
                <Text
                  numberOfLines={1}
                style={[styles.metadataText]}>
                  {showDetails?.Actors}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.metadataContainer}>
            {showDetails?.Director && (
              <View style={{flexDirection: 'row', gap: moderateScale(5)}}>
                <Text style={{...styles.metadataText, width: scale(115)}}>
                  Director:
                </Text>
                <Text style={styles.metadataText}>
                  {showDetails?.Director}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text 
            numberOfLines={3}
            style={styles.description}>
            {showDetails?.Plot || 
              'Marvel Studios` brings together the most unexpected team up with Bucky, Yelena, Red Guardian, John Walker, Ghost faced with a challenge which can change the fate of the world for ever.'}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  backgroundImagePlaceholder: {
    // flex: 1,
    // backgroundColor: CommonColors.themeMain,
    // height: height/3,
    paddingTop: verticalScale(20),
  },
  
  backgroundImageStyle: {
    resizeMode: 'cover',
    alignSelf: 'flex-end',
    position: 'absolute',
    width: '80%',
    height: height/1.2,
  },
  
  horizontalGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    height:height/1.2
  },
  
  container: {
    // width: scale(855),
    height: verticalScale(350),
    zIndex: 10,
    marginLeft: moderateScale(40),
    justifyContent: 'center',
    gap: moderateScale(21),
  },
  
  title: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(60),
    lineHeight: scale(75), // 1.25em
    color: '#EFEFEF',
    textAlign: 'left',
  },
  
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(15),
  },
  
  ratingBadge: {
    backgroundColor: CommonColors.textGrey,
    borderRadius: moderateScale(6),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  ratingText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(24),
    lineHeight: scale(28), // 1.175em
    color: '#1D1D1D',
  },
  
  metadataText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(26),
    lineHeight: scale(30), // 1.175em
    color: CommonColors.textGrey,
  },
  
  descriptionContainer: {
    width: scale(855),
  },
  
  description: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(24),
    lineHeight: scale(28), // 1.175em
    color: CommonColors.textGrey,
    textAlign: 'left',
  },
})

export default ShowDetails1 