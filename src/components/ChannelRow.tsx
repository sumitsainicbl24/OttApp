import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { useMappingHelper } from '@shopify/flash-list';
import FontFamily from '../constants/FontFamily';
import { moderateScale, scale } from '../styles/scaling';
import { CommonColors } from '../styles/Colors';
import { calculateProgramWidth, decodeEPGTitle } from '../utils/epgUtils';
import SimpleMarquee from './MarqueeText';

interface ChannelRowProps {
  item: any;
  index: number;
  isFocused: boolean;
  onFocus: (streamId: string) => void;
}

const ChannelRow = ({ item, index, isFocused, onFocus }: ChannelRowProps) => {
  const epgList = item?.epg;
  const { getMappingKey } = useMappingHelper();
  const [focusedEpg, setFocusedEpg] = useState<number | null>(epgList?.[0]?.id);

  return (
    <TouchableOpacity
      focusable
      style={styles.rowStyle}
      onFocus={e => {
        onFocus(item?.stream_id);
      }}
      activeOpacity={1}
    >
      {/* <SimpleMarquee
        text={`${index + 1}. ${item.title}` || 'Channel Name'}
        shouldStart={isFocused}
        textStyle={[
          styles.channelNameText,
          isFocused && {
            color: CommonColors.blueText,
          },
        ]}
        speed={50}
      /> */}
      <Text
        style={[
          styles.channelNameText,
          isFocused && {
            color: CommonColors.blueText,
          },
        ]}
      >
        {index + 1}. {item.title}
      </Text>
      <View style={styles.epgView}>
        {epgList?.length > 0 &&
          epgList.map((epg: any, epgIndex: number) => {
            const width = calculateProgramWidth(epg);
            const isFocusedEpg = focusedEpg === epg?.id && isFocused;
            return (
              <TouchableOpacity
                key={getMappingKey(item.id, epgIndex)}
                focusable
                style={[
                  styles.epgItemStyle,
                  {
                    width,
                    backgroundColor: isFocused
                      ? 'rgb(66,69,71)'
                      : 'rgba(29,32,37,0.9)',
                  },
                  isFocusedEpg &&
                    isFocused && {
                      backgroundColor: 'white',
                    },
                ]}
                onFocus={() => setFocusedEpg(epg?.id)}
                activeOpacity={1}
              >
                <Text
                  style={
                    isFocusedEpg ? styles.focusedTitleText : styles.titleText
                  }
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {decodeEPGTitle(epg.title)}
                </Text>
              </TouchableOpacity>
            );
          })}
      </View>
    </TouchableOpacity>
  );
};

export default ChannelRow;

const styles = StyleSheet.create({
  focusedRowStyle: {
    width: 200,
    height: 45,
    borderWidth: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: moderateScale(10),
  },
  rowStyle: {
    width: 200,
    height: 45,
    borderWidth: 1,
    flexDirection: 'row',
    backgroundColor: 'black',
  },
  epgItemStyle: {
    width: 100,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // borderColor: 'red',
  },
  channelNameText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(25),
    letterSpacing: moderateScale(0.24),
    color: CommonColors.white,
    alignSelf: 'center',
    paddingLeft: moderateScale(20),
  },
  epgView: { flexDirection: 'row', marginLeft: moderateScale(125) },
  titleText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(25),
    letterSpacing: moderateScale(0.24),
    color: CommonColors.white,
  },
  focusedTitleText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(25),
    letterSpacing: moderateScale(0.24),
    color: CommonColors.black,
  },
});
