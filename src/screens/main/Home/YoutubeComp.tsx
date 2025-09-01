import {Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import YoutubePlayer, {YoutubeIframeRef} from 'react-native-youtube-iframe';
import {moderateScale} from '../../../styles/scaling';

const YoutubeComp = ({data}: {data: any}) => {
  console.log('data', data);
  const playerRef = useRef<YoutubeIframeRef>(null);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    console.log('playerRef', playerRef.current?.getDuration());
  }, [playerRef?.current]);

  const onReady = () => {
    setTimeout(() => {
      setOpacity(1);
    }, 400);
  };

  return (
    <Pressable focusable={false} pointerEvents="none">
      <YoutubePlayer
        ref={playerRef}
        height={390}
        play={true}
        mute={true}
        videoId={data?.youtube_trailer || 'dVIcn0XA0Sg'}
        onChangeState={(e: any) => {
          if (e === 'ended') {
            playerRef.current?.seekTo(0, true);
          }
        }}
        initialPlayerParams={{
          controls: false,
          rel: false,
        }}
        forceAndroidAutoplay={true}
        onReady={onReady}
        webViewStyle={{opacity: opacity, marginTop: moderateScale(-30)}}
      />
    </Pressable>
  );
};

export default React.memo(YoutubeComp);

const styles = StyleSheet.create({});
