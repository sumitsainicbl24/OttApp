import React, { useState, useCallback, useEffect, useRef } from 'react';
import {Image, Text, View, StyleSheet, ImageSourcePropType, ActivityIndicator} from 'react-native';
import {CommonColors} from '../styles/Colors';
import {moderateScale, verticalScale, scale, height} from '../styles/scaling';
import FontFamily from '../constants/FontFamily';
import Video from 'react-native-video';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import imagepath from '../constants/imagepath';

interface ChannelMediaPlayerProps {
  imageSource?: ImageSourcePropType;
  showTitle?: string;
  timeSlot?: string;
  progressPercentage?: number;
  duration?: string;
  streamUrl: string | null;
  selectedCategory: string;
  loading: boolean;
}

const ChannelMediaPlayer: React.FC<ChannelMediaPlayerProps> = ({
  imageSource,
  showTitle = 'No Information',
  timeSlot = '02:00 - 03:00PM',
  progressPercentage = 65,
  duration = '26 min',
  streamUrl='',
  selectedCategory,
  loading,
}) => {
  const currentlyPlaying = useSelector((state: RootState) => state.rootReducer.main.currentlyPlaying)
  
  // Video loading and error states
  const [videoLoading, setVideoLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [videoKey, setVideoKey] = useState(0); // Force video re-render on retry
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  console.log(streamUrl, 'streamUrl');
  
  // Reset states when streamUrl changes
  useEffect(() => {
    if (!streamUrl) {
      setVideoLoading(false);
      setIsRetrying(false);
      // Clear any pending retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    } else {
      setVideoLoading(true);
      setIsRetrying(false);
    }
  }, [streamUrl]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);
  
  // Video event handlers
  const handleLoadStart = useCallback(() => {
    setVideoLoading(true);
    // Clear any pending retry timeout when starting to load
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);
  
  const handleLoad = useCallback(() => {
    setVideoLoading(false);
    setIsRetrying(false);
  }, []);
  
  const handleError = useCallback((error: any) => {
    console.error('Video error:', error);
    setVideoLoading(false);
    setIsRetrying(true);
    
    // Auto retry after 3 seconds
    console.log('Auto retrying in 3 seconds...');
    retryTimeoutRef.current = setTimeout(() => {
      setVideoKey(prev => prev + 1); // Force re-render
      setVideoLoading(true);
      setIsRetrying(false);
    }, 3000);
  }, []);
  
  return (
    <View style={styles.ShowDetailsContainer}>
      <View style={styles.videoContainer}>
        {streamUrl && (
          <Video 
            key={videoKey} // Force re-render on retry
            source={{ uri: streamUrl }} 
            style={styles.ShowImageContainer}
            paused={false}
            resizeMode="contain"
            repeat={true}
            onLoadStart={handleLoadStart}
            onLoad={handleLoad}
            onError={handleError}
            controlsStyles={{
              hideSeekBar:true,
              hideDuration:true,
              hidePosition:true,
              hideFullscreen:true,
              hideNavigationBarOnFullScreenMode:true,
              hideNotificationBarOnFullScreenMode:true,
              hideSettingButton:true,
            }}
            playInBackground={false}
          />
        )}
        
        {/* No stream URL overlay */}
        {!streamUrl && (
          <View style={styles.overlayContainer}>
            <Image source={imagepath.tv} style={styles.errorIcon} />
            <Text style={styles.errorText}>No stream available</Text>
          </View>
        )}
        
        {/* Loading overlay */}
        {streamUrl && (videoLoading || isRetrying) && (
          <View style={styles.overlayContainer}>
            <ActivityIndicator size="large" color={CommonColors.blueText} />
            <Text style={styles.loadingText}>
              {/* {isRetrying ? 'Retrying...' : 'Loading channel...'} */}
            </Text>
          </View>
        )}
        
      </View>

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

      {!loading && <View style={{ 
        position:'absolute',
        top:moderateScale(50),
        right:moderateScale(10),
        alignItems:'flex-end',
        gap:moderateScale(10)
      }}>
        <Image source={imagepath.empty_star} style={styles.filled_star} />
      <Text style={{color:CommonColors.white, 
        fontSize:moderateScale(18), 
        fontFamily:FontFamily.PublicSans_Medium
        }}>{selectedCategory}</Text>
      </View>}
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
  videoContainer: {
    position: 'relative',
    width: scale(680),
    height: scale(438),
  },
  ShowImageContainer: {
    width: scale(680),
    height: scale(438),
    borderRadius: moderateScale(16),
    overflow: 'hidden',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateScale(15),
  },
  loadingText: {
    color: CommonColors.white,
    fontSize: scale(20),
    fontFamily: FontFamily.PublicSans_Medium,
    marginTop: moderateScale(10),
  },
  errorIcon: {
    width: scale(50),
    height: scale(50),
    tintColor: CommonColors.white,
  },
  errorText: {
    color: CommonColors.white,
    fontSize: scale(22),
    fontFamily: FontFamily.PublicSans_SemiBold,
    textAlign: 'center',
    marginBottom: moderateScale(10),
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
  filled_star: {
    width: scale(30),
    height: scale(30),
    marginRight: scale(8),  
  },
});

export default React.memo(ChannelMediaPlayer); 