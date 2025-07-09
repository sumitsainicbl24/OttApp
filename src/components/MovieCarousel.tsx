import React from 'react'
import { ImageSourcePropType, FlatList, StyleSheet, Text, View } from 'react-native'
import { CommonColors } from '../styles/Colors'
import { moderateScale, scale, verticalScale } from '../styles/scaling'
import FontFamily from '../constants/FontFamily'
import MovieCard from './MovieCard'

interface MovieData {
  id: number
  title: string
  image?: ImageSourcePropType
  logo?: ImageSourcePropType
  url?: string
  groupTitle?: string
}

interface MovieCarouselProps {
  title: string
  data: MovieData[]
  onMoviePress?: (movie: MovieData) => void
}

const MovieCarousel: React.FC<MovieCarouselProps> = ({ 
  title, 
  data, 
  onMoviePress 
}) => {
  const handleMoviePress = (movie: MovieData) => {
    onMoviePress?.(movie)
  }

  const renderItem = ({ item }: { item: MovieData }) => (
    <MovieCard 
      movie={item} 
      onPress={() => handleMoviePress(item)}
    />
  )

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        renderItem={renderItem}
        // keyExtractor={(item) => item.id.toString()||item.title}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.carouselContainer}
        contentContainerStyle={{
          paddingRight: moderateScale(20),
        }}
      />
    </View>
  )
}

export default MovieCarousel

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: verticalScale(40),
    paddingHorizontal: moderateScale(20),
    zIndex: 100,
  },
  sectionTitle: {
    fontFamily: FontFamily.PublicSans_Bold,
    fontSize: scale(30),
    color: CommonColors.white,
    marginBottom: verticalScale(24),
    marginLeft: moderateScale(20),
  },
  carouselContainer: {
    paddingVertical: verticalScale(25),
    paddingHorizontal: moderateScale(20),
  },
}) 