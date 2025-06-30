import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { CommonColors } from '../styles/Colors'
import { moderateScale, scale, verticalScale } from '../styles/scaling'
import FontFamily from '../constants/FontFamily'
import ContinueWatchingCard from './ContinueWatchingCard'

interface ContinueWatchingData {
  id: number
  title: string
  image: any // ImageSourcePropType
}

interface ContinueWatchingCarouselProps {
  data: ContinueWatchingData[]
  onItemPress?: (item: ContinueWatchingData) => void
}

const ContinueWatchingCarousel: React.FC<ContinueWatchingCarouselProps> = ({ 
  data, 
  onItemPress 
}) => {
  const handleItemPress = (item: ContinueWatchingData) => {
    console.log('Continue watching selected:', item.title)
    onItemPress?.(item)
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Continue Watching</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.carouselContainer}
      >
        {data.map((item, index) => (
          <ContinueWatchingCard 
            key={item.id} 
            data={item} 
            onPress={() => handleItemPress(item)}
          />
        ))}
      </ScrollView>
    </View>
  )
}

export default ContinueWatchingCarousel

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: verticalScale(40),
    paddingHorizontal: moderateScale(20),
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