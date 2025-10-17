/**
 * TvGuideCarousel - Ultra-Optimized TV Guide Component
 * 
 * Built from scratch with maximum performance optimizations:
 * - Minimal re-renders through aggressive memoization
 * - Debounced scroll handling
 * - Static configurations
 * - Smart state management with React 18 transitions
 * - Optimal FlashList configuration
 * - Clean separation of concerns
 */

import React, {useMemo, useRef, useCallback, useState, useTransition, memo} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TVFocusGuideView,
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
import {EPGProgram} from '../utils/epgUtils';
import TvGuideChannelCard from './TvGuideChannelCard';
import {
  createTimelineSlots,
  createTimelineConfig,
  getCurrentTimePosition,
  TimelineConfig,
  TimelineSlot,
} from '../utils/timelineUtils';

// ==================== TYPES ====================

interface ChannelData {
  group?: string;
  title?: string;
  logo?: string;
  url?: string;
  epg?: EPGProgram[];
}

interface ProgramDetails {
  showTitle: string;
  timeSlot: string;
  progressPercentage: number;
  duration: string;
  description: string;
}

interface TvGuideCarouselProps {
  title?: string;
  channels: ChannelData[];
  loading?: boolean;
  onChannelPress?: (channel: ChannelData) => void;
  onFocus?: () => void;
  onChannelUrlChange?: (url: string) => void;
  onProgramDetailsChange?: (details: ProgramDetails) => void;
  disableScroll?: boolean;
}

// ==================== CONSTANTS ====================

// Static configuration - created once, never changes
const SLOT_WIDTH = scale(200);
const SLOT_DURATION_MINUTES = 30;
const TOTAL_SLOTS = 48; // 24 hours
const SCROLL_THROTTLE_MS = 100;
const AUTO_SCROLL_THRESHOLD_MINUTES = 15;
const VISIBLE_TIMELINE_WIDTH = width - scale(450);

// Pre-calculate static timeline config
const STATIC_TIMELINE_CONFIG = createTimelineConfig(
  SLOT_DURATION_MINUTES,
  TOTAL_SLOTS,
  SLOT_WIDTH
);

// ==================== SUB-COMPONENTS ====================

/**
 * TimelineHeader - Memoized timeline slot renderer
 */
const TimelineSlotItem = memo<{slot: TimelineSlot; width: number}>(
  ({slot, width}) => (
    <View style={[styles.timelineSlot, {width}]}>
      <Text style={styles.timelineText}>{slot.displayTime}</Text>
    </View>
  )
);

TimelineSlotItem.displayName = 'TimelineSlotItem';

/**
 * CurrentTimeLine - Visual indicator for current time
 */
const CurrentTimeLine = memo<{position: number}>(({position}) => {
  if (position < 0) return null;
  
  return (
    <View
      style={[
        styles.currentTimeLine,
        {left: position + moderateScale(360)},
      ]}
    />
  );
});

CurrentTimeLine.displayName = 'CurrentTimeLine';

/**
 * AutoScrollIndicator - Shows when auto-scrolling
 */
const AutoScrollIndicator = memo<{visible: boolean}>(({visible}) => {
  if (!visible) return null;
  
  return (
    <View style={styles.autoScrollBadge}>
      <Text style={styles.autoScrollText}>Auto-scrolling...</Text>
    </View>
  );
});

AutoScrollIndicator.displayName = 'AutoScrollIndicator';

/**
 * LoadingState - Centered loading indicator
 */
const LoadingState = memo(() => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator 
      size="large" 
      color={CommonColors.blueText} 
      style={styles.activityIndicator} 
    />
    <Text style={styles.loadingText}>Loading channels...</Text>
  </View>
));

LoadingState.displayName = 'LoadingState';

// ==================== MAIN COMPONENT ====================

const TvGuideCarousel: React.FC<TvGuideCarouselProps> = ({
  title,
  channels,
  loading = false,
  onChannelPress,
  onFocus,
  onChannelUrlChange,
  onProgramDetailsChange,
  disableScroll = false,
}) => {
  // ==================== REFS ====================
  
  const channelListRef = useRef<FlashList<ChannelData>>(null);
  const timelineScrollRef = useRef<ScrollView>(null);
  
  // ==================== NAVIGATION & DISPATCH ====================
  
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const dispatch = useAppDispatch();
  
  // ==================== STATE ====================
  
  const [timelineScrollOffset, setTimelineScrollOffset] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  // ==================== TIMELINE CONFIGURATION ====================
  
  // Memoized timeline config with scroll offset
  const timelineConfig = useMemo<TimelineConfig>(() => ({
    ...STATIC_TIMELINE_CONFIG,
    scrollOffset: timelineScrollOffset,
  }), [timelineScrollOffset]);
  
  // Generate timeline slots
  const timelineSlots = useMemo(
    () => createTimelineSlots(timelineConfig),
    [timelineScrollOffset]
  );
  
  // Calculate current time position
  const currentTimePosition = useMemo(
    () => getCurrentTimePosition(timelineSlots, SLOT_WIDTH),
    [timelineSlots]
  );
  
  // Format current date/time - calculated once on mount
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
  }, []); // Only once
  
  // ==================== SCROLL HANDLING ====================
  
  // Debounced scroll offset setter
  const debouncedSetScrollOffset = useMemo(
    () => debounce((scrollX: number) => {
      const slotsScrolled = Math.round(scrollX / SLOT_WIDTH);
      const minutesOffset = slotsScrolled * SLOT_DURATION_MINUTES; // Fixed: Use actual slot duration (30 mins)
      
      // Low-priority update using transition
      startTransition(() => {
        setTimelineScrollOffset(minutesOffset);
      });
    }, SCROLL_THROTTLE_MS),
    []
  );
  
  // Timeline scroll handler - extracts value immediately
  const handleTimelineScroll = useCallback((event: any) => {
    const scrollX = event.nativeEvent?.contentOffset?.x || 0;
    debouncedSetScrollOffset(scrollX);
  }, [debouncedSetScrollOffset]);
  
  // ==================== AUTO-SCROLL LOGIC ====================
  
  // Auto-scroll when program focus reaches edge
  const handleProgramFocusAutoScroll = useCallback(
    (channelIndex: number, programIndex: number, programPosition: any) => {
      if (isAutoScrolling || !programPosition) return;
      
      const programLeft = programPosition.left || 0;
      const programWidth = programPosition.width || 0;
      const programRight = programLeft + programWidth;
      
      const leftThreshold = VISIBLE_TIMELINE_WIDTH * 0.2;
      const rightThreshold = VISIBLE_TIMELINE_WIDTH * 0.8;
      
      let newScrollOffset = timelineScrollOffset;
      
      // Check if need to scroll left
      if (programLeft < leftThreshold) {
        const targetLeft = VISIBLE_TIMELINE_WIDTH * 0.4;
        const scrollAmount = (targetLeft - programLeft) / SLOT_WIDTH;
        newScrollOffset = Math.max(0, timelineScrollOffset - scrollAmount * SLOT_DURATION_MINUTES);
      }
      // Check if need to scroll right
      else if (programRight > rightThreshold) {
        const targetRight = VISIBLE_TIMELINE_WIDTH * 0.6;
        const scrollAmount = (programRight - targetRight) / SLOT_WIDTH;
        newScrollOffset = timelineScrollOffset + scrollAmount * SLOT_DURATION_MINUTES;
      }
      
      // Only scroll if significant change
      const changeAmount = Math.abs(newScrollOffset - timelineScrollOffset);
      if (changeAmount > AUTO_SCROLL_THRESHOLD_MINUTES) {
        setIsAutoScrolling(true);
        setTimelineScrollOffset(newScrollOffset);
        
        // Scroll the ScrollView
        const scrollX = (newScrollOffset / SLOT_DURATION_MINUTES) * SLOT_WIDTH;
        timelineScrollRef.current?.scrollTo({
          x: scrollX,
          animated: true,
        });
        
        // Reset auto-scrolling flag
        setTimeout(() => setIsAutoScrolling(false), 500);
      }
    },
    [timelineScrollOffset, isAutoScrolling]
  );
  
  // ==================== CHANNEL HANDLING ====================
  
  // Scroll to specific channel
  const scrollToChannel = useCallback((channelIndex: number) => {
    if (!channelListRef.current || disableScroll) return;
    
    setTimeout(() => {
      channelListRef.current?.scrollToIndex({
        index: channelIndex,
        animated: true,
        viewPosition: 0,
        viewOffset: verticalScale(120),
      });
    }, 100);
  }, [disableScroll]);
  
  // Handle channel focus
  const handleChannelFocus = useCallback((channelIndex: number, channel: ChannelData) => {
    onFocus?.();
    scrollToChannel(channelIndex);
  }, [onFocus, scrollToChannel]);
  
  // Handle channel press
  const handleChannelPress = useCallback((channel: ChannelData) => {
    dispatch(setCurrentlyPlaying(channel));
    onChannelPress?.(channel);
  }, [dispatch, onChannelPress]);
  
  // ==================== RENDER FUNCTIONS ====================
  
  // Render timeline slot
  const renderTimelineSlot = useCallback(({item}: {item: TimelineSlot; index: number}) => (
    <TimelineSlotItem slot={item} width={SLOT_WIDTH} />
  ), []);
  
  // Render channel card
  const renderChannelCard = useCallback(
    ({item, index}: {item: ChannelData; index: number}) => (
      <TvGuideChannelCard
        channel={item}
        channelIndex={index}
        timelineConfig={timelineConfig}
        onChannelPress={() => handleChannelPress(item)}
        onChannelFocus={() => handleChannelFocus(index, item)}
        onChannelUrlChange={onChannelUrlChange}
        onProgramDetailsChange={onProgramDetailsChange}
        onProgramFocusAutoScroll={handleProgramFocusAutoScroll}
        showProgramDetails={true}
      />
    ),
    [
      timelineConfig,
      handleChannelPress,
      handleChannelFocus,
      onChannelUrlChange,
      onProgramDetailsChange,
      handleProgramFocusAutoScroll,
    ]
  );
  
  // Key extractor
  const keyExtractor = useCallback(
    (item: ChannelData, index: number) => item?.url || `channel-${index}`,
    []
  );
  
  // Get item type for better recycling
  const getItemType = useCallback(
    (item: ChannelData) => {
      // All items are same type for consistent recycling
      return 'channel';
    },
    []
  );
  
  // Override item layout for better performance
  const overrideItemLayout = useCallback(
    (layout: any, item: ChannelData, index: number) => {
      layout.size = verticalScale(50); // Base height
    },
    []
  );
  
  // ==================== RENDER ====================
  
  return (
    <View style={styles.container}>
      <ScrollView
        ref={timelineScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleTimelineScroll}
        scrollEventThrottle={SCROLL_THROTTLE_MS}
        style={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          {/* Timeline Header */}
          <View focusable={false} style={styles.timelineHeader}>
            {/* Date/Time Display */}
            <View style={styles.dateTimeContainer}>
              <Text style={styles.dateTimeText}>{currentDateTime}</Text>
            </View>
            
            {/* Timeline Slots */}
            <View style={styles.timelineSlotsContainer}>
              <View style={[styles.timelineContent, {flexDirection: 'row'}]}>
                {timelineSlots.map((slot, index) => (
                  <TimelineSlotItem 
                    key={`slot-${index}`} 
                    slot={slot} 
                    width={SLOT_WIDTH} 
                  />
                ))}
              </View>
            </View>
          </View>
          
          {/* Channel List */}
          <TVFocusGuideView autoFocus style={styles.channelListContainer}>
            {loading ? (
              <LoadingState />
            ) : (
              <>
                <FlashList
                  ref={channelListRef}
                  data={channels}
                  renderItem={renderChannelCard}
                  keyExtractor={keyExtractor}
                  getItemType={getItemType}
                  overrideItemLayout={overrideItemLayout}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.channelListContent}
                  estimatedItemSize={verticalScale(50)}
                  drawDistance={verticalScale(300)}
                  estimatedListSize={{
                    height: height,
                    width: width,
                  }}
                  scrollEnabled={!disableScroll}
                  removeClippedSubviews={true}
                />
                
                {/* Current time indicator line */}
                <CurrentTimeLine position={currentTimePosition} />
                
                {/* Auto-scroll indicator */}
                <AutoScrollIndicator visible={isAutoScrolling} />
              </>
            )}
          </TVFocusGuideView>
        </View>
      </ScrollView>
    </View>
  );
};

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    width: width,
    height: height,
    paddingHorizontal: moderateScale(20),
    // backgroundColor: CommonColors.white,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    minWidth: width * 2,
    flexDirection: 'column',
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: verticalScale(60),
    marginBottom: verticalScale(10),
    borderBottomColor: CommonColors.textGrey + '30',
  },
  dateTimeContainer: {
    width: scale(450),
    paddingLeft: moderateScale(20),
  },
  dateTimeText: {
    textAlign: 'left',
    fontSize: scale(26),
    fontFamily: FontFamily.PublicSans_Medium,
    color: CommonColors.blueText,
  },
  timelineSlotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timelineContent: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(10),
  },
  timelineSlot: {
    height: verticalScale(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: moderateScale(5),
  },
  timelineText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(25),
    color: CommonColors.textGrey,
    textAlign: 'center',
  },
  channelListContainer: {
    flex: 1,
    position: 'relative',
  },
  channelListContent: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(18),
  },
  currentTimeLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: CommonColors.blueOpacity30,
    zIndex: 15,
  },
  autoScrollBadge: {
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
  },
  activityIndicator: {
    height: 60,
    width: 60,
  },
  loadingText: {
    color: CommonColors.white,
    fontSize: scale(18),
    fontFamily: FontFamily.PublicSans_Medium,
    marginTop: verticalScale(16),
  },
});

// ==================== EXPORT ====================

export default memo(TvGuideCarousel);

