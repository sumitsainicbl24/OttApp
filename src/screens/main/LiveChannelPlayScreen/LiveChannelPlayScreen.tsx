// 1. React Native core imports
import React, { useState, useEffect, useRef } from 'react'
import { 
  Text, 
  View, 
  TouchableOpacity, 
  StatusBar, 
  Image, 
  Dimensions, 
  Platform,
  BackHandler,
  useTVEventHandler,
  ActivityIndicator,
  Alert
} from 'react-native'

// 2. Third-party library imports
import Video from 'react-native-video'
import LinearGradient from 'react-native-linear-gradient'

// 3. Navigation imports
import { useNavigation, RouteProp, useRoute, NavigationProp } from '@react-navigation/native'

// 4. Redux imports
import { useAppSelector, useAppDispatch } from '../../../redux/hooks'
import { useSelector } from 'react-redux'
import { RootState } from '../../../redux/store'

// 5. Global styles and utilities
import { CommonColors } from '../../../styles/Colors'
import { moderateScale, verticalScale, scale } from '../../../styles/scaling'
import FontFamily from '../../../constants/FontFamily'
import imagepath from '../../../constants/imagepath'

// 6. Component imports
import MainLayout from '../../../components/MainLayout'
import MarqueeText from '../../../components/MarqueeText'

// 7. Utils and helpers
import { MainStackParamList } from '../../../navigation/NavigationsTypes'

// 8. Local styles import (ALWAYS LAST)
import { styles } from './styles'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

type LiveChannelPlayScreenRouteProp = RouteProp<MainStackParamList, 'LiveChannelPlayScreen'>

const LiveChannelPlayScreen = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>()
  const dispatch = useAppDispatch()
  const route = useRoute<LiveChannelPlayScreenRouteProp>()
  const videoRef = useRef<any>(null)

  const { currentlyPlaying } = useSelector((state: RootState) => state.rootReducer.main)
  const { channel } = route.params

  // State management for live channel
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paused, setPaused] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [focused, setFocused] = useState<string | null>(null)
  const [volume, setVolume] = useState(1.0)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(true)
  const [networkError, setNetworkError] = useState(false)

  // Hide controls timer
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null)

  // Channel information
  const channelName = channel?.name || channel?.title || 'Live Channel'
  const channelLogo = channel?.logo || channel?.image
  const streamUrl = channel?.url || ''

  // Auto-hide controls after 3 seconds of inactivity
  const resetControlsTimer = () => {
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current)
    }
    setShowControls(true)
    hideControlsTimer.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }

  // TV remote event handler
  const myTVEventHandler = (evt: any) => {
    if (evt && evt.eventType === 'select') {
      resetControlsTimer()
    } else if (evt && evt.eventType === 'playPause') {
      handlePlayPause()
    } else if (evt && evt.eventType === 'up') {
      resetControlsTimer()
    } else if (evt && evt.eventType === 'down') {
      resetControlsTimer()
    } else if (evt && evt.eventType === 'left') {
      resetControlsTimer()
    } else if (evt && evt.eventType === 'right') {
      resetControlsTimer()
    }
  }

  useTVEventHandler(myTVEventHandler)

  // Handle back button press
  useEffect(() => {
    const backAction = () => {
      navigation.goBack()
      return true
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)
    return () => backHandler.remove()
  }, [navigation])

  // Initialize controls timer
  useEffect(() => {
    resetControlsTimer()
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current)
      }
    }
  }, [])

  // Video event handlers
  const handleLoad = (data: any) => {
    console.log('Live channel loaded:', data)
    setLoading(false)
    setError(null)
    setNetworkError(false)
  }

  const handleError = (error: any) => {
    console.log('Live channel error:', error)
    setLoading(false)
    setError('Failed to load live channel')
    setNetworkError(true)
  }

  const handleProgress = (data: any) => {
    // For live streams, we don't need to track progress
  }

  const handlePlayPause = () => {
    setPaused(!paused)
    resetControlsTimer()
  }

  const handleRecord = () => {
    setMuted(!muted)
    resetControlsTimer()
  }

  const handleVolumeUp = () => {
    setVolume(Math.min(1.0, volume + 0.1))
    resetControlsTimer()
  }

  const handleVolumeDown = () => {
    setVolume(Math.max(0.0, volume - 0.1))
    resetControlsTimer()
  }

  const handleBack = () => {
    navigation.goBack()
  }

  const handleReload = () => {
    setLoading(true)
    setError(null)
    setNetworkError(false)
    // Force reload by updating a key
    videoRef.current?.seek(0)
  }

  // Focus handlers
  const handleFocus = (buttonName: string) => {
    setFocused(buttonName)
    resetControlsTimer()
  }

  const handleBlur = () => {
    setFocused(null)
  }

  const renderError = () => (
    <View style={styles.errorContainer}>
      <View style={styles.errorContent}>
        <Image source={imagepath.TvIcon} style={styles.errorIcon} />
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorMessage}>
          Unable to load the live channel. Please check your connection and try again.
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, focused === 'retry' && styles.retryButtonFocused]}
          onPress={handleReload}
          onFocus={() => handleFocus('retry')}
          onBlur={handleBlur}
          activeOpacity={1}
        >
          <Image source={imagepath.reload} style={styles.retryIcon} />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={CommonColors.white} />
      <Text style={styles.loadingText}>Loading {channelName}...</Text>
    </View>
  )

  const renderControls = () => {
    if (!showControls || loading || error) return null

    return (
      <LinearGradient
             colors={[CommonColors.themeMain, 
                'rgba(19, 22, 25, 0.95)', 
                'rgba(19, 22, 25, 0.5)',  
                'rgba(19, 22, 25, 0.4)', 
                'rgba(19, 22, 25, 0.3)',  
                'transparent']}
        locations={[0, 0.2, 0.5, 0.8, 0.9, 1]}
       start={{ x: 0, y: 1 }}
       end={{ x: 0, y: 0 }}
        style={styles.controlsOverlay}
      >
        <View>
        {/* Top info section */}
        <View style={styles.topInfoSection}>
          <View style={styles.topLeftInfo}>
            <Image source={imagepath.tv} style={styles.tvLogo} />
            <View style={styles.channelInfoSection}>
              <Text style={styles.noInfoText}>No information</Text>
              <View style={styles.channelDetailsRow}>
                <Text style={styles.channelNumber}>1</Text>
                <Text style={styles.channelDetails}>16K | {channelName}</Text>
                <View style={styles.qualityBadges}>
                  <View style={styles.qualityBadge}>
                    <Text style={styles.qualityText}>4K</Text>
                  </View>
                  <View style={styles.qualityBadge}>
                    <Text style={styles.qualityText}>25 FPS</Text>
                  </View>
                  <View style={styles.qualityBadge}>
                    <Text style={styles.qualityText}>STEREO</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
          </View>
        </View>

        {/* Bottom controls bar */}
        <View style={styles.bottomControlsBar}>
          {/* Previous button */}
          <View
            style={[styles.controlButton, focused === 'previous' && styles.controlButtonFocused]}
          >
            <Image source={imagepath.previous} style={styles.controlButtonIcon} />
          </View>

          {/* Rewind 10s button */}
          <View
            style={[styles.controlButton, focused === 'rewind' && styles.controlButtonFocused]}
          >
            <Image source={imagepath.rewind_button} style={styles.controlButtonIcon} />
          </View>

          {/* Large Play/Pause button */}
          <TouchableOpacity
            style={[styles.largePlayButton, focused === 'playPause' && styles.largePlayButtonFocused]}
            onPress={handlePlayPause}
            onFocus={() => handleFocus('playPause')}
            onBlur={handleBlur}
            activeOpacity={1}
            hasTVPreferredFocus={true}
          >
            <Image
              source={paused ? imagepath.playbuttonarrowhead : imagepath.pauseIcon}
              style={{...styles.largePlayIcon, tintColor: focused === 'playPause' ? CommonColors.black : CommonColors.white}}
            />
          </TouchableOpacity>

          {/* Fast forward 10s button */}
          <View
            style={[styles.controlButton, focused === 'fastforward' && styles.controlButtonFocused]}
          >
            <Image source={imagepath.fast_forward} style={styles.controlButtonIcon} />
          </View>

          {/* Next button */}
          <View
            style={[styles.controlButton, focused === 'next' && styles.controlButtonFocused]}
          >
            <Image source={imagepath.next} style={styles.controlButtonIcon} />
          </View>

        <View
        style={{
            flexDirection:'row',
            alignItems:'center',
            gap:moderateScale(10),
            marginRight:moderateScale(10),
            marginBottom:moderateScale(10),
            position:'absolute',
            right:moderateScale(45),
            bottom:moderateScale(25),
        }}
        >
          {/* Live indicator */}
          <View style={styles.liveIndicatorContainer}>
            <Text style={styles.liveIndicatorText}>LIVE</Text>
          </View>

          {/* Volume/Settings button */}
          <TouchableOpacity
            style={[styles.controlButton, focused === 'record' && styles.controlButtonFocused]}
            onPress={handleRecord}
            onFocus={() => handleFocus('record')}
            onBlur={handleBlur}
            activeOpacity={1}
          >
            <Image
              source={imagepath.record_button}
              style={styles.controlButtonIcon}
            />
          </TouchableOpacity>
          {
            focused === 'record' && (
              <View style={{
                paddingHorizontal:moderateScale(10),
                paddingVertical:verticalScale(5),
                borderRadius:moderateScale(10),
                position:'absolute',
                right:moderateScale(-10),
                bottom:moderateScale(-25),
              }}>
                <Text style={{
                  color:CommonColors.white,
                  fontSize:moderateScale(12),
                  fontFamily:FontFamily.PublicSans_Medium,
                }}>Record</Text>
              </View>
            )
          }


          </View>
        </View>
        </View>
      </LinearGradient>
    )
  }

  return (
    <MainLayout activeScreen="LiveChannelPlayScreen" hideSidebar={true}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      
      <View style={styles.container}>
        {/* Video Player */}
        {!error && (
          <Video
            ref={videoRef}
            source={{ uri: streamUrl }}
            style={styles.videoPlayer}
            paused={paused}
            volume={volume}
            muted={muted}
            resizeMode="contain"
            onLoad={handleLoad}
            onError={handleError}
            onProgress={handleProgress}
            playInBackground={false}
            playWhenInactive={false}
          />
        )}

        {/* Loading overlay */}
        {loading && renderLoading()}

        {/* Error overlay */}
        {error && renderError()}

        {/* Controls overlay */}
        {renderControls()}

        {/* Touch overlay for showing controls */}
        <TouchableOpacity
          style={styles.touchOverlay}
          onPress={resetControlsTimer}
          activeOpacity={1}
        />
      </View>
    </MainLayout>
  )
}

export default LiveChannelPlayScreen
