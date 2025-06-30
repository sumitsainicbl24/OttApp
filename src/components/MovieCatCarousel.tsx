import React from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { CommonColors } from '../styles/Colors'
import { moderateScale, scale, verticalScale } from '../styles/scaling'
import FontFamily from '../constants/FontFamily'
import MovieCatCard from './MovieCatCard'

interface MovieData {
  id: number
  title: string
  image: any // ImageSourcePropType
  category?: string
}

interface MovieCatCarouselProps {
  title: string
  data: MovieData[]
  onMoviePress?: (movie: MovieData) => void
  onFocus?: () => void
}

const MovieCatCarousel: React.FC<MovieCatCarouselProps> = ({ 
  title, 
  data, 
  onMoviePress,
  onFocus,
}) => {
  const handleMoviePress = (movie: MovieData) => {
    console.log(`${title} selected:`, movie.title)
    onMoviePress?.(movie)
  }

  const renderMovieItem = ({ item }: { item: MovieData }) => (
    <MovieCatCard 
      movie={item} 
      onPress={() => handleMoviePress(item)}
      onFocus={onFocus}
    />
  )

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        renderItem={renderMovieItem}
        keyExtractor={(item) => item.id.toString()}
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

export default MovieCatCarousel

const styles = StyleSheet.create({
  sectionContainer: {
    // marginTop: verticalScale(40),
    paddingHorizontal: moderateScale(20),
    zIndex: 100,
  },
  sectionTitle: {
    fontFamily: FontFamily.PublicSans_Bold,
    fontSize: scale(38),
    color: CommonColors.white,
    marginBottom: verticalScale(5),
    marginLeft: moderateScale(20),
  },
  carouselContainer: {
    paddingVertical: verticalScale(25),
    paddingHorizontal: moderateScale(20),
  },
}) 