import React, { useMemo, useRef, useCallback } from 'react'
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle, TouchableOpacity } from 'react-native'
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

interface TimelineItem {
  id: string
  startTime: string
  endTime: string
  middleTime: string
  displayTimeRange: string
  startTimestamp: number
  endTimestamp: number
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

  // Generate timeline data starting from current time with 30-minute intervals in pairs
  const generateTimelineData = (): TimelineItem[] => {
    const timeline: TimelineItem[] = []
    const now = new Date()
    
    // Start from the current hour, rounded down
    const startTime = new Date(now)
    startTime.setMinutes(0, 0, 0)
    
    // Generate 24 time slot pairs (24 hours worth of 30-minute interval pairs)
    for (let i = 0; i < 24; i++) {
      const firstSlot = new Date(startTime.getTime() + (i * 60 * 60 * 1000)) // Hour intervals
      const middleSlot = new Date(firstSlot.getTime() + (0.5 * 60 * 60 * 1000)) // 30 minutes later
      const secondSlot = new Date(firstSlot.getTime() + (1 * 60 * 60 * 1000)) // 1 Hour later
      
      const formatTime = (date: Date) => {
        const hours = date.getHours()
        const minutes = date.getMinutes()
        const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
        const ampm = hours >= 12 ? 'PM' : 'AM'
        return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`
      }
      
      const startTimeStr = formatTime(firstSlot)
      const middleTimeStr = formatTime(middleSlot)
      const endTimeStr = formatTime(secondSlot)
      
      timeline.push({
        id: `time-pair-${i}`,
        startTime: startTimeStr,
        middleTime: middleTimeStr,
        endTime: endTimeStr,
        displayTimeRange: `${startTimeStr}  -  ${endTimeStr}`,
        startTimestamp: firstSlot.getTime(),
        endTimestamp: secondSlot.getTime(),
      })
    }
    
    return timeline
  }

  const timelineData = useMemo(() => generateTimelineData(), [])

  const formatCurrentDateTime = (): string => {
    const now = new Date()
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    const dayName = days[now.getDay()]
    const monthName = months[now.getMonth()]
    const date = now.getDate()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    const ampm = hours >= 12 ? 'PM' : 'AM'
    
    return `${dayName}, ${monthName} ${date}, ${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`
  }

  const renderTimelineItem = ({ item, index }: { item: TimelineItem; index: number }) =>
    {
      console.log(item,'item in timeline');
      return (<View 
      style={styles.timelineItem}
    >
      <Text style={styles.timelineText}>{item.startTime}</Text>
    </View>
  )}

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
      {/* <Text style={[styles.sectionTitle, titleStyle]}>{title}</Text> */}

      {/* Timeline FlashList */}
      <View
      focusable={false}
      style={styles.timelineContainer}>
                 <View style={{width: scale(450), paddingLeft: moderateScale(20)}}>
           <Text style={{
             textAlign: 'left',
             fontSize: scale(32),
             fontFamily: FontFamily.PublicSans_Medium,
             color: CommonColors.blueText,
             }}>{formatCurrentDateTime()}</Text>
         </View>
        <FlashList
          data={timelineData}
          renderItem={renderTimelineItem}
          keyExtractor={(item) => item.id}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          estimatedItemSize={scale(100)}
          contentContainerStyle={styles.timelineContentContainer}
          focusable={false}
        />
      </View>
      
      <View style={styles.carouselWrapper}>
        <FlashList
          ref={flashListRef}
          data={data}
          renderItem={renderShowItem}
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
    paddingVertical: verticalScale(10),
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
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: verticalScale(60),
    marginBottom: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: CommonColors.textGrey + '30',
  },
  timelineContentContainer: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(10),
  },
  timelineItem: {
    width: scale(287),
    height: verticalScale(40),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: moderateScale(5),
  },
  timelineText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(25),
    color: CommonColors.textGrey,
    textAlign: 'center',
  },
}) 