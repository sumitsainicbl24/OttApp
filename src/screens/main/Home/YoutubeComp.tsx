import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Alert, Animated, Pressable, StyleSheet, TVFocusGuideView} from 'react-native';
import YoutubePlayer, {YoutubeIframeRef} from 'react-native-youtube-iframe';
import imagepath from '../../../constants/imagepath';
import {moderateScale, width} from '../../../styles/scaling';
import {imageResolutionHandlerForUrl} from '../../../utils/CommonFunctions';

interface YoutubeCompProps {
  data: {
    youtube_trailer?: string;
    backdrop_path?: string[];
    cover_big?: string;
    cover?: string;
  };
  height?: number;
  VideoWidth?: number;
}

const YoutubeComp = ({
  data,
  height = 500,
  VideoWidth = width - 150,
}: YoutubeCompProps) => {
  const playerRef = useRef<YoutubeIframeRef>(null);
  const [opacity, setOpacity] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  useEffect(() => {
    const getVideoDuration = async () => {
      try {
        // Add a small delay to ensure the player is fully initialized
        await new Promise(resolve => setTimeout(resolve, 1000));
        const duration: number = await playerRef?.current?.getDuration()!;
        setVideoDuration(duration);
      } catch (error) {
        console.log('error getting video duration:', error);
      }
    };

    if (data?.youtube_trailer) {
      getVideoDuration();
    }
  }, [data?.youtube_trailer]);

  const styles = useMemo(() => createStyles(height), [height]);

  const animationConfig = useMemo(
    () => ({
      entrance: {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      },
      exit: {
        toValue: 0,
        duration: 4000,
        useNativeDriver: true,
      },
    }),
    [],
  );

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpacity(0);
    setIsVideoReady(false);
    fadeAnim.setValue(0);
    timeoutRef.current = setTimeout(() => {
      setOpacity(1);
      Animated.timing(fadeAnim, animationConfig.entrance).start(() => {
        setIsVideoReady(true);
        Animated.timing(fadeAnim, animationConfig.exit).start();
      });
    }, 2000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [data, fadeAnim, animationConfig]);

  const imageSource = useMemo(() => {
    if (data?.backdrop_path && data.backdrop_path.length > 0) {
      return {
        uri: imageResolutionHandlerForUrl(data.backdrop_path[0]),
      };
    } else if (data?.cover_big) {
      return {
        uri: imageResolutionHandlerForUrl(data.cover_big),
      };
    } else if (data?.cover) {
      return {
        uri: imageResolutionHandlerForUrl(data.cover),
      };
    }
    return imagepath.VideoPlaceHolder;
  }, [data?.backdrop_path, data?.cover_big, data?.cover]);

  const handleStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      playerRef.current?.seekTo(0, true);
    }
  }, []);

  return (
    <TVFocusGuideView focusable={false} style={styles.container}>
      <YoutubePlayer
        ref={playerRef}
        height={height}
        width={VideoWidth}
        play={true}
        mute={false}
        videoId={data?.youtube_trailer}
        onChangeState={handleStateChange}
        initialPlayerParams={{
          controls: false,
          rel: false,
          start: 10,
          end: videoDuration - 8,
        }}
        forceAndroidAutoplay={true}
        webViewStyle={{opacity: opacity, marginTop: moderateScale(50)}}
      />

      {/* Poster image overlay - shows until video is ready */}
      {!isVideoReady && (
        <Animated.Image
          source={imageSource}
          style={styles.posterImage}
          resizeMode="cover"
        />
      )}

      {/* Animated fade overlay - always on top */}
      <Animated.View
        style={[
          styles.fadeOverlay,
          {
            opacity: fadeAnim,
          },
        ]}
        pointerEvents="none"
      />
    </TVFocusGuideView>
  );
};

export default YoutubeComp;

const createStyles = (height: number) =>
  StyleSheet.create({
    container: {
      position: 'relative',
      alignItems: 'flex-end',
      // backgroundColor:'red',
      // height: height 
    },
    posterImage: {
      position: 'absolute',
      top: 100,
      left: 180,
      right: 0,
      height,
      zIndex: 2,
      opacity: 1,
    },
    fadeOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height,
      backgroundColor: 'rgba(0, 0, 0, 1)', // Semi-transparent black overlay
      zIndex: 3,
    },
  });
