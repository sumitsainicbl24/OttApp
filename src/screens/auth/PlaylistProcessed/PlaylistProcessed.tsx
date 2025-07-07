// 1. React Native core imports
import React, { useEffect, useRef, useState } from 'react'
import { Animated, Image, Text, TouchableOpacity, View } from 'react-native'

// 2. Global styles and utilities
import CommonStyles from '../../../styles/CommonStyles'

// 3. Component imports
import { NavigationProp, RouteProp, useNavigation } from '@react-navigation/native'
import WrapperContainer from '../../../components/WrapperContainer'
import imagepath from '../../../constants/imagepath'
import { AuthStackParamList } from '../../../navigation/NavigationsTypes'

// 4. Local styles import (ALWAYS LAST)
import RNFS from 'react-native-fs'
import { getCategoryApi, LoginApi, setAuthTokenAction, setIsPlaylistProcessedAction } from '../../../redux/actions/auth'
import { checkResumeAvailable, generateResumeKey, M3UStreamParser } from '../../../utils/m3uParseAndGet'
import { styles } from './styles'

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
    downloadAndParseM3U()
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

  const downloadAndParseM3U = async (currentRetry: number = 0) => {
    let parser: M3UStreamParser | null = null;
    let resumeKey = generateResumeKey(playlistUrl);
    
    try {
      const url = playlistUrl;
      const baseDir = RNFS.DocumentDirectoryPath;
      console.log(`Starting streaming fetch and parse... (Attempt ${currentRetry + 1})`);
      
      // Check if we can resume a previous download
      const existingResumeState = await checkResumeAvailable(resumeKey);
      let startByte = 0;
      
      if (existingResumeState && existingResumeState.url === url) {
        console.log('Found resumable download:', existingResumeState);
        startByte = existingResumeState.bytesDownloaded;
        setIsResuming(true);
        setResumeAttempt(prev => prev + 1);
      }
      
      // Create streaming parser with stats callback
      parser = new M3UStreamParser(baseDir, (newStats) => {
        setStats(newStats);
      }, resumeKey);

      // Load previous state if resuming
      if (existingResumeState) {
        await parser.loadResumeState();
      }

      // Use streaming fetch with resume capability
      await streamFetchAndParseWithResume(url, parser, startByte, (progress, downloaded, total) => {
        setDownloadProgress(progress);
        // Save resume state periodically
        parser?.saveResumeState(url, downloaded, total);
      });

      // Finalize parsing
      const finalStats = await parser.finalize();
      setStats(finalStats);
      
      console.log('✅ Processing completed');
      console.log('Final stats:', finalStats);
      
    } catch (err) {
      console.error('Streaming fetch/parse error:', err);
      
      if (parser) {
        // Save current state for potential resume
        await parser.saveResumeState(playlistUrl, parser.getResumePosition(), parser.getTotalBytesExpected());
      }
      
      if (err instanceof Error) {
        if (err.message.includes('Network error') || err.message.includes('timeout')) {
          console.log('Network error detected. Resume data saved for later.');
          
          // Automatic retry with exponential backoff
          if (currentRetry < maxRetries) {
            const delay = Math.pow(2, currentRetry) * 1000; // 1s, 2s, 4s
            console.log(`Retrying in ${delay}ms... (${currentRetry + 1}/${maxRetries})`);
            setRetryCount(currentRetry + 1);
            
            setTimeout(() => {
              downloadAndParseM3U(currentRetry + 1);
            }, delay);
            return; // Don't set loading to false yet
          } else {
            setErrorMessage('Failed to download playlist after multiple attempts. You can try again later.');
          }
        } else {
          setErrorMessage(err.message);
        }
      }
    } finally {
      // Clean up parser
      if (parser) {
        parser.cleanup();
      }
      
      setLoading(false);
      setIsResuming(false);
    }
  };

  const streamFetchAndParseWithResume = (
    url: string, 
    parser: M3UStreamParser, 
    startByte: number = 0,
    onProgress: (progress: number, downloaded: number, total: number) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open('GET', url, true);
      xhr.timeout = 120000; // 2 minute timeout
      
      // Set Range header for resume
      if (startByte > 0) {
        xhr.setRequestHeader('Range', `bytes=${startByte}-`);
        console.log(`Resuming download from byte ${startByte}`);
      }
      
      let receivedBytes = startByte;
      let totalBytes = startByte;
      let lastProcessedLength = 0;
      let lastResumeStateSave = 0;
      
      xhr.onloadstart = () => {
        if (startByte > 0) {
          console.log(`Resuming streaming fetch from byte ${startByte}...`);
        } else {
          console.log('Starting streaming fetch...');
        }
      };
      
      xhr.onprogress = async (event) => {
        try {
          // Handle both full download and partial content (resume)
          const contentLength = startByte > 0 
            ? parseInt(xhr.getResponseHeader('Content-Range')?.split('/')[1] || '0') 
            : event.total;
          
          totalBytes = contentLength || event.total;
          receivedBytes = startByte + event.loaded;
          
          parser.updateDownloadProgress(receivedBytes, totalBytes);
          
          if (totalBytes > 0) {
            const progress = Math.round((receivedBytes / totalBytes) * 100);
            onProgress(progress, receivedBytes, totalBytes);
          }
          
          // Get the response text up to this point
          const currentText = xhr.responseText;
          
          if (currentText && currentText.length > lastProcessedLength) {
            // Extract only the new chunk since last processing
            const newChunk = currentText.substring(lastProcessedLength);
            lastProcessedLength = currentText.length;
            
            if (newChunk) {
              // Clean and process the new chunk
              const cleanChunk = cleanM3UContent(newChunk);
              await parser.processChunk(cleanChunk);
            }
          }
          
          // Save resume state every 5 seconds
          const currentTime = Date.now();
          if (currentTime - lastResumeStateSave > 5000) {
            await parser.saveResumeState(url, receivedBytes, totalBytes);
            lastResumeStateSave = currentTime;
          }
          
        } catch (error) {
          console.error('Error during progress processing:', error);
          // Continue processing even if one chunk fails
        }
      };
      
      xhr.onload = async () => {
        try {
          const isSuccess = xhr.status === 200 || xhr.status === 206; // 206 for partial content
          
          if (isSuccess) {
            // Process any remaining data
            const finalText = xhr.responseText;
            if (finalText && finalText.length > lastProcessedLength) {
              const finalChunk = finalText.substring(lastProcessedLength);
              if (finalChunk) {
                const cleanChunk = cleanM3UContent(finalChunk);
                await parser.processChunk(cleanChunk);
              }
            }
            
            onProgress(100, receivedBytes, totalBytes);
            console.log('✅ Streaming fetch completed');
            resolve();
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      xhr.onerror = () => {
        console.error('XMLHttpRequest error. Status:', xhr.status, 'Ready state:', xhr.readyState);
        console.error('Response headers:', xhr.getAllResponseHeaders());
        reject(new Error(`Network error occurred during streaming fetch. Status: ${xhr.status}, Ready state: ${xhr.readyState}`));
      };
      
      xhr.ontimeout = () => {
        console.error('XMLHttpRequest timeout. Status:', xhr.status, 'Ready state:', xhr.readyState);
        reject(new Error(`Request timeout during streaming fetch. Status: ${xhr.status}`));
      };
      
      xhr.send();
    });
  };

  // Helper function to clean M3U content of problematic characters
  const cleanM3UContent = (content: string): string => {
    try {
      // Remove or replace problematic characters that might cause encoding issues
      return content
        // Replace common problematic chars with safe alternatives
        .replace(/[""]/g, '"')  // Replace smart quotes
        .replace(/['']/g, "'")  // Replace smart apostrophes
        .replace(/[–—]/g, '-')  // Replace em/en dashes
        .replace(/[…]/g, '...') // Replace ellipsis
        // Remove null bytes and other control characters except newlines and tabs
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        // Ensure line endings are consistent
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n');
    } catch (error) {
      console.error('Error cleaning M3U content:', error);
      // Return original content if cleaning fails
      return content;
    }
  };

  const login = async () => {
    try {
      let res = await LoginApi(playlistUrl)
      await setAuthTokenAction(res.data.token)

      // setLoading(false)
      // res = await getMediaData()
      // console.log('getMediaData response:', res)
      // await getMediaData('series')
      // await getMediaData('movies')

      await getCategoryApi('live')
      await getCategoryApi('movies')
      res = await getCategoryApi('series')
      setStats({
        channels: res.data.totalLive,
        movies: res.data.totalMovies,
        series: res.data.totalSeries
      })
      console.log('getCategoryData response:', res)
      setLoading(false)

    } catch (error: any) {
      console.log('Login error details:',error)
      await getCategoryApi('live')
      await getCategoryApi('movies')
      const res = await getCategoryApi('series')
      setStats({
        channels: res.data.totalLive,
        movies: res.data.totalMovies,
        series: res.data.totalSeries
      })
      setLoading(false)
    }
  }
  
  useEffect(() => {
    login()
    // downloadAndParseM3U();
    
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