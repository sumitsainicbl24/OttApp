import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
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
  decodeEPGTitle,
} from '../utils/epgUtils';
import {
  calculateProgramPositions,
  createTimelineSlots,
} from '../utils/timelineUtils';

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
  onFocus?: (event: any, programIndex: number) => void;
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
  handleBlockPress?: () => void;
}

// Extract time formatting logic
const formatTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

// Extract time formatting for hour/minute
const formatTimeFromHM = (hour: number, minute: number): string => {
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
};

// Memoized program details component
const ProgramDetails = React.memo<{
  details: any;
  showLogo: string | undefined;
  showTitle: string | undefined;
  imageError: boolean;
  handleImageError: (e: any) => void;
  focusedProgramIndex: number;
  programPositions: any[];
}>(({details, showLogo, showTitle, imageError, handleImageError, focusedProgramIndex, programPositions}) => {
  return (
    <View style={styles.detailsRow}>
      <View style={styles.detailsLogoContainer}>
        <Image
          source={
            showLogo
              ? imageError
                ? {uri: getProxyImageUrl(showLogo)}
                : {uri: showLogo}
              : imagepath.tv
          }
          style={styles.detailsLogo}
          resizeMode="contain"
          tintColor={!showLogo ? CommonColors.white : undefined}
          onError={handleImageError}
        />
      </View>
      <View
        style={[
          styles.detailsInline,
          {
            left: programPositions[focusedProgramIndex]?.left + 160 || 0,
          },
        ]}>
        <View style={styles.detailsContent}>
          <Text style={styles.detailsTitle} numberOfLines={1}>
            {details.showTitle}
          </Text>
          <Text style={styles.detailsMeta} numberOfLines={1}>
            {details.timeSlot} • {details.duration}
          </Text>
          <Text style={styles.detailsDescription} numberOfLines={2}>
            {details.description}
          </Text>
        </View>
        <View>
          <Image source={imagepath.empty_star} style={styles.filled_star} />
          <Text style={styles.detailsMeta}>{showTitle}</Text>
        </View>
      </View>
    </View>
  );
});

ProgramDetails.displayName = 'ProgramDetails';

// Memoized timeline program block
const TimelineProgramBlock = React.memo<{
  position: any;
  index: number;
  focusedProgramIndex: number | null;
  hasTVPreferredFocus: boolean;
  onFocus: (event: any, index: number) => void;
  onBlur: (event: any, index: number) => void;
  onPress: (index: number) => void;
}>(({position, index, focusedProgramIndex, hasTVPreferredFocus, onFocus, onBlur, onPress}) => {
  const isFocused = focusedProgramIndex === index;
  const displayTitle = position.width < 60 
    ? position.title.substring(0, 1) + '...' 
    : position.title;

  return (
    <View style={styles.programWrapper}>
      <TouchableOpacity
        style={[
          styles.timelineProgramBlock,
          {
            left: position.left,
            width: position.width,
            backgroundColor: 'rgba(27,30,33,0.8)',
            zIndex: isFocused ? 1000 : 1,
          },
          isFocused && styles.programBlockFocused,
        ]}
        hasTVPreferredFocus={hasTVPreferredFocus && index === 0}
        activeOpacity={1}
        onFocus={(event) => onFocus(event, index)}
        onBlur={(event) => onBlur(event, index)}
        onPress={() => onPress(index)}>
        <Text
          style={[
            styles.programText,
            isFocused && styles.programTextFocused,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {displayTitle}
        </Text>
      </TouchableOpacity>
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.position.left === nextProps.position.left &&
    prevProps.position.width === nextProps.position.width &&
    prevProps.position.title === nextProps.position.title &&
    prevProps.focusedProgramIndex === nextProps.focusedProgramIndex &&
    prevProps.index !== prevProps.focusedProgramIndex &&
    nextProps.index !== nextProps.focusedProgramIndex
  );
});

TimelineProgramBlock.displayName = 'TimelineProgramBlock';

const ShowChannelCatCard: React.FC<ShowChannelCatCardProps> = ({
  show,
  hasTVPreferredFocus = false,
  onFocus,
  onBlur,
  onPress,
  channelIndex = 0,
  setChannelUrl,
  setProgramDetails,
  timelineConfig,
  onProgramFocusWithAutoScroll,
  handleBlockPress,
  showCurrentDetails = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [focusedProgramIndex, setFocusedProgramIndex] = useState<number | null>(null);
  const [lastTap, setLastTap] = useState<number | null>(null);
  const [currentDetails, setCurrentDetails] = useState<any | null>(null);
  
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const dispatch = useDispatch();

  // Reset image error state when show changes
  useEffect(() => {
    setImageError(false);
  }, [show.title, show.logo]);

  // Generate timeline slots - memoized
  const timelineSlots = useMemo(
    () => timelineConfig ? createTimelineSlots(timelineConfig) : [],
    [timelineConfig?.scrollOffset, timelineConfig?.slotWidth]
  );

  // Calculate program positions - memoized with proper dependencies
  const programPositions = useMemo(() => {
    if (!timelineConfig || !timelineSlots.length) return [];
    
    return calculateProgramPositions(
      show.epg || [],
      timelineSlots,
      timelineConfig.slotWidth,
    );
  }, [show.epg, timelineSlots.length, timelineConfig?.slotWidth]);

  // Fallback programs - only calculate when needed
  const fallbackPrograms = useMemo(() => {
    if (programPositions.length > 0) return [];
    return processEPGData(show.epg || []);
  }, [show.epg, programPositions.length]);

  // Extract program details calculation to memoized function
  const getProgramDetails = useCallback((programIndex: number) => {
    let programData = null;
    let epgData = null;

    if (programPositions.length > 0 && programIndex < programPositions.length) {
      programData = programPositions[programIndex];
      epgData = programData.program;
    } else if (fallbackPrograms.length > 0 && programIndex < fallbackPrograms.length) {
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

    let timeSlot = '02:00 - 03:00PM';
    let progressPercentage = 0;
    let duration = '26 min';

    // Extract time from EPG data if available
    if (epgData?.start_timestamp && epgData?.stop_timestamp) {
      try {
        const startTime = new Date(parseInt(epgData.start_timestamp) * 1000);
        const endTime = new Date(parseInt(epgData.stop_timestamp) * 1000);
        const now = new Date();

        timeSlot = `${formatTime(startTime)} - ${formatTime(endTime)}`;

        if (programData.duration === 'current') {
          const totalDuration = endTime.getTime() - startTime.getTime();
          const elapsed = now.getTime() - startTime.getTime();
          progressPercentage = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
        }

        const durationMs = endTime.getTime() - startTime.getTime();
        const durationMinutes = Math.round(durationMs / (1000 * 60));
        duration = `${durationMinutes} min`;
      } catch (error) {
        console.warn('Error parsing EPG timestamps:', error);
      }
    } else {
      // Generate time slots for programs without EPG data
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

      timeSlot = `${formatTimeFromHM(startHour, startMinute)} - ${formatTimeFromHM(endHour, finalEndMinute)}`;
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
  }, [programPositions, fallbackPrograms]);

  // Optimized focus handler
  const handleProgramFocus = useCallback((event: any, programIndex: number) => {
    setFocusedProgramIndex(programIndex);
    onFocus?.(event, programIndex);

    const programDetails = getProgramDetails(programIndex);
    
    setProgramDetails?.(programDetails);
    
    if (showCurrentDetails) {
      setCurrentDetails(programDetails);
    }

    // Trigger auto-scroll
    if (onProgramFocusWithAutoScroll && programPositions.length > 0 && programIndex < programPositions.length) {
      const programPosition = programPositions[programIndex];
      onProgramFocusWithAutoScroll(channelIndex, programIndex, programPosition);
    }
  }, [
    onFocus,
    setProgramDetails,
    showCurrentDetails,
    onProgramFocusWithAutoScroll,
    programPositions,
    channelIndex,
    getProgramDetails,
  ]);

  // Optimized blur handler
  const handleProgramBlur = useCallback((event: any, programIndex: number) => {
    setFocusedProgramIndex(null);
    onBlur?.(event, programIndex);
    setCurrentDetails(null);
  }, [onBlur]);

  // Optimized image error handler
  const handleImageError = useCallback((e: any) => {
    console.log('Image failed to load, showing placeholder for:', show.title);
    setImageError(true);
  }, [show.title]);

  // Optimized press handler
  const handlePress = useCallback((index: number) => {
    dispatch(
      setCurrentlyPlaying({
        ...show,
        type: 'live',
        url: show.url,
      }),
    );
    
    handleBlockPress?.();
    
    const handleDoubleClick = () => {
      navigation.navigate('LiveChannelPlayScreen', {
        channel: {
          ...show,
          url: show.url,
          type: 'live',
          epg: show?.epg?.[0]!,
        },
      });
    };

    if (streamUrl === show.url) {
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
  }, [dispatch, show, handleBlockPress, streamUrl, lastTap, navigation, setChannelUrl]);

  // Channel logo source - memoized
  const logoSource = useMemo(() => {
    if (show?.logo) {
      return imageError 
        ? {uri: getProxyImageUrl(show.logo)}
        : {uri: show.logo};
    }
    return imagepath.tv;
  }, [show?.logo, imageError]);

  return (
    <View
      style={[
        styles.channelRow,
        focusedProgramIndex !== null && styles.channelRowFocused,
      ]}>
      <View style={styles.rowTop}>
        <View style={styles.channelInfo}>
          <Text style={styles.channelNumber}>{channelIndex + 1}</Text>

          <View style={styles.channelLogoContainer}>
            <Image
              source={logoSource}
              style={styles.channelLogo}
              tintColor={!show?.logo ? CommonColors.white : undefined}
              onError={handleImageError}
            />
          </View>

          <View style={styles.channelNameContainer}>
            <SimpleMarquee
              text={show.title || 'Channel Name'}
              shouldStart={focusedProgramIndex !== null}
              textStyle={[
                styles.channelNameText,
                focusedProgramIndex !== null && styles.channelNameTextFocused,
              ]}
              speed={50}
            />
          </View>
        </View>

        <View style={styles.programSchedule}>
          {programPositions.length > 0 ? (
            <View style={styles.timelineProgramContainer}>
              {programPositions.map((position, index) => (
                <TimelineProgramBlock
                  key={position.program.id || `program-${index}`}
                  position={position}
                  index={index}
                  focusedProgramIndex={focusedProgramIndex}
                  hasTVPreferredFocus={hasTVPreferredFocus}
                  onFocus={handleProgramFocus}
                  onBlur={handleProgramBlur}
                  onPress={handlePress}
                />
              ))}
            </View>
          ) : (
            <View style={styles.fallbackProgramContainer}>
              {fallbackPrograms.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.programBlock,
                    focusedProgramIndex === index && styles.programBlockFocused,
                  ]}
                  hasTVPreferredFocus={hasTVPreferredFocus && index === 0}
                  activeOpacity={1}
                  onFocus={(event) => handleProgramFocus(event, index)}
                  onBlur={(event) => handleProgramBlur(event, index)}
                  onPress={() => handlePress(index)}>
                  <Text
                    style={[
                      styles.programText,
                      focusedProgramIndex === index && styles.programTextFocused,
                    ]}
                    numberOfLines={1}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
      
      {currentDetails && focusedProgramIndex !== null && (
        <ProgramDetails
          details={currentDetails}
          showLogo={show?.logo}
          showTitle={show?.title}
          imageError={imageError}
          handleImageError={handleImageError}
          focusedProgramIndex={focusedProgramIndex}
          programPositions={programPositions}
        />
      )}
    </View>
  );
};

// Styles extracted outside component
const styles = StyleSheet.create({
  channelRow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
    minHeight: verticalScale(50),
    position: 'relative',
    paddingHorizontal: moderateScale(8),
    marginVertical: verticalScale(0),
    borderRadius: moderateScale(8),
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  channelRowFocused: {
    paddingTop: verticalScale(0),
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
  channelLogoContainer: {
    marginRight: moderateScale(10),
    height: moderateScale(30),
    width: moderateScale(60),
    paddingVertical: verticalScale(5),
    borderRadius: moderateScale(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelLogo: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(4),
    resizeMode: 'contain',
  },
  channelNameContainer: {
    width: moderateScale(100),
    overflow: 'hidden',
  },
  channelNameText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(14),
    letterSpacing: moderateScale(0.24),
    color: CommonColors.white,
    flex: 1,
  },
  channelNameTextFocused: {
    color: CommonColors.blueText,
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
    marginRight: moderateScale(2),
  },
  programBlockFocused: {
    borderColor: CommonColors.white,
    backgroundColor: 'rgba(225, 226, 228, 1)',
    zIndex: 1000,
    elevation: 5,
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
  timelineProgramContainer: {
    position: 'relative',
    height: moderateScale(35),
    width: '100%',
    marginLeft: moderateScale(2),
    overflow: 'visible',
    paddingTop: verticalScale(2),
    paddingBottom: verticalScale(2),
    zIndex: 10,
  },
  programWrapper: {
    flexDirection: 'column',
  },
  timelineProgramBlock: {
    position: 'absolute',
    top: verticalScale(2),
    height: moderateScale(32),
    borderRadius: moderateScale(6),
    paddingHorizontal: moderateScale(4),
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  fallbackProgramContainer: {
    flexDirection: 'row',
    gap: moderateScale(2),
    paddingHorizontal: moderateScale(5),
    height: moderateScale(56),
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  detailsRow: {
    flexDirection: 'row',
    width: '100%',
  },
  detailsLogoContainer: {
    width: moderateScale(315),
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsLogo: {
    width: moderateScale(80),
    height: moderateScale(80),
  },
  detailsInline: {
    marginTop: verticalScale(8),
    width: '12.6%',
    alignSelf: 'flex-start',
    borderRadius: moderateScale(10),
    backgroundColor: 'rgba(27,30,33,0.6)',
    paddingVertical: verticalScale(12),
    paddingHorizontal: moderateScale(14),
    flexDirection: 'row',
    position: 'absolute',
    zIndex: 2000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  detailsContent: {
    flex: 1,
  },
  detailsTitle: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(20),
    color: CommonColors.white,
    marginBottom: verticalScale(6),
  },
  detailsMeta: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(15),
    color: 'rgba(255,255,255,0.8)',
    marginBottom: verticalScale(8),
  },
  detailsDescription: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(15),
    color: 'rgba(255,255,255,0.92)',
  },
  filled_star: {
    height: 14,
    width: 14,
    alignSelf: 'flex-end',
    marginBottom: moderateScale(8),
  },
});

export default React.memo(ShowChannelCatCard, (prevProps, nextProps) => {
  // Custom comparison function for optimal re-rendering
  return (
    prevProps.show.url === nextProps.show.url &&
    prevProps.show.title === nextProps.show.title &&
    prevProps.show.logo === nextProps.show.logo &&
    prevProps.channelIndex === nextProps.channelIndex &&
    prevProps.timelineConfig?.scrollOffset === nextProps.timelineConfig?.scrollOffset &&
    prevProps.hasTVPreferredFocus === nextProps.hasTVPreferredFocus
  );
});

