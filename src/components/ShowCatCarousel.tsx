import React from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { CommonColors } from '../styles/Colors'
import { moderateScale, scale, verticalScale } from '../styles/scaling'
import FontFamily from '../constants/FontFamily'
import ShowCatCard from './ShowCatCard'

interface ShowData {
  group?: string
  title?: string
  logo?: string
  url?: string
}

interface ShowCatCarouselProps {
  title: string
  data: ShowData[]
  onShowPress?: (show: ShowData) => void
  onFocus?: () => void
  getMovieDetails?: (movie: any) => void
}

const ShowCatCarousel: React.FC<ShowCatCarouselProps> = ({ 
  title, 
  data,   
  onShowPress,
  onFocus,
  getMovieDetails
}) => {
  const handleShowPress = (show: ShowData) => {
    console.log(`${title} selected:`, show.title)
    // onShowPress?.(show)
  }

  console.log('data in ShowCatCarousel', data)
  

  const renderShowItem = ({ item }: { item: ShowData }) => (
    <ShowCatCard
      show={item} 
      onPress={() => handleShowPress(item)}
      onFocus={()=>{
        onFocus?.()
        getMovieDetails?.(item?.title)
      }}
    />
  )

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        renderItem={renderShowItem}
        keyExtractor={(item) => item?.url?.toString() || ''}
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

export default ShowCatCarousel

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