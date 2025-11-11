import React, {forwardRef} from 'react';
import {Pressable, StyleSheet, Image, View} from 'react-native';
import {moderateScale} from '../../styles/scaling';
import imagepath from '../../constants/imagepath';
import {CommonColors} from '../../styles/Colors';

interface SettingsButtonProps {
  onPress: () => void;
  focused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  nextFocusLeft?: any;
}

const SettingsButton = forwardRef<any, SettingsButtonProps>(
  ({onPress, focused, onFocus, onBlur, nextFocusLeft}, ref) => {
    return (
      <Pressable
        ref={ref}
        style={[styles.button]}
        onPress={onPress}
        onFocus={onFocus}
        onBlur={onBlur}
        hasTVPreferredFocus={focused}
        nextFocusLeft={nextFocusLeft}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Settings"
        tvFocusable={true}
        focusable={true}>
        <Image
          source={imagepath.settingIcon}
          style={[styles.icon, focused && styles.focusedIcon]}
          tintColor={focused ? CommonColors.white : 'rgba(228, 228, 228, 0.87)'}
        />
        {/* {focused && <View style={styles.focusIndicator} />} */}
      </Pressable>
    );
  },
);

SettingsButton.displayName = 'SettingsButton';

const styles = StyleSheet.create({
  button: {
    width: moderateScale(45),
    height: moderateScale(45),
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: moderateScale(38),
    height: moderateScale(38),
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

export default SettingsButton;
