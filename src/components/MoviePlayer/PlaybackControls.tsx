import React from 'react';
import {View, Pressable, StyleSheet, Image} from 'react-native';
import {moderateScale} from '../../styles/scaling';
import imagepath from '../../constants/imagepath';
import {CommonColors} from '../../styles/Colors';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onRewind: () => void;
  onForward: () => void;
  onForwardLongPressStart?: () => void;
  onForwardLongPressEnd?: () => void;
  onRewindLongPressStart?: () => void;
  onRewindLongPressEnd?: () => void;
  focusedControl?: string | null;
  onFocus?: (control: string) => void;
  onBlur?: () => void;
  rewindRef?: React.RefObject<any>;
  playPauseRef?: React.RefObject<any>;
  forwardRef?: React.RefObject<any>;
  settingsRef?: React.RefObject<any>;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onPlayPause,
  onRewind,
  onForward,
  onForwardLongPressStart,
  onForwardLongPressEnd,
  onRewindLongPressStart,
  onRewindLongPressEnd,
  focusedControl,
  onFocus,
  onBlur,
  rewindRef,
  playPauseRef,
  forwardRef,
  settingsRef,
}) => {
  return (
    <View style={styles.container}>
      <Pressable
        ref={rewindRef}
        style={[
          styles.controlButton,
          // focusedControl === 'rewind' && styles.focusedButton,
        ]}
        onPress={onRewind}
        onLongPress={onRewindLongPressStart}
        onPressOut={onRewindLongPressEnd}
        onFocus={() => onFocus?.('rewind')}
        onBlur={onBlur}
        // hasTVPreferredFocus={focusedControl === 'rewind'}
        // nextFocusRight={playPauseRef?.current}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Rewind 10 seconds, long press for continuous rewind"
        tvFocusable={true}>
        <View style={styles.iconContainer}>
          <Image
            source={imagepath.rewind_button}
            style={[
              styles.icon,
              focusedControl === 'rewind' && styles.focusedIcon,
            ]}
            tintColor={
              focusedControl === 'rewind'
                ? CommonColors.white
                : 'rgba(228, 228, 228, 0.5)'
            }
          />
        </View>
        {/* {focusedControl === 'rewind' && <View style={styles.focusIndicator} />} */}
      </Pressable>

      <Pressable
        ref={playPauseRef}
        style={[
          styles.playPauseButton,
          // focusedControl === 'playPause' && styles.focusedButton,
        ]}
        onPress={onPlayPause}
        onFocus={() => onFocus?.('playPause')}
        onBlur={onBlur}
        // hasTVPreferredFocus={focusedControl === 'playPause'}
        // nextFocusLeft={rewindRef?.current}
        // nextFocusRight={forwardRef?.current}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        tvFocusable={true}>
        <View style={styles.playPauseIconContainer}>
          {isPlaying ? (
            <Image
              source={imagepath.pauseIcon}
              style={[
                styles.playPauseIcon,
                focusedControl === 'playPause' && styles.focusedIcon,
              ]}
              tintColor={
                focusedControl === 'playPause'
                  ? CommonColors.white
                  : 'rgba(228, 228, 228, 0.5)'
              }
            />
          ) : (
            <Image
              source={imagepath.playbuttonarrowhead}
              style={[
                styles.playPauseIcon,
                focusedControl === 'playPause' && styles.focusedIcon,
              ]}
              tintColor={
                focusedControl === 'playPause'
                  ? CommonColors.white
                  : 'rgba(228, 228, 228, 0.5)'
              }
            />
          )}
        </View>
        {/* {focusedControl === 'playPause' && (
          <View style={styles.focusIndicator} />
        )} */}
      </Pressable>

      <Pressable
        ref={forwardRef}
        style={[
          styles.controlButton,
          // focusedControl === 'forward' && styles.focusedButton,
        ]}
        onPress={onForward}
        onLongPress={onForwardLongPressStart}
        onPressOut={onForwardLongPressEnd}
        onFocus={() => onFocus?.('forward')}
        onBlur={onBlur}
        // hasTVPreferredFocus={focusedControl === 'forward'}
        // nextFocusLeft={playPauseRef?.current}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Forward 10 seconds, long press for continuous forward"
        tvFocusable={true}
        nextFocusRight={settingsRef?.current || undefined}>
        <View style={styles.iconContainer}>
          <Image
            source={imagepath.fast_forward}
            style={[
              styles.icon,
              focusedControl === 'forward' && styles.focusedIcon,
            ]}
            tintColor={
              focusedControl === 'forward'
                ? CommonColors.white
                : 'rgba(228, 228, 228, 0.5)'
            }
          />
        </View>
        {/* {focusedControl === 'forward' && (
          <View style={styles.focusIndicator} />
        )} */}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(20),
  },
  controlButton: {
    width: moderateScale(49),
    height: moderateScale(49),
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseButton: {
    width: moderateScale(49),
    height: moderateScale(49),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseIconContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: moderateScale(25),
    height: moderateScale(25),
  },
  playPauseIcon: {
    width: moderateScale(25),
    height: moderateScale(25),
  },
  focusedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: moderateScale(4),
    borderWidth: 2,
    borderColor: CommonColors.white,
    transform: [{scale: 1.1}],
    shadowColor: CommonColors.white,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  focusedIcon: {
    transform: [{scale: 1.1}],
  },
  focusIndicator: {
    position: 'absolute',
    top: moderateScale(-2),
    left: moderateScale(-2),
    right: moderateScale(-2),
    bottom: moderateScale(-2),
    borderRadius: moderateScale(6),
    borderWidth: 2,
    borderColor: CommonColors.white,
    opacity: 0.5,
  },
});

export default PlaybackControls;

