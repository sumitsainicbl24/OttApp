import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Text,
  useTVEventHandler,
  TVFocusGuideView,
} from 'react-native';
import Video, {VideoRef} from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import {useSelector} from 'react-redux';
import {moderateScale, verticalScale, scale} from '../../styles/scaling';
import {CommonColors} from '../../styles/Colors';
import {RootState} from '../../redux/store';
import VideoInfoBadges from './VideoInfoBadges';
import ProgressBar from './ProgressBar';
import PlaybackControls from './PlaybackControls';
import SettingsButton from './SettingsButton';
import EpisodeButton from './EpisodeButton';
import TitleDisplay from './TitleDisplay';
import TimeDisplay from './TimeDisplay';
import SettingsModal from './SettingsModal';
import EpisodeModal from './EpisodeModal';

interface MoviePlayerProps {
  streamUrl: string;
  title?: string;
  resolution?: string;
  audio?: string;
  fps?: string;
  onExit?: () => void;
  onSettingsPress?: () => void;
  onEpisodeSelect?: (episode: any) => void;
  initialTime?: number;
  hideControls?: boolean;
}

const MoviePlayer: React.FC<MoviePlayerProps> = ({
  streamUrl,
  title = '[ALL] Spider-Man: No Way Home (2021)',
  resolution = '4096 x 2160',
  audio = '5.1',
  fps = '25 fps',
  onExit,
  onSettingsPress,
  onEpisodeSelect,
  initialTime = 0,
  hideControls = false,
}) => {
  const videoRef = useRef<VideoRef>(null);

  // Get series episodes from Redux
  const {currentSeriesEpisodes} = useSelector(
    (state: RootState) => state.rootReducer.main,
  );

  const isSeries = currentSeriesEpisodes && currentSeriesEpisodes.length > 1;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [focusedControl, setFocusedControl] = useState<string | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const forwardIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const rewindIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isForwardLongPressing, setIsForwardLongPressing] = useState(false);
  const [isRewindLongPressing, setIsRewindLongPressing] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);

  // Refs for TV navigation
  const rewindRef = useRef<any>(null);
  const playPauseRef = useRef<any>(null);
  const forwardRef = useRef<any>(null);
  const episodeRef = useRef<any>(null);
  const settingsRef = useRef<any>(null);

  // Control order for navigation - include episode if it's a series
  const controlOrder = isSeries
    ? ['rewind', 'playPause', 'forward', 'episode', 'settings']
    : ['rewind', 'playPause', 'forward', 'settings'];

  useEffect(() => {
    if (initialTime > 0 && videoRef.current) {
      videoRef.current.seek(initialTime);
    }
  }, [initialTime]);

  useEffect(() => {
    if (showControls && !hideControls) {
      // Don't start timer if settings modal or episode modal is open
      if (!showSettingsModal && !showEpisodeModal) {
        resetControlsTimer();
      }
      // Set initial focus to first control when controls are shown
      if (!focusedControl && controlOrder.length > 0) {
        const firstControl = controlOrder[0];
        setFocusedControl(firstControl);
        setTimeout(() => focusControl(firstControl), 200);
      }
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (forwardIntervalRef.current) {
        clearInterval(forwardIntervalRef.current);
        forwardIntervalRef.current = null;
      }
      if (rewindIntervalRef.current) {
        clearInterval(rewindIntervalRef.current);
        rewindIntervalRef.current = null;
      }
    };
  }, [
    showControls,
    hideControls,
    showSettingsModal,
    showEpisodeModal,
    controlOrder,
  ]);

  const resetControlsTimer = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    // Don't set timer if settings modal or episode modal is open
    if (!showSettingsModal && !showEpisodeModal) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 5000);
    }
  };

  const handleScreenPress = () => {
    if (!hideControls) {
      setShowControls(!showControls);
      if (!showControls) {
        resetControlsTimer();
      }
    }
  };

  const handleLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleError = (error: any) => {
    console.error('Video error:', error);
    setLoading(false);
    setError('Failed to load video');
  };

  const handleProgress = (data: any) => {
    setCurrentTime(data.currentTime);
    if (data.seekableDuration > 0) {
      setDuration(data.seekableDuration);
    }
    // Stop long press if we've reached the end
    if (isForwardLongPressing && data.currentTime >= duration && duration > 0) {
      handleForwardLongPressEnd();
    }
    // Stop long press if we've reached the beginning
    if (isRewindLongPressing && data.currentTime <= 0) {
      handleRewindLongPressEnd();
    }
  };

  const handlePlayPause = () => {
    setPaused(!paused);
  };

  const handleRewind = () => {
    if (videoRef.current) {
      const newTime = Math.max(0, currentTime - 10);
      videoRef.current.seek(newTime);
      setCurrentTime(newTime);
    }
  };

  const handleForward = () => {
    if (videoRef.current) {
      const newTime = Math.min(duration, currentTime + 10);
      videoRef.current.seek(newTime);
      setCurrentTime(newTime);
    }
  };

  const handleForwardLongPressStart = () => {
    setIsForwardLongPressing(true);
    // Stop any rewind long press
    if (isRewindLongPressing) {
      handleRewindLongPressEnd();
    }
    // Start continuous forward seeking
    forwardIntervalRef.current = setInterval(() => {
      if (videoRef.current) {
        setCurrentTime(prevTime => {
          const newTime = Math.min(duration, prevTime + 10);
          videoRef.current?.seek(newTime);
          return newTime;
        });
      }
    }, 100); // Seek every 100ms (10x per second)
    resetControlsTimer();
  };

  const handleForwardLongPressEnd = () => {
    setIsForwardLongPressing(false);
    if (forwardIntervalRef.current) {
      clearInterval(forwardIntervalRef.current);
      forwardIntervalRef.current = null;
    }
  };

  const handleRewindLongPressStart = () => {
    setIsRewindLongPressing(true);
    // Stop any forward long press
    if (isForwardLongPressing) {
      handleForwardLongPressEnd();
    }
    // Start continuous rewind seeking
    rewindIntervalRef.current = setInterval(() => {
      if (videoRef.current) {
        setCurrentTime(prevTime => {
          const newTime = Math.max(0, prevTime - 1);
          videoRef.current?.seek(newTime);
          return newTime;
        });
      }
    }, 100); // Seek every 100ms (10x per second)
    resetControlsTimer();
  };

  const handleRewindLongPressEnd = () => {
    setIsRewindLongPressing(false);
    if (rewindIntervalRef.current) {
      clearInterval(rewindIntervalRef.current);
      rewindIntervalRef.current = null;
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.seek(time);
      setCurrentTime(time);
    }
  };

  const handleFocus = (control: string) => {
    setFocusedControl(control);
    // Stop long press if user navigates away from forward/rewind buttons
    if (control !== 'forward' && isForwardLongPressing) {
      handleForwardLongPressEnd();
    }
    if (control !== 'rewind' && isRewindLongPressing) {
      handleRewindLongPressEnd();
    }
  };

  const handleBlur = () => {
    // Stop long press if focus is lost
    if (isForwardLongPressing) {
      handleForwardLongPressEnd();
    }
    if (isRewindLongPressing) {
      handleRewindLongPressEnd();
    }
    setFocusedControl(null);
  };

  // Helper function to focus a control
  const focusControl = (controlId: string) => {
    // Use requestTVFocus for better TV focus handling
    setTimeout(() => {
      switch (controlId) {
        case 'rewind':
          rewindRef.current?.requestTVFocus?.();
          rewindRef.current?.focus?.();
          break;
        case 'playPause':
          playPauseRef.current?.requestTVFocus?.();
          playPauseRef.current?.focus?.();
          break;
        case 'forward':
          forwardRef.current?.requestTVFocus?.();
          forwardRef.current?.focus?.();
          break;
        case 'episode':
          episodeRef.current?.requestTVFocus?.();
          episodeRef.current?.focus?.();
          break;
        case 'settings':
          settingsRef.current?.requestTVFocus?.();
          settingsRef.current?.focus?.();
          break;
        default:
          break;
      }
    }, 50);
  };

  // TV Event Handler
  useTVEventHandler((evt: any) => {
    // Don't handle events when settings modal or episode modal is open
    if (showSettingsModal || showEpisodeModal) {
      return;
    }

    if (!showControls || hideControls || loading || error) {
      // Show controls on any TV event if hidden
      if (evt?.eventType && !showControls) {
        setShowControls(true);
        resetControlsTimer();
        // Focus first control
        if (controlOrder.length > 0) {
          const firstControl = controlOrder[0];
          setFocusedControl(firstControl);
          setTimeout(() => focusControl(firstControl), 100);
        }
      }
      return;
    }

    const eventType = evt?.eventType;

    // Handle play/pause button press
    if (eventType === 'playPause') {
      handlePlayPause();
      resetControlsTimer();
      return;
    }

    // Handle rewind button press
    if (eventType === 'rewind') {
      handleRewind();
      resetControlsTimer();
      return;
    }

    // Handle fast forward button press
    if (eventType === 'fastForward') {
      handleForward();
      resetControlsTimer();
      return;
    }

    // Handle longRight for continuous forward seeking
    if (eventType === 'longRight') {
      if (focusedControl === 'forward' || !focusedControl) {
        handleForwardLongPressStart();
      }
      return;
    }

    // Handle longLeft for continuous rewind seeking
    if (eventType === 'longLeft') {
      if (focusedControl === 'rewind' || !focusedControl) {
        handleRewindLongPressStart();
      }
      return;
    }

    // Handle release of long press (when right/left is released after long press)
    if (eventType === 'right' && isForwardLongPressing) {
      handleForwardLongPressEnd();
      resetControlsTimer();
      return;
    }

    if (eventType === 'left' && isRewindLongPressing) {
      handleRewindLongPressEnd();
      resetControlsTimer();

      return;
    }

    // Let native focus system handle left/right navigation
    // We don't need to manually handle it - nextFocusLeft/nextFocusRight will handle it
    // Just reset the timer when navigation occurs
    if (eventType === 'left' || eventType === 'right') {
      resetControlsTimer();
      return;
    }

    // Handle select button
    if (eventType === 'select') {
      if (focusedControl === 'rewind') {
        handleRewind();
      } else if (focusedControl === 'playPause') {
        handlePlayPause();
      } else if (focusedControl === 'forward') {
        handleForward();
      } else if (focusedControl === 'episode') {
        handleEpisodePress();
      } else if (focusedControl === 'settings') {
        handleSettingsPress();
      }
      resetControlsTimer();
      return;
    }
  });

  const handleEpisodePress = () => {
    // Clear the controls timer when opening episode modal
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
    // Ensure controls stay visible when episode modal opens
    setShowControls(true);
    setShowEpisodeModal(true);
  };

  const handleCloseEpisodeModal = () => {
    setShowEpisodeModal(false);
    // Ensure controls are visible when modal closes
    setShowControls(true);
    // Return focus to episode button after modal closes
    setTimeout(() => {
      if (episodeRef.current) {
        setFocusedControl('episode');
        episodeRef.current?.focus?.();
        episodeRef.current?.requestTVFocus?.();
      }
      // Restart the controls timer after modal closes
      resetControlsTimer();
    }, 100);
  };

  const handleEpisodeSelect = (episode: any) => {
    onEpisodeSelect?.(episode);
    handleCloseEpisodeModal();
  };

  const handleSettingsPress = () => {
    // Clear the controls timer when opening settings modal
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
    // Ensure controls stay visible when settings modal opens
    setShowControls(true);
    setShowSettingsModal(true);
    onSettingsPress?.();
  };

  const handleCloseSettingsModal = () => {
    setShowSettingsModal(false);
    // Ensure controls are visible when modal closes
    setShowControls(true);
    // Return focus to settings button after modal closes
    setTimeout(() => {
      if (settingsRef.current) {
        setFocusedControl('settings');
        settingsRef.current?.focus?.();
        settingsRef.current?.requestTVFocus?.();
      }
      // Restart the controls timer after modal closes
      resetControlsTimer();
    }, 100);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.videoContainer}
        onPress={handleScreenPress}
        activeOpacity={1}>
        <Video
          ref={videoRef}
          source={{
            uri: streamUrl,
            headers: {
              'User-Agent': 'React-Native-TV-Player/1.0.0',
            },
          }}
          style={styles.video}
          resizeMode="cover"
          controls={false}
          paused={paused}
          onLoad={handleLoad}
          onError={handleError}
          onProgress={handleProgress}
          repeat={false}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          bufferConfig={{
            minBufferMs: 15000,
            maxBufferMs: 50000,
            bufferForPlaybackMs: 2500,
            bufferForPlaybackAfterRebufferMs: 5000,
          }}
        />

        {/* Top Gradient Overlay */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.65)', 'rgba(196, 196, 196, 0)']}
          style={styles.topGradient}
        />

        {/* Bottom Gradient Overlay */}
        <LinearGradient
          colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)']}
          style={styles.bottomGradient}
        />

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={CommonColors.white} />
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Controls Overlay */}
        {showControls && !loading && !error && !hideControls && (
          <View style={styles.controlsOverlay}>
            {/* Top Section - Date/Time */}
            <View style={styles.topSection}>
              <View style={styles.topLeft} />
              <View style={styles.topRight}>
                <TimeDisplay />
              </View>
            </View>

            {/* Bottom Section - Controls */}
            <View style={styles.bottomSection}>
              <View style={styles.bottomLeft}>
                <View style={styles.topTitleContainer}>
                  <TitleDisplay title={title} />

                  <VideoInfoBadges
                    resolution={resolution}
                    audio={audio}
                    fps={fps}
                  />
                </View>
                <View style={styles.bottomControlsRow}>
                  <ProgressBar
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={handleSeek}
                  />
                </View>
                <View style={styles.controlsRow}>
                  <TVFocusGuideView style={styles.focusGuide} autoFocus={false}>
                    <View />
                    <PlaybackControls
                      isPlaying={!paused}
                      onPlayPause={handlePlayPause}
                      onRewind={handleRewind}
                      onForward={handleForward}
                      onForwardLongPressStart={handleForwardLongPressStart}
                      onForwardLongPressEnd={handleForwardLongPressEnd}
                      onRewindLongPressStart={handleRewindLongPressStart}
                      onRewindLongPressEnd={handleRewindLongPressEnd}
                      focusedControl={focusedControl}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      rewindRef={rewindRef}
                      playPauseRef={playPauseRef}
                      forwardRef={forwardRef}
                      settingsRef={settingsRef}
                    />
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: moderateScale(20),
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      {isSeries && (
                        <EpisodeButton
                          ref={episodeRef}
                          onPress={handleEpisodePress}
                          focused={focusedControl === 'episode'}
                          onFocus={() => handleFocus('episode')}
                          onBlur={handleBlur}
                          nextFocusLeft={forwardRef.current}
                          nextFocusRight={settingsRef.current}
                        />
                      )}
                      <SettingsButton
                        ref={settingsRef}
                        onPress={handleSettingsPress}
                        focused={focusedControl === 'settings'}
                        onFocus={() => handleFocus('settings')}
                        onBlur={handleBlur}
                        nextFocusLeft={
                          isSeries ? episodeRef.current : forwardRef.current
                        }
                      />
                    </View>
                  </TVFocusGuideView>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Settings Modal */}
        <SettingsModal
          visible={showSettingsModal}
          onClose={handleCloseSettingsModal}
        />

        {/* Episode Modal */}
        {isSeries && (
          <EpisodeModal
            visible={showEpisodeModal}
            onClose={handleCloseEpisodeModal}
            episodes={currentSeriesEpisodes}
            currentEpisodeUrl={streamUrl}
            onEpisodeSelect={handleEpisodeSelect}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CommonColors.black,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: moderateScale(78),
    zIndex: 1,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: moderateScale(166),
    zIndex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  errorText: {
    color: CommonColors.white,
    fontSize: moderateScale(18),
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    justifyContent: 'space-between',
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: moderateScale(22),
    paddingHorizontal: moderateScale(59),
  },
  topLeft: {
    flex: 1,
  },
  topRight: {
    alignItems: 'flex-end',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: moderateScale(20),
    paddingHorizontal: moderateScale(59),
  },
  topTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  bottomLeft: {
    flex: 1,
    gap: moderateScale(8),
  },
  bottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(20),
    marginBottom: moderateScale(5),
  },
  bottomControlsRow: {
    width: '100%',
  },
  controlsRow: {
    marginTop: moderateScale(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
  },
  focusGuide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default MoviePlayer;
