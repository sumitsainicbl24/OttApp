import React from 'react';
import {Image, Text, View, StyleSheet, ImageSourcePropType} from 'react-native';
import {CommonColors} from '../styles/Colors';
import {moderateScale, verticalScale, scale, height} from '../styles/scaling';
import FontFamily from '../constants/FontFamily';
import Video from 'react-native-video';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface ChannelMediaPlayerProps {
  imageSource?: ImageSourcePropType;
  showTitle?: string;
  timeSlot?: string;
  progressPercentage?: number;
  duration?: string;
  streamUrl: string | null;
}

const ChannelMediaPlayer: React.FC<ChannelMediaPlayerProps> = ({
  imageSource,
  showTitle = 'No Information',
  timeSlot = '02:00 - 03:00PM',
  progressPercentage = 65,
  duration = '26 min',
  streamUrl='',
}) => {
  const currentlyPlaying = useSelector((state: RootState) => state.rootReducer.main.currentlyPlaying)
  console.log(streamUrl, 'streamUrl');
  
  return (
    <View style={styles.ShowDetailsContainer}>
      <Video 
      source={{ uri: streamUrl }} 
      style={styles.ShowImageContainer}
      paused={false}
      resizeMode="contain"
      repeat={true}
      controls={true}
       />

      <View style={styles.ShowDetailsContent}>
        <Text style={styles.showTitle}>{showTitle}</Text>
        <Text style={styles.showTimeSlot}>{timeSlot}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, {width: `${progressPercentage}%`}]} />
          </View>
          <Text style={styles.durationText}>{duration}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ShowDetailsContainer: {
    height: height / 2,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: moderateScale(40),
    paddingVertical: verticalScale(45),
  },
  ShowImageContainer: {
    width: scale(680),
    height: scale(438),
    borderRadius: moderateScale(16),
    overflow: 'hidden',
  },
  ShowImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  ShowDetailsContent: {
    paddingLeft: moderateScale(50),
    paddingRight: moderateScale(40),
    justifyContent: 'center',
    gap: verticalScale(30),
  },
  showTitle: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(36),
    lineHeight: scale(42),
    letterSpacing: scale(0.72), // 2% of font size
    color: CommonColors.white,
  },
  showTimeSlot: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(28),
    lineHeight: scale(33),
    letterSpacing: scale(0.56), // 2% of font size
    color: CommonColors.white,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: moderateScale(25),
  },
  progressBarContainer: {
    width: scale(250),
    height: moderateScale(5),
    backgroundColor: '#1C2F4B',
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: CommonColors.white,
    borderRadius: moderateScale(20),
  },
  durationText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(24),
    lineHeight: scale(28),
    letterSpacing: scale(0.48), // 2% of font size
    color: CommonColors.white,
  },
});

export default React.memo(ChannelMediaPlayer); 