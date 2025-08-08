// 1. React Native core imports
import React, { useEffect, useRef, useState } from 'react'
import { Animated, Image, Text, TouchableOpacity, View } from 'react-native'

// 2. Global styles and utilities
import CommonStyles from '../../../../styles/CommonStyles'

// 3. Component imports
import { NavigationProp, RouteProp, useNavigation } from '@react-navigation/native'
import WrapperContainer from '../../../../components/WrapperContainer'
import imagepath from '../../../../constants/imagepath'
import { AuthStackParamList } from '../../../../navigation/NavigationsTypes'

// 4. Local styles import (ALWAYS LAST)
import { getCategoryApi, LoginApi, setAuthTokenAction, setIsPlaylistProcessedAction } from '../../../../redux/actions/auth'
import { styles } from './styles'
import Toast from 'react-native-toast-message'

const PlaylistProcessed = ({ route }: { route: RouteProp<AuthStackParamList, 'PlaylistProcessed'> }) => {
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>()
  const { type, playlistUrl } = route.params
  // Focus state for buttons
  const [focused, setFocused] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ channels: 0, movies: 0, series: 0 })
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [resumeAttempt, setResumeAttempt] = useState(0)
  const [isResuming, setIsResuming] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [authToken, setAuthToken] = useState('')
  const maxRetries = 3
  
  // Animation value for loading text
  const fadeAnim = useRef(new Animated.Value(1)).current

  const handleNext = async () => {
   await setIsPlaylistProcessedAction(true)
  }

  const handleCancel = () => {
    navigation.goBack()
  }

  const handleRetry = () => {
    setErrorMessage(null)
    setRetryCount(0)
    setLoading(true)
  }

  const handleDoneFocus = () => {
    setFocused('done')
  }

  const handleBackFocus = () => {
    setFocused('back')
  }

  const handleBlur = () => {
    setFocused(null)
  }

  const login = async () => {
    try {
      let res = await LoginApi(playlistUrl)
      // let res = await LoginApi("http://line.cloud-ott.net/get.php?username=GKBELS&password=JT93E4&type=m3u_plus&output=ts")
      console.log('login response:', res)
      
      await setAuthTokenAction(res?.data?.token)

      

      res =await getCategoryApi('live')

      console.log('getCategoryApi response:', res)
      
      setStats(prev => ({
        ...prev,
        channels: res?.data?.data?.totalChannels
      }))
      res = await getCategoryApi('movies')
      setStats(prev => ({
        ...prev,
        movies: res?.data?.data?.totalMovies
      }))
      res = await getCategoryApi('series')
      setStats(prev => ({
        ...prev,
        series: res?.data?.data?.totalSeries
      }))
      console.log('getCategoryData response:', res)
      setLoading(false)

    } catch (error: any) {
      console.log('Login error details:',error)

      if(error?.response?.data?.error){
        Toast.show({
          text1: error?.response?.data?.error,
          type: 'error',
        })
        setLoading(false)
        navigation.goBack()
        return
      }
     
      let res = await getCategoryApi('live')
      setStats(prev => ({
        ...prev,
        channels: res?.data?.data?.totalChannels
      }))
      res = await getCategoryApi('movies')
      setStats(prev => ({
        ...prev,
        movies: res?.data?.data?.totalMovies
      }))
      res = await getCategoryApi('series')
      setStats(prev => ({
        ...prev,
        series: res?.data?.data?.totalSeries
      }))
     
      setLoading(false)
    }
  }
  
  useEffect(() => {
    login()
    
  }, [])

  // Animation effect for loading text
  useEffect(() => {
    if (loading) {
      const startAnimation = () => {
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (loading) {
            startAnimation()
          }
        })
      }
      startAnimation()
    }
  }, [loading, fadeAnim])

  return (
    <WrapperContainer containerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.LeftContainer}>
          <View style={styles.iconContainer}>
            <Image source={imagepath.downloadIconWhite} style={styles.iconPlaceholder}/>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={CommonStyles.Heading}>Playlist is</Text>
            <Text style={CommonStyles.Heading}>{loading ? 'Processing...' : 'processed'}</Text>
          </View>
      </View>

      {/* Main Content Section */}
      <View style={styles.contentContainer}>
        <View style={styles.formContainer}>
          {loading ? (
            <>
              <Animated.Text style={[styles.formTitle, { opacity: fadeAnim }]}>
                {isResuming ? `Resuming download (Attempt ${resumeAttempt})...` : 
                 retryCount > 0 ? `Retrying... (${retryCount}/${maxRetries})` : 'Please wait...'}
              </Animated.Text>
              {downloadProgress > 0 && (
                <Text style={styles.formSubTitle}>
                  {isResuming ? 'Resuming' : 'Download'}: {downloadProgress}%
                </Text>
              )}
            </>
          ) : errorMessage ? (
            <>
              <Text style={[styles.formTitle, { color: '#ff6b6b' }]}>
                Download Failed
              </Text>
              <Text style={[styles.formSubTitle, { color: '#ff6b6b', marginBottom: 20 }]}>
                {errorMessage}
              </Text>
              <TouchableOpacity 
                onPress={handleRetry}
                style={{
                  backgroundColor: '#007AFF',
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginBottom: 10
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                  Retry Download
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.formTitle}>Playlist is processed</Text>
          )}
          
          <Text style={styles.formSubTitle}>Channels: {stats.channels.toLocaleString()}</Text>
          <Text style={styles.formSubTitle}>Movies: {stats.movies.toLocaleString()}</Text>
          <Text style={styles.formSubTitle}>Shows: {stats.series.toLocaleString()}</Text>

          
        </View>

        <View style={styles.rightContainer}>
        {/* Separator Line */}
        <View style={styles.separator} />

        {/* Bottom Buttons */}
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity 
            onPress={handleNext}
            activeOpacity={1}
            onFocus={!loading ? handleDoneFocus : undefined}
            onBlur={handleBlur}
            hasTVPreferredFocus={true}
            // disabled={loading}
          >
            <Text style={[
              styles.nextButtonText,
              focused === 'done' && styles.nextButtonTextFocused
            ]}>Done</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleCancel}
            activeOpacity={1}
            onFocus={handleBackFocus}
            onBlur={handleBlur}
          >
            <Text style={[
              styles.cancelButtonText,
              focused === 'back' && styles.cancelButtonTextFocused
            ]}>Back</Text>
          </TouchableOpacity>
        </View>
        </View>
      </View>
    </WrapperContainer>
  )
}

export default PlaylistProcessed 