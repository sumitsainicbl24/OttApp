import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FontFamily from '../constants/FontFamily';
import { CommonColors } from '../styles/Colors';
import { moderateScale, scale, verticalScale } from '../styles/scaling';
import SimpleMarquee from './MarqueeText';

interface LiveTVChannel {
  url: string;
  name: string;
  number: string;
  category: string;
  isLive: boolean;
  title: string;
}

interface LiveTVChannelsProps {
  data: LiveTVChannel[];
  onChannelPress?: (channel: LiveTVChannel) => void;
  category: string;
}

const LiveTVChannels: React.FC<LiveTVChannelsProps> = ({ data, onChannelPress, category }) => {
  const [focused, setFocused] = useState<string | null>(null)

  const handleFocus = (url: string) => {
    setFocused(url)
  }

  const handleBlur = () => {
    setFocused(null)
  }

  const renderChannelLogo = (channel: LiveTVChannel) => {
    return (
      <TouchableOpacity
        key={channel?.url}
        style={[
          styles.channelLogoContainer,
          focused === channel.url && styles.channelLogoContainerFocused
        ]}
        onPress={() => onChannelPress?.(channel)}
        activeOpacity={1}
        onFocus={() => handleFocus(channel.url)}
        onBlur={() => handleBlur()}
        {...({ isTVSelectable: true } as any)}
      >
        <Text style={styles.channelName}>{category}</Text>
        <View style={styles.liveIndicator}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <View style={{ width: '100%' }}>
            <SimpleMarquee text={channel.title} textStyle={styles.currentShow} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.sectionContainerLiveChannels}>
      <Text style={styles.sectionTitleLiveChannels}>Live TV Channels</Text>
      <FlatList
        data={data}
        renderItem={({ item }) => renderChannelLogo(item)}
        keyExtractor={(item) => item.url.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.channelsContainer}
        contentContainerStyle={styles.channelsContentContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainerLiveChannels: {
    // height: '30%',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(40),
    zIndex: 10,
  },

  sectionTitleLiveChannels: {
    fontFamily: FontFamily.PublicSans_Bold,
    fontSize: scale(30),
    color: CommonColors.white,
    marginBottom: verticalScale(24),
  },

  channelsContainer: {
    flexDirection: 'row',
    paddingHorizontal: moderateScale(5),
    paddingVertical: verticalScale(5),
  },

  channelsContentContainer: {
    paddingRight: moderateScale(40),
    alignItems: 'center',
  },

  channelLogoContainer: {
    width: moderateScale(200),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    padding: moderateScale(16),
    marginRight: moderateScale(7.5),
  },
  channelLogoContainerFocused: {
    transform: [{ scale: 1.05 }],
    borderColor: CommonColors.white,
  },

  channelName: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(14),
    color: CommonColors.white,
    textAlign: 'center',
    marginBottom: verticalScale(15),
  },

  liveIndicator: {
    backgroundColor: '#FF0000',
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(4),
    marginBottom: verticalScale(8),
  },

  liveText: {
    fontFamily: FontFamily.PublicSans_Bold,
    fontSize: moderateScale(12),
    color: CommonColors.white,
  },

  currentShow: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(14),
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});

export default LiveTVChannels; 