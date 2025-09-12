import React, {memo, useState, useEffect} from 'react';
import {Pressable, Text, View} from 'react-native';
import {decodeEPGTitle} from '../../../utils/epgUtils';
import {styles} from './LeftChannelViewStyles';
import {moderateScale} from '../../../styles/scaling';
import {getProxyImageUrl} from '../../../utils/CommonFunctions';
import FastImage from 'react-native-fast-image';
import {CommonColors} from '../../../styles/Colors';

export interface channelData {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  epg_channel_id: string;
  added: string;
  is_adult: number;
  category_id: string;
  category_ids: number[];
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
  title: string;
  logo: string;
  group: string;
  url: string;
  epg: Epg[];
  type: string;
}

export interface Epg {
  id: string;
  epg_id: string;
  title: string;
  lang: string;
  start: string;
  end: string;
  description: string;
  channel_id: string;
  start_timestamp: string;
  stop_timestamp: string;
  now_playing: number;
  has_archive: number;
}

interface LeftChannelItemProps {
  item: channelData;
  isFocused: boolean;
  currentProgram: string;
  onPress: (channel: channelData) => void;
  onItemFocus: (channel: channelData) => void;
}

// Helper function to decode channel name
const decodeChannelName = (encodedName: string): string => {
  try {
    // Check if it looks like base64 encoded
    if (encodedName && /^[A-Za-z0-9+/=]+$/.test(encodedName)) {
      return atob(encodedName);
    }
    return encodedName;
  } catch (error) {
    return encodedName;
  }
};

// Helper function to calculate program progress
const calculateProgramProgress = (channel: channelData): number => {
  if (!channel.epg || channel.epg.length === 0) {
    return 0;
  }

  const now = new Date();
  const currentProgram = channel.epg.find(program => {
    const startTime = new Date(program.start);
    const endTime = new Date(program.end);
    return now >= startTime && now <= endTime;
  });

  if (!currentProgram) {
    return 0;
  }

  const startTime = new Date(currentProgram.start);
  const endTime = new Date(currentProgram.end);
  const totalDuration = endTime.getTime() - startTime.getTime();
  const elapsed = now.getTime() - startTime.getTime();

  if (totalDuration <= 0) return 0;

  const progress = (elapsed / totalDuration) * 100;
  return Math.max(0, Math.min(100, progress)); // Clamp between 0 and 100
};

const LeftChannelItem = memo<LeftChannelItemProps>(
  ({item, isFocused, currentProgram, onPress, onItemFocus}) => {
    const [progress, setProgress] = useState(() =>
      calculateProgramProgress(item),
    );

    // Decode the current program title
    const decodedCurrentProgram =
      currentProgram && currentProgram !== 'No information'
        ? decodeEPGTitle(currentProgram)
        : currentProgram;

    useEffect(() => {
      const updateProgress = () => {
        setProgress(calculateProgramProgress(item));
      };

      // Update immediately
      updateProgress();

      // Set up interval for updates
      const interval = setInterval(updateProgress, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }, [item]);

    return (
      <Pressable
        accessible={true}
        accessibilityRole="button"
        onFocus={() => onItemFocus(item)}
        onPress={() => onPress(item)}
        style={[styles.channelItem, isFocused && styles.channelItemFocused]}>
        <View style={styles.channelContent}>
          {/* TV Icon */}
          <FastImage
            source={{
              uri: getProxyImageUrl(item?.stream_icon)!,
              priority: 'high',
            }}
            style={{
              width: 30,
              height: 30,
              borderRadius: moderateScale(6),
            }}
            resizeMode="cover"
          />

          <View style={styles.channelInfoContainer}>
            <Text
              style={{
                ...styles.channelName,
                color: isFocused ? CommonColors.black : CommonColors.white,
              }}
              numberOfLines={1}>
              {item.num} {decodeChannelName(item.name)}
            </Text>
            <Text style={{...styles.currentProgram,color:isFocused ? CommonColors.black : CommonColors.blueText}} numberOfLines={1}>
              {decodedCurrentProgram}
            </Text>

            {/* Progress Bar */}
            {progress > 0 && (
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, {width: `${progress}%`,backgroundColor:isFocused ? CommonColors.black : CommonColors.white}]} />
              </View>
            )}
          </View>

          {/* Selection Arrow */}
          {isFocused && (
            <View style={styles.selectionArrow}>
              <Text style={styles.arrowText}>▶</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  },
);

// Add display name for better debugging
LeftChannelItem.displayName = 'LeftChannelItem';

export default LeftChannelItem;
