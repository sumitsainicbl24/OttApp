import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  Alert, 
  Dimensions, 
  Image,
  Platform,
  BackHandler,
  TVFocusGuideView,
  Pressable,
  useTVEventHandler,
  ActivityIndicator
} from 'react-native';
import Video from 'react-native-video';
import imagepath from '../constants/imagepath';
import { moderateScale, scale } from '../styles/scaling';
import FontFamily from '../constants/FontFamily';
import { RootState } from '../redux/store';
import { useSelector } from 'react-redux';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LiveVideoCompProps {
  streamUrl: string;
  onExit?: () => void;
}

const LiveVideoComp = ({ streamUrl, onExit }: LiveVideoCompProps) => {

  //get currently playing from redux
  const {currentlyPlaying, currentSeriesEpisodes}:any = useSelector((state: RootState) => state.rootReducer.main)
  
  // Use state for currentEpisodeIndex instead of calculating it each time
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(() => {
    return currentSeriesEpisodes.findIndex((episode:any) => episode.url === streamUrl)
  })

  const [VideoUrl, setVideoUrl] = useState(currentSeriesEpisodes[currentEpisodeIndex]?.url || streamUrl)


  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [focused, setFocused] = useState<string | null>(null);
  const [volume, setVolume] = useState(1.0);
  const [muted, setMuted] = useState(false);
  const [initialFocus, setInitialFocus] = useState(true);
  const [showProgressOnly, setShowProgressOnly] = useState(false);
  const [pendingSeekTime, setPendingSeekTime] = useState<number | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    visible: boolean;
  }>({ message: '', visible: false });
  
  // Refs for focus management
  const videoRef = useRef<any>(null);
  const playPauseRef = useRef<any>(null);
  const rewindRef = useRef<any>(null);
  const forwardRef = useRef<any>(null);
  const previousRef = useRef<any>(null);
  const nextRef = useRef<any>(null);
  const watchFromStartRef = useRef<any>(null);
  const volumeRef = useRef<any>(null);
  const fullscreenRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Auto-hide controls after 5 seconds
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
      setFocused(null); // Clear focus when controls auto-hide
    }, 5000);
  };

  // Auto-hide progress bar after 3 seconds
  const resetProgressTimeout = () => {
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
    }
    progressTimeoutRef.current = setTimeout(() => {
      setShowProgressOnly(false);
      setFocused(null);
    }, 3000);
  };

  // Show progress bar for seeking feedback
  const showProgressForSeeking = () => {
    setShowProgressOnly(true);
    setFocused('progressBar');
    resetProgressTimeout();
  };

  // Show notification temporarily
  const showNotification = (message: string) => {
    setNotification({ message, visible: true });
    setTimeout(() => {
      setNotification({ message: '', visible: false });
    }, 3000);
  };

  const handleNextEpisode = () => {
    if (currentEpisodeIndex < currentSeriesEpisodes.length - 1) {
      const nextIndex = currentEpisodeIndex + 1
      setVideoUrl(currentSeriesEpisodes[nextIndex]?.url)
      setCurrentEpisodeIndex(nextIndex)
      setCurrentTime(0)
    }
    else{
      showNotification('This is the last episode');
    }
  }

  const handlePreviousEpisode = () => {
    if (currentEpisodeIndex > 0) {
      const prevIndex = currentEpisodeIndex - 1
      setVideoUrl(currentSeriesEpisodes[prevIndex]?.url)
      setCurrentEpisodeIndex(prevIndex)
      setCurrentTime(0)
    }
    else {
      showNotification('This is the first episode');
    }
  }

  const seekTo = (seconds: number) => {
    // Calculate new time based on current time (even if video isn't loaded)
    const baseTime = pendingSeekTime !== null ? pendingSeekTime : currentTime;
    const newTime = Math.max(0, Math.min(baseTime + seconds, duration || 999999));
    
    // Update UI immediately for instant feedback
    setCurrentTime(newTime);
    
    // If video is loaded and ready, seek immediately
    if (!loading && !error && videoRef.current) {
      videoRef.current.seek(newTime);
      setPendingSeekTime(null);
    } else {
      // Store pending seek time for when video loads
      setPendingSeekTime(newTime);
      console.log('Video not ready, storing pending seek time:', newTime);
    }
    
    // Show progress bar for seeking when controls are hidden
    if (!showControls) {
      showProgressForSeeking();
    } else {
      setShowControls(true);
      resetControlsTimeout();
    }
  };

  const togglePlayPause = () => {
    setPaused(!paused);
    setShowControls(true);
    resetControlsTimeout();
  };

  const toggleMute = () => {
    setMuted(!muted);
    setShowControls(true);
    resetControlsTimeout();
  };

  // Set up TV event handler for remote control
  useTVEventHandler((evt: any) => {
    console.log('TV Event:', evt?.eventType, 'Controls visible:', showControls);
    
    if (evt && evt.eventType === 'playPause') {
      togglePlayPause();
    } else if (evt && evt.eventType === 'rewind') {
      seekTo(-10);
    } else if (evt && evt.eventType === 'fastForward') {
      seekTo(10);
    } else if (evt && evt.eventType === 'right') {
      // Seek forward when controls are hidden or when only progress is showing
      if (!showControls || showProgressOnly) {
        console.log('Seeking forward 10 seconds');
        seekTo(10);
      }
    } else if (evt && evt.eventType === 'left') {
      // Seek backward when controls are hidden or when only progress is showing
      if (!showControls || showProgressOnly) {
        console.log('Seeking backward 10 seconds');
        seekTo(-10);
      }
    } else if (evt && evt.eventType === 'select') {
      if (!showControls) {
        setShowControls(true);
        setShowProgressOnly(false); // Hide progress bar when showing full controls
        if (progressTimeoutRef.current) {
          clearTimeout(progressTimeoutRef.current);
        }
        resetControlsTimeout();
        setInitialFocus(true); // Reset initial focus when controls are shown via remote
      }
    } else if (evt && evt.eventType === 'menu') {
      // First press: hide controls/progress, second press: exit
      if (showControls || showProgressOnly) {
        console.log('Hiding controls/progress on menu/back press');
        setShowControls(false);
        setShowProgressOnly(false);
        setFocused(null);
        if (progressTimeoutRef.current) {
          clearTimeout(progressTimeoutRef.current);
        }
      } else if (onExit) {
        console.log('Exiting player on menu/back press');
        onExit();
      }
    }
  });

  useEffect(() => {
    // Handle Android TV back button
    if (Platform.isTV) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        // First press: hide controls/progress, second press: exit
        if (showControls || showProgressOnly) {
          console.log('Hiding controls/progress on Android back press');
          setShowControls(false);
          setShowProgressOnly(false);
          setFocused(null);
          if (progressTimeoutRef.current) {
            clearTimeout(progressTimeoutRef.current);
          }
          return true; // Prevent default back behavior
        } else if (onExit) {
          console.log('Exiting player on Android back press');
          onExit();
          return true; // Prevent default back behavior
        }
        return false;
      });

      return () => {
        backHandler.remove();
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        if (progressTimeoutRef.current) {
          clearTimeout(progressTimeoutRef.current);
        }
      };
    }
  }, [onExit, showControls, showProgressOnly]);

  useEffect(() => {
    if (showControls) {
      resetControlsTimeout();
    }
  }, [showControls]);

  const onLoad = (data: any) => {
    console.log('Stream loaded:', data);
    setLoading(false);
    setError(null);
    setDuration(data.duration || 0);
    
    // If there's a pending seek time, seek to it now that video is loaded
    if (pendingSeekTime !== null && videoRef.current) {
      const seekTime = Math.max(0, Math.min(pendingSeekTime, data.duration || 0));
      console.log('Seeking to pending time:', seekTime);
      videoRef.current.seek(seekTime);
      setCurrentTime(seekTime);
      setPendingSeekTime(null);
    }
  };

  const onError = (error: any) => {
    console.log('Stream error:', error);
    setError('Failed to load stream. Please check your internet connection.');
    setLoading(false);
  };

  const retryStream = () => {
    setLoading(true);
    setError(null);
    // Keep pending seek time for after retry loads if user was seeking
    // Reset current time to 0 if no pending seek
    if (pendingSeekTime === null) {
      setCurrentTime(0);
    }
  };

  const onProgress = (data: any) => {
    setCurrentTime(data.currentTime);
  };

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getRemainingTime = () => {
    // If duration is known, calculate remaining time
    if (duration > 0) {
      return duration - currentTime;
    }
    // If duration unknown, show current time as remaining time
    return currentTime;
  };

  const getProgressPercentage = () => {
    // Use duration if available, otherwise use a default for seeking feedback
    const totalDuration = duration || 3600; // Default 1 hour for seeking when duration unknown
    if (totalDuration === 0) return 0;
    return (currentTime / totalDuration) * 100;
  };

  const handleScreenPress = () => {
    setShowControls(!showControls);
    if (!showControls) {
      setShowProgressOnly(false); // Hide progress bar when showing full controls
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
      resetControlsTimeout();
      setInitialFocus(true); // Reset initial focus when controls are shown
    }
  };

  const handleFocus = (componentName: string) => {
    setFocused(componentName);
    setShowControls(true);
    resetControlsTimeout();
    if (initialFocus) {
      setInitialFocus(false);
    }
  };

  const handleBlur = () => {
    setFocused(null);
  };

  return (
    <View style={styles.container}>
      {/* Video Component */}
      <Pressable 
        style={styles.videoContainer}
        onPress={handleScreenPress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Video player"
        accessibilityHint="Press to show or hide controls"
      >
        <Video
          ref={videoRef}
          source={{ 
            uri: VideoUrl,
            headers: {
              'User-Agent': 'React-Native-TV-Player/1.0.0'
            }
          }}
          style={styles.video}
          resizeMode="contain"
          controls={false}
          paused={paused}
          volume={muted ? 0 : volume}
          onLoad={onLoad}
          onError={onError}
          onProgress={onProgress}
          onBuffer={({ isBuffering }) => {
            console.log('Buffering:', isBuffering);
          }}
          repeat={false}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          bufferConfig={{
            minBufferMs: 15000,
            maxBufferMs: 50000,
            bufferForPlaybackMs: 2500,
            bufferForPlaybackAfterRebufferMs: 5000
          }}
        />
      </Pressable>

      {/* Controls Overlay */}
      {showControls && !loading && !error && (
        <View style={styles.controlsOverlay}>
          
          {/* show movie name */}
          <Text style={styles.movieName}>{`${currentlyPlaying?.title}${currentSeriesEpisodes?.length > 1 ? ' EP ' + (currentEpisodeIndex+1) : ''}`}
          </Text>
          

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TVFocusGuideView style={styles.bottomControlsGuide}>

               {/* Control Buttons */}
               {/* <View style={styles.bottomButtons}>
                  <Pressable 
                    ref={volumeRef}
                    style={[
                      styles.bottomButton,
                      focused === 'volume' && styles.focusedButton
                    ]}
                    onPress={toggleMute}
                    onFocus={() => handleFocus('volume')}
                    onBlur={handleBlur}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={muted ? "Unmute" : "Mute"}
                    accessibilityHint="Press to toggle sound"
                    nextFocusUp={playPauseRef.current}
                    nextFocusRight={fullscreenRef.current}
                  >
                    <Image source={muted ? imagepath.muteIcon : imagepath.unmuteIcon} style={styles.controlIconBottom}/>
                    {focused === 'volume' && <View style={styles.focusIndicator} />}
                  </Pressable>
                  </View> */}
                  {/* <Pressable 
                    ref={fullscreenRef}
                    style={[
                      styles.bottomButton,
                      focused === 'fullscreen' && styles.focusedButton
                    ]}
                    onPress={() => {
                      // Fullscreen toggle logic can be added here
                      Alert.alert('Fullscreen', 'Fullscreen toggle would be implemented here');
                    }}
                    onFocus={() => handleFocus('fullscreen')}
                    onBlur={handleBlur}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Toggle fullscreen"
                    accessibilityHint="Press to toggle fullscreen mode"
                    nextFocusUp={forwardRef.current}
                    nextFocusLeft={volumeRef.current}
                  >
                    <Image source={imagepath.maximizeIcon} style={styles.controlIcon}/>
                    {focused === 'fullscreen' && <View style={styles.focusIndicator} />}
                  </Pressable> */}
                
              {/* Progress Bar */}
              <View style={styles.progressBarWrapper}>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { width: `${getProgressPercentage()}%` }
                      ]} 
                    />
                  </View>
                </View>
              </View>

              {/* Bottom Control Row */}
              <View style={styles.bottomControlRow}>
                {/* Time Indicators */}
                <View style={styles.timeIndicators}>
                  <Text style={styles.currentTime}>
                    {formatTime(currentTime)}
                    {pendingSeekTime !== null && (
                      <Text style={styles.seekingIndicator}> (seeking)</Text>
                    )}
                    {' /'}
                  </Text>
                  <View style={styles.remainingTimeContainer}>
                    <Text style={styles.remainingTimePrefix}>
                      {/* {duration > 0 ? '-' : ''} */}
                    </Text>
                    <Text style={styles.remainingTime}>
                      {/* {duration > 0 ? formatTime(getRemainingTime()) : formatTime(currentTime)}
                       */}
                       {formatTime(duration)}
                    </Text>
                  </View>
                </View>

               
              </View>
            </TVFocusGuideView>
          </View>
          {/* Center Controls */}
          <TVFocusGuideView style={styles.centerControlsGuide} autoFocus>
            <View style={styles.centerControls}>
              {/* previous button */}
              {currentSeriesEpisodes.length > 1 && 
              <Pressable 
                ref={previousRef}
                style={[
                  styles.centerButton,
                  focused === 'previous' && styles.focusedButton
                ]}
                onPress={()=>handlePreviousEpisode()}
                onFocus={() => handleFocus('previous')}
                onBlur={handleBlur}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Previous"
                accessibilityHint="Press to go to previous video"
                hasTVPreferredFocus={false}
                nextFocusRight={playPauseRef.current}
                nextFocusDown={volumeRef.current}
              >
                <Image source={imagepath.previous} 
                style={{...styles.controlIcon, height: moderateScale(23), width: moderateScale(23),
                  ...(currentEpisodeIndex === 0 && {opacity: 0.5})
                }}/>
                {focused === 'previous' && <View style={styles.focusIndicator} />}
              </Pressable>
              }
              <Pressable 
                ref={rewindRef}
                style={[
                  styles.centerButton,
                  focused === 'rewind' && styles.focusedButton
                ]}
                onPress={() => seekTo(-10)}
                onFocus={() => handleFocus('rewind')}
                onBlur={handleBlur}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Rewind 10 seconds"
                accessibilityHint="Press to go back 10 seconds"
                hasTVPreferredFocus={false}
                nextFocusRight={playPauseRef.current}
                nextFocusDown={volumeRef.current}
              >
                <Image source={imagepath.rewind_button} style={styles.controlIcon}/>
                {focused === 'rewind' && <View style={styles.focusIndicator} />}
              </Pressable>

              <Pressable 
                ref={playPauseRef}
                style={[
                  styles.centerButton, 
                  styles.playPauseButton,
                  focused === 'playPause' && styles.focusedButton
                ]}
                onPress={togglePlayPause}
                onFocus={() => handleFocus('playPause')}
                onBlur={handleBlur}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={paused ? "Play video" : "Pause video"}
                accessibilityHint={paused ? "Press to play" : "Press to pause"}
                hasTVPreferredFocus={initialFocus}
                nextFocusLeft={rewindRef.current}
                nextFocusRight={forwardRef.current}
                nextFocusDown={volumeRef.current}
              >
                <Image 
                  source={paused ? imagepath.playbuttonarrowhead : imagepath.pauseIcon} 
                  style={styles.playPauseIcon}
                />
                {focused === 'playPause' && <View style={styles.focusIndicator} />}
              </Pressable>

              <Pressable 
                ref={forwardRef}
                style={[
                  styles.centerButton,
                  focused === 'forward' && styles.focusedButton
                ]}
                onPress={() => seekTo(10)}
                onFocus={() => handleFocus('forward')}
                onBlur={handleBlur}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Forward 10 seconds"
                accessibilityHint="Press to go forward 10 seconds"
                nextFocusLeft={playPauseRef.current}
                nextFocusDown={fullscreenRef.current}
              >
                <Image source={imagepath.fast_forward} style={styles.controlIcon}/>
                {focused === 'forward' && <View style={styles.focusIndicator} />}
              </Pressable>

              {/* next button */}
              {currentSeriesEpisodes.length > 1 && 
              <Pressable 
                ref={nextRef}
                style={[
                  styles.centerButton,
                  focused === 'next' && styles.focusedButton,
                ]}
                onPress={()=>handleNextEpisode()}
                onFocus={() => handleFocus('next')}
                onBlur={handleBlur}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Next"
                accessibilityHint="Press to go to next video"
                nextFocusLeft={forwardRef.current}
                nextFocusDown={fullscreenRef.current}
              >
                <Image source={imagepath.next} 
                style={{
                  ...styles.controlIcon,
                  height: moderateScale(23),
                  width: moderateScale(23),
                  ...(currentEpisodeIndex === currentSeriesEpisodes.length - 1 && {opacity: 0.5})
                  }}/>
                {focused === 'next' && <View style={styles.focusIndicator} />}
              </Pressable>
              }

              {/* watch from start button */}
              <View style={styles.watchFromStartContainer}>
              <Pressable 
                ref={watchFromStartRef}
                style={[
                  styles.centerButton,
                  focused === 'watchFromStart' && styles.focusedButton
                ]}
                onPress={() => {
                  // Directly seek to beginning using video ref
                  if (videoRef.current) {
                    videoRef.current.seek(0);
                  }
                  setCurrentTime(0);
                  setPendingSeekTime(null);
                  
                  // Show controls and reset timeout
                  setShowControls(true);
                  resetControlsTimeout();
                }}
                onFocus={() => handleFocus('watchFromStart')}
                onBlur={handleBlur}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Watch from start"
                accessibilityHint="Press to watch from start"
                nextFocusLeft={nextRef.current}
                nextFocusDown={fullscreenRef.current}
              >
                <Image source={imagepath.reload} style={{...styles.controlIcon, height: moderateScale(25), width: moderateScale(25)}}/>
                {focused === 'watchFromStart' && <View style={styles.focusIndicator} />}
              </Pressable>
              {focused === 'watchFromStart' &&
              <Text style={styles.watchFromStartText}>Watch from start</Text>
              }
              </View>
            </View>
          </TVFocusGuideView>
        </View>
      )}

      {/* Progress Bar Only Overlay for Seeking */}
      {showProgressOnly && !showControls && (
        <View style={styles.progressOnlyOverlay}>
          <View style={styles.progressOnlyContainer}>
            <View style={[
              styles.progressBarWrapper,
              focused === 'progressBar' && styles.focusedProgressWrapper
            ]}>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${getProgressPercentage()}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>
            
            {/* Time Indicators for Progress Only */}
            <View style={styles.progressTimeIndicators}>
              <Text style={styles.progressCurrentTime}>
                {formatTime(currentTime)}
                {pendingSeekTime !== null && (
                  <Text style={styles.seekingIndicator}> (seeking)</Text>
                )}
              </Text>
              <View style={styles.progressRemainingTimeContainer}>
                <Text style={styles.progressRemainingTimePrefix}>
                  {duration > 0 ? '-' : ''}
                </Text>
                <Text style={styles.progressRemainingTime}>
                  {duration > 0 ? formatTime(getRemainingTime()) : formatTime(currentTime)}
                  {/* {formatTime(getRemainingTime())} */}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Loading Overlay */}
      {loading && (
       //loader
       <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#FFFFFF" />
       </View>
      )}

      {/* Error Overlay */}
      {error && (
        <View style={styles.overlay}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable 
            style={[
              styles.retryButton,
              focused === 'retry' && styles.focusedButton
            ]}
            onPress={retryStream}
            onFocus={() => handleFocus('retry')}
            onBlur={handleBlur}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Retry loading stream"
            accessibilityHint="Press to retry loading the video stream"
            hasTVPreferredFocus={true}
          >
            <Text style={styles.retryButtonText}> Retry</Text>
            {focused === 'retry' && <View style={styles.focusIndicator} />}
          </Pressable>
        </View>
      )}

      {/* Exit Instructions */}
      {/* {showControls && !loading && !error && Platform.isTV && (
        <View style={styles.exitInstructions}>
          <Text style={styles.exitText}>
            ← → to seek • MENU/BACK to hide • Press twice to exit
          </Text>
        </View>
      )} */}

      {/* Custom Notification Overlay */}
      {notification.visible && (
        <View style={styles.notificationOverlay}>
          <View style={styles.notificationContainer}>
            <Text style={styles.notificationText}>{notification.message}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0F14',
  },
  videoContainer: {
    flex: 1,
  },
  video: {
    flex: 1,
  },
  controlsOverlay: {
    position: 'absolute',
    height: moderateScale(165),
    width:'100%',
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  centerControlsGuide: {
    position: 'absolute',
    bottom:0,
    left: 0,
    right: 0,
    marginBottom:moderateScale(25),
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(150),
    gap: moderateScale(20)
  },
  centerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(50),
    // backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: moderateScale(25),
    width: moderateScale(40),
    height: moderateScale(40),
  },
  playPauseButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    // backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  focusedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    // transform: [{ scale: 1.1 }],
  },
  focusIndicator: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    // borderWidth: moderateScale(1),
    // borderColor: '#FFDF28',
    // borderColor:'#FFFFFF',
    borderRadius: moderateScale(50),
  },
  watchFromStartContainer: {
    position: 'absolute',
    bottom: 0,
    right: moderateScale(0),
    width: moderateScale(125),
  },
  watchFromStartText: {
    position: 'absolute',
    bottom: moderateScale(-20),
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(20),
    color: '#FFFFFF',
    textAlign: 'left',
    right: moderateScale(50),
  },
  controlIcon: {
    width: moderateScale(23),
    height: moderateScale(23),
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  controlIconBottom: {
    width: moderateScale(32),
    height: moderateScale(32),
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  playPauseIcon: {
    width: moderateScale(25),
    height: moderateScale(25),
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  movieName:{
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(35),
    color: '#FFFFFF',
    textAlign: 'left',
    marginLeft: moderateScale(35),
    marginTop: moderateScale(10),
  },
  bottomControls: {
  },
  bottomControlsGuide: {
    paddingHorizontal: moderateScale(40),
    paddingVertical: moderateScale(25),
  },
  progressBarWrapper: {
    marginBottom: moderateScale(15),
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarBackground: {
    height: moderateScale(5),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  bottomControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    width: '100%',
  },
  currentTime: {
    fontFamily: FontFamily.PublicSans_Light,
    fontSize: scale(45),
    color: '#FFFFFF',
  },
  remainingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  remainingTimePrefix: {
    fontFamily: 'PublicSans-Regular',
    fontSize: 14,
    color: '#FFFFFF',
  },
  remainingTime: {
    fontFamily: FontFamily.PublicSans_Light,
    fontSize: scale(45),
    color: '#FFFFFF',
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: moderateScale(20),
    justifyContent: 'flex-end',
    marginBottom: moderateScale(15),

  },
  bottomButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(13),
    paddingHorizontal: moderateScale(13),
    borderRadius: moderateScale(50),
    width: moderateScale(50),
    height: moderateScale(50),
  },
  controlIconText: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'PublicSans-SemiBold',
    marginBottom: 10,
  },
  overlaySubText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'PublicSans-Regular',
    opacity: 0.7,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'PublicSans-Regular',
    lineHeight: 32,
    paddingHorizontal: 40,
  },
  retryButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    // paddingHorizontal: 40,
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(25),
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: scale(32),
    fontFamily: FontFamily.PublicSans_SemiBold,
  },
  exitInstructions: {
    position: 'absolute',
    top: 40,
    right: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  exitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PublicSans-Regular',
    opacity: 0.8,
  },
  // Progress bar only overlay styles
  progressOnlyOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 20,
  },
  progressOnlyContainer: {
    paddingHorizontal: 40,
  },
  focusedProgressWrapper: {
    borderWidth: moderateScale(1),
    borderColor: '#FFFFFF',
    borderRadius: moderateScale(50),
    padding: moderateScale(4),
  },
  progressTimeIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginTop: 12,
  },
  progressCurrentTime: {
    fontFamily: FontFamily.PublicSans_Light,
    fontSize: scale(45),
    color: '#FFFFFF',
  },
  progressRemainingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  progressRemainingTimePrefix: {
    fontFamily: FontFamily.PublicSans_Light,
    fontSize: scale(45),
    color: '#FFFFFF',
  },
  progressRemainingTime: {
    fontFamily: FontFamily.PublicSans_Light,
    fontSize: scale(45),
    color: '#FFFFFF',
  },
  seekingIndicator: {
      fontFamily: FontFamily.PublicSans_Light,
      fontSize: scale(14),
      color: '#FFFFFF',
      opacity: 0.8,
  },
  // Custom Notification Overlay Styles
  notificationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000, // Ensure it's on top
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(20),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  notificationIconContainer: {
    marginRight: moderateScale(10),
  },
  notificationIcon: {
    width: moderateScale(25),
    height: moderateScale(25),
    tintColor: '#FFFFFF',
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: scale(20),
    fontFamily: FontFamily.PublicSans_Regular,
    flexShrink: 1,
  },
});

export default LiveVideoComp;