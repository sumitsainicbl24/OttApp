import React from 'react'
import { ImageSourcePropType, StyleSheet, Text, View } from 'react-native'
import { CommonColors } from '../styles/Colors'
import { moderateScale, verticalScale, scale } from '../styles/scaling'
import FontFamily from '../constants/FontFamily'

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
  showDetails?: ShowData
}

const ShowDetails1: React.FC<ShowDetails1Props> = ({ 
  showDetails,
}) => {

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>
        {showDetails?.title}
      </Text>

      {/* Metadata Row */}
      <View style={styles.metadataContainer}>
        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>
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
          <Text style={[styles.metadataText]}>
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
        numberOfLines={4}
        style={styles.metadataText}>
          {showDetails?.Plot || 
            'Marvel Studios` brings together the most unexpected team up with Bucky, Yelena, Red Guardian, John Walker, Ghost faced with a challenge which can change the fate of the world for ever.'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
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