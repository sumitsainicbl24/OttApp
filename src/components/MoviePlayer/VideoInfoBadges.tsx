import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {moderateScale} from '../../styles/scaling';
import FontFamily from '../../constants/FontFamily';
import {CommonColors} from '../../styles/Colors';

interface VideoInfoBadgesProps {
  resolution?: string;
  audio?: string;
  fps?: string;
}

const VideoInfoBadges: React.FC<VideoInfoBadgesProps> = ({
  resolution = '4096 x 2160',
  audio = '5.1',
  fps = '25 fps',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{resolution}</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{audio}</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{fps}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: moderateScale(10),
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: moderateScale(32),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(6),
  },
  badgeText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(18),
    color: CommonColors.white,
    letterSpacing: -0.36,
  },
});

export default VideoInfoBadges;

