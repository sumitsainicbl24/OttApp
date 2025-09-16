import React, {useMemo, useRef, useCallback, useState} from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {CommonColors} from '../styles/Colors';
import {height, moderateScale, scale, verticalScale, width} from '../styles/scaling';
import FontFamily from '../constants/FontFamily';
import {debounce} from '../utils/CommonFunctions';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {MainStackParamList} from '../navigation/NavigationsTypes';
import {setCurrentlyPlaying} from '../redux/reducers/main';
import {useAppDispatch} from '../redux/hooks';
import ShowChannelCatCard from './ShowChannelCatCard';
import {EPGProgram} from '../utils/epgUtils';
import {
  createTimelineSlots,
  createTimelineConfig,
  getCurrentTimePosition,
} from '../utils/timelineUtils';

interface ShowData {
  group?: string;
  title?: string;
  logo?: string;
  url?: string;
  epg?: EPGProgram[];
}

interface TimelineItem {
  id: string;
  startTime: string;
  endTime: string;
  middleTime: string;
  displayTimeRange: string;
  startTimestamp: number;
  endTimestamp: number;
}

interface ShowChannelCatCarouselProps {
  title: string;
  data: ShowData[];
  onShowPress?: (show: ShowData) => void;
  onFocus?: () => void;
  getMovieDetails?: (movie: any) => void;
  horizontal?: boolean;
  type?: string;
  mainStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  disableScroll?: boolean;
  setChannelUrl?: (url: string) => void;
  setProgramDetails?: (details: {
    showTitle: string;
    timeSlot: string;
    progressPercentage: number;
    duration: string;
    description: string;
  }) => void;
  loading?: boolean;
  handleBlockPress?: (show: ShowData) => void;
}

const ShowChannelCatCarouselTvGuide: React.FC<ShowChannelCatCarouselProps> = ({
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
  setChannelUrl,
  setProgramDetails,
  loading = false,
  handleBlockPress,
}) => {
  const flashListRef = useRef<FlashList<ShowData>>(null);
  const timelineScrollRef = useRef<ScrollView>(null);
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const dispatch = useAppDispatch();
  const [timelineScrollOffset, setTimelineScrollOffset] = useState<number>(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  // Calculate number of columns based on screen width and card width

  // Create a debounced version of getMovieDetails
  const debouncedGetMovieDetails = useMemo(
    () => (getMovieDetails ? debounce(getMovieDetails, 300) : undefined),
    [getMovieDetails],
  );

  const handleShowPress = (show: ShowData) => {
    if (type === 'series') {
      dispatch(setCurrentlyPlaying(show));
      navigation.navigate('MoviePlayScreen', {show: show});
    }
    if (type === 'movies') {
      dispatch(setCurrentlyPlaying(show));
      navigation.navigate('MoviePlayScreen', {movie: show});
    }
  };

  const scrollToRow = useCallback(
    (itemIndex: number) => {
      if (horizontal) {
        // For horizontal scroll, scroll to the specific item
        setTimeout(() => {
          flashListRef.current?.scrollToIndex({
            index: itemIndex,
            animated: true,
            viewPosition: 0.5, // Center the item
          });
        }, 100);
      } else {
        // For grid scroll, scroll to the row

        const rowIndex = Math.floor(itemIndex);
        const scrollToIndex = rowIndex;
        if (!disableScroll) {
          flashListRef.current?.scrollToIndex({
            index: scrollToIndex,
            animated: true,
            viewPosition: 0, // Scroll to top
          });
        }
        // setTimeout(() => {
        //   flashListRef.current?.scrollToIndex({
        //     index: scrollToIndex,
        //     animated: true,
        //     viewPosition: 0, // Scroll to top
        //   })
        // }, 100)
      }
    },
    [horizontal],
  );

  const handleItemFocus = (index: number, item: ShowData) => {
    onFocus?.();
    debouncedGetMovieDetails?.(item?.title);
    scrollToRow(index);
  };



  // Create timeline configuration for 24 hours (48 slots of 30 minutes each)
  const timelineConfig = useMemo(
    () => createTimelineConfig(30, 48, scale(200)),
    [],
  );

  // Generate timeline slots with scroll offset
  const timelineSlots = useMemo(
    () =>
      createTimelineSlots({
        ...timelineConfig,
        scrollOffset: timelineScrollOffset,
      }),
    [timelineConfig, timelineScrollOffset],
  );

  // Get current time position
  const currentTimePosition = useMemo(
    () => getCurrentTimePosition(timelineSlots, timelineConfig.slotWidth),
    [timelineSlots, timelineConfig.slotWidth],
  );

  const formatCurrentDateTime = (): string => {
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const date = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? 'PM' : 'AM';

    return `${dayName}, ${monthName} ${date}, ${hour12}:${minutes
      .toString()
      .padStart(2, '0')} ${ampm}`;
  };

  const renderTimelineItem = ({item, index}: {item: any; index: number}) => {
    return (
      <View style={[styles.timelineItem, {width: timelineConfig.slotWidth}]}>
        <Text style={styles.timelineText}>{item.displayTime}</Text>
      </View>
    );
  };

  // Handle horizontal scroll to shift timeline
  const handleTimelineScroll = (event: any) => {
    const {contentOffset} = event.nativeEvent;
    const scrollX = contentOffset.x;

    // Calculate how many 30-minute slots we've scrolled
    const slotsScrolled = Math.round(scrollX / timelineConfig.slotWidth);
    const minutesOffset = slotsScrolled * 10; // 30 minutes per slot

    // Update the scroll offset
    setTimelineScrollOffset(minutesOffset);
  };

  // Reset timeline to current time
  const resetTimelineToCurrentTime = () => {
    setTimelineScrollOffset(0);
  };

  // Auto-scroll timeline when focus reaches the end of visible area
  const handleProgramFocusWithAutoScroll = useCallback(
    (channelIndex: number, programIndex: number, programPosition: any) => {
      if (isAutoScrolling) return; // Prevent multiple auto-scrolls

      // Calculate the visible timeline width (screen width minus channel info width)
      const visibleTimelineWidth = width - scale(450); // Channel info width
      const programLeft = programPosition?.left || 0;
      const programWidth = programPosition?.width || 0;
      const programRight = programLeft + programWidth;

      // Define edge thresholds (20% from each edge)
      const leftThreshold = visibleTimelineWidth * 0.2;
      const rightThreshold = visibleTimelineWidth * 0.8;

      let newScrollOffset = timelineScrollOffset;

      // Check if program is near the left edge
      if (programLeft < leftThreshold) {
        // Scroll left to center the program
        const targetLeft = visibleTimelineWidth * 0.4; // Center the program
        const scrollAmount = (targetLeft - programLeft) / timelineConfig.slotWidth;
        newScrollOffset = Math.max(0, timelineScrollOffset - scrollAmount * 30); // 30 minutes per slot
      }
      // Check if program is near the right edge
      else if (programRight > rightThreshold) {
        // Scroll right to center the program
        const targetRight = visibleTimelineWidth * 0.6; // Center the program
        const scrollAmount = (programRight - targetRight) / timelineConfig.slotWidth;
        newScrollOffset = timelineScrollOffset + scrollAmount * 30; // 30 minutes per slot
      }

      // Only update if there's a significant change
      if (Math.abs(newScrollOffset - timelineScrollOffset) > 15) { // 15 minutes threshold
        setIsAutoScrolling(true);
        setTimelineScrollOffset(newScrollOffset);
        
        // Also scroll the ScrollView to the new position
        const scrollX = (newScrollOffset / 30) * timelineConfig.slotWidth; // Convert minutes to pixels
        timelineScrollRef.current?.scrollTo({
          x: scrollX,
          animated: true,
        });
        
        // Reset auto-scrolling flag after animation completes
        setTimeout(() => {
          setIsAutoScrolling(false);
        }, 500);
      }
    },
    [timelineScrollOffset, timelineConfig.slotWidth, isAutoScrolling]
  );

  const renderShowItem = React.useCallback(
    ({item, index}: {item: ShowData; index: number}) => (
      <ShowChannelCatCard
        handleBlockPress={handleBlockPress}
        show={item}
        channelIndex={index}
        onPress={() => handleShowPress(item)}
        onFocus={() => handleItemFocus(index, item)}
        setChannelUrl={setChannelUrl}
        setProgramDetails={setProgramDetails}
        timelineConfig={{
          ...timelineConfig,
          scrollOffset: timelineScrollOffset,
        }}
        onProgramFocusWithAutoScroll={handleProgramFocusWithAutoScroll}
      />
    ),
    [
      handleShowPress,
      handleItemFocus,
      setChannelUrl,
      setProgramDetails,
      timelineConfig,
      timelineScrollOffset,
      handleProgramFocusWithAutoScroll,
    ],
  );

  console.log(data, 'data in channel carousel');

  return (
    <View
      style={[
        styles.sectionContainer,
        horizontal && styles.horizontalSectionContainer,
        mainStyle,
      ]}>
      {/* <Text style={[styles.sectionTitle, titleStyle]}>{title}</Text> */}

      {/* Timeline and EPG Grid Container */}
      <ScrollView
        ref={timelineScrollRef}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        onScroll={handleTimelineScroll}
        scrollEventThrottle={16}
        style={styles.epgScrollContainer}>
        <View style={styles.epgContentContainer}>
          {/* Timeline Header */}
          <View focusable={false} style={styles.timelineContainer}>
            <View style={{width: scale(450), paddingLeft: moderateScale(20)}}>
              <Text
                style={{
                  textAlign: 'left',
                  fontSize: scale(32),
                  fontFamily: FontFamily.PublicSans_Medium,
                  color: CommonColors.blueText,
                }}>
                {formatCurrentDateTime()}
              </Text>
            </View>
            <View style={styles.timelineContainer}>
              <FlashList
                data={timelineSlots}
                renderItem={renderTimelineItem}
                keyExtractor={(item, index) => index.toString()}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                estimatedItemSize={timelineConfig.slotWidth}
                contentContainerStyle={styles.timelineContentContainer}
                focusable={false}
                scrollEnabled={false} // Disable individual scrolling since parent handles it
              />
            </View>
          </View>

          {/* Channel List */}
          <View style={styles.carouselWrapper}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={CommonColors.blueText} style={{height:60 , width:60}} />
                <Text style={styles.loadingText}>Loading channels...</Text>
              </View>
            ) : (
              <>
                <FlashList
                  ref={flashListRef}
                  data={data}
                  renderItem={renderShowItem}
                  keyExtractor={(item, index) =>
                    item?.url?.toString() || index.toString()
                  }
                  horizontal={horizontal}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={
                    horizontal
                      ? styles.horizontalGridContainer
                      : styles.gridContainer
                  }
                  estimatedItemSize={horizontal ? scale(250) : verticalScale(400)}
                  scrollEnabled={!disableScroll}
                />

                {/* Current time line across all channels */}
                {currentTimePosition >= 0 && (
                  <View
                    style={[
                      styles.currentTimeLineAcrossChannels,
                      {left: currentTimePosition + moderateScale(360)}, // Offset by channel name width
                    ]}
                  />
                )}

                {/* Auto-scroll indicator */}
                {isAutoScrolling && (
                  <View style={styles.autoScrollIndicator}>
                    <Text style={styles.autoScrollText}>Auto-scrolling...</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default React.memo(ShowChannelCatCarouselTvGuide);

const styles = StyleSheet.create({
  sectionContainer: {
    width: width,
    paddingHorizontal: moderateScale(20),
    height: height/1.8,
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
    // borderBottomWidth: 1,
    borderBottomColor: CommonColors.textGrey + '30',
    position: 'relative',
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
  currentTimeIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: CommonColors.white,
    zIndex: 10,
  },
  currentTimeLineAcrossChannels: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: CommonColors.blueOpacity30,
    zIndex: 15, // Higher z-index to appear above channel content
    // For Android shadow
  },
  epgScrollContainer: {
    flex: 1,
  },
  epgContentContainer: {
    minWidth: width * 2, // Make content wider than screen to enable scrolling
    flexDirection: 'column',
  },
  autoScrollIndicator: {
    position: 'absolute',
    top: verticalScale(10),
    right: moderateScale(20),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(4),
    zIndex: 20,
  },
  autoScrollText: {
    color: CommonColors.white,
    fontSize: scale(14),
    fontFamily: FontFamily.PublicSans_Medium,
  },
  loadingContainer: {
    // flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(40),
    // backgroundColor:'red',
    height:60,
    width:width/1.5,
    // alig
  },
  loadingText: {
    color: CommonColors.white,
    fontSize: scale(18),
    fontFamily: FontFamily.PublicSans_Medium,
    marginTop: verticalScale(16),
  },
});
