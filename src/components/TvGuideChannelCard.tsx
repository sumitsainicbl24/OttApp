/**
 * TvGuideChannelCard - Ultra-Optimized Channel Card Component
 *
 * Built from scratch with maximum performance:
 * - Minimal re-renders with aggressive memoization
 * - Extracted sub-components
 * - Smart conditional rendering
 * - Optimized event handlers
 * - Clean state management
 * - Type-safe props
 */

import React, {useState, useEffect, useMemo, useCallback, memo} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TVFocusGuideView,
  View,
} from 'react-native';
import {CommonColors} from '../styles/Colors';
import {moderateScale, scale, verticalScale} from '../styles/scaling';
import FontFamily from '../constants/FontFamily';
import imagepath from '../constants/imagepath';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {MainStackParamList} from '../navigation/NavigationsTypes';
import {getProxyImageUrl} from '../utils/CommonFunctions';
import {setCurrentlyPlaying} from '../redux/reducers/main';
import {useDispatch} from 'react-redux';
import SimpleMarquee from './MarqueeText';
import {
  EPGProgram,
  processEPGData,
  decodeEPGDescription,
} from '../utils/epgUtils';
import {
  calculateProgramPositions,
  createTimelineSlots,
  ProgramPosition,
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

interface TvGuideChannelCardProps {
  channel: ChannelData;
  channelIndex: number;
  timelineConfig: any;
  onChannelPress: () => void;
  onChannelFocus: () => void;
  onChannelUrlChange?: (url: string) => void;
  onProgramDetailsChange?: (details: ProgramDetails) => void;
  onProgramFocusAutoScroll?: (
    channelIndex: number,
    programIndex: number,
    programPosition: any,
  ) => void;
  showProgramDetails?: boolean;
  hasTVPreferredFocus?: boolean;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format date to time string
 */
const formatTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

/**
 * Format hour and minute to time string
 */
const formatTimeFromHM = (hour: number, minute: number): string => {
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
};

/**
 * Calculate program details from EPG data
 */
const calculateProgramDetails = (
  programData: any,
  epgData: EPGProgram | null,
  programIndex: number,
): ProgramDetails => {
  let timeSlot = '02:00 - 03:00PM';
  let progressPercentage = 0;
  let duration = '26 min';

  // Extract from EPG if available
  if (epgData?.start_timestamp && epgData?.stop_timestamp) {
    try {
      const startTime = new Date(parseInt(epgData.start_timestamp) * 1000);
      const endTime = new Date(parseInt(epgData.stop_timestamp) * 1000);
      const now = new Date();

      timeSlot = `${formatTime(startTime)} - ${formatTime(endTime)}`;

      // Calculate progress for current programs
      if (programData.duration === 'current') {
        const totalDuration = endTime.getTime() - startTime.getTime();
        const elapsed = now.getTime() - startTime.getTime();
        progressPercentage = Math.max(
          0,
          Math.min(100, (elapsed / totalDuration) * 100),
        );
      }

      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = Math.round(durationMs / (1000 * 60));
      duration = `${durationMinutes} min`;
    } catch (error) {
      console.warn('Error parsing EPG timestamps:', error);
    }
  } else {
    // Generate fallback time slots
    const now = new Date();
    let startHour = now.getHours();
    let startMinute = Math.floor(now.getMinutes() / 30) * 30;

    if (programData.duration === 'next') {
      startMinute += 30;
      if (startMinute >= 60) {
        startMinute = 0;
        startHour = (startHour + 1) % 24;
      }
    } else if (programData.duration !== 'current') {
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

    timeSlot = `${formatTimeFromHM(
      startHour,
      startMinute,
    )} - ${formatTimeFromHM(endHour, finalEndMinute)}`;
    duration = '30 min';

    if (programData.duration === 'current') {
      progressPercentage = 65;
    }
  }

  // Extract description
  let description = 'No description available';
  if (epgData?.description) {
    try {
      description = decodeEPGDescription(epgData.description);
    } catch (error) {
      console.warn('Failed to decode EPG description:', error);
    }
  }

  return {
    showTitle: programData.title || 'No Information',
    timeSlot,
    progressPercentage,
    duration,
    description,
  };
};

// ==================== SUB-COMPONENTS ====================

/**
 * ChannelInfo - Channel number, logo, and name
 */
const ChannelInfo = memo<{
  channelIndex: number;
  channelName: string;
  logoSource: any;
  isFocused: boolean;
  showImage?: boolean;
  onImageError: () => void;
}>(
  ({
    channelIndex,
    channelName,
    logoSource,
    isFocused,
    showImage = true,
    onImageError,
  }) => (
    <View style={styles.channelInfo}>
      <Text style={styles.channelNumber}>{channelIndex + 1}</Text>

      <View style={styles.logoContainer}>
        {showImage && (
          <Image
            source={logoSource}
            style={styles.logo}
            tintColor={
              logoSource === imagepath.tv ? CommonColors.white : undefined
            }
            onError={onImageError}
            resizeMode="cover"
          />
        )}
      </View>

      <View style={styles.nameContainer}>
        <SimpleMarquee
          text={channelName || 'Channel Name'}
          shouldStart={isFocused}
          textStyle={[
            styles.channelName,
            isFocused && styles.channelNameFocused,
          ]}
          speed={50}
        />
      </View>
    </View>
  ),
);

ChannelInfo.displayName = 'ChannelInfo';

/**
 * ProgramBlock - Individual program in timeline
 */
const ProgramBlock = memo<{
  position: ProgramPosition;
  index: number;
  isFocused: boolean;
  hasTVPreferredFocus: boolean;
  onFocus: (event: any, index: number) => void;
  onBlur: (event: any, index: number) => void;
  onPress: (index: number) => void;
}>(
  ({
    position,
    index,
    isFocused,
    hasTVPreferredFocus,
    onFocus,
    onBlur,
    onPress,
  }) => {
    const displayTitle =
      position.width < 60
        ? position.title.substring(0, 1) + '...'
        : position.title;

    return (
      <TouchableOpacity
        style={[
          styles.programBlock,
          {
            left: position.left,
            width: position.width,
            zIndex: isFocused ? 1000 : 1,
          },
          isFocused && styles.programBlockFocused,
        ]}
        // hasTVPreferredFocus={hasTVPreferredFocus && index === 0}
        activeOpacity={1}
        onFocus={e => onFocus(e, index)}
        onBlur={e => onBlur(e, index)}
        onPress={() => onPress(index)}>
        <Text
          style={[styles.programText, isFocused && styles.programTextFocused]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {displayTitle}
        </Text>
      </TouchableOpacity>
    );
  },
  (prev, next) => {
    // Custom comparison for optimal re-renders
    return (
      prev.position.left === next.position.left &&
      prev.position.width === next.position.width &&
      prev.position.title === next.position.title &&
      prev.isFocused === next.isFocused
    );
  },
);

ProgramBlock.displayName = 'ProgramBlock';

/**
 * FallbackProgram - Program block for fallback view
 */
const FallbackProgram = memo<{
  item: any;
  index: number;
  isFocused: boolean;
  hasTVPreferredFocus: boolean;
  onFocus: (event: any, index: number) => void;
  onBlur: (event: any, index: number) => void;
  onPress: (index: number) => void;
}>(
  ({item, index, isFocused, hasTVPreferredFocus, onFocus, onBlur, onPress}) => (
    <TouchableOpacity
      style={[styles.fallbackBlock, isFocused && styles.programBlockFocused]}
      // hasTVPreferredFocus={hasTVPreferredFocus && index === 0}
      activeOpacity={1}
      onFocus={e => onFocus(e, index)}
      onBlur={e => onBlur(e, index)}
      onPress={() => onPress(index)}>
      <Text
        style={[styles.programText, isFocused && styles.programTextFocused]}
        numberOfLines={1}>
        {item.title}
      </Text>
    </TouchableOpacity>
  ),
);

FallbackProgram.displayName = 'FallbackProgram';

/**
 * ProgramDetailsOverlay - Shows details on focus
 */
const ProgramDetailsOverlay = memo<{
  details: ProgramDetails;
  logoSource: any;
  channelName: string;
  leftPosition: number;
  onImageError: () => void;
}>(({details, logoSource, channelName, leftPosition, onImageError}) => (
  <View style={styles.detailsRow}>
    <View style={styles.detailsLogoContainer}>
      <Image
        source={logoSource}
        style={styles.detailsLogo}
        resizeMode="cover"
        tintColor={logoSource === imagepath.tv ? CommonColors.white : undefined}
        onError={onImageError}
      />
    </View>

    <View style={[styles.detailsPanel, {left: leftPosition}]}>
      <View style={styles.detailsContent}>
        <Text style={styles.detailsTitle} numberOfLines={1}>
          {details.showTitle}
        </Text>
        <Text style={styles.detailsMeta} numberOfLines={1}>
          {details.timeSlot} • {details.duration}
        </Text>
        <Text style={styles.detailsDescription} numberOfLines={1}>
          {details.description}
        </Text>
      </View>

      <View style={styles.detailsSide}>
        <Image source={imagepath.empty_star} style={styles.starIcon} />
        <Text style={styles.detailsMeta}>{channelName}</Text>
      </View>
    </View>
  </View>
));

ProgramDetailsOverlay.displayName = 'ProgramDetailsOverlay';

// ==================== MAIN COMPONENT ====================

const TvGuideChannelCard: React.FC<TvGuideChannelCardProps> = ({
  channel,
  channelIndex,
  timelineConfig,
  onChannelPress,
  onChannelFocus,
  onChannelUrlChange,
  onProgramDetailsChange,
  onProgramFocusAutoScroll,
  showProgramDetails = false,
  hasTVPreferredFocus = false,
}) => {
  // ==================== STATE ====================

  const [imageError, setImageError] = useState(false);
  const [focusedProgramIndex, setFocusedProgramIndex] = useState<number | null>(
    null,
  );
  const [currentDetails, setCurrentDetails] = useState<ProgramDetails | null>(
    null,
  );
  const [lastTapTime, setLastTapTime] = useState<number | null>(null);
  const [currentStreamUrl, setCurrentStreamUrl] = useState<string | null>(null);

  // ==================== HOOKS ====================

  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const dispatch = useDispatch();

  // Reset image error on channel change
  useEffect(() => {
    setImageError(false);
  }, [channel.title, channel.logo]);

  // ==================== MEMOIZED DATA ====================

  // Timeline slots - only recalculate when config actually changes
  const timelineSlots = useMemo(
    () => (timelineConfig ? createTimelineSlots(timelineConfig) : []),
    [timelineConfig?.scrollOffset, timelineConfig?.slotWidth],
  );

  // Program positions - optimize with better dependencies
  const programPositions = useMemo(() => {
    if (!timelineConfig || !timelineSlots.length || !channel.epg?.length)
      return [];

    return calculateProgramPositions(
      channel.epg,
      timelineSlots,
      timelineConfig.slotWidth,
    );
  }, [channel.epg?.length, timelineSlots, timelineConfig?.slotWidth]);

  // Fallback programs (only if no timeline data)
  const fallbackPrograms = useMemo(() => {
    if (programPositions.length > 0) return [];
    return processEPGData(channel.epg || []);
  }, [channel.epg, programPositions.length]);

  // Channel logo source
  const logoSource = useMemo(() => {
    if (channel?.logo) {
      return imageError
        ? {uri: getProxyImageUrl(channel.logo)}
        : {uri: channel.logo};
    }
    return imagepath.tv;
  }, [channel?.logo, imageError]);

  // ==================== EVENT HANDLERS ====================

  // Get program details
  const getProgramDetails = useCallback(
    (programIndex: number): ProgramDetails => {
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

      if (!programData) {
        return {
          showTitle: 'No Information',
          timeSlot: '02:00 - 03:00PM',
          progressPercentage: 0,
          duration: '26 min',
          description: 'No description available',
        };
      }

      return calculateProgramDetails(programData, epgData, programIndex);
    },
    [programPositions, fallbackPrograms],
  );

  // Handle program focus
  const handleProgramFocus = useCallback(
    (event: any, programIndex: number) => {
      setFocusedProgramIndex(programIndex);
      onChannelFocus();
      const details = getProgramDetails(programIndex);
      onProgramDetailsChange?.(details);
      if (showProgramDetails) {
        setCurrentDetails(details);
      }
      if (
        onProgramFocusAutoScroll &&
        programPositions.length > 0 &&
        programIndex < programPositions.length
      ) {
        const programPosition = programPositions[programIndex];
        onProgramFocusAutoScroll(channelIndex, programIndex, programPosition);
      }
    },
    [
      onChannelFocus,
      getProgramDetails,
      onProgramDetailsChange,
      showProgramDetails,
      onProgramFocusAutoScroll,
      programPositions,
      channelIndex,
    ],
  );

  // Handle program blur
  const handleProgramBlur = useCallback(() => {
    setFocusedProgramIndex(null);
    setCurrentDetails(null);
  }, []);

  // Handle image error
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Handle program press
  const handleProgramPress = useCallback(
    (programIndex: number) => {
      dispatch(
        setCurrentlyPlaying({
          ...channel,
          type: 'live',
          url: channel.url,
        }),
      );

      onChannelPress();

      const navigateToPlayer = () => {
        navigation.navigate('LiveChannelPlayScreen', {
          channel: {
            ...channel,
            url: channel.url,
            type: 'live',
            epg: channel?.epg?.[0]!,
          },
        });
      };

      // Double-click detection
      if (currentStreamUrl === channel.url) {
        navigateToPlayer();
        setLastTapTime(null);
        return;
      }

      const now = Date.now();
      const DOUBLE_PRESS_DELAY = 300;

      if (lastTapTime && now - lastTapTime < DOUBLE_PRESS_DELAY) {
        navigateToPlayer();
        setLastTapTime(null);
      } else {
        setCurrentStreamUrl(channel.url || '');
        onChannelUrlChange?.('');
        setTimeout(() => {
          onChannelUrlChange?.(channel.url || '');
        }, 250);
        setLastTapTime(now);
      }
    },
    [
      dispatch,
      channel,
      onChannelPress,
      currentStreamUrl,
      lastTapTime,
      navigation,
      onChannelUrlChange,
    ],
  );

  // ==================== RENDER ====================

  const isFocused = focusedProgramIndex !== null;

  return (
    <View style={[styles.container, isFocused && styles.containerFocused]}>
      {/* Main Row */}
      <View style={styles.mainRow}>
        {/* Channel Info */}
        <ChannelInfo
          channelIndex={channelIndex}
          channelName={channel.title || ''}
          logoSource={logoSource}
          isFocused={isFocused}
          onImageError={handleImageError}
        />

        {/* Program Schedule */}
        <View style={styles.programSchedule}>
          {programPositions.length > 0 ? (
            <TVFocusGuideView autoFocus style={styles.timelineContainer}>
              {programPositions.map((position, index) => {
                // Only render visible programs for better performance
                const isVisible = position.width > 10 && position.left < 2000;
                if (!isVisible) return null;

                return (
                  <ProgramBlock
                    key={position.program.id || `program-${index}`}
                    position={position}
                    index={index}
                    isFocused={focusedProgramIndex === index}
                    hasTVPreferredFocus={hasTVPreferredFocus}
                    onFocus={handleProgramFocus}
                    onBlur={handleProgramBlur}
                    onPress={handleProgramPress}
                  />
                );
              })}
            </TVFocusGuideView>
          ) : (
            <View style={styles.fallbackContainer}>
              {fallbackPrograms.slice(0, 3).map((item, index) => (
                <FallbackProgram
                  key={index}
                  item={item}
                  index={index}
                  isFocused={focusedProgramIndex === index}
                  hasTVPreferredFocus={hasTVPreferredFocus}
                  onFocus={handleProgramFocus}
                  onBlur={handleProgramBlur}
                  onPress={handleProgramPress}
                />
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Program Details Overlay */}
      {currentDetails && focusedProgramIndex !== null && (
        <ProgramDetailsOverlay
          details={currentDetails}
          logoSource={logoSource}
          channelName={channel?.title || ''}
          leftPosition={programPositions[focusedProgramIndex]?.left + 160 || 0}
          onImageError={handleImageError}
        />
      )}
    </View>
  );
};

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    width: '100%',
    minHeight: verticalScale(80),
    paddingHorizontal: moderateScale(8),
    borderRadius: moderateScale(8),
    // backgroundColor: 'rgba(7, 7, 7, 0.2)',
  },
  containerFocused: {
    paddingTop: verticalScale(0),
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: moderateScale(250),
    marginRight: moderateScale(10),
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
  logoContainer: {
    marginRight: moderateScale(10),
    height: moderateScale(45),
    width: moderateScale(40),
    paddingVertical: verticalScale(5),
    borderRadius: moderateScale(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(4),
    resizeMode: 'contain',
  },
  nameContainer: {
    width: '70%',
    overflow: 'hidden',
  },
  channelName: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(14),
    letterSpacing: moderateScale(0.24),
    color: CommonColors.white,
    flex: 1,
  },
  channelNameFocused: {
    color: CommonColors.blueText,
  },
  programSchedule: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: moderateScale(2),
    overflow: 'visible',
  },
  timelineContainer: {
    position: 'relative',
    height: moderateScale(55),
    width: '100%',
    marginLeft: moderateScale(2),
    overflow: 'visible',
    paddingVertical: verticalScale(2),
  },
  programBlock: {
    position: 'absolute',
    top: verticalScale(2),
    height: moderateScale(54),
    borderRadius: moderateScale(6),
    paddingHorizontal: moderateScale(4),
    justifyContent: 'center',
    backgroundColor: 'rgba(19, 23, 27, 0.46)',
    // borderWidth: 0.5,
    // borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  programBlockFocused: {
    // borderColor: CommonColors.white,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    // elevation: 5,
  },
  programText: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: scale(20),
    color: CommonColors.whiteOpacity50,
    textAlign: 'left',
  },
  programTextFocused: {
    color: CommonColors.black,
  },
  fallbackContainer: {
    flexDirection: 'row',
    gap: moderateScale(2),
    paddingHorizontal: moderateScale(5),
    height: moderateScale(56),
  },
  fallbackBlock: {
    width: '100%',
    // borderRadius: moderateScale(6),
    // paddingHorizontal: moderateScale(12),
    justifyContent: 'center',
    // borderWidth: 2,
    borderColor: 'transparent',
    // backgroundColor: 'rgba(182, 187, 193, 0.1)',
    marginRight: moderateScale(2),

    // position: 'absolute',
    // top: verticalScale(2),
    height: moderateScale(54),
    borderRadius: moderateScale(6),
    paddingHorizontal: moderateScale(4),
    // justifyContent: 'center',
    backgroundColor: 'rgba(182, 187, 193, 0.1)',
  },
  detailsRow: {
    flexDirection: 'row',
    width: '100%',
  },
  detailsLogoContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsLogo: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(8),
    marginLeft: moderateScale(40),
  },
  detailsPanel: {
    marginTop: verticalScale(8),
    width: '12.6%',
    alignSelf: 'flex-start',
    borderRadius: moderateScale(10),
    // backgroundColor: 'rgba(229, 233, 237, 0.12)',
    backgroundColor: 'rgba(19, 23, 27, 0.46)',


    paddingVertical: verticalScale(12),
    paddingHorizontal: moderateScale(14),
    flexDirection: 'row',
    position: 'absolute',
    zIndex: 2000,
    // elevation: 10,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
  },
  detailsContent: {
    flex: 1,
  },
  detailsTitle: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(18),

    color: CommonColors.white,
    marginBottom: verticalScale(6),
  },
  detailsMeta: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: scale(18),
    color: 'rgba(255,255,255,0.8)',
    marginBottom: verticalScale(8),
  },
  detailsDescription: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: scale(18),
    color: 'rgba(255,255,255,0.92)',
  },
  detailsSide: {
    alignItems: 'flex-end',
  },
  starIcon: {
    height: 14,
    width: 14,
    marginBottom: moderateScale(8),
  },
});

// ==================== EXPORT ====================

export default memo(TvGuideChannelCard, (prevProps, nextProps) => {
  // Custom comparison for optimal re-rendering
  return (
    prevProps.channel.url === nextProps.channel.url &&
    prevProps.channel.title === nextProps.channel.title &&
    prevProps.channel.logo === nextProps.channel.logo &&
    prevProps.channelIndex === nextProps.channelIndex &&
    prevProps.timelineConfig?.scrollOffset ===
      nextProps.timelineConfig?.scrollOffset &&
    prevProps.hasTVPreferredFocus === nextProps.hasTVPreferredFocus
  );
});
