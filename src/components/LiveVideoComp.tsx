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
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { MainStackParamList } from '../navigation/NavigationsTypes';

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
  
  // Context menu states
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuFocused, setContextMenuFocused] = useState<string | null>(null);
  
  // Audio submenu states
  const [showAudioSubmenu, setShowAudioSubmenu] = useState(false);
  const [audioSubmenuFocused, setAudioSubmenuFocused] = useState<string | null>(null);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<string>('default');
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  // Subtitles submenu states
  const [showSubtitlesSubmenu, setShowSubtitlesSubmenu] = useState(false);
  const [subtitlesSubmenuFocused, setSubtitlesSubmenuFocused] = useState<string | null>(null);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('off');
  
  // Playback speed submenu states
  const [showSpeedSubmenu, setShowSpeedSubmenu] = useState(false);
  const [speedSubmenuFocused, setSpeedSubmenuFocused] = useState<string | null>(null);
  const [selectedSpeed, setSelectedSpeed] = useState<string>('1x');
  
  // Video quality submenu states
  const [showQualitySubmenu, setShowQualitySubmenu] = useState(false);
  const [qualitySubmenuFocused, setQualitySubmenuFocused] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string>('auto');
  
  // Video playback rate state
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  
  // Context menu options
  const contextMenuOptions = [
    { id: 'audio', label: 'Audio Track', icon: imagepath.unmuteIcon },
    { id: 'subtitles', label: 'Subtitles', icon: imagepath.caption_icon },
    { id: 'quality', label: 'Video Quality', icon: imagepath.videoQuality },
    { id: 'speed', label: 'Playback Speed', icon: imagepath.buttons },
    { id: 'settings', label: 'Settings', icon: imagepath.settingIcon },
  ];

  // Audio track options
  const audioTrackOptions = [
    { id: 'default', label: 'Default', isDefault: true },
    // { id: 'english', label: 'English', language: 'en' },
    // { id: 'spanish', label: 'Spanish', language: 'es' },
    // { id: 'french', label: 'French', language: 'fr' },
    // { id: 'german', label: 'German', language: 'de' },
  ];

  // Subtitle options
  const subtitleOptions = [
    { id: 'off', label: 'Off' },
    // { id: 'english', label: 'English', language: 'en' },
    // { id: 'spanish', label: 'Spanish', language: 'es' },
    // { id: 'french', label: 'French', language: 'fr' },
    // { id: 'german', label: 'German', language: 'de' },
    // { id: 'auto', label: 'Auto-generated' },
  ];

  // Playback speed options
  const speedOptions = [
    { id: '0.25x', label: '0.25x' },
    { id: '0.5x', label: '0.5x' },
    { id: '0.75x', label: '0.75x' },
    { id: '1x', label: 'Normal', isDefault: true },
    { id: '1.25x', label: '1.25x' },
    { id: '1.5x', label: '1.5x' },
    { id: '2x', label: '2x' },
  ];

  // Video quality options
  const qualityOptions = [
    { id: 'auto', label: 'Auto', isDefault: true },
    // { id: '144p', label: '144p' },
    // { id: '240p', label: '240p' },
    // { id: '360p', label: '360p' },
    // { id: '480p', label: '480p' },
    // { id: '720p', label: '720p HD' },
    // { id: '1080p', label: '1080p Full HD' },
    // { id: '4k', label: '4K Ultra HD' },
  ];
  
  // Refs for focus management
  const videoRef = useRef<any>(null);
  const playPauseRef = useRef<any>(null);
  const rewindRef = useRef<any>(null);
  const forwardRef = useRef<any>(null);
  const previousRef = useRef<any>(null);
  const nextRef = useRef<any>(null);
  const watchFromStartRef = useRef<any>(null);
  const menuButtonRef = useRef<any>(null);
  const volumeRef = useRef<any>(null);
  const fullscreenRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Context menu refs
  const contextMenuRefs = useRef<{ [key: string]: any }>({});
  const audioSubmenuRefs = useRef<{ [key: string]: any }>({});
  const subtitlesSubmenuRefs = useRef<{ [key: string]: any }>({});
  const speedSubmenuRefs = useRef<{ [key: string]: any }>({});
  const qualitySubmenuRefs = useRef<{ [key: string]: any }>({});
  
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

  // Context menu handlers
  const openContextMenu = () => {
    console.log('Opening context menu with options:', contextMenuOptions.map(opt => opt.label));
    setShowContextMenu(true);
    setShowControls(false);
    setShowProgressOnly(false);
    setContextMenuFocused(contextMenuOptions[0].id);
    console.log('Setting initial focus to:', contextMenuOptions[0].label);
    // Clear any existing timeouts
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
    }
    
    // Focus the first menu item after a small delay to ensure it's rendered
    setTimeout(() => {
      if (contextMenuRefs.current[contextMenuOptions[0].id]) {
        console.log('Focusing first menu item:', contextMenuOptions[0].label);
        contextMenuRefs.current[contextMenuOptions[0].id].focus();
      }
    }, 100);
  };

  const hideContextMenu = () => {
    setShowContextMenu(false);
    setContextMenuFocused(null);
  };

  // Audio submenu handlers
  const openAudioSubmenu = () => {
    setShowAudioSubmenu(true);
    setAudioSubmenuFocused(selectedAudioTrack);
    console.log('Opening audio submenu, focusing on:', selectedAudioTrack);
    
    // Focus the selected audio track after a small delay to ensure it's rendered
    setTimeout(() => {
      if (audioSubmenuRefs.current[selectedAudioTrack]) {
        console.log('Focusing selected audio track:', selectedAudioTrack);
        audioSubmenuRefs.current[selectedAudioTrack].focus();
      }
    }, 100);
  };

  const hideAudioSubmenu = () => {
    setShowAudioSubmenu(false);
    setAudioSubmenuFocused(null);
  };

  const handleAudioTrackSelection = (trackId: string) => {
    setSelectedAudioTrack(trackId);
    const selectedTrack = audioTrackOptions.find(track => track.id === trackId);
    showNotification(`Audio: ${selectedTrack?.label || 'Unknown'}`);
    hideAudioSubmenu();
    hideContextMenu();
  };

  // Subtitles submenu handlers
  const openSubtitlesSubmenu = () => {
    setShowSubtitlesSubmenu(true);
    setSubtitlesSubmenuFocused(selectedSubtitle);
    console.log('Opening subtitles submenu, focusing on:', selectedSubtitle);
    
    setTimeout(() => {
      if (subtitlesSubmenuRefs.current[selectedSubtitle]) {
        console.log('Focusing selected subtitle:', selectedSubtitle);
        subtitlesSubmenuRefs.current[selectedSubtitle].focus();
      }
    }, 100);
  };

  const hideSubtitlesSubmenu = () => {
    setShowSubtitlesSubmenu(false);
    setSubtitlesSubmenuFocused(null);
  };

  const handleSubtitleSelection = (subtitleId: string) => {
    setSelectedSubtitle(subtitleId);
    const selectedSub = subtitleOptions.find(sub => sub.id === subtitleId);
    showNotification(`Subtitles: ${selectedSub?.label || 'Unknown'}`);
    hideSubtitlesSubmenu();
    hideContextMenu();
  };

  // Speed submenu handlers
  const openSpeedSubmenu = () => {
    setShowSpeedSubmenu(true);
    setSpeedSubmenuFocused(selectedSpeed);
    console.log('Opening speed submenu, focusing on:', selectedSpeed);
    
    setTimeout(() => {
      if (speedSubmenuRefs.current[selectedSpeed]) {
        console.log('Focusing selected speed:', selectedSpeed);
        speedSubmenuRefs.current[selectedSpeed].focus();
      }
    }, 100);
  };

  const hideSpeedSubmenu = () => {
    setShowSpeedSubmenu(false);
    setSpeedSubmenuFocused(null);
  };

  // Function to convert speed string to numeric value
  const convertSpeedToRate = (speedId: string): number => {
    switch (speedId) {
      case '0.25x': return 0.25;
      case '0.5x': return 0.5;
      case '0.75x': return 0.75;
      case '1x': return 1.0;
      case '1.25x': return 1.25;
      case '1.5x': return 1.5;
      case '2x': return 2.0;
      default: return 1.0;
    }
  };

  const handleSpeedSelection = (speedId: string) => {
    setSelectedSpeed(speedId);
    const newRate = convertSpeedToRate(speedId);
    setPlaybackRate(newRate);
    
    console.log(`Playback speed changed to: ${speedId} (rate: ${newRate})`);
    
    const selectedSpd = speedOptions.find(spd => spd.id === speedId);
    showNotification(`Speed: ${selectedSpd?.label || 'Unknown'}`);
    hideSpeedSubmenu();
    hideContextMenu();
  };

  // Quality submenu handlers
  const openQualitySubmenu = () => {
    setShowQualitySubmenu(true);
    setQualitySubmenuFocused(selectedQuality);
    console.log('Opening quality submenu, focusing on:', selectedQuality);
    
    setTimeout(() => {
      if (qualitySubmenuRefs.current[selectedQuality]) {
        console.log('Focusing selected quality:', selectedQuality);
        qualitySubmenuRefs.current[selectedQuality].focus();
      }
    }, 100);
  };

  const hideQualitySubmenu = () => {
    setShowQualitySubmenu(false);
    setQualitySubmenuFocused(null);
  };

  const handleQualitySelection = (qualityId: string) => {
    setSelectedQuality(qualityId);
    const selectedQual = qualityOptions.find(qual => qual.id === qualityId);
    showNotification(`Quality: ${selectedQual?.label || 'Unknown'}`);
    hideQualitySubmenu();
    hideContextMenu();
  };

  const handleContextMenuSelection = (optionId: string) => {
    console.log('Context menu option selected:', optionId);
    // Add specific handling for each option here
    switch (optionId) {
      case 'audio':
        openAudioSubmenu();
        return; // Don't hide context menu, keep it open with submenu
      case 'subtitles':
        openSubtitlesSubmenu();
        return; // Don't hide context menu, keep it open with submenu
      case 'quality':
        openQualitySubmenu();
        return; // Don't hide context menu, keep it open with submenu
      case 'speed':
        openSpeedSubmenu();
        return; // Don't hide context menu, keep it open with submenu
      case 'settings':
        // Clean up all menu states before navigation
        setFocused(null);
        setContextMenuFocused(null);
        hideContextMenu();
        
        // Small delay to ensure cleanup completes before navigation
        setTimeout(() => {
          navigation.navigate('Settings');
        }, 100);
        break;
      default:
        break;
    }
    hideContextMenu();
  };

  const handleNextEpisode = () => {
    if (currentEpisodeIndex < currentSeriesEpisodes.length - 1) {
      const nextIndex = currentEpisodeIndex + 1
      setVideoUrl(currentSeriesEpisodes[nextIndex]?.url)
      setCurrentEpisodeIndex(nextIndex)
      setCurrentTime(0)
      // Playback speed is preserved automatically via state
      console.log(`Next episode loaded, maintaining playback speed: ${playbackRate}x`);
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
      // Playback speed is preserved automatically via state
      console.log(`Previous episode loaded, maintaining playback speed: ${playbackRate}x`);
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
    console.log('TV Event:', evt?.eventType, 'Controls visible:', showControls, 'Context menu:', showContextMenu, 'Active submenu:', {
      audio: showAudioSubmenu,
      subtitles: showSubtitlesSubmenu, 
      speed: showSpeedSubmenu,
      quality: showQualitySubmenu
    });
    
    // Handle audio submenu navigation first
    if (showAudioSubmenu) {
      console.log('Audio submenu navigation - Event:', evt?.eventType, 'Current focused:', audioSubmenuFocused);
      if (evt && evt.eventType === 'up') {
        const currentIndex = audioTrackOptions.findIndex(option => option.id === audioSubmenuFocused);
        if (currentIndex <= 0) {
          console.log('Already at first item, blocking up navigation');
          return;
        }
        const prevOption = audioTrackOptions[currentIndex - 1];
        setAudioSubmenuFocused(prevOption.id);
        if (audioSubmenuRefs.current[prevOption.id]) {
          audioSubmenuRefs.current[prevOption.id].focus();
        }
      } else if (evt && evt.eventType === 'down') {
        const currentIndex = audioTrackOptions.findIndex(option => option.id === audioSubmenuFocused);
        if (currentIndex >= audioTrackOptions.length - 1) {
          console.log('Already at last item, blocking down navigation');
          return;
        }
        const nextOption = audioTrackOptions[currentIndex + 1];
        setAudioSubmenuFocused(nextOption.id);
        if (audioSubmenuRefs.current[nextOption.id]) {
          audioSubmenuRefs.current[nextOption.id].focus();
        }
      } else if (evt && evt.eventType === 'select') {
        if (audioSubmenuFocused) {
          handleAudioTrackSelection(audioSubmenuFocused);
        }
      } else if (evt && evt.eventType === 'menu' || evt && evt.eventType === 'left') {
        hideAudioSubmenu();
      }
      return;
    }

    // Handle subtitles submenu navigation
    if (showSubtitlesSubmenu) {
      console.log('Subtitles submenu navigation - Event:', evt?.eventType, 'Current focused:', subtitlesSubmenuFocused);
      if (evt && evt.eventType === 'up') {
        const currentIndex = subtitleOptions.findIndex(option => option.id === subtitlesSubmenuFocused);
        if (currentIndex <= 0) {
          console.log('Already at first item, blocking up navigation');
          return;
        }
        const prevOption = subtitleOptions[currentIndex - 1];
        setSubtitlesSubmenuFocused(prevOption.id);
        if (subtitlesSubmenuRefs.current[prevOption.id]) {
          subtitlesSubmenuRefs.current[prevOption.id].focus();
        }
      } else if (evt && evt.eventType === 'down') {
        const currentIndex = subtitleOptions.findIndex(option => option.id === subtitlesSubmenuFocused);
        if (currentIndex >= subtitleOptions.length - 1) {
          console.log('Already at last item, blocking down navigation');
          return;
        }
        const nextOption = subtitleOptions[currentIndex + 1];
        setSubtitlesSubmenuFocused(nextOption.id);
        if (subtitlesSubmenuRefs.current[nextOption.id]) {
          subtitlesSubmenuRefs.current[nextOption.id].focus();
        }
      } else if (evt && evt.eventType === 'select') {
        if (subtitlesSubmenuFocused) {
          handleSubtitleSelection(subtitlesSubmenuFocused);
        }
      } else if (evt && evt.eventType === 'menu' || evt && evt.eventType === 'left') {
        hideSubtitlesSubmenu();
      }
      return;
    }

    // Handle speed submenu navigation
    if (showSpeedSubmenu) {
      console.log('Speed submenu navigation - Event:', evt?.eventType, 'Current focused:', speedSubmenuFocused);
      if (evt && evt.eventType === 'up') {
        const currentIndex = speedOptions.findIndex(option => option.id === speedSubmenuFocused);
        if (currentIndex <= 0) {
          console.log('Already at first item, blocking up navigation');
          return;
        }
        const prevOption = speedOptions[currentIndex - 1];
        setSpeedSubmenuFocused(prevOption.id);
        if (speedSubmenuRefs.current[prevOption.id]) {
          speedSubmenuRefs.current[prevOption.id].focus();
        }
      } else if (evt && evt.eventType === 'down') {
        const currentIndex = speedOptions.findIndex(option => option.id === speedSubmenuFocused);
        if (currentIndex >= speedOptions.length - 1) {
          console.log('Already at last item, blocking down navigation');
          return;
        }
        const nextOption = speedOptions[currentIndex + 1];
        setSpeedSubmenuFocused(nextOption.id);
        if (speedSubmenuRefs.current[nextOption.id]) {
          speedSubmenuRefs.current[nextOption.id].focus();
        }
      } else if (evt && evt.eventType === 'select') {
        if (speedSubmenuFocused) {
          handleSpeedSelection(speedSubmenuFocused);
        }
      } else if (evt && evt.eventType === 'menu' || evt && evt.eventType === 'left') {
        hideSpeedSubmenu();
      }
      return;
    }

    // Handle quality submenu navigation
    if (showQualitySubmenu) {
      console.log('Quality submenu navigation - Event:', evt?.eventType, 'Current focused:', qualitySubmenuFocused);
      if (evt && evt.eventType === 'up') {
        const currentIndex = qualityOptions.findIndex(option => option.id === qualitySubmenuFocused);
        if (currentIndex <= 0) {
          console.log('Already at first item, blocking up navigation');
          return;
        }
        const prevOption = qualityOptions[currentIndex - 1];
        setQualitySubmenuFocused(prevOption.id);
        if (qualitySubmenuRefs.current[prevOption.id]) {
          qualitySubmenuRefs.current[prevOption.id].focus();
        }
      } else if (evt && evt.eventType === 'down') {
        const currentIndex = qualityOptions.findIndex(option => option.id === qualitySubmenuFocused);
        if (currentIndex >= qualityOptions.length - 1) {
          console.log('Already at last item, blocking down navigation');
          return;
        }
        const nextOption = qualityOptions[currentIndex + 1];
        setQualitySubmenuFocused(nextOption.id);
        if (qualitySubmenuRefs.current[nextOption.id]) {
          qualitySubmenuRefs.current[nextOption.id].focus();
        }
      } else if (evt && evt.eventType === 'select') {
        if (qualitySubmenuFocused) {
          handleQualitySelection(qualitySubmenuFocused);
        }
      } else if (evt && evt.eventType === 'menu' || evt && evt.eventType === 'left') {
        hideQualitySubmenu();
      }
      return;
    }
    
    // Handle context menu navigation
    if (showContextMenu) {
      console.log('Context menu navigation - Event:', evt?.eventType, 'Current focused:', contextMenuFocused);
      if (evt && evt.eventType === 'left') {
        const currentIndex = contextMenuOptions.findIndex(option => option.id === contextMenuFocused);
        console.log('Left pressed - current index:', currentIndex);
        if (currentIndex > 0) {
          const prevOption = contextMenuOptions[currentIndex - 1];
          console.log('Moving to previous option:', prevOption.label);
          setContextMenuFocused(prevOption.id);
          // Focus the actual button
          if (contextMenuRefs.current[prevOption.id]) {
            contextMenuRefs.current[prevOption.id].focus();
          }
        }
      } else if (evt && evt.eventType === 'right') {
        const currentIndex = contextMenuOptions.findIndex(option => option.id === contextMenuFocused);
        console.log('Right pressed - current index:', currentIndex, 'total options:', contextMenuOptions.length);
        if (currentIndex < contextMenuOptions.length - 1) {
          const nextOption = contextMenuOptions[currentIndex + 1];
          console.log('Moving to next option:', nextOption.label);
          setContextMenuFocused(nextOption.id);
          // Focus the actual button
          if (contextMenuRefs.current[nextOption.id]) {
            contextMenuRefs.current[nextOption.id].focus();
          }
        }
      } else if (evt && evt.eventType === 'select') {
        if (contextMenuFocused) {
          handleContextMenuSelection(contextMenuFocused);
        }
      } else if (evt && evt.eventType === 'menu') {
        hideContextMenu();
      }
      return; // Don't handle other events when context menu is open
    }
    
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
        // First check if any submenu is open
        if (showAudioSubmenu) {
          console.log('Hiding audio submenu on Android back press');
          hideAudioSubmenu();
          return true; // Prevent default back behavior
        }
        if (showSubtitlesSubmenu) {
          console.log('Hiding subtitles submenu on Android back press');
          hideSubtitlesSubmenu();
          return true; // Prevent default back behavior
        }
        if (showSpeedSubmenu) {
          console.log('Hiding speed submenu on Android back press');
          hideSpeedSubmenu();
          return true; // Prevent default back behavior
        }
        if (showQualitySubmenu) {
          console.log('Hiding quality submenu on Android back press');
          hideQualitySubmenu();
          return true; // Prevent default back behavior
        }
        // Then check if context menu is open
        if (showContextMenu) {
          console.log('Hiding context menu on Android back press');
          hideContextMenu();
          return true; // Prevent default back behavior
        }
        // Then check for controls/progress, then exit
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
  }, [onExit, showControls, showProgressOnly, showContextMenu, showAudioSubmenu, showSubtitlesSubmenu, showSpeedSubmenu, showQualitySubmenu]);

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
          rate={playbackRate}
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
          
          {/* show movie name and playback speed */}
          <View style={styles.movieNameContainer}>
            <Text style={styles.movieName}>{`${currentlyPlaying?.title}${currentSeriesEpisodes?.length > 1 ? ' EP ' + (currentEpisodeIndex+1) : ''}`}
            </Text>
            {playbackRate !== 1.0 && (
              <Text style={styles.playbackSpeedIndicator}>
                {selectedSpeed}
              </Text>
            )}
          </View>
          

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

              {/* watch from start and menu buttons */}
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
                nextFocusRight={menuButtonRef.current}
                nextFocusDown={fullscreenRef.current}
              >
                <Image source={imagepath.reload} style={{...styles.controlIcon, height: moderateScale(25), width: moderateScale(25)}}/>
                {focused === 'watchFromStart' && <View style={styles.focusIndicator} />}
              </Pressable>
              {focused === 'watchFromStart' &&
              <Text style={{...styles.watchFromStartText}}>Watch from start</Text>
              }

              {/* Menu button */}
              <Pressable 
                ref={menuButtonRef}
                style={[
                  styles.menuButton,
                  focused === 'menuButton' && styles.focusedButton
                ]}
                onPress={openContextMenu}
                onFocus={() => handleFocus('menuButton')}
                onBlur={handleBlur}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Open menu"
                accessibilityHint="Press to open video menu"
                nextFocusLeft={watchFromStartRef.current}
                nextFocusDown={fullscreenRef.current}
              >
                <Image source={imagepath.menubar} style={{...styles.controlIcon, height: moderateScale(25), width: moderateScale(25)}}/>
                {focused === 'menuButton' && <View style={styles.focusIndicator} />}
              </Pressable>
              {focused === 'menuButton' &&
              <Text style={styles.menuButtonText}>Menu</Text>
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

      {/* Audio Submenu Overlay */}
      {showAudioSubmenu && (
        <View style={styles.audioSubmenuOverlay}>
          <View style={styles.audioSubmenuContainer}>
            <View style={styles.audioSubmenuHeader}>
              <Text style={styles.audioSubmenuTitle}>Audio Track</Text>
            </View>
            <View style={styles.audioSubmenuContent}>
              {audioTrackOptions.map((option, index) => (
                <Pressable
                  key={option.id}
                  ref={(ref) => {
                    audioSubmenuRefs.current[option.id] = ref;
                  }}
                  style={[
                    styles.audioSubmenuItem,
                    audioSubmenuFocused === option.id && styles.audioSubmenuItemFocused,
                    selectedAudioTrack === option.id && styles.audioSubmenuItemSelected
                  ]}
                  onPress={() => handleAudioTrackSelection(option.id)}
                  onFocus={() => {
                    console.log('Audio submenu item focused:', option.label, option.id, 'Audio submenu open:', showAudioSubmenu);
                    setAudioSubmenuFocused(option.id);
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                >
                  <View style={styles.audioSubmenuItemContent}>
                    <Text style={[
                      styles.audioSubmenuLabel,
                      audioSubmenuFocused === option.id && styles.audioSubmenuLabelFocused,
                      selectedAudioTrack === option.id && styles.audioSubmenuLabelSelected
                    ]}>
                      {option.label}
                    </Text>
                    {selectedAudioTrack === option.id && (
                      <Image source={imagepath.check} style={styles.audioSubmenuCheckIcon} />
                    )}
                  </View>
                  {audioSubmenuFocused === option.id && (
                    <View style={styles.audioSubmenuFocusIndicator} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Subtitles Submenu Overlay */}
      {showSubtitlesSubmenu && (
        <View style={styles.audioSubmenuOverlay}>
          <View style={styles.audioSubmenuContainer}>
            <View style={styles.audioSubmenuHeader}>
              <Text style={styles.audioSubmenuTitle}>Subtitles</Text>
            </View>
            <View style={styles.audioSubmenuContent}>
              {subtitleOptions.map((option, index) => (
                <Pressable
                  key={option.id}
                  ref={(ref) => {
                    subtitlesSubmenuRefs.current[option.id] = ref;
                  }}
                  style={[
                    styles.audioSubmenuItem,
                    subtitlesSubmenuFocused === option.id && styles.audioSubmenuItemFocused,
                    selectedSubtitle === option.id && styles.audioSubmenuItemSelected
                  ]}
                  onPress={() => handleSubtitleSelection(option.id)}
                  onFocus={() => {
                    console.log('Subtitles submenu item focused:', option.label, option.id);
                    setSubtitlesSubmenuFocused(option.id);
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                >
                  <View style={styles.audioSubmenuItemContent}>
                    <Text style={[
                      styles.audioSubmenuLabel,
                      subtitlesSubmenuFocused === option.id && styles.audioSubmenuLabelFocused,
                      selectedSubtitle === option.id && styles.audioSubmenuLabelSelected
                    ]}>
                      {option.label}
                    </Text>
                    {selectedSubtitle === option.id && (
                      <Image source={imagepath.check} style={styles.audioSubmenuCheckIcon} />
                    )}
                  </View>
                  {subtitlesSubmenuFocused === option.id && (
                    <View style={styles.audioSubmenuFocusIndicator} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Speed Submenu Overlay */}
      {showSpeedSubmenu && (
        <View style={styles.audioSubmenuOverlay}>
          <View style={styles.audioSubmenuContainer}>
            <View style={styles.audioSubmenuHeader}>
              <Text style={styles.audioSubmenuTitle}>Playback Speed</Text>
            </View>
            <View style={styles.audioSubmenuContent}>
              {speedOptions.map((option, index) => (
                <Pressable
                  key={option.id}
                  ref={(ref) => {
                    speedSubmenuRefs.current[option.id] = ref;
                  }}
                  style={[
                    styles.audioSubmenuItem,
                    speedSubmenuFocused === option.id && styles.audioSubmenuItemFocused,
                    selectedSpeed === option.id && styles.audioSubmenuItemSelected
                  ]}
                  onPress={() => handleSpeedSelection(option.id)}
                  onFocus={() => {
                    console.log('Speed submenu item focused:', option.label, option.id);
                    setSpeedSubmenuFocused(option.id);
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                >
                  <View style={styles.audioSubmenuItemContent}>
                    <Text style={[
                      styles.audioSubmenuLabel,
                      speedSubmenuFocused === option.id && styles.audioSubmenuLabelFocused,
                      selectedSpeed === option.id && styles.audioSubmenuLabelSelected
                    ]}>
                      {option.label}
                    </Text>
                    {selectedSpeed === option.id && (
                      <Image source={imagepath.check} style={styles.audioSubmenuCheckIcon} />
                    )}
                  </View>
                  {speedSubmenuFocused === option.id && (
                    <View style={styles.audioSubmenuFocusIndicator} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Quality Submenu Overlay */}
      {showQualitySubmenu && (
        <View style={styles.audioSubmenuOverlay}>
          <View style={styles.audioSubmenuContainer}>
            <View style={styles.audioSubmenuHeader}>
              <Text style={styles.audioSubmenuTitle}>Video Quality</Text>
            </View>
            <View style={styles.audioSubmenuContent}>
              {qualityOptions.map((option, index) => (
                <Pressable
                  key={option.id}
                  ref={(ref) => {
                    qualitySubmenuRefs.current[option.id] = ref;
                  }}
                  style={[
                    styles.audioSubmenuItem,
                    qualitySubmenuFocused === option.id && styles.audioSubmenuItemFocused,
                    selectedQuality === option.id && styles.audioSubmenuItemSelected
                  ]}
                  onPress={() => handleQualitySelection(option.id)}
                  onFocus={() => {
                    console.log('Quality submenu item focused:', option.label, option.id);
                    setQualitySubmenuFocused(option.id);
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                >
                  <View style={styles.audioSubmenuItemContent}>
                    <Text style={[
                      styles.audioSubmenuLabel,
                      qualitySubmenuFocused === option.id && styles.audioSubmenuLabelFocused,
                      selectedQuality === option.id && styles.audioSubmenuLabelSelected
                    ]}>
                      {option.label}
                    </Text>
                    {selectedQuality === option.id && (
                      <Image source={imagepath.check} style={styles.audioSubmenuCheckIcon} />
                    )}
                  </View>
                  {qualitySubmenuFocused === option.id && (
                    <View style={styles.audioSubmenuFocusIndicator} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Context Menu Overlay */}
      {showContextMenu && (
        <View style={styles.contextMenuOverlay}>
          <View style={styles.contextMenuContainer}>
            <View style={styles.contextMenuContent}>
              {contextMenuOptions.map((option, index) => (
                <Pressable
                  key={option.id}
                  ref={(ref) => {
                    contextMenuRefs.current[option.id] = ref;
                  }}
                  style={[
                    styles.contextMenuItem,
                    contextMenuFocused === option.id && styles.contextMenuItemFocused,
                    (showAudioSubmenu || showSubtitlesSubmenu || showSpeedSubmenu || showQualitySubmenu) && styles.contextMenuItemDisabled
                  ]}
                  onPress={() => {
                    if (!showAudioSubmenu && !showSubtitlesSubmenu && !showSpeedSubmenu && !showQualitySubmenu) {
                      handleContextMenuSelection(option.id);
                    }
                  }}
                  onFocus={() => {
                    if (!showAudioSubmenu && !showSubtitlesSubmenu && !showSpeedSubmenu && !showQualitySubmenu) {
                      console.log('Context menu item focused:', option.label, option.id);
                      setContextMenuFocused(option.id);
                    } else {
                      console.log('⚠️ Context menu focus blocked - submenu is open, attempted focus on:', option.label);
                    }
                  }}
                  accessible={!showAudioSubmenu && !showSubtitlesSubmenu && !showSpeedSubmenu && !showQualitySubmenu}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  pointerEvents={(showAudioSubmenu || showSubtitlesSubmenu || showSpeedSubmenu || showQualitySubmenu) ? 'none' : 'auto'}
                >
                    <View style={styles.contextMenuItemContent}>
                      <Image source={option.icon} style={styles.contextMenuIcon} />
                      <Text style={[
                        styles.contextMenuLabel,
                        contextMenuFocused === option.id && styles.contextMenuLabelFocused
                      ]}>
                        {option.label}
                      </Text>
                    </View>
                    {contextMenuFocused === option.id && (
                      <View style={styles.contextMenuFocusIndicator} />
                    )}
                  </Pressable>
                ))}
            </View>
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
    width: moderateScale(200),
    flexDirection: 'row',
    gap: moderateScale(15),
  },
  watchFromStartText: {
    position: 'absolute',
    bottom: moderateScale(-20),
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(20),
    color: '#FFFFFF',
    textAlign: 'left',
    right: moderateScale(120),
  },
  menuButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(50),
    padding: moderateScale(25),
    width: moderateScale(40),
    height: moderateScale(40),
  },
  menuButtonText: {
    position: 'absolute',
    bottom: moderateScale(-20),
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(20),
    color: '#FFFFFF',
    left: moderateScale(75),
    right: moderateScale(8),
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
  movieNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: moderateScale(35),
    marginTop: moderateScale(10),
    gap: moderateScale(15),
  },
  movieName:{
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(35),
    color: '#FFFFFF',
    textAlign: 'left',
  },
  playbackSpeedIndicator: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(24),
    color: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: '#007AFF',
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
  // Context Menu Styles
  contextMenuOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    paddingVertical: moderateScale(30),
    paddingHorizontal: moderateScale(40),
  },
  contextMenuContainer: {
    width: '100%',
  },
  contextMenuGuide: {
    width: '100%',
  },
  contextMenuContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  contextMenuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(15),
    paddingHorizontal: moderateScale(20),
    borderRadius: moderateScale(10),
    minWidth: moderateScale(120),
  },
  contextMenuItemFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  contextMenuItemDisabled: {
    opacity: 0.3,
  },
  contextMenuItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextMenuIcon: {
    width: moderateScale(30),
    height: moderateScale(30),
    tintColor: '#FFFFFF',
    marginBottom: moderateScale(8),
  },
  contextMenuLabel: {
    color: '#FFFFFF',
    fontSize: scale(18),
    fontFamily: FontFamily.PublicSans_Regular,
    textAlign: 'center',
  },
  contextMenuLabelFocused: {
    fontFamily: FontFamily.PublicSans_SemiBold,
  },
  contextMenuFocusIndicator: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderWidth: moderateScale(2),
    borderColor: '#FFFFFF',
    borderRadius: moderateScale(15),
  },
  // Audio Submenu Styles
  audioSubmenuOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: moderateScale(300),
    backgroundColor: 'rgba(0,0,0,0.95)',
    paddingVertical: moderateScale(40),
    paddingHorizontal: moderateScale(30),
  },
  audioSubmenuContainer: {
    flex: 1,
  },
  audioSubmenuHeader: {
    marginBottom: moderateScale(30),
    paddingBottom: moderateScale(15),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  audioSubmenuTitle: {
    color: '#FFFFFF',
    fontSize: scale(24),
    fontFamily: FontFamily.PublicSans_SemiBold,
    textAlign: 'center',
  },
  audioSubmenuContent: {
    flex: 1,
  },
  audioSubmenuItem: {
    paddingVertical: moderateScale(15),
    paddingHorizontal: moderateScale(20),
    marginBottom: moderateScale(5),
    borderRadius: moderateScale(8),
  },
  audioSubmenuItemFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  audioSubmenuItemSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
  },
  audioSubmenuItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  audioSubmenuLabel: {
    color: '#FFFFFF',
    fontSize: scale(20),
    fontFamily: FontFamily.PublicSans_Regular,
  },
  audioSubmenuLabelFocused: {
    fontFamily: FontFamily.PublicSans_SemiBold,
  },
  audioSubmenuLabelSelected: {
    color: '#007AFF',
  },
  audioSubmenuCheckIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
    tintColor: '#007AFF',
  },
  audioSubmenuFocusIndicator: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderWidth: moderateScale(2),
    borderColor: '#FFFFFF',
    borderRadius: moderateScale(10),
  },
});

export default LiveVideoComp;