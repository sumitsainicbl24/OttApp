import {Pressable, StyleSheet, Text, View} from 'react-native';
import React, { useEffect, useRef } from 'react';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import {moderateScale} from '../../../styles/scaling';

const YoutubeComp = ({data}: {data: any}) => {
  console.log('data', data);
  const playerRef = useRef<YoutubeIframeRef>(null);
  
  useEffect(() => {
    console.log('playerRef', playerRef.current?.getDuration())
  }, [playerRef?.current]);

  return (
    <Pressable focusable={false}>
      <YoutubePlayer
        ref={playerRef}
        height={360}
        play={true}
        mute={true}
        videoId={data?.youtube_trailer || 'dVIcn0XA0Sg'}
        onChangeState={(e: any) => {
          if(e === 'ended'){
            playerRef.current?.seekTo(0, true);
          }
        }}
        initialPlayerParams={{
          controls: false,
          rel: false,
        }}
        forceAndroidAutoplay={true}
        onPlaybackRateChange={(e: any) => {
          console.log('playback rate changed', e);
        }}
   
        webViewStyle={{opacity: 1, marginTop: moderateScale(-80)}}
      />
    </Pressable>
  );
};

export default React.memo(YoutubeComp);

const styles = StyleSheet.create({});
