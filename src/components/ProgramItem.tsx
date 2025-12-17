import React, {useState, useCallback, useRef, useEffect} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {CommonColors} from '../styles/Colors';
import {moderateScale, scale, verticalScale} from '../styles/scaling';
import FontFamily from '../constants/FontFamily';
import {ProgramPosition} from '../utils/timelineUtils';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {MainStackParamList} from '../navigation/NavigationsTypes';
import {useDispatch, useSelector} from 'react-redux';
import {setCurrentlyPlaying} from '../redux/reducers/main';
import {RootState} from '../redux/store';

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
    [key: string]: any;
  };
  currentStreamUrl?: string | null;
  setChannelUrl?: (url: string) => void;
}

const ProgramItem = React.forwardRef<any, ProgramItemProps>(({
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
}, ref) => {
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
      // Only reset if the URL actually changed, not on every render
      if (currentStreamUrl !== show?.url) {
        lastSetUrlRef.current = null;
      }
    }
  }, [show?.url, currentStreamUrl]);

  // Pre-compute display text
  const displayText = React.useMemo(
    () =>
      position.width < 60
        ? position.title.substring(0, 2) + '...'
        : position.title,
    [position.width, position.title],
  );

  // Memoize style objects
  const containerStyle = React.useMemo(
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

  const textStyle = React.useMemo(
    () => [
      styles.programText,
      hasAnyFocus && {color: CommonColors.white},
      isFocused && {color: CommonColors.black},
    ],
    [hasAnyFocus, isFocused],
  );

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

    // Check if the same URL is already set - check multiple sources
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
      // Double click detected
      handleDoubleClick();
      setLastTap(null);
    } else {
      // Single click - change the stream URL (OK button press)
      lastSetUrlRef.current = show.url || null;
      setChannelUrl?.('');
      setTimeout(() => {
        setChannelUrl?.(show.url || '');
      }, 250);
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
    dispatch,
    currentlyPlaying,
  ]);

  return (
    <View style={{flexDirection: 'column'}}>
      <TouchableOpacity
        ref={ref}
        style={[
          styles.timelineProgramBlock,
          containerStyle,
          isFocused && styles.programBlockFocused,
        ]}
        hasTVPreferredFocus={hasTVPreferredFocus && index === 0}
        activeOpacity={1}
        onFocus={event => onFocus(event, index)}
        onBlur={event => onBlur(event, index)}
        onPress={handlePress}>
        <Text
          style={textStyle}
          numberOfLines={1}
          ellipsizeMode="tail">
          {displayText}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

export default React.memo(ProgramItem);

// export default ProgramItem;

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
    elevation: 5, // Higher elevation for Android
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

