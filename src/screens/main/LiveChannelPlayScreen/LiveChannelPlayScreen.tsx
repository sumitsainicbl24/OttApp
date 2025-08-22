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
  Alert,
  Pressable
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
    console.log('TV Event:', evt?.eventType, 'Current focus:', focused)
    
    if (evt && evt.eventType === 'select') {
      resetControlsTimer()
    } else if (evt && evt.eventType === 'up') {
      resetControlsTimer()
    } else if (evt && evt.eventType === 'down') {
      resetControlsTimer()
    } else if (evt && evt.eventType === 'left') {
      resetControlsTimer()
      // Navigate to previous button
      if (focused === 'history') setFocused('tvGuide')
      else if (focused === 'welcome') setFocused('history')
      else if (focused === 'clear') setFocused('welcome')
      else if (focused === 'tvGuide') setFocused('clear')
    } else if (evt && evt.eventType === 'right') {
      resetControlsTimer()
      // Navigate to next button
      if (focused === 'tvGuide') setFocused('history')
      else if (focused === 'history') setFocused('welcome')
      else if (focused === 'clear') setFocused('tvGuide')
      else if (focused === 'welcome') setFocused('clear')
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
    // Set initial focus to WELCOME button
    setFocused('welcome')
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
    videoRef?.current?.resume()
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

  // Retry function for reloading the stream
  const handleReload = () => {
    setLoading(true)
    setError(null)
    setNetworkError(false)
    // Force reload by updating a key
    videoRef.current?.seek(0)
  }

  // Focus handlers
  const handleFocus = (buttonName: string) => {
    console.log('Focus changed to:', buttonName)
    setFocused(buttonName)
    resetControlsTimer()
  }

  const handleBlur = () => {
    console.log('Focus blurred')
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

        {/* Bottom navigation buttons */}
        <View style={styles.bottomNavigationBar}>
          {/* TV Guide button */}
          <Pressable
            style={[styles.navButton, focused === 'tvGuide' && styles.navButtonFocused]}
            onPress={() => {}}
            onFocus={() => handleFocus('tvGuide')}
            onBlur={handleBlur}
            hasTVPreferredFocus={false}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="TV Guide"
            accessibilityHint="Navigate to TV Guide"
          >
            <View style={styles.navButtonIcon}>
              <View style={styles.tvGuideIcon}>
                <View style={styles.tvGuideLine} />
                <View style={styles.tvGuideLine} />
                <View style={styles.tvGuideLine} />
                <View style={styles.tvGuideDots}>
                  <View style={styles.tvGuideDot} />
                  <View style={styles.tvGuideDot} />
                  <View style={styles.tvGuideDot} />
                </View>
              </View>
            </View>
            <Text style={styles.navButtonText}>TV guide</Text>
          </Pressable>

          {/* History button */}
          <Pressable
            style={[styles.navButton, focused === 'history' && styles.navButtonFocused]}
            onPress={() => {}}
            onFocus={() => handleFocus('history')}
            onBlur={handleBlur}
            hasTVPreferredFocus={false}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="History"
            accessibilityHint="View viewing history"
          >
            <View style={styles.navButtonIcon}>
              <Image source={imagepath.reload} style={styles.navButtonImage} />
            </View>
            <Text style={styles.navButtonText}>History</Text>
          </Pressable>

          {/* Welcome button */}
          <Pressable
            style={[styles.navButton, focused === 'welcome' && styles.navButtonFocused]}
            onPress={() => {}}
            onFocus={() => handleFocus('welcome')}
            onBlur={handleBlur}
            // hasTVPreferredFocus={true}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Welcome"
            accessibilityHint="Welcome screen"
          >
            <View style={styles.navButtonIcon}>
              <View style={styles.welcomeIcon}>
                <View style={styles.welcomeDot} />
                <View style={styles.welcomeDot} />
                <View style={styles.welcomeDot} />
                <View style={styles.welcomeDot} />
              </View>
            </View>
            <Text style={styles.navButtonText}>WELCOME</Text>
            {/* <Text style={styles.navButtonSubtext}>No information</Text> */}
          </Pressable>

          {/* Clear button */}
          <Pressable
            style={[styles.navButton, focused === 'clear' && styles.navButtonFocused]}
            onPress={() => {}}
            onFocus={() => handleFocus('clear')}
            onBlur={handleBlur}
            hasTVPreferredFocus={false}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Clear"
            accessibilityHint="Clear current selection"
          >
            <View style={styles.navButtonIcon}>
              <Image source={imagepath.remove} style={styles.navButtonImage} />
            </View>
            <Text style={styles.navButtonText}>Clear</Text>
          </Pressable>
        </View>

        {/* Down arrow indicator */}
        <View style={styles.downArrowContainer}>
          <View style={styles.downArrow} />
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
            volume={volume}
            muted={muted}
            resizeMode="contain"
            onLoad={handleLoad}
            onError={handleError}
            onProgress={handleProgress}
            playInBackground={false}
            paused={false}
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
