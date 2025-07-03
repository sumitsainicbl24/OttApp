import React, { useMemo, useRef, useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { CommonColors } from '../styles/Colors'
import { moderateScale, scale, verticalScale } from '../styles/scaling'
import FontFamily from '../constants/FontFamily'
import ShowCatCard from './ShowCatCard'
import { debounce } from '../utils/CommonFunctions'

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
  const flashListRef = useRef<FlashList<ShowData>>(null)
  const lastScrollTimeRef = useRef<number>(0)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Create a debounced version of getMovieDetails
  const debouncedGetMovieDetails = useMemo(
    () => getMovieDetails ? debounce(getMovieDetails, 300) : undefined,
    [getMovieDetails]
  )

  // Debounced scroll to center function
  const debouncedScrollToCenter = useCallback(
    debounce((index: number) => {
      const now = Date.now()
      const timeSinceLastScroll = now - lastScrollTimeRef.current
      
      // Only scroll to center if enough time has passed since last scroll
      // This prevents interference with rapid/continuous scrolling
      if (timeSinceLastScroll > 100) {
        flashListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5, // 0.5 centers the item
        })
      }
    }, 150),
    []
  )

  const handleShowPress = (show: ShowData) => {
    console.log(`${title} selected:`, show.title)
    // onShowPress?.(show)
  }

  const handleItemFocus = (index: number, item: ShowData) => {
    onFocus?.()
    debouncedGetMovieDetails?.(item?.title)
    
    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    
    // Set a timeout to center the item after a brief delay
    // This allows for smooth continuous scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      debouncedScrollToCenter(index)
    }, 200)
  }

  // Track scroll events to prevent centering during active scrolling
  const handleScroll = () => {
    lastScrollTimeRef.current = Date.now()
  }

  console.log('data in ShowCatCarousel', data)
  

  const renderShowItem = ({ item, index }: { item: ShowData; index: number }) => (
    <ShowCatCard
      show={item} 
      onPress={() => handleShowPress(item)}
      onFocus={() => handleItemFocus(index, item)}
    />
  )

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlashList
        ref={flashListRef}
        data={data}
        renderItem={renderShowItem}
        keyExtractor={(item) => item?.url?.toString() || ''}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        // style={styles.carouselContainer}
        contentContainerStyle={{
          paddingRight: moderateScale(20),
          paddingLeft: moderateScale(20),
          paddingVertical: verticalScale(35),
          paddingHorizontal: moderateScale(20),
          paddingTop: verticalScale(45),
        }}
        estimatedItemSize={200}
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
    // marginBottom: verticalScale(5),
    marginLeft: moderateScale(20),
  },
  carouselContainer: {
    paddingVertical: verticalScale(35),
    paddingHorizontal: moderateScale(20),
    paddingTop: verticalScale(45),
  },
}) 