import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {CommonColors} from '../styles/Colors';
import {moderateScale, scale, verticalScale} from '../styles/scaling';
import FontFamily from '../constants/FontFamily';
import {ProgramPosition} from '../utils/timelineUtils';

interface ProgramItemProps {
  position: ProgramPosition;
  index: number;
  focusedProgramIndex: number | null;
  hasTVPreferredFocus: boolean;
  onFocus: (event: any, index: number) => void;
  onBlur: (event: any, index: number) => void;
  onPress: (index: number) => void;
}

const ProgramItem: React.FC<ProgramItemProps> = ({
  position,
  index,
  focusedProgramIndex,
  hasTVPreferredFocus,
  onFocus,
  onBlur,
  onPress,
}) => {
  const isFocused = focusedProgramIndex === index;
  const hasAnyFocus = focusedProgramIndex !== null;

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

  return (
    <View style={{flexDirection: 'column'}}>
      <TouchableOpacity
        style={[
          styles.timelineProgramBlock,
          containerStyle,
          isFocused && styles.programBlockFocused,
        ]}
        hasTVPreferredFocus={hasTVPreferredFocus && index === 0}
        activeOpacity={1}
        onFocus={event => onFocus(event, index)}
        onBlur={event => onBlur(event, index)}
        onPress={() => onPress(index)}>
        <Text
          style={textStyle}
          numberOfLines={1}
          ellipsizeMode="tail">
          {displayText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// // Custom comparison function for better memoization
// const areEqual = (
//   prevProps: ProgramItemProps,
//   nextProps: ProgramItemProps,
// ): boolean => {
//   return (
//     prevProps.index === nextProps.index &&
//     prevProps.focusedProgramIndex === nextProps.focusedProgramIndex &&
//     prevProps.position.left === nextProps.position.left &&
//     prevProps.position.width === nextProps.position.width &&
//     prevProps.position.title === nextProps.position.title &&
//     prevProps.hasTVPreferredFocus === nextProps.hasTVPreferredFocus
//   );
// };

export default React.memo(ProgramItem);

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

