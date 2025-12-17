import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CommonColors } from '../styles/Colors';
import { moderateScale, scale, verticalScale } from '../styles/scaling';
import FontFamily from '../constants/FontFamily';
import { ProgramPosition } from '../utils/timelineUtils';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { MainStackParamList } from '../navigation/NavigationsTypes';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentlyPlaying } from '../redux/reducers/main';
import { RootState } from '../redux/store';

interface ProgramItemProps {
  position: ProgramPosition;
  index: number;
  focusedProgramIndex: number | null;
  hasTVPreferredFocus: boolean;
  onFocus: (event: any, index: number) => void;
  onBlur: (event: any, index: number) => void;
  onPress?: (index: number) => void;
  show?: {
    url?: string;
    title?: string;
    epg?: any[];
    [key: string]: any;
  };
  currentStreamUrl?: string | null;
  setChannelUrl?: (url: string) => void;
  setProgramDetails?: (details: {
    showTitle: string;
    timeSlot: string;
    progressPercentage: number;
    duration: string;
    description: string;
  }) => void;
  getProgramDetails?: (programIndex: number) => {
    showTitle: string;
    timeSlot: string;
    progressPercentage: number;
    duration: string;
    description: string;
  };
}

const OptimizedProgramItem = React.forwardRef<any, ProgramItemProps>(
  (
    {
      position,
      index,
      focusedProgramIndex,
      hasTVPreferredFocus,
      onFocus,
      onBlur,
      onPress,
      show,
      currentStreamUrl,
      setChannelUrl,
      setProgramDetails,
      getProgramDetails,
    },
    ref,
  ) => {
    const isFocused = focusedProgramIndex === index;
    const hasAnyFocus = focusedProgramIndex !== null;
    const [lastTap, setLastTap] = useState<number | null>(null);
    const lastSetUrlRef = useRef<string | null>(null);
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const dispatch = useDispatch();
    const currentlyPlaying = useSelector(
      (state: RootState) => state.rootReducer.main.currentlyPlaying,
    );

    // Reset lastSetUrlRef when show changes
    useEffect(() => {
      if (show?.url !== lastSetUrlRef.current) {
        if (currentStreamUrl !== show?.url) {
          lastSetUrlRef.current = null;
        }
      }
    }, [show?.url, currentStreamUrl]);

    // Memoize display text calculation
    const displayText = useMemo(
      () =>
        position.width < 60
          ? position.title.substring(0, 2) + '...'
          : position.title,
      [position.width, position.title],
    );

    // Memoize container style to prevent unnecessary recalculations
    const containerStyle = useMemo(
      () => ({
        left: position.left,
        width: position.width - 2,
        backgroundColor: hasAnyFocus
          ? 'rgb(66,69,71)'
          : 'rgba(29,32,37,0.9)',
        zIndex: isFocused ? 1000 : 1,
      }),
      [position.left, position.width, hasAnyFocus, isFocused],
    );

    // Memoize text style
    const textStyle = useMemo(
      () => [
        styles.programText,
        hasAnyFocus && { color: CommonColors.white },
        isFocused && { color: CommonColors.black },
      ],
      [hasAnyFocus, isFocused],
    );

    // Memoize double click handler
    const handleDoubleClick = useCallback(() => {
      if (!show) return;
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

    // Memoize press handler - Update video on Enter press
    const handlePress = useCallback(() => {
      if (onPress) {
        onPress(index);
        return;
      }

      if (!show || !show.url) return;

      dispatch(
        setCurrentlyPlaying({
          ...show,
          type: 'live',
          url: show.url,
        }),
      );

      const isUrlAlreadySet =
        currentStreamUrl === show.url ||
        lastSetUrlRef.current === show.url ||
        (currentlyPlaying && currentlyPlaying.url === show.url);

      if (isUrlAlreadySet) {
        handleDoubleClick();
        setLastTap(null);
        return;
      }

      const now = Date.now();
      const DOUBLE_PRESS_DELAY = 300;

      if (lastTap && now - lastTap < DOUBLE_PRESS_DELAY) {
        // Double press - navigate to full screen
        handleDoubleClick();
        setLastTap(null);
      } else {
        // Single press (Enter) - Update video in ChannelMediaPlayer
        lastSetUrlRef.current = show.url || null;
        
        // Update program details for video player first
        if (setProgramDetails && getProgramDetails) {
          const programDetails = getProgramDetails(index);
          setProgramDetails(programDetails);
        }
        
        // Update channel URL to show video - only set if URL is valid
        if (show.url && setChannelUrl) {
          // Directly set the URL without clearing first to avoid Activity null error
          setChannelUrl(show.url);
        }
        setLastTap(now);
      }
    }, [
      onPress,
      index,
      show,
      currentStreamUrl,
      lastTap,
      handleDoubleClick,
      setChannelUrl,
      setProgramDetails,
      getProgramDetails,
      dispatch,
      currentlyPlaying,
    ]);

    // Memoize focus handler
    const handleFocus = useCallback(
      (event: any) => {
        onFocus(event, index);
      },
      [onFocus, index],
    );

    // Memoize blur handler
    const handleBlur = useCallback(
      (event: any) => {
        onBlur(event, index);
      },
      [onBlur, index],
    );

    return (
      <View style={{ flexDirection: 'column' }}>
        <TouchableOpacity
          ref={ref}
          style={[
            styles.timelineProgramBlock,
            containerStyle,
            isFocused && styles.programBlockFocused,
          ]}
          hasTVPreferredFocus={hasTVPreferredFocus && index === 0}
          activeOpacity={1}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onPress={handlePress}
        >
          <Text
            style={textStyle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayText}
          </Text>
        </TouchableOpacity>
      </View>
    );
  },
);

OptimizedProgramItem.displayName = 'OptimizedProgramItem';

export default React.memo(OptimizedProgramItem);

const styles = StyleSheet.create({
  programText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(25),
    color: 'rgb(179,180,181)',
    textAlign: 'left',
  },
  programBlockFocused: {
    borderColor: CommonColors.white,
    backgroundColor: 'rgba(225, 226, 228, 1)',
    zIndex: 1000,
    elevation: 5,
  },
  timelineProgramBlock: {
    position: 'absolute',
    top: verticalScale(2),
    height: moderateScale(42),
    borderRadius: moderateScale(6),
    paddingHorizontal: moderateScale(4),
    justifyContent: 'center',
  },
});
