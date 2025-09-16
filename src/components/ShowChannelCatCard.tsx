import React, {useState, useEffect} from 'react';
import {
  FlatList,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import {CommonColors} from '../styles/Colors';
import {moderateScale, scale, verticalScale} from '../styles/scaling';
import FontFamily from '../constants/FontFamily';
import imagepath from '../constants/imagepath';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {MainStackParamList} from '../navigation/NavigationsTypes';
import {
  getProxyImageUrl,
  imageResolutionHandlerForUrl,
} from '../utils/CommonFunctions';
import {setCurrentlyPlaying} from '../redux/reducers/main';
import {useDispatch} from 'react-redux';
import SimpleMarquee from './MarqueeText';
import {EPGProgram, processEPGData, decodeEPGDescription} from '../utils/epgUtils';
import {
  calculateProgramPositions,
  createTimelineConfig,
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

const ShowChannelCatCard: React.FC<ShowChannelCatCardProps> = ({
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
}) => {
  const [imageError, setImageError] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [focusedProgramIndex, setFocusedProgramIndex] = useState<number | null>(
    null,
  );
  const [lastTap, setLastTap] = useState<number | null>(null);
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const dispatch = useDispatch();

  // Reset image error state when show changes
  useEffect(() => {
    setImageError(false);
  }, [show.title, show.logo]);

  const handleProgramFocus = (event: any, programIndex: number) => {
    setFocusedProgramIndex(programIndex);
    onFocus?.(event, programIndex);

    // Set program details without changing the stream URL
    if (setProgramDetails) {
      const programDetails = getProgramDetails(programIndex);
      console.log('programDetails', programDetails);
      setProgramDetails(programDetails);
    }

    // Trigger auto-scroll if program is near the edge of visible area
    if (onProgramFocusWithAutoScroll) {
      // Get the program position for timeline-based programs
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
      // For fallback programs, we don't have precise positioning, so skip auto-scroll
    }
  };

  const handleProgramBlur = (event: any, programIndex: number) => {
    setFocusedProgramIndex(null);
    onBlur?.(event, programIndex);
  };

  const handleProgramPress = (programIndex: number) => {
    onPress?.(programIndex);
  };

  const handleImageError = (e: any) => {
    console.log(
      'Image failed to load, showing placeholder for:',
      show.title,
      e,
    );
    setImageError(true);
  };

  const getProgramDetails = (programIndex: number) => {
    // Get program data from either timeline positions or fallback programs
    let programData = null;
    let epgData = null;

    if (programPositions.length > 0 && programIndex < programPositions.length) {
      // Use timeline program data
      programData = programPositions[programIndex];
      epgData = programData.program; // Timeline positions have EPG data in .program
    } else if (
      fallbackPrograms.length > 0 &&
      programIndex < fallbackPrograms.length
    ) {
      // Use fallback program data
      programData = fallbackPrograms[programIndex];
      epgData = programData.epgData; // Fallback programs have EPG data in .epgData
    }

    if (programData) {
      console.log('programData', programData);
      // Extract time information from EPG data if available
      let timeSlot = '02:00 - 03:00PM'; // Default
      let progressPercentage = 0; // Default to 0 for non-current programs
      let duration = '26 min'; // Default

      if (epgData && epgData.start_timestamp && epgData.stop_timestamp) {
        try {
          const startTime = new Date(parseInt(epgData.start_timestamp) * 1000);
          const endTime = new Date(parseInt(epgData.stop_timestamp) * 1000);
          const now = new Date();

          // Format time slot
          const formatTime = (date: Date) => {
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
            const ampm = hours >= 12 ? 'PM' : 'AM';
            return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
          };

          timeSlot = `${formatTime(startTime)} - ${formatTime(endTime)}`;

          // Only calculate progress percentage for current programs
          if (programData.duration === 'current') {
            const totalDuration = endTime.getTime() - startTime.getTime();
            const elapsed = now.getTime() - startTime.getTime();
            progressPercentage = Math.max(
              0,
              Math.min(100, (elapsed / totalDuration) * 100),
            );
          } else {
            // For future programs, set progress to 0
            progressPercentage = 0;
          }

          // Calculate duration
          const durationMs = endTime.getTime() - startTime.getTime();
          const durationMinutes = Math.round(durationMs / (1000 * 60));
          duration = `${durationMinutes} min`;
        } catch (error) {
          console.warn('Error parsing EPG timestamps:', error);
          // Fall back to default values if timestamp parsing fails
        }
      } else {
        // For programs without EPG data, generate reasonable time slots
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Generate time slots based on program index and current time
        let startHour = currentHour;
        let startMinute = Math.floor(currentMinute / 30) * 30; // Round to nearest 30 minutes

        if (programData.duration === 'current') {
          // Current program starts at current time
          startHour = currentHour;
          startMinute = Math.floor(currentMinute / 30) * 30;
        } else if (programData.duration === 'next') {
          // Next program starts 30 minutes from current time
          startMinute += 30;
          if (startMinute >= 60) {
            startMinute = 0;
            startHour = (startHour + 1) % 24;
          }
        } else {
          // Future programs - add more time based on index
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

        // Format time slot
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

        // Only show progress for current programs
        if (programData.duration === 'current') {
          progressPercentage = 65; // Default progress for current programs without EPG
        } else {
          progressPercentage = 0; // No progress for future programs
        }
      }

      // Extract and decode description from EPG data
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

    // Return default values if no program data found
    return {
      showTitle: 'No Information',
      timeSlot: '02:00 - 03:00PM',
      progressPercentage: 0, // Default to 0 for unknown programs
      duration: '26 min',
      description: 'No description available',
    };
  };

  const handleDoubleClick = () => {
    dispatch(
      setCurrentlyPlaying({
        ...show,
        type: 'live', // Mark this as a live TV channel
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
  };

  const handlePress = (index: number) => {
    dispatch(
      setCurrentlyPlaying({
        ...show,
        type: 'live', // Mark this as a live TV channel
        url: show.url,
      }),
    );
    handleBlockPress?.();
    if (streamUrl === show.url) {
      handleDoubleClick();
      setLastTap(null);
      return;
    }
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTap && now - lastTap < DOUBLE_PRESS_DELAY) {
      // Double click detected
      handleDoubleClick();
      setLastTap(null);
    } else {
      // Single click - change the stream URL (OK button press)
      setStreamUrl(show.url || '');
      setChannelUrl?.('');
      setTimeout(() => {
        setChannelUrl?.(show.url || '');
      }, 250);
      setLastTap(now);
    }
  };

  // Use external timeline configuration or create default one for 24 hours
  const timelineConfig = React.useMemo(
    () =>
      externalTimelineConfig ||
      createTimelineConfig(30, 48, moderateScale(200)),
    [externalTimelineConfig],
  );

  // Generate timeline slots
  const timelineSlots = React.useMemo(
    () => createTimelineSlots(timelineConfig),
    [timelineConfig],
  );

  // Calculate program positions within timeline
  const programPositions = React.useMemo(() => {
    if (!show.epg || show.epg.length === 0) return [];
    return calculateProgramPositions(
      show.epg,
      timelineSlots,
      timelineConfig.slotWidth,
    );
  }, [show.epg, timelineSlots, timelineConfig.slotWidth]);

  // Fallback to old method if no EPG data
  const fallbackPrograms = React.useMemo(() => {
    return processEPGData(show.epg || []);
  }, [show.epg, show.title]);

  return (
    <View style={styles.channelRow}>
      <View style={styles.channelInfo}>
        <Text style={styles.channelNumber}>{channelIndex + 1}</Text>

        <View style={styles.channelLogoContainer}>
          <Image
            source={
              show?.logo
                ? imageError
                  ? {uri: getProxyImageUrl(show?.logo)}
                  : {uri: show?.logo}
                : imagepath.tv
            }
            style={styles.channelLogo}
            tintColor={!show?.logo ? CommonColors.white : undefined}
            onError={e => {
              console.log('Image error:', e.nativeEvent.error);
              handleImageError(e.nativeEvent);
            }}
          />
        </View>

        <View style={{width: moderateScale(140), overflow: 'hidden'}}>
          <SimpleMarquee
            text={show.title || 'Channel Name'}
            shouldStart={focusedProgramIndex !== null}
            textStyle={[
              styles.channelNameText,
              focusedProgramIndex !== null && {color: CommonColors.blueText},
            ]}
            speed={50}
          />
        </View>
      </View>

      <View style={styles.programSchedule}>
        {programPositions.length > 0 ? (
          <View style={styles.timelineProgramContainer}>
            {programPositions.map((position, index) => (
              <TouchableOpacity
                key={position.program.id || index}
                style={[
                  styles.timelineProgramBlock,
                  {
                    left: position.left,
                    width: position.width,
                    backgroundColor: 'rgba(27,30,33,0.5)',
                  },
                  focusedProgramIndex === index && styles.programBlockFocused,
                ]}
                hasTVPreferredFocus={hasTVPreferredFocus && index === 0}
                activeOpacity={1}
                onFocus={event => handleProgramFocus(event, index)}
                onBlur={event => handleProgramBlur(event, index)}
                onPress={() => handlePress(index)}>
                <Text
                  style={[
                    styles.programText,
                    focusedProgramIndex === index && {
                      color: CommonColors.black,
                    },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {position.width < 60
                    ? position.title.substring(0, 1) + '...'
                    : position.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <FlatList
            data={fallbackPrograms}
            renderItem={({item, index}) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.programBlock,
                  {backgroundColor: 'rgba(27,30,33,1)'},
                  focusedProgramIndex === index && styles.programBlockFocused,
                ]}
                hasTVPreferredFocus={hasTVPreferredFocus && index === 0}
                activeOpacity={1}
                onFocus={event => handleProgramFocus(event, index)}
                onBlur={event => handleProgramBlur(event, index)}
                onPress={() => handlePress(index)}>
                <Text
                  style={[
                    styles.programText,
                    focusedProgramIndex === index && {
                      color: CommonColors.black,
                    },
                  ]}
                  numberOfLines={1}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: moderateScale(8),
              paddingHorizontal: moderateScale(10),
              height: moderateScale(40),
            }}
          />
        )}
      </View>
    </View>
  );
};

export default ShowChannelCatCard;

const styles = StyleSheet.create({
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: verticalScale(60),
    // paddingHorizontal: moderateScale(12),
    marginVertical: verticalScale(4),
    borderRadius: moderateScale(8),
    // backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: moderateScale(280),
    marginRight: moderateScale(20),
  },
  channelNumber: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(18),
    lineHeight: moderateScale(26),
    letterSpacing: moderateScale(0.44),
    color: CommonColors.white,
    width: moderateScale(35),
    textAlign: 'center',
    marginRight: moderateScale(15),
  },
  channelLogoContainer: {
    marginRight: moderateScale(15),
    height: moderateScale(40),
    width: moderateScale(75),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(6),
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: CommonColors.backgroundBlue,
  },
  channelLogo: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(6),
    resizeMode: 'contain',
  },
  channelNameText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(18),
    letterSpacing: moderateScale(0.24),
    color: CommonColors.white,
    flex: 1,
  },
  programSchedule: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: moderateScale(10),
  },
  programBlock: {
    // flex: 1,
    // height: moderateScale(44),
    width: '100%',
    borderRadius: moderateScale(6),
    paddingHorizontal: moderateScale(12),
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  programBlockFocused: {
    borderColor: CommonColors.white,
    backgroundColor: 'rgba(225, 226, 228, 1)',
    shadowColor: CommonColors.white,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  currentProgram: {
    backgroundColor: '#3E4756',
  },
  nextProgram: {
    backgroundColor: '#232629',
  },
  programText: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: scale(20),
    color: CommonColors.white,
    textAlign: 'left',
  },
  timelineProgramContainer: {
    position: 'relative',
    height: moderateScale(40), // Single row height
    width: '100%',
    marginLeft: moderateScale(10),
  },
  timelineProgramBlock: {
    position: 'absolute',
    top: 0,
    height: moderateScale(40),
    borderRadius: moderateScale(6),
    paddingHorizontal: moderateScale(8),
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  smallProgramText: {
    fontSize: moderateScale(14),
  },
  verySmallProgramText: {
    fontSize: moderateScale(12),
  },
});
