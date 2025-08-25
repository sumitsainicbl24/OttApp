import {Pressable, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import YoutubePlayer from 'react-native-youtube-iframe';
import {moderateScale} from '../../../styles/scaling';

const YoutubeComp = () => {
  return (
    <Pressable  
      onFocus={() => {
        console.log('focus captured');
      }}
      pointerEvents="box-only"
      focusable={false}
      style={{}}>
      <YoutubePlayer
        height={360}
        //   ref={playerRef}
        play={true}
        mute={true}
        videoId={'eRwV1k-abZo'}
        
        onChangeState={() => {}}
        initialPlayerParams={{
          controls: false,
          rel: false,
        }}
        forceAndroidAutoplay={true}
        webViewProps={{
          androidLayerType: 'hardware',
          focusable: false, // 🔑 prevents keyboard/D-Pad focus
          accessible: false, // 🔑 removes from accessibility
          importantForAccessibility: 'no',
          accessibilityElementsHidden: true,
          accessibilityViewIsModal: false,
          pointerEvents: 'none', // 🔑 disables all touch/click
          onFocus: (e: any) => e.preventDefault(),
          onBlur: () => {},
        }}
        webViewStyle={{opacity: 1, marginTop: moderateScale(-180)}}
      />
    </Pressable>
  );
};

export default React.memo(YoutubeComp);

const styles = StyleSheet.create({});
