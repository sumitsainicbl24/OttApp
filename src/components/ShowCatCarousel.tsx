import React, { useMemo, useRef, useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import LinearGradient from 'react-native-linear-gradient'
import { CommonColors } from '../styles/Colors'
import { moderateScale, scale, verticalScale, width } from '../styles/scaling'
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
  horizontal?: boolean
}

const ShowCatCarousel: React.FC<ShowCatCarouselProps> = ({ 
  title, 
  data,   
  onShowPress,
  onFocus,
  getMovieDetails,
  horizontal = false
}) => {
  const flashListRef = useRef<FlashList<ShowData>>(null)
  
  // Calculate number of columns based on screen width and card width
  const numColumns = useMemo(() => {
    if (horizontal) return 1
    
    const cardWidth = scale(250) // ShowCatCard width
    const horizontalPadding = moderateScale(40) // Total horizontal padding
    const cardMargin = moderateScale(15) // Margin between cards
    const availableWidth = width - horizontalPadding
    const minColumns = 1
    const maxColumns = Math.floor((availableWidth + cardMargin) / (cardWidth + cardMargin))
    return Math.max(minColumns, maxColumns)
  }, [horizontal])
  
  // Create a debounced version of getMovieDetails
  const debouncedGetMovieDetails = useMemo(
    () => getMovieDetails ? debounce(getMovieDetails, 300) : undefined,
    [getMovieDetails]
  )

  const handleShowPress = (show: ShowData) => {
    console.log(`${title} selected:`, show.title)
    // onShowPress?.(show)
  }

  const scrollToRow = useCallback((itemIndex: number) => {
    if (horizontal) {
      // For horizontal scroll, scroll to the specific item
      setTimeout(() => {
        flashListRef.current?.scrollToIndex({
          index: itemIndex,
          animated: true,
          viewPosition: 0.5, // Center the item
        })
      }, 100)
    } else {
      // For grid scroll, scroll to the row
      const rowIndex = Math.floor(itemIndex / numColumns)
      const scrollToIndex = rowIndex * numColumns
      
      setTimeout(() => {
        flashListRef.current?.scrollToIndex({
          index: scrollToIndex,
          animated: true,
          viewPosition: 0, // Scroll to top
        })
      }, 100)
    }
  }, [numColumns, horizontal])

  const handleItemFocus = (index: number, item: ShowData) => {
    onFocus?.()
    debouncedGetMovieDetails?.(item?.title)
    scrollToRow(index)
  }

  console.log('data in ShowCatCarousel', data)
  console.log('Calculated numColumns:', numColumns)
  

  const renderShowItem = ({ item, index }: { item: ShowData; index: number }) => (
    <ShowCatCard
      show={item} 
      onPress={() => handleShowPress(item)}
      onFocus={() => handleItemFocus(index, item)}
      style={horizontal ? styles.horizontalGridItem : styles.gridItem}
    />
  )

  return (
    <View style={[styles.sectionContainer, horizontal && styles.horizontalSectionContainer]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.carouselWrapper}>
        <FlashList
          ref={flashListRef}
          data={data}
          renderItem={renderShowItem}
          keyExtractor={(item) => item?.url?.toString() || ''}
          numColumns={numColumns}
          horizontal={horizontal}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={horizontal ? styles.horizontalGridContainer : styles.gridContainer}
          estimatedItemSize={horizontal ? scale(250) : verticalScale(400)}
        />
        {/* Overlay to hide partially visible second row - only for grid layout */}
        {!horizontal && (
          <LinearGradient
            colors={[
              'transparent',
              'transparent',
              'transparent',
              CommonColors.themeMain + '80',
              CommonColors.themeMain,
            ]}
            style={styles.bottomOverlay}
            pointerEvents="none"
          />
        )}
      </View>
    </View>
  )
}

export default ShowCatCarousel

const styles = StyleSheet.create({
  sectionContainer: {
    width: width,
    paddingHorizontal: moderateScale(20),
    height: verticalScale(595),
  },
  sectionTitle: {
    fontFamily: FontFamily.PublicSans_Bold,
    fontSize: scale(38),
    color: CommonColors.white,
    marginLeft: moderateScale(20),
    marginBottom: verticalScale(20),
  },
  carouselWrapper: {
    flex: 1,
    position: 'relative',
  },
  gridContainer: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(20),
  },
  gridItem: {
    // flex: 1,
    marginHorizontal: moderateScale(7.5), // Half of the original marginRight to center spacing
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: verticalScale(100),
    zIndex: 10,
  },
  horizontalSectionContainer: {
    height: verticalScale(520),
  },
  horizontalGridContainer: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(20),
  },
  horizontalGridItem: {
    marginHorizontal: moderateScale(7.5),
  },
}) 