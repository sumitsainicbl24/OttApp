import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {moderateScale} from '../../styles/scaling';
import FontFamily from '../../constants/FontFamily';
import {CommonColors} from '../../styles/Colors';

interface ProgressBarProps {
  currentTime: number; // in seconds
  duration: number; // in seconds
  onSeek?: (time: number) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  onSeek,
}) => {
  const [containerWidth, setContainerWidth] = useState(moderateScale(1600));
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (event: any) => {
    if (onSeek && duration > 0) {
      const {locationX} = event.nativeEvent;
      const containerWidth = moderateScale(1600);
      const seekTime = (locationX / containerWidth) * duration;
      onSeek(Math.max(0, Math.min(seekTime, duration)));
    }
  };

  const handleProgressBarPress = (event: any) => {
    if (onSeek && duration > 0 && containerWidth > 0) {
      const {locationX} = event.nativeEvent;
      const seekTime = (locationX / containerWidth) * duration;
      onSeek(Math.max(0, Math.min(seekTime, duration)));
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.progressBarContainer}
        onPress={handleProgressBarPress}
        onLayout={(event) => {
          const {width} = event.nativeEvent.layout;
          if (width > 0) {
            setContainerWidth(width);
          }
        }}
        activeOpacity={1}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {width: `${progress}%`},
            ]}
          />
          <View
            style={[
              styles.seekHandle,
              {left: `${progress}%`},
            ]}
          />
        </View>
      </TouchableOpacity>
      <Text style={styles.timeText}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    // paddingVertical: moderateScale(10),
  },
  progressBarContainer: {
    width: '100%',
    maxWidth: moderateScale(1600),
    marginBottom: moderateScale(10),
  },
  progressBarBackground: {
    width: '100%',
    height: moderateScale(7),
    backgroundColor: '#868686',
    borderRadius: moderateScale(3.5),
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6155F5',
    borderRadius: moderateScale(3.5),
    position: 'absolute',
    left: 0,
    top: 0,
  },
  seekHandle: {
    position: 'absolute',
    width: moderateScale(15),
    height: moderateScale(15),
    borderRadius: moderateScale(7.5),
    backgroundColor: '#6155F5',
    top: moderateScale(-4),
    marginLeft: moderateScale(-7.5),
  },
  timeText: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(24),
    color: '#E4E4E4',
    lineHeight: moderateScale(24),
  // position:'absolute',
  },
});

export default ProgressBar;

