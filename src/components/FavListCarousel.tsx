import React from 'react'
import { StyleSheet, Text, View, FlatList } from 'react-native'
import { CommonColors } from '../styles/Colors'
import { moderateScale, scale, verticalScale } from '../styles/scaling'
import FontFamily from '../constants/FontFamily'
import ShowCatCard from './ShowCatCard'

interface ShowData {
  id: number
  title: string
  image: any // ImageSourcePropType
  category?: string
}

interface FavListCarouselProps {
  title: string
  data: ShowData[]
  onShowPress?: (show: ShowData) => void
  onFocus?: () => void
}

const FavListCarousel: React.FC<FavListCarouselProps> = ({ 
  title, 
  data, 
  onShowPress,
  onFocus
}) => {
  const handleShowPress = (show: ShowData) => {
    console.log(`${title} selected:`, show.title)
    onShowPress?.(show)
  }

  const renderShowItem = ({ item }: { item: ShowData }) => (
    <ShowCatCard 
      show={item} 
      onPress={() => handleShowPress(item)}
      onFocus={onFocus}
    />
  )

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={data}
        renderItem={renderShowItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={6}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        style={styles.carouselContainer}
        contentContainerStyle={styles.wrapContainer}
      />
    </View>
  )
}

export default FavListCarousel

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: verticalScale(40),
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
  wrapContainer: {
    paddingRight: moderateScale(20),
  },
}) 