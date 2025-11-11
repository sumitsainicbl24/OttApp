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
  TVFocusGuideView,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {CommonColors} from '../styles/Colors';
import {
  height,
  moderateScale,
  scale,
  verticalScale,
  width,
} from '../styles/scaling';
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
  setChannelUrl,
  setProgramDetails,
  loading = false,
  handleBlockPress,
}) => {
  console.log('data--->>>>>', data);
  const flashListRef = useRef<FlashList<ShowData>>(null);
  const timelineScrollRef = useRef<ScrollView>(null);
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const dispatch = useAppDispatch();
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  const debouncedGetMovieDetails = useMemo(
    () => (getMovieDetails ? debounce(getMovieDetails, 300) : undefined),
    [getMovieDetails],
  );
  console.log('show channel cat carousel rendered');

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
        setTimeout(() => {
          flashListRef.current?.scrollToIndex({
            index: itemIndex,
            animated: true,
            viewPosition: 0.5,
          });
        }, 100);
      } else {
        const rowIndex = Math.floor(itemIndex);
        const scrollToIndex = rowIndex;
        if (!disableScroll) {
          flashListRef.current?.scrollToIndex({
            index: scrollToIndex,
            animated: true,
            viewPosition: 0,
            viewOffset: verticalScale(120),
          });
        }
      }
    },
    [horizontal],
  );

  const handleItemFocus = (index: number, item: ShowData) => {
    onFocus?.();
    debouncedGetMovieDetails?.(item?.title);
    scrollToRow(index);
  };

  const timelineConfig = useMemo(
    () => createTimelineConfig(30, 48, scale(280)), // Increased slot width for better spacing
    [],
  );

  const timelineSlots = useMemo(
    () => createTimelineSlots(timelineConfig),
    [timelineConfig],
  );

  const currentTimePosition = useMemo(
    () => getCurrentTimePosition(timelineSlots, timelineConfig.slotWidth),
    [timelineSlots, timelineConfig.slotWidth],
  );

  const formatCurrentDateTime = React.useCallback((): string => {
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
  }, []);

  const currentDateTime = React.useMemo(
    () => formatCurrentDateTime(),
    [formatCurrentDateTime],
  );

  const renderTimelineItem = React.useCallback(
    ({item, index}: {item: any; index: number}) => {
      return (
        <View style={[styles.timelineItem, {width: timelineConfig.slotWidth}]}>
          <Text style={styles.timelineText}>{item.displayTime}</Text>
        </View>
      );
    },
    [timelineConfig.slotWidth],
  );

  const handleProgramFocusWithAutoScroll = useCallback(
    (channelIndex: number, programIndex: number, programPosition: any) => {
      if (isAutoScrolling) return; // Prevent multiple auto-scrolls

      const visibleTimelineWidth = width - scale(350); // Channel info width
      const programLeft = programPosition?.left || 0;
      const programWidth = programPosition?.width || 0;
      const programRight = programLeft + programWidth;

      const leftThreshold = visibleTimelineWidth * 0.2;
      const rightThreshold = visibleTimelineWidth * 0.8;

      if (programLeft < leftThreshold) {
        const targetLeft = visibleTimelineWidth * 0.4; // Center the program
        const scrollX = Math.max(0, programLeft - targetLeft);

        setIsAutoScrolling(true);
        timelineScrollRef.current?.scrollTo({
          x: scrollX,
          animated: true,
        });

        setTimeout(() => {
          setIsAutoScrolling(false);
        }, 500);
      } else if (programRight > rightThreshold) {
        const targetRight = visibleTimelineWidth * 0.6; // Center the program
        const scrollX = programRight - targetRight;

        setIsAutoScrolling(true);
        timelineScrollRef.current?.scrollTo({
          x: scrollX,
          animated: true,
        });

        setTimeout(() => {
          setIsAutoScrolling(false);
        }, 500);
      }
    },
    [timelineConfig.slotWidth, isAutoScrolling],
  );

  const renderShowItem = ({item, index}: {item: ShowData; index: number}) => (
    <ShowChannelCatCard
      show={item}
      channelIndex={index}
      onPress={() => handleShowPress(item)}
      onFocus={() => handleItemFocus(index, item)}
      setChannelUrl={setChannelUrl}
      setProgramDetails={setProgramDetails}
      timelineConfig={timelineConfig}
      onProgramFocusWithAutoScroll={handleProgramFocusWithAutoScroll}
    />
  );

  // const renderShowItem = React.useCallback(
  //   ({item, index}: {item: ShowData; index: number}) => (
  //     <ShowChannelCatCard
  //       show={item}
  //       channelIndex={index}
  //       onPress={() => handleShowPress(item)}
  //       onFocus={() => handleItemFocus(index, item)}
  //       setChannelUrl={setChannelUrl}
  //       setProgramDetails={setProgramDetails}
  //       timelineConfig={timelineConfig}
  //       onProgramFocusWithAutoScroll={handleProgramFocusWithAutoScroll}
  //     />
  //   ),
  //   [
  //     handleShowPress,
  //     handleItemFocus,
  //     setChannelUrl,
  //     setProgramDetails,
  //     timelineConfig,
  //     handleProgramFocusWithAutoScroll,
  //     handleBlockPress,
  //     data,
  //   ],
  // );

  return (
    <View style={[styles.sectionContainer, mainStyle]}>
      <ScrollView
        ref={timelineScrollRef}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        style={styles.epgScrollContainer}>
        <View style={styles.epgContentContainer}>
          <View focusable={false} style={styles.timelineContainer}>
            <View style={{width: scale(350), paddingLeft: moderateScale(20)}}>
              <Text
                style={{
                  textAlign: 'left',
                  fontSize: scale(26),
                  fontFamily: FontFamily.PublicSans_Medium,
                  color: CommonColors.blueText,
                }}>
                {currentDateTime}
              </Text>
            </View>
            {/* <View style={styles.timelineContainer}> */}
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
              getItemType={() => 'timeline'}
            />
            {/* </View> */}
          </View>

          <View style={styles.carouselWrapper}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color={CommonColors.blueText}
                  style={{height: 60, width: 60}}
                />
                <Text style={styles.loadingText}>Loading channels...</Text>
              </View>
            ) : (
              <TVFocusGuideView autoFocus style={{flex: 1}}>
                <FlashList
                  ref={flashListRef}
                  data={data}
                  renderItem={renderShowItem}
                  keyExtractor={(item, index) =>
                    item?.url?.toString() || index.toString()
                  }
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.gridContainer}
                  estimatedItemSize={verticalScale(65)}
                  scrollEnabled={!disableScroll}
                  removeClippedSubviews={false}
                  drawDistance={verticalScale(300)}
                  estimatedListSize={styles.mainFlashListSize}
                  overrideItemLayout={(layout, item, index) => {
                    layout.size = verticalScale(65);
                  }}
                />
                {currentTimePosition >= 0 && (
                  <View
                    style={[
                      styles.currentTimeLineAcrossChannels,
                      {left: currentTimePosition + moderateScale(300)}, // Offset by channel name width
                    ]}>
                    <View style={styles.circle} />
                  </View>
                )}

                {isAutoScrolling && (
                  <View style={styles.autoScrollIndicator}>
                    <Text style={styles.autoScrollText}>Auto-scrolling...</Text>
                  </View>
                )}
              </TVFocusGuideView>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default React.memo(ShowChannelCatCarousel);

const styles = StyleSheet.create({
  sectionContainer: {
    width: width,
    paddingHorizontal: moderateScale(20),
    height: height / 1.6,
    // backgroundColor:'rgb(19,22,27)'
  },
  mainFlashListSize: {
    height: height / 1.8,
    width: width,
  },
  circle: {
    width: 8,
    height: 8,
    backgroundColor: CommonColors.blueOpacity50,
    borderRadius: moderateScale(5),
    alignSelf: 'center',
    bottom: 8,
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
    // paddingVertical: verticalScale(5),
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
    height: verticalScale(50),
    marginBottom: verticalScale(5),
    borderBottomWidth: 1.5,
    borderBottomColor: CommonColors.whiteOpacity30,
    position: 'relative',
    // backgroundColor:'red',
    // borderBottomWidth:1,
  },
  timelineContentContainer: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(5),
    borderBottomWidth: 1,
    borderBottomColor: CommonColors.textGrey + '30',
  },
  timelineItem: {
    width: scale(280), // Match the slot width
    height: verticalScale(40),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: moderateScale(5),
  },
  timelineText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(18),
    color: 'rgb(179,180,181)',
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
    backgroundColor: CommonColors.blueOpacity50,
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
    height: 60,
    width: width / 1.5,
    // alig
  },
  loadingText: {
    color: CommonColors.white,
    fontSize: scale(18),
    fontFamily: FontFamily.PublicSans_Medium,
    marginTop: verticalScale(16),
  },
});
