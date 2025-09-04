import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import YoutubePlayer, {YoutubeIframeRef} from 'react-native-youtube-iframe';
import {height, moderateScale, width} from '../../../styles/scaling';
import imagepath from '../../../constants/imagepath';
import {imageResolutionHandlerForUrl} from '../../../utils/CommonFunctions';

const YoutubeComp = ({data}: {data: any}) => {
  console.log('data', data);
  const playerRef = useRef<YoutubeIframeRef>(null);
  const [opacity, setOpacity] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);


  const onReady = () => {
    setTimeout(() => {
      setOpacity(1);
      setIsVideoReady(true);
    }, 400);
  };

  const getImageSource = (info: any) => {
    if (info?.backdrop_path && info.backdrop_path.length > 0) {
      return {
        uri: imageResolutionHandlerForUrl(info.backdrop_path[0]),
      };
    } else if (info?.cover_big) {
      return {
        uri: imageResolutionHandlerForUrl(info.cover_big),
      };
    } else if (info?.cover) {
      return {
        uri: imageResolutionHandlerForUrl(info.cover),
      };
    }
    return imagepath.VideoPlaceHolder;
  };

  return (
    <Pressable focusable={false} pointerEvents="none" style={styles.container}>
      {/* Poster image overlay - shows until video is ready */}
      {!isVideoReady && (
        <Image
          source={getImageSource(data)}
          style={styles.posterImage}
          resizeMode="cover"
        />
      )}
      
      <YoutubePlayer
        ref={playerRef}
        height={500}
        width={width-150}
        play={true}
        mute={false}
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
        webViewStyle={{opacity: opacity, marginTop: moderateScale(50)}}
      />
    </Pressable>
  );
};

export default React.memo(YoutubeComp);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'flex-end',
  },
  posterImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height:500 ,
    zIndex: 1,
  },
});
