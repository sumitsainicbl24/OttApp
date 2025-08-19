import React, { useMemo, useRef, useCallback } from 'react'
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { CommonColors } from '../styles/Colors'
import { moderateScale, scale, verticalScale, width } from '../styles/scaling'
import FontFamily from '../constants/FontFamily'
import { debounce } from '../utils/CommonFunctions'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { MainStackParamList } from '../navigation/NavigationsTypes'
import { setCurrentlyPlaying } from '../redux/reducers/main'
import { useAppDispatch } from '../redux/hooks'
import ShowChannelCatCard from './ShowChannelCatCard'

interface ShowData {
  group?: string
  title?: string
  logo?: string
  url?: string
}

interface ShowChannelCatCarouselProps {
  title: string
  data: ShowData[]
  onShowPress?: (show: ShowData) => void
  onFocus?: () => void
  getMovieDetails?: (movie: any) => void
  horizontal?: boolean
  type?: string
  mainStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  disableScroll?: boolean;
  setChannelUrl?: (url: string) => void;
}

const ShowChannelCatCarousel: React.FC<ShowChannelCatCarouselProps> = ({ 
  title, 
  data,   
  onShowPress,
  onFocus,
  getMovieDetails,
  horizontal = false,
  type,
  mainStyle,
  titleStyle,
  disableScroll = false,
  setChannelUrl
}) => {
  const flashListRef = useRef<FlashList<ShowData>>(null)
  const navigation = useNavigation<NavigationProp<MainStackParamList>>()
  const dispatch = useAppDispatch()
  // Calculate number of columns based on screen width and card width
  
  // Create a debounced version of getMovieDetails
  const debouncedGetMovieDetails = useMemo(
    () => getMovieDetails ? debounce(getMovieDetails, 300) : undefined,
    [getMovieDetails]
  )

  const handleShowPress = (show: ShowData) => {
    if(type === 'series'){
      dispatch(setCurrentlyPlaying(show))
      navigation.navigate('MoviePlayScreen', { show: show })
    }
    if(type === 'movies'){
      dispatch(setCurrentlyPlaying(show))
      navigation.navigate('MoviePlayScreen', { movie: show })
    }
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

      const rowIndex = Math.floor(itemIndex)
      const scrollToIndex = rowIndex
      if(!disableScroll){
      flashListRef.current?.scrollToIndex({
          index: scrollToIndex,
          animated: true,
          viewPosition: 0, // Scroll to top
        })
      }
      // setTimeout(() => {
      //   flashListRef.current?.scrollToIndex({
      //     index: scrollToIndex,
      //     animated: true,
      //     viewPosition: 0, // Scroll to top
      //   })
      // }, 100)
    }
  }, [horizontal])

  const handleItemFocus = (index: number, item: ShowData) => {
    onFocus?.()
    debouncedGetMovieDetails?.(item?.title)
    scrollToRow(index)
  }
  

  const renderShowItem = ({ item, index }: { item: ShowData; index: number }) => (
    <ShowChannelCatCard
      show={item}
      channelIndex={index}
      onPress={() => handleShowPress(item)}
      onFocus={() => handleItemFocus(index, item)}
      setChannelUrl={setChannelUrl}
    />
  )

  console.log(data,'data in channel carousel');
  

  return (
    <View style={[styles.sectionContainer, horizontal && styles.horizontalSectionContainer, mainStyle]}>
      <Text style={[styles.sectionTitle, titleStyle]}>{title}</Text>
      <View style={styles.carouselWrapper}>
        <FlashList
          ref={flashListRef}
          data={data}
          renderItem={renderShowItem}
          ItemSeparatorComponent={() => <View style={{height: verticalScale(15) }} />}
          keyExtractor={(item, index) => item?.url?.toString() || index.toString()}
          horizontal={horizontal}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={horizontal ? styles.horizontalGridContainer : styles.gridContainer}
          estimatedItemSize={horizontal ? scale(250) : verticalScale(400)}
          scrollEnabled={!disableScroll}
        />
      </View>
    </View>
  )
}

export default React.memo(ShowChannelCatCarousel)

const styles = StyleSheet.create({
  sectionContainer: {
    width: width,
    paddingHorizontal: moderateScale(20),
    height: verticalScale(500),
  },
  sectionTitle: {
    fontFamily: FontFamily.PublicSans_Bold,
    fontSize: scale(38),
    color: CommonColors.white,
    marginLeft: moderateScale(20),
    // marginBottom: verticalScale(20),
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