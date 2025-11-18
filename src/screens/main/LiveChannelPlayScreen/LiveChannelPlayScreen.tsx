import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  Text,
  TouchableOpacity,
  useTVEventHandler,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Video, { VideoRef } from 'react-native-video';
import { useDispatch, useSelector } from 'react-redux';
import MainLayout from '../../../components/MainLayout';
import imagepath from '../../../constants/imagepath';
import { RootState } from '../../../redux/store';
import { CommonColors } from '../../../styles/Colors';
import { moderateScale, scale, verticalScale } from '../../../styles/scaling';
import TvGuideModal from './TvGuideModal';
import HistoryModal from './HistoryModal';

import { MainStackParamList } from '../../../navigation/NavigationsTypes';

import {
  clearLiveTvHistoryApi,
  clearSingleChannelHistoryApi,
  getLiveTvHistoryApi,
  getLiveTvHistoryApiWithDateApi,
  saveHistoryApi,
} from '../../../redux/actions/main';
import { setCurrentlyPlaying } from '../../../redux/reducers/main';
import { channelData } from '../Tv/TvWithoutMediaPlayer';
import { styles } from './styles';
import FastImage from 'react-native-fast-image';
import { getProxyImageUrl } from '../../../utils/CommonFunctions';
import LeftChannelModal from './LeftChannelModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type LiveChannelPlayScreenRouteProp = RouteProp<
  MainStackParamList,
  'LiveChannelPlayScreen'
>;

const LiveChannelPlayScreen = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const route = useRoute<LiveChannelPlayScreenRouteProp>();
  const videoRef = useRef<VideoRef>(null);
  const focusIndexRef = useRef<number>(0);
  const { currentlyPlaying } = useSelector(
    (state: RootState) => state.rootReducer.main,
  );
  console.log('currentlyPlaying--->>>>', currentlyPlaying);
  const dispatch = useDispatch();
  const { channel } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [focused, setFocused] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [muted, setMuted] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [showTvGuide, setShowTvGuide] = useState(false);
  const [tvGuideLoading, setTvGuideLoading] = useState(false);
  const [showLeftChannelModal, setShowLeftChannelModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyDataWithDate, setHistoryDataWithDate] = useState<any[]>([]);
  const [channelName, setChannelName] = useState(
    channel?.name || channel?.title || 'Live Channel',
  );
  const { userToken } = useSelector(
    (state: RootState) => state.rootReducer.auth,
  );

  // Create navigation items array for FlatList
  type NavigationItem =
    | { id: string; type: 'button'; label: string; icon?: any; data?: any }
    | {
        id: string;
        type: 'historyItem';
        label: string;
        data?: any;
        icon?: any;
      };

  const navigationItems: NavigationItem[] = [
    { id: 'tvGuide', type: 'button', label: 'TV Guide', icon: 'tvGuide' },
    { id: 'history', type: 'button', label: 'History', icon: 'history' },
    ...(historyData?.map((item, index) => ({
      id: `historyItem_${index}`,
      type: 'historyItem' as const,
      label: item.name,
      data: item,
    })) || []),
    { id: 'clear', type: 'button', label: 'Clear', icon: 'clear' },
  ];

  useEffect(() => {
    console.log(
      'currentlyPlayingcurrentlyPlayingcurrentlyPlaying',
      currentlyPlaying,
    );
    if (currentlyPlaying) {
      // videoRef.current?.setSource({uri: currentlyPlaying?.url});
      setChannelName(
        currentlyPlaying?.name || currentlyPlaying?.title || 'Live Channel',
      );
    }
  }, [currentlyPlaying]);

  useEffect(() => {
    if (userToken) {
      getLiveTvHistory();
      saveHistory(channel);
      getLiveTvHistoryWithDate();
    }
  }, [channel]);

  async function saveHistory(channel: channelData) {
    try {
      const response = await saveHistoryApi(channel);
      console.log('response from saveHistory', response);
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  async function getLiveTvHistory() {
    try {
      const response = await getLiveTvHistoryApi();
      setHistoryData(response?.data?.data?.channels);
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  async function getLiveTvHistoryWithDate() {
    try {
      const response = await getLiveTvHistoryApiWithDateApi();
      console.log('newDataforModal--->>>', response);

      setHistoryDataWithDate(response?.data?.data?.historyByDate);
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }

  async function clearLiveTvHistory() {
    try {
      await clearLiveTvHistoryApi();
      const newDataforModal = await getLiveTvHistoryApiWithDateApi();
      const newData = await getLiveTvHistoryApi();
      setHistoryDataWithDate(newDataforModal?.data?.data?.historyByDate);
      setHistoryData(newData?.data?.data?.channels);
      setShowHistoryModal(false);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }

  async function clearSingleChannelHistory(data: any) {
    try {
      await clearSingleChannelHistoryApi(data);
      const newDataforModal = await getLiveTvHistoryApiWithDateApi();
      const newData = await getLiveTvHistoryApi();
      setHistoryDataWithDate(newDataforModal?.data?.data?.historyByDate);
      setHistoryData(newData?.data?.data?.channels);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }

  const resetControlsTimer = () => {
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    setShowControls(true);
    hideControlsTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleTvGuidePress = () => {
    setShowControls(false);
    setShowTvGuide(true);
    setTvGuideLoading(true);
    setTimeout(() => {
      setTvGuideLoading(false);
    }, 1000);
  };

  const handleTvGuideClose = () => {
    setShowTvGuide(false);
    setTvGuideLoading(false);
  };

  const handleLeftChannelModalOpen = () => {
    setShowControls(false);
    setShowLeftChannelModal(true);
  };

  const handleLeftChannelModalClose = () => {
    setShowLeftChannelModal(false);
  };

  const handleHistoryModalOpen = () => {
    setShowControls(false);
    setShowHistoryModal(true);
  };

  const handleHistoryModalClose = () => {
    setShowHistoryModal(false);
  };

  const handleHistoryItemSelect = (item: any) => {
    dispatch(
      setCurrentlyPlaying({
        ...item,
        type: 'live',
      }),
    );
    setShowHistoryModal(false);
  };

  const handleDeleteHistoryItem = async (item: any) => {
    try {
      // You can implement individual item deletion API here
      // For now, we'll just refresh the history list
      console.log('Deleting history item:', item);
      let data = {
        stream_id: item?.stream_id,
      };
      await clearSingleChannelHistory(data);
      const newData = await getLiveTvHistory();
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  // Navigation functions
  const navigateFocus = (direction: 'left' | 'right') => {
    const totalItems = navigationItems.length;
    if (totalItems === 0) return;

    // Use ref for more reliable state tracking
    const currentIndex = focusIndexRef.current;

    let newIndex = currentIndex;

    if (direction === 'left') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
    } else {
      newIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
    }

    // Update ref first, then state
    focusIndexRef.current = newIndex;
    setFocusedIndex(newIndex);
    setFocused(navigationItems[newIndex].id);
    resetControlsTimer();
    console.log(
      `Focus moved ${direction}: index ${currentIndex} -> ${newIndex}, item: ${navigationItems[newIndex].label}`,
    );
  };

  // TV remote event handler
  const myTVEventHandler = (evt: any) => {
    if (
      evt &&
      evt.eventType === 'select' &&
      !showTvGuide &&
      !showHistoryModal &&
      !showLeftChannelModal
    ) {
      resetControlsTimer();
      const currentItem = navigationItems[focusedIndex];
      if (currentItem) {
        if (currentItem.id === 'tvGuide') {
          handleTvGuidePress();
        } else if (currentItem.id === 'history') {
          handleHistoryModalOpen();
        } else if (currentItem.id === 'clear') {
          clearLiveTvHistory();
        } else if (currentItem.type === 'historyItem') {
          console.log('History item selected:', currentItem.data);

          dispatch(
            setCurrentlyPlaying({
              ...currentItem?.data,
              type: 'live', // Mark this as a live TV channel
            }),
          );
        }
      }
    } else if (
      evt &&
      evt.eventType === 'up' &&
      !showTvGuide &&
      !showHistoryModal &&
      !showLeftChannelModal
    ) {
      resetControlsTimer();
    } else if (
      evt &&
      evt.eventType === 'down' &&
      !showTvGuide &&
      !showHistoryModal &&
      !showLeftChannelModal
    ) {
      resetControlsTimer();
    } else if (
      evt &&
      evt.eventType === 'left' &&
      !showTvGuide &&
      !showHistoryModal &&
      !showLeftChannelModal
    ) {
      if (showControls) {
        navigateFocus('left');
      } else {
        // Alert.alert("hehehe")
        handleLeftChannelModalOpen();
      }
    } else if (
      evt &&
      evt.eventType === 'right' &&
      !showTvGuide &&
      !showHistoryModal &&
      !showLeftChannelModal
    ) {
      console.log('right pressed');
      navigateFocus('right');
    }
  };

  const TVEventHandlerTvGuide = (evt: any) => {
    if (evt && evt.eventType === 'select') {
    } else if (evt && evt.eventType === 'up') {
    } else if (evt && evt.eventType === 'down') {
    } else if (evt && evt.eventType === 'left') {
      console.log('left pressed');
    } else if (evt && evt.eventType === 'right') {
      console.log('right pressed');
    }
  };

  useTVEventHandler(myTVEventHandler);

  // Handle back button press
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [navigation]);

  // Initialize controls timer
  useEffect(() => {
    resetControlsTimer();
    // Set initial focus to first button
    focusIndexRef.current = 0;
    setFocused('tvGuide');
    setFocusedIndex(0);
    return () => {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    };
  }, []);

  // Update focus when navigation items change
  useEffect(() => {
    if (
      navigationItems.length > 0 &&
      focusIndexRef.current >= navigationItems.length
    ) {
      console.log(
        `Resetting focus: focusedIndex ${focusIndexRef.current} >= length ${navigationItems.length}`,
      );
      focusIndexRef.current = 0;
      setFocusedIndex(0);
      setFocused(navigationItems[0].id);
    }
  }, [navigationItems]);

  // Debug effect to track focus changes
  useEffect(() => {
    console.log(
      `Focus state changed: focusedIndex=${focusedIndex}, focused=${focused}`,
    );
  }, [focusedIndex, focused]);

  // Video event handlers
  const handleLoad = (data: any) => {
    console.log('Live channel loaded:', data);
    setLoading(false);
    setError(null);
    setNetworkError(false);
    videoRef?.current?.resume();
  };

  const handleError = (error: any) => {
    console.log('Live channel error:', error);
    setLoading(false);
    setError('Failed to load live channel');
    setNetworkError(true);
  };

  const handleProgress = (data: any) => {
    // For live streams, we don't need to track progress
  };

  // Retry function for reloading the stream
  const handleReload = () => {
    setLoading(true);
    setError(null);
    setNetworkError(false);
    // Force reload by updating a key
    videoRef.current?.seek(0);
  };

  // Focus handlers
  const handleFocus = (buttonName: string) => {
    const index = navigationItems.findIndex(item => item.id === buttonName);
    if (index !== -1) {
      focusIndexRef.current = index;
      setFocusedIndex(index);
      setFocused(buttonName);
    }
    resetControlsTimer();
  };

  // Render function for FlatList items
  const renderNavigationItem = ({
    item,
    index,
  }: {
    item: NavigationItem;
    index: number;
  }) => {
    const isFocused = focusedIndex === index;
    return (
      <Pressable
        style={[styles.navButton, isFocused && styles.navButtonFocused]}
        onFocus={() => handleFocus(item.id)}
        accessible={true}
        accessibilityRole="button"
      >
        <View style={styles.navButtonIcon}>
          <View style={styles.navButtonIconContainer}>
            {item.icon === 'tvGuide' && imagepath.tvGuide && (
              <FastImage
                source={imagepath.tvGuide}
                style={styles.navButtonImage}
              />
            )}
            {item.icon === 'clear' && imagepath.tvGuide && (
              <FastImage
                source={imagepath.clear}
                style={styles.navButtonImage}
                tintColor={CommonColors.white}
              />
            )}
            {item.icon === 'history' && imagepath.history && (
              <FastImage
                source={imagepath.history}
                style={styles.navButtonImage}
              />
            )}
            {item?.data?.stream_icon && (
              <FastImage
                source={{
                  uri: getProxyImageUrl(item?.data?.stream_icon)!,
                  priority: 'high',
                }}
                style={{
                  ...styles.navButtonImage,
                  width: 100,
                  height: moderateScale(58),
                  marginBottom: verticalScale(10),
                  borderRadius: moderateScale(6),
                }}
                resizeMode="contain"
              />
            )}
            {!item?.data && (
              <Text style={styles.navButtonText} numberOfLines={1}>
                {item.label}
              </Text>
            )}
          </View>
          {item?.data && (
            <Text style={styles.navButtonSubtext} numberOfLines={1}>
              {item.label}
            </Text>
          )}
          {item?.data && !isFocused && (
            <View style={styles.progressBarNavBtn} />
          )}
        </View>
      </Pressable>
    );
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <View style={styles.errorContent}>
        {imagepath.TvIcon && (
          <Image source={imagepath.TvIcon} style={styles.errorIcon} />
        )}
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorMessage}>
          Unable to load the live channel. Please check your connection and try
          again.
        </Text>
        <TouchableOpacity
          style={[
            styles.retryButton,
            focused === 'retry' && styles.retryButtonFocused,
          ]}
          onPress={handleReload}
          onFocus={() => handleFocus('retry')}
          activeOpacity={1}
        >
          {imagepath.reload && (
            <Image source={imagepath.reload} style={styles.retryIcon} />
          )}
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={CommonColors.white} />
      <Text style={styles.loadingText}>Loading {channelName}...</Text>
    </View>
  );

  const renderControls = () => {
    if (!showControls || loading || error) return null;

    return (
      <LinearGradient
        colors={[
          CommonColors.themeMain,
          'rgba(19, 22, 25, 0.95)',
          'rgba(19, 22, 25, 0.5)',
          'rgba(19, 22, 25, 0.4)',
          'rgba(19, 22, 25, 0.3)',
          'transparent',
        ]}
        locations={[0, 0.2, 0.5, 0.8, 0.9, 1]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.controlsOverlay}
      >
        <View>
          {/* Top info section */}
          <View style={styles.topInfoSection}>
            <View style={styles.topLeftInfo}>
              {imagepath.tv && (
                <FastImage
                  source={
                    currentlyPlaying?.stream_icon
                      ? {
                          uri: getProxyImageUrl(currentlyPlaying?.stream_icon)!,
                          priority: 'high',
                        }
                      : imagepath.tv
                  }
                  resizeMode="contain"
                  style={styles.tvLogo}
                />
              )}
              <View style={styles.channelInfoSection}>
                <Text style={styles.noInfoText}>No information</Text>
                <View style={styles.channelDetailsRow}>
                  <Text style={styles.channelDetails}>{channelName}</Text>
                  <View style={styles.qualityBadges}>
                    <View style={styles.qualityBadge}>
                      <Text style={styles.qualityText}>4K</Text>
                    </View>
                    <View style={styles.qualityBadge}>
                      <Text style={styles.qualityText}>25 FPS</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}></View>
          </View>

          {/* Bottom navigation buttons */}
          <View style={styles.bottomNavigationBar}>
            <FlatList
              data={navigationItems}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.id}
              renderItem={renderNavigationItem}
              contentContainerStyle={styles.flatListContent}
            />
          </View>

          {/* Down arrow indicator */}
          <View style={styles.downArrowContainer}>
            <View style={styles.downArrow} />
          </View>
        </View>
      </LinearGradient>
    );
  };

  const handleChannelSelect = (channel: channelData) => {
    console.log('channelselected:---->>>>>>', channel);
    // videoRef?.current?.;
    videoRef?.current?.setSource({ uri: channel?.url });

    // setChannel(channel);
    // setChannelName(channel?.name || channel?.title || 'Live Channel');
    dispatch(
      setCurrentlyPlaying({
        ...channel,
        type: 'live',
      }),
    );
    handleLeftChannelModalClose();
  };

  return (
    <MainLayout activeScreen="LiveChannelPlayScreen" hideSidebar={true}>
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="light-content"
      />

      <View style={styles.container}>
        {/* Video Player */}
        {!error && (
          <Video
            key={currentlyPlaying?.stream_id}
            ref={videoRef}
            source={{ uri: currentlyPlaying?.url }}
            style={styles.videoPlayer}
            volume={volume}
            muted={muted}
            repeat={true}
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

        {/* TV Guide Modal */}
        <TvGuideModal
          visible={showTvGuide}
          onClose={handleTvGuideClose}
          channelData={channel}
        />

        {/* Left Channel Modal */}
        <LeftChannelModal
          visible={showLeftChannelModal}
          onClose={handleLeftChannelModalClose}
          channelData={channel}
          onChannelSelect={handleChannelSelect}
        />

        {/* History Modal */}
        <HistoryModal
          visible={showHistoryModal}
          onClose={handleHistoryModalClose}
          historyData={historyDataWithDate}
          onItemSelect={handleHistoryItemSelect}
          // onClearHistory={clearLiveTvHistory}
          onDeleteItem={handleDeleteHistoryItem}
        />
      </View>
    </MainLayout>
  );
};

export default LiveChannelPlayScreen;
