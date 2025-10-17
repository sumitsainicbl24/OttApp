import React, {useMemo, useRef, useCallback, useState, useTransition} from 'react';
import {
  StyleSheet,
  Text,
  View,
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
import ShowChannelCatCard from './ShowChannelCatCard.optimized';
import {EPGProgram} from '../utils/epgUtils';
import {
  createTimelineSlots,
  createTimelineConfig,
  getCurrentTimePosition,
  TimelineConfig,
} from '../utils/timelineUtils';

interface ShowData {
  group?: string;
  title?: string;
  logo?: string;
  url?: string;
  epg?: EPGProgram[];
}

interface ShowChannelCatCarouselProps {
  title: string;
  data: ShowData[];
  onShowPress?: (show: ShowData) => void;
  onFocus?: () => void;
  getMovieDetails?: (movie: any) => void;
  horizontal?: boolean;
  type?: string;
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

// Move static config outside component to prevent recreation
const SLOT_WIDTH = scale(200);
const SLOT_DURATION = 30;
const TOTAL_SLOTS = 48;
const VISIBLE_TIMELINE_WIDTH = width - scale(450);
const AUTO_SCROLL_THRESHOLD = 15; // minutes
const SCROLL_THROTTLE = 100; // ms

// Create timeline config once
const staticTimelineConfig = createTimelineConfig(SLOT_DURATION, TOTAL_SLOTS, SLOT_WIDTH);

const ShowChannelCatCarouselTvGuide: React.FC<ShowChannelCatCarouselProps> = ({
  title,
  data,
  onShowPress,
  onFocus,
  getMovieDetails,
  horizontal = false,
  type,
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
  const [isPending, startTransition] = useTransition();

  // Memoize timeline config with scroll offset
  const timelineConfig = useMemo<TimelineConfig>(() => ({
    ...staticTimelineConfig,
    scrollOffset: timelineScrollOffset,
  }), [timelineScrollOffset]);

  // Generate timeline slots - memoized with scroll offset
  const timelineSlots = useMemo(
    () => createTimelineSlots(timelineConfig),
    [timelineScrollOffset] // Only recalculate when scroll offset changes
  );

  // Get current time position - memoized
  const currentTimePosition = useMemo(
    () => getCurrentTimePosition(timelineSlots, SLOT_WIDTH),
    [timelineSlots]
  );

  // Format current date time - memoized
  const currentDateTime = useMemo(() => {
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const date = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    return `${dayName}, ${monthName} ${date}, ${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }, []); // Only calculate once on mount

  // Debounced movie details fetch
  const debouncedGetMovieDetails = useMemo(
    () => (getMovieDetails ? debounce(getMovieDetails, 300) : undefined),
    [getMovieDetails],
  );

  // Handle show press - memoized
  const handleShowPress = useCallback((show: ShowData) => {
    if (type === 'series' || type === 'movies') {
      dispatch(setCurrentlyPlaying(show));
      navigation.navigate('MoviePlayScreen', {
        [type === 'series' ? 'show' : 'movie']: show
      });
    }
  }, [type, dispatch, navigation]);

  // Scroll to row - memoized
  const scrollToRow = useCallback(
    (itemIndex: number) => {
      if (!flashListRef.current) return;
      
      if (horizontal) {
        setTimeout(() => {
          flashListRef.current?.scrollToIndex({
            index: itemIndex,
            animated: true,
            viewPosition: 0.5,
          });
        }, 100);
      } else {
        const rowIndex = Math.floor(itemIndex);
        flashListRef.current.scrollToIndex({
          index: rowIndex,
          animated: true,
          viewPosition: 0,
          viewOffset: verticalScale(120),
        });
      }
    },
    [horizontal],
  );

  // Handle item focus - memoized
  const handleItemFocus = useCallback((index: number, item: ShowData) => {
    onFocus?.();
    debouncedGetMovieDetails?.(item?.title);
    scrollToRow(index);
  }, [onFocus, debouncedGetMovieDetails, scrollToRow]);

  // Throttled timeline scroll handler - extract scroll value before debounce
  const debouncedSetScrollOffset = useMemo(
    () => debounce((scrollX: number) => {
      const slotsScrolled = Math.round(scrollX / SLOT_WIDTH);
      const minutesOffset = slotsScrolled * 10;
      
      // Use transition for non-urgent update
      startTransition(() => {
        setTimelineScrollOffset(minutesOffset);
      });
    }, SCROLL_THROTTLE),
    []
  );

  const handleTimelineScroll = useCallback((event: any) => {
    // Extract scroll value immediately to avoid synthetic event issues
    const scrollX = event.nativeEvent?.contentOffset?.x || 0;
    debouncedSetScrollOffset(scrollX);
  }, [debouncedSetScrollOffset]);

  // Auto-scroll timeline when focus reaches edge - optimized
  const handleProgramFocusWithAutoScroll = useCallback(
    (channelIndex: number, programIndex: number, programPosition: any) => {
      if (isAutoScrolling || !programPosition) return;

      const programLeft = programPosition.left || 0;
      const programWidth = programPosition.width || 0;
      const programRight = programLeft + programWidth;

      const leftThreshold = VISIBLE_TIMELINE_WIDTH * 0.2;
      const rightThreshold = VISIBLE_TIMELINE_WIDTH * 0.8;

      let newScrollOffset = timelineScrollOffset;

      if (programLeft < leftThreshold) {
        const targetLeft = VISIBLE_TIMELINE_WIDTH * 0.4;
        const scrollAmount = (targetLeft - programLeft) / SLOT_WIDTH;
        newScrollOffset = Math.max(0, timelineScrollOffset - scrollAmount * 30);
      } else if (programRight > rightThreshold) {
        const targetRight = VISIBLE_TIMELINE_WIDTH * 0.6;
        const scrollAmount = (programRight - targetRight) / SLOT_WIDTH;
        newScrollOffset = timelineScrollOffset + scrollAmount * 30;
      }

      // Only update if significant change
      if (Math.abs(newScrollOffset - timelineScrollOffset) > AUTO_SCROLL_THRESHOLD) {
        setIsAutoScrolling(true);
        setTimelineScrollOffset(newScrollOffset);
        
        const scrollX = (newScrollOffset / 30) * SLOT_WIDTH;
        timelineScrollRef.current?.scrollTo({
          x: scrollX,
          animated: true,
        });
        
        setTimeout(() => setIsAutoScrolling(false), 500);
      }
    },
    [timelineScrollOffset, isAutoScrolling]
  );

  // Render timeline item - memoized
  const renderTimelineItem = useCallback(({item}: {item: any; index: number}) => {
    return (
      <View style={[styles.timelineItem, {width: SLOT_WIDTH}]}>
        <Text style={styles.timelineText}>{item.displayTime}</Text>
      </View>
    );
  }, []);

  // Render show item - optimized memoization
  const renderShowItem = useCallback(
    ({item, index}: {item: ShowData; index: number}) => (
      <ShowChannelCatCard
        handleBlockPress={() => handleBlockPress?.(item)}
        showCurrentDetails={true}
        show={item}
        channelIndex={index}
        onPress={() => handleShowPress(item)}
        onFocus={() => handleItemFocus(index, item)}
        setChannelUrl={setChannelUrl}
        setProgramDetails={setProgramDetails}
        timelineConfig={timelineConfig}
        onProgramFocusWithAutoScroll={handleProgramFocusWithAutoScroll}
      />
    ),
    [
      handleBlockPress,
      handleShowPress,
      handleItemFocus,
      setChannelUrl,
      setProgramDetails,
      timelineConfig,
      handleProgramFocusWithAutoScroll,
    ],
  );

  // Key extractor - memoized
  const keyExtractor = useCallback(
    (item: ShowData, index: number) => item?.url?.toString() || index.toString(),
    []
  );

  return (
    <View style={[styles.sectionContainer, horizontal && styles.horizontalSectionContainer]}>
      <ScrollView
        ref={timelineScrollRef}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        onScroll={handleTimelineScroll}
        scrollEventThrottle={SCROLL_THROTTLE}
        style={styles.epgScrollContainer}>
        <View style={styles.epgContentContainer}>
          {/* Timeline Header */}
          <View focusable={false} style={styles.timelineContainer}>
            <View style={styles.dateTimeContainer}>
              <Text style={styles.dateTimeText}>{currentDateTime}</Text>
            </View>
            <View style={styles.timelineContainer}>
              <FlashList
                data={timelineSlots}
                renderItem={renderTimelineItem}
                keyExtractor={(item, index) => index.toString()}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                estimatedItemSize={SLOT_WIDTH}
                contentContainerStyle={styles.timelineContentContainer}
                focusable={false}
                scrollEnabled={false}
                drawDistance={SLOT_WIDTH * 4} // Optimize rendering
              />
            </View>
          </View>

          {/* Channel List */}
          <View style={styles.carouselWrapper}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={CommonColors.blueText} style={styles.activityIndicator} />
                <Text style={styles.loadingText}>Loading channels...</Text>
              </View>
            ) : (
              <>
                <FlashList
                  ref={flashListRef}
                  data={data}
                  renderItem={renderShowItem}
                  keyExtractor={keyExtractor}
                  horizontal={horizontal}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={
                    horizontal
                      ? styles.horizontalGridContainer
                      : styles.gridContainer
                  }
                  estimatedItemSize={horizontal ? scale(250) : verticalScale(400)}
                  drawDistance={verticalScale(800)} // Optimize rendering distance
                  estimatedListSize={{
                    height: horizontal ? verticalScale(400) : height / 1.8,
                    width: horizontal ? width * 2 : width,
                  }}
                />

                {/* Current time indicator */}
                {currentTimePosition >= 0 && (
                  <View
                    style={[
                      styles.currentTimeLineAcrossChannels,
                      {left: currentTimePosition + moderateScale(360)},
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

// Styles extracted outside component for performance
const styles = StyleSheet.create({
  sectionContainer: {
    width: width,
    paddingHorizontal: moderateScale(20),
    height: height,
  },
  carouselWrapper: {
    flex: 1,
    position: 'relative',
  },
  gridContainer: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(18),
  },
  horizontalSectionContainer: {
    height: verticalScale(520),
  },
  horizontalGridContainer: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(20),
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: verticalScale(60),
    marginBottom: verticalScale(10),
    borderBottomColor: CommonColors.textGrey + '30',
    position: 'relative',
  },
  timelineContentContainer: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(10),
  },
  timelineItem: {
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
  currentTimeLineAcrossChannels: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: CommonColors.blueOpacity30,
    zIndex: 15,
  },
  epgScrollContainer: {
    flex: 1,
  },
  epgContentContainer: {
    minWidth: width * 2,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(40),
    height: 60,
    width: width/1.5,
  },
  loadingText: {
    color: CommonColors.white,
    fontSize: scale(18),
    fontFamily: FontFamily.PublicSans_Medium,
    marginTop: verticalScale(16),
  },
  activityIndicator: {
    height: 60,
    width: 60,
  },
  dateTimeContainer: {
    width: scale(450),
    paddingLeft: moderateScale(20),
  },
  dateTimeText: {
    textAlign: 'left',
    fontSize: scale(32),
    fontFamily: FontFamily.PublicSans_Medium,
    color: CommonColors.blueText,
  },
});

export default React.memo(ShowChannelCatCarouselTvGuide);

