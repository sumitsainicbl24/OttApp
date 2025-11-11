import React, {forwardRef} from 'react';
import {Pressable, StyleSheet, Image, View, Text} from 'react-native';
import {moderateScale, scale} from '../../styles/scaling';
import imagepath from '../../constants/imagepath';
import {CommonColors} from '../../styles/Colors';
import FontFamily from '../../constants/FontFamily';

interface EpisodeButtonProps {
  onPress: () => void;
  focused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  nextFocusLeft?: any;
  nextFocusRight?: any;
}

const EpisodeButton = forwardRef<any, EpisodeButtonProps>(
  ({onPress, focused, onFocus, onBlur, nextFocusLeft, nextFocusRight}, ref) => {
    return (
      <Pressable
        ref={ref}
        style={[styles.button]}
        onPress={onPress}
        onFocus={onFocus}
        onBlur={onBlur}
        hasTVPreferredFocus={focused}
        nextFocusLeft={nextFocusLeft}
        nextFocusRight={nextFocusRight}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Episodes"
        tvFocusable={true}
        focusable={true}>
        <View style={styles.content}>
          <Image
            source={imagepath.PlaylistIcon}
            style={[styles.icon, focused && styles.focusedIcon]}
            tintColor={focused ? CommonColors.white : 'rgba(228, 228, 228, 0.87)'}
          />
          <Text
            style={[
              styles.label,
              focused && styles.focusedLabel,
            ]}>
            Episode
          </Text>
        </View>
      </Pressable>
    );
  },
);

EpisodeButton.displayName = 'EpisodeButton';

const styles = StyleSheet.create({
  button: {
    width: moderateScale(121),
    height: moderateScale(32),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: moderateScale(16),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(16),
  },
  icon: {
    width: moderateScale(32),
    height: moderateScale(32),
  },
  label: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(32),
    color: 'rgba(228, 228, 228, 0.87)',
    letterSpacing: -0.72,
  },
  focusedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: moderateScale(4),
    borderWidth: 2,
    borderColor: CommonColors.white,
    transform: [{scale: 1.05}],
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
  focusedLabel: {
    color: CommonColors.white,
  },
});

export default EpisodeButton;

