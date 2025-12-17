import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  InteractionManager,
} from 'react-native';
import { CommonColors } from '../styles/Colors';
import { moderateScale, scale, verticalScale } from '../styles/scaling';
import FontFamily from '../constants/FontFamily';
import imagepath from '../constants/imagepath';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { MainStackParamList } from '../navigation/NavigationsTypes';
import {
  getProxyImageUrl,
} from '../utils/CommonFunctions';
import { setCurrentlyPlaying } from '../redux/reducers/main';
import { useDispatch, useSelector } from 'react-redux';
import SimpleMarquee from './MarqueeText';
import {
  EPGProgram,
  processEPGData,
  decodeEPGDescription,
} from '../utils/epgUtils';
import {
  calculateProgramPositions,
  createTimelineConfig,
  createTimelineSlots,
} from '../utils/timelineUtils';
import FastImage from 'react-native-fast-image';
import { RootState } from '../redux/store';
import { FlashList } from '@shopify/flash-list';
import OptimizedProgramItem from './OptimizedProgramItem';

interface ShowData {
  group?: string;
  title?: string;
  logo?: string;
  url?: string;
  channelIndex?: number;
  epg?: EPGProgram[];
}

interface ShowChannelCatCardProps {
  show: ShowData;
  hasTVPreferredFocus?: boolean;
  onFocus?: (show: any) => void;
  onBlur?: (event: any, programIndex: number) => void;
  onPress?: (programIndex: number) => void;
  channelIndex?: number;
  setChannelUrl?: (url: string) => void;
  showCurrentDetails?: boolean;
  setProgramDetails?: (details: {
    showTitle: string;
    timeSlot: string;
    progressPercentage: number;
    duration: string;
    description: string;
  }) => void;
  timelineConfig?: any;
  onProgramFocusWithAutoScroll?: (
    channelIndex: number,
    programIndex: number,
    programPosition: any,
  ) => void;
  handleBlockPress?: (show: ShowData) => void;
  firstFocusableRef?: React.RefObject<any>;
}

// Memoize channel info component to prevent unnecessary re-renders
const ChannelInfo = React.memo<{
  channelIndex: number;
  logo: string | undefined;
  title: string | undefined;
  imageError: boolean;
  focusedProgramIndex: number | null;
  currentlyPlayingUrl: string | undefined;
  showUrl: string | undefined;
  onImageError: (e: any) => void;
}>(
  ({
    channelIndex,
    logo,
    title,
    imageError,
    focusedProgramIndex,
    currentlyPlayingUrl,
    showUrl,
    onImageError,
  }) => {
    const isCurrentlyPlaying = currentlyPlayingUrl === showUrl;

    return (
      <View style={styles.channelInfo}>
        <Text style={styles.channelNumber}>{channelIndex + 1}</Text>

        <View style={styles.channelLogoContainer}>
          <Image
            source={
              logo
                ? imageError
                  ? { uri: getProxyImageUrl(logo) }
                  : { uri: logo }
                : imagepath.tv
            }
            style={styles.channelLogo}
            resizeMode="contain"
            tintColor={!logo ? CommonColors.white : undefined}
            onError={onImageError}
          />
        </View>

        <View
          style={{ overflow: 'hidden', width: '70%', flexDirection: 'row' }}
        >
          <SimpleMarquee
            text={title || 'Channel Name'}
            shouldStart={focusedProgramIndex !== null}
            textStyle={[
              styles.channelNameText,
              focusedProgramIndex !== null && {
                color: CommonColors.blueText,
              },
            ]}
            speed={50}
          />
          {showUrl && isCurrentlyPlaying && (
            <View
              style={{
                position: 'absolute',
                right: 0,
                justifyContent: 'center',
                backgroundColor: 'black',
              }}
            >
              <FastImage
                source={imagepath.playicon}
                style={{ height: 16, width: 16 }}
              />
            </View>
          )}
        </View>
      </View>
    );
  },
);

const OptimizedShowChannelCatCard: React.FC<ShowChannelCatCardProps> = ({
  show,
  hasTVPreferredFocus,
  onFocus,
  onBlur,
  onPress,
  channelIndex = 0,
  setChannelUrl,
  setProgramDetails,
  timelineConfig: externalTimelineConfig,
  onProgramFocusWithAutoScroll,
  handleBlockPress,
  showCurrentDetails = false,
  firstFocusableRef,
}) => {
  const { currentlyPlaying } = useSelector(
    (state: RootState) => state.rootReducer.main,
  );
  const [imageError, setImageError] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [focusedProgramIndex, setFocusedProgramIndex] = useState<number | null>(
    null,
  );
  const [lastTap, setLastTap] = useState<number | null>(null);
  const calculationCacheRef = useRef<{
    epgHash: string;
    positions: any[];
  } | null>(null);

  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const dispatch = useDispatch();

  // Reset image error state when show changes
  useEffect(() => {
    setImageError(false);
  }, [show.title, show.logo]);

  // Memoize timeline config
  const timelineConfig = useMemo(
    () =>
      externalTimelineConfig ||
      createTimelineConfig(30, 48, moderateScale(200)),
    [externalTimelineConfig],
  );

  // Memoize timeline slots
  const timelineSlots = useMemo(
    () => createTimelineSlots(timelineConfig),
    [timelineConfig],
  );

  // Optimized program positions calculation with caching and deferred execution
  const [programPositions, setProgramPositions] = useState<any[]>([]);
  const [isCalculatingPositions, setIsCalculatingPositions] = useState(false);
  
  useEffect(() => {
    setIsCalculatingPositions(true);
    
    // Defer heavy calculation to avoid blocking scroll
    const task = InteractionManager.runAfterInteractions(() => {
      // Create a simple hash of EPG data for caching
      const epgHash = show.epg
        ? JSON.stringify(show.epg.map((p) => p.id || p.epg_id))
        : 'no-epg';

      // Check cache
      if (
        calculationCacheRef.current &&
        calculationCacheRef.current.epgHash === epgHash
      ) {
        setProgramPositions(calculationCacheRef.current.positions);
        setIsCalculatingPositions(false);
        return;
      }

      // Calculate positions
      const positions = calculateProgramPositions(
        show.epg || [],
        timelineSlots,
        timelineConfig.slotWidth,
      );

      // Update cache
      calculationCacheRef.current = {
        epgHash,
        positions,
      };

      setProgramPositions(positions);
      setIsCalculatingPositions(false);
    });

    return () => {
      if (task && task.cancel) {
        task.cancel();
      }
    };
  }, [show.epg, timelineSlots, timelineConfig.slotWidth]);

  // Memoize fallback programs
  const fallbackPrograms = useMemo(() => {
    return processEPGData(show.epg || []);
  }, [show.epg]);

  // Memoize program details getter
  const getProgramDetails = useCallback(
    (programIndex: number) => {
      let programData = null;
      let epgData = null;
      if (
        programPositions.length > 0 &&
        programIndex < programPositions.length
      ) {
        programData = programPositions[programIndex];
        epgData = programData.program;
      } else if (
        fallbackPrograms.length > 0 &&
        programIndex < fallbackPrograms.length
      ) {
        programData = fallbackPrograms[programIndex];
        epgData = programData.epgData;
      }

      if (programData) {
        let timeSlot = '02:00 - 03:00PM';
        let progressPercentage = 0;
        let duration = '26 min';

        if (epgData && epgData.start_timestamp && epgData.stop_timestamp) {
          try {
            const startTime = new Date(
              parseInt(epgData.start_timestamp) * 1000,
            );
            const endTime = new Date(parseInt(epgData.stop_timestamp) * 1000);
            const now = new Date();

            const formatTime = (date: Date) => {
              const hours = date.getHours();
              const minutes = date.getMinutes();
              const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
              const ampm = hours >= 12 ? 'PM' : 'AM';
              return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
            };

            timeSlot = `${formatTime(startTime)} - ${formatTime(endTime)}`;

            if (programData.duration === 'current') {
              const totalDuration = endTime.getTime() - startTime.getTime();
              const elapsed = now.getTime() - startTime.getTime();
              progressPercentage = Math.max(
                0,
                Math.min(100, (elapsed / totalDuration) * 100),
              );
            } else {
              progressPercentage = 0;
            }

            const durationMs = endTime.getTime() - startTime.getTime();
            const durationMinutes = Math.round(durationMs / (1000 * 60));
            duration = `${durationMinutes} min`;
          } catch (error) {
            console.warn('Error parsing EPG timestamps:', error);
          }
        } else {
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();

          let startHour = currentHour;
          let startMinute = Math.floor(currentMinute / 30) * 30;

          if (programData.duration === 'current') {
            startHour = currentHour;
            startMinute = Math.floor(currentMinute / 30) * 30;
          } else if (programData.duration === 'next') {
            startMinute += 30;
            if (startMinute >= 60) {
              startMinute = 0;
              startHour = (startHour + 1) % 24;
            }
          } else {
            const additionalMinutes = (programIndex - 1) * 30;
            startMinute += additionalMinutes;
            while (startMinute >= 60) {
              startMinute -= 60;
              startHour = (startHour + 1) % 24;
            }
          }

          const endMinute = startMinute + 30;
          let endHour = startHour;
          let finalEndMinute = endMinute;

          if (endMinute >= 60) {
            finalEndMinute = endMinute - 60;
            endHour = (startHour + 1) % 24;
          }

          const formatTime = (hour: number, minute: number) => {
            const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            const ampm = hour >= 12 ? 'PM' : 'AM';
            return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
          };

          timeSlot = `${formatTime(startHour, startMinute)} - ${formatTime(
            endHour,
            finalEndMinute,
          )}`;
          duration = '30 min';

          if (programData.duration === 'current') {
            progressPercentage = 65;
          } else {
            progressPercentage = 0;
          }
        }

        let description = 'No description available';
        if (epgData && epgData.description) {
          try {
            description = decodeEPGDescription(epgData.description);
          } catch (error) {
            console.warn('Failed to decode EPG description:', error);
            description = 'No description available';
          }
        }

        return {
          showTitle: programData.title || 'No Information',
          timeSlot,
          progressPercentage,
          duration,
          description,
        };
      }

      return {
        showTitle: 'No Information',
        timeSlot: '02:00 - 03:00PM',
        progressPercentage: 0,
        duration: '26 min',
        description: 'No description available',
      };
    },
    [programPositions, fallbackPrograms],
  );

  const handleProgramFocus = useCallback(
    (event: any, programIndex: number) => {
      setFocusedProgramIndex(programIndex);
      onFocus?.(show);

      if (setProgramDetails) {
        const programDetails = getProgramDetails(programIndex);
        setProgramDetails(programDetails);
      }

      if (onProgramFocusWithAutoScroll) {
        if (
          programPositions.length > 0 &&
          programIndex < programPositions.length
        ) {
          const programPosition = programPositions[programIndex];
          onProgramFocusWithAutoScroll(
            channelIndex,
            programIndex,
            programPosition,
          );
        }
      }
    },
    [
      onFocus,
      setProgramDetails,
      show,
      onProgramFocusWithAutoScroll,
      programPositions,
      channelIndex,
      getProgramDetails,
    ],
  );

  const handleProgramBlur = useCallback(() => {
    setFocusedProgramIndex(null);
  }, []);

  const handleImageError = useCallback((e: any) => {
    setImageError(true);
  }, []);

  const handleDoubleClick = useCallback(() => {
    dispatch(
      setCurrentlyPlaying({
        ...show,
        type: 'live',
        url: show.url,
      }),
    );
    navigation.navigate('LiveChannelPlayScreen', {
      channel: {
        ...show,
        url: show.url,
        type: 'live',
        epg: show?.epg?.[0]!,
      },
    });
  }, [dispatch, show, navigation]);

  const handlePress = useCallback(() => {
    dispatch(
      setCurrentlyPlaying({
        ...show,
        type: 'live',
        url: show.url,
      }),
    );

    const isUrlAlreadySet =
      streamUrl === show.url ||
      (currentlyPlaying && currentlyPlaying.url === show.url);

    if (isUrlAlreadySet) {
      handleDoubleClick();
      setLastTap(null);
      return;
    }

    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTap && now - lastTap < DOUBLE_PRESS_DELAY) {
      handleDoubleClick();
      setLastTap(null);
    } else {
      setStreamUrl(show.url || '');
      setChannelUrl?.('');
      setTimeout(() => {
        setChannelUrl?.(show.url || '');
      }, 250);
      setLastTap(now);
    }
  }, [
    dispatch,
    show,
    streamUrl,
    setChannelUrl,
    handleDoubleClick,
    lastTap,
    currentlyPlaying,
  ]);

  // Optimized fallback program item renderer
  const renderFallbackProgramItem = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <TouchableOpacity
        ref={index === 0 ? firstFocusableRef : undefined}
        style={[
          styles.programBlock,
          focusedProgramIndex === index && styles.programBlockFocused,
        ]}
        hasTVPreferredFocus={hasTVPreferredFocus && index === 0}
        activeOpacity={1}
        onFocus={event => handleProgramFocus(event, index)}
        onBlur={handleProgramBlur}
        onPress={handlePress}
      >
        <Text
          style={[
            styles.programText,
            focusedProgramIndex === index && {
              color: CommonColors.black,
            },
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
    ),
    [
      focusedProgramIndex,
      hasTVPreferredFocus,
      handleProgramFocus,
      handleProgramBlur,
      handlePress,
      firstFocusableRef,
    ],
  );

  // Window-based rendering: Only render programs that are likely visible
  // Calculate visible range based on timeline width and scroll position
  const visibleProgramPositions = useMemo(() => {
    if (programPositions.length === 0) return [];
    
    // Limit to maximum 50 programs per channel to prevent lag
    // This ensures smooth scrolling even with many programs
    const MAX_VISIBLE_PROGRAMS = 50;
    
    if (programPositions.length <= MAX_VISIBLE_PROGRAMS) {
      return programPositions;
    }
    
    // If focused, show more programs around the focused one
    if (focusedProgramIndex !== null) {
      const start = Math.max(0, focusedProgramIndex - 10);
      const end = Math.min(programPositions.length, focusedProgramIndex + 40);
      return programPositions.slice(start, end);
    }
    
    // Otherwise, show first MAX_VISIBLE_PROGRAMS
    return programPositions.slice(0, MAX_VISIBLE_PROGRAMS);
  }, [programPositions, focusedProgramIndex]);

  // Memoize program items list - only create when visible positions change
  const programItems = useMemo(() => {
    // Use InteractionManager to defer rendering during scroll
    return visibleProgramPositions.map((position, index) => {
      // Find original index in full programPositions array
      const originalIndex = programPositions.findIndex(
        (p) => p.program.id === position.program.id || 
               (p.left === position.left && p.width === position.width)
      );
      const actualIndex = originalIndex >= 0 ? originalIndex : index;
      
      return (
        <OptimizedProgramItem
          key={position.program.id || `program-${actualIndex}`}
          ref={actualIndex === 0 ? firstFocusableRef : undefined}
          position={position}
          index={actualIndex}
          focusedProgramIndex={focusedProgramIndex}
          hasTVPreferredFocus={hasTVPreferredFocus || false}
          onFocus={handleProgramFocus}
          onBlur={handleProgramBlur}
          show={show}
          currentStreamUrl={streamUrl}
          setChannelUrl={setChannelUrl}
          setProgramDetails={setProgramDetails}
          getProgramDetails={getProgramDetails}
        />
      );
    });
  }, [
    visibleProgramPositions,
    programPositions,
    focusedProgramIndex,
    hasTVPreferredFocus,
    handleProgramFocus,
    handleProgramBlur,
    show,
    streamUrl,
    setChannelUrl,
    setProgramDetails,
    getProgramDetails,
    firstFocusableRef,
  ]);

  return (
    <View
      style={[
        styles.channelRow,
        focusedProgramIndex !== null && styles.channelRowFocused,
      ]}
    >
      <View style={styles.rowTop}>
        <ChannelInfo
          channelIndex={channelIndex}
          logo={show.logo}
          title={show.title}
          imageError={imageError}
          focusedProgramIndex={focusedProgramIndex}
          currentlyPlayingUrl={currentlyPlaying?.url}
          showUrl={show.url}
          onImageError={handleImageError}
        />

        <View style={styles.programSchedule}>
          {!isCalculatingPositions && programPositions.length > 0 && visibleProgramPositions.length > 0 ? (
            <View style={styles.timelineProgramContainer}>
              {programItems}
            </View>
          ) : !isCalculatingPositions && programPositions.length === 0 ? (
            <FlashList
              data={fallbackPrograms}
              renderItem={renderFallbackProgramItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.fallbackProgramContainer}
              removeClippedSubviews={true}
            />
          ):<></>}
        </View>
      </View>
    </View>
  );
};

// Custom comparison function to prevent unnecessary re-renders
const areEqual = (prevProps: ShowChannelCatCardProps, nextProps: ShowChannelCatCardProps) => {
  // Only re-render if these critical props change
  return (
    prevProps.show.url === nextProps.show.url &&
    prevProps.show.title === nextProps.show.title &&
    prevProps.show.logo === nextProps.show.logo &&
    prevProps.channelIndex === nextProps.channelIndex &&
    JSON.stringify(prevProps.show.epg?.map(p => p.id || p.epg_id)) === 
    JSON.stringify(nextProps.show.epg?.map(p => p.id || p.epg_id))
  );
};

export default React.memo(OptimizedShowChannelCatCard, areEqual);

const styles = StyleSheet.create({
  channelRow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
    position: 'relative',
    borderRadius: moderateScale(8),
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  fallbackProgramContainer: {
    gap: moderateScale(2),
    paddingHorizontal: moderateScale(5),
    height: moderateScale(56),
  },
  channelRowFocused: {
    paddingTop: verticalScale(0),
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: moderateScale(250),
    marginRight: moderateScale(16),
    paddingRight: moderateScale(10),
  },
  channelNumber: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
    letterSpacing: moderateScale(0.44),
    color: CommonColors.white,
    width: moderateScale(25),
    textAlign: 'center',
    marginRight: moderateScale(10),
  },
  channelLogoContainer: {
    marginRight: moderateScale(16),
    height: moderateScale(45),
    width: moderateScale(40),
    paddingVertical: verticalScale(5),
    borderRadius: moderateScale(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelLogo: {
    height: moderateScale(40),
    width: moderateScale(50),
    borderRadius: moderateScale(4),
    resizeMode: 'contain',
  },
  channelNameText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(25),
    letterSpacing: moderateScale(0.24),
    color: CommonColors.white,
    flex: 1,
  },
  programSchedule: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: moderateScale(2),
    overflow: 'visible',
  },
  programBlock: {
    width: '100%',
    borderRadius: moderateScale(6),
    paddingHorizontal: moderateScale(12),
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(27,30,33,1)',
  },
  programBlockFocused: {
    borderColor: CommonColors.white,
    backgroundColor: 'rgba(225, 226, 228, 1)',
    zIndex: 1000,
    elevation: 5,
  },
  programText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(25),
    color: 'rgb(179,180,181)',
    textAlign: 'left',
  },
  timelineProgramContainer: {
    height: moderateScale(45),
    width: '100%',
    marginLeft: moderateScale(2),
    overflow: 'visible',
    zIndex: 10,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
});
