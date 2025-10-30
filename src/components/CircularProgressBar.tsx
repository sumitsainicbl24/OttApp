import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import FontFamily from '../constants/FontFamily';
import {CommonColors} from '../styles/Colors';

interface CircularProgressBarProps {
  rating: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
  fontSize?: number;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  rating,
  size = 50,
  strokeWidth = 4,
  showText = true,
  fontSize,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (rating / 10) * 100; // Assuming rating is out of 10
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Color based on rating
  const getColor = (rating: number): string => {
    if (rating >= 7) return '#4CAF50'; // Green for good ratings
    if (rating >= 5) return '#FFC107'; // Yellow for average ratings
    return '#F44336'; // Red for poor ratings
  };

  const textSize = fontSize || size * 0.28;

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          stroke="rgba(255, 255, 255, 0.2)"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <Circle
          stroke={getColor(rating)}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {showText && (
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.ratingText,
              {
                fontSize: textSize,
              },
            ]}>
            {rating.toFixed(1)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  textContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: FontFamily.PublicSans_Bold,
    color: CommonColors.textWhite,
  },
});

export default React.memo(CircularProgressBar);
