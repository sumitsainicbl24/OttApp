import { BlurView } from '@react-native-community/blur';
import React, { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TVFocusGuideView,
  useTVEventHandler,
  View,
} from 'react-native';
import { VideoRef } from 'react-native-video';
import FontFamily from '../../constants/FontFamily';
import { CommonColors } from '../../styles/Colors';
import { moderateScale } from '../../styles/scaling';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  videoRef?: React.RefObject<VideoRef | null>;
  videoViewRef?: React.RefObject<View | null>;
}

type TabType = 'Audio' | 'Subtitles' | 'Delay' | 'Display';

interface RadioOption {
  label: string;
  value: string;
}

const SettingsModal = React.forwardRef<View, SettingsModalProps>(
  ({ visible, onClose, videoRef, videoViewRef }, ref) => {
  const [activeTab, setActiveTab] = useState<TabType>('Audio');
  const [selectedAudio, setSelectedAudio] = useState('English');
  const [selectedSubtitle, setSelectedSubtitle] = useState('None');
  const [selectedDelay, setSelectedDelay] = useState('0s');
  const [selectedDisplay, setSelectedDisplay] = useState('Auto');
  const [focusedTabIndex, setFocusedTabIndex] = useState<number | null>(0);
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(0);
  const [isNavigatingTabs, setIsNavigatingTabs] = useState(true);

  // Refs for tabs
  const tabRefs = useRef<{ [key: string]: any }>({});
  // Refs for radio options
  const optionRefs = useRef<{ [key: string]: any }>({});

  const tabs: TabType[] = ['Audio', 'Subtitles', 'Delay', 'Display'];

  const audioOptions: RadioOption[] = [
    { label: 'Dutch', value: 'Dutch' },
    { label: 'English', value: 'English' },
    { label: 'Arabic', value: 'Arabic' },
  ];

  const subtitleOptions: RadioOption[] = [
    { label: 'None', value: 'None' },
    { label: 'English', value: 'English' },
    { label: 'Spanish', value: 'Spanish' },
    { label: 'French', value: 'French' },
  ];

  const delayOptions: RadioOption[] = [
    { label: '0s', value: '0s' },
    { label: '0.5s', value: '0.5s' },
    { label: '1s', value: '1s' },
    { label: '1.5s', value: '1.5s' },
    { label: '2s', value: '2s' },
  ];

  const displayOptions: RadioOption[] = [
    { label: 'Auto', value: 'Auto' },
    { label: '16:9', value: '16:9' },
    { label: '4:3', value: '4:3' },
    { label: 'Original', value: 'Original' },
  ];

  const getCurrentOptions = React.useCallback((): RadioOption[] => {
    switch (activeTab) {
      case 'Audio':
        return audioOptions;
      case 'Subtitles':
        return subtitleOptions;
      case 'Delay':
        return delayOptions;
      case 'Display':
        return displayOptions;
      default:
        return [];
    }
  }, [activeTab]);

  const getSelectedValue = (): string => {
    switch (activeTab) {
      case 'Audio':
        return selectedAudio;
      case 'Subtitles':
        return selectedSubtitle;
      case 'Delay':
        return selectedDelay;
      case 'Display':
        return selectedDisplay;
      default:
        return '';
    }
  };

  // Helper function to get aspectRatio value from display option
  const getAspectRatioFromDisplayOption = (option: string): string | undefined => {
    switch (option) {
      case 'Auto':
        return '16/9'; // Default aspect ratio
      case '16:9':
        return '16/9';
      case '4:3':
        return '4/3';
      case 'Original':
        return undefined; // Remove aspectRatio constraint for original
      default:
        return '16/9';
    }
  };

  const handleOptionSelect = (value: string) => {
    switch (activeTab) {
      case 'Audio':
        setSelectedAudio(value);
        break;
      case 'Subtitles':
        setSelectedSubtitle(value);
        break;
      case 'Delay':
        setSelectedDelay(value);
        break;
      case 'Display':
        setSelectedDisplay(value);
        // Update video aspect ratio using setNativeProps on the view wrapper
        if (videoViewRef?.current) {
          const aspectRatio = getAspectRatioFromDisplayOption(value);
          try {
            if (aspectRatio) {
              videoViewRef.current.setNativeProps({
                style: { aspectRatio },
              });
            } else {
              // For 'Original', remove aspectRatio constraint
              videoViewRef.current.setNativeProps({
                style: { aspectRatio: undefined },
              });
            }
          } catch (error) {
            console.warn('Failed to update video aspect ratio:', error);
          }
        }
        break;
    }
  };

  const handleTabSelect = (tab: TabType, index: number) => {
    setActiveTab(tab);
    setFocusedTabIndex(index);
    setFocusedOptionIndex(0);
    setIsNavigatingTabs(false);
  };

  // Handle back button press
  useEffect(() => {
    const backAction = () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [visible, onClose]);

  // Focus management when modal opens
  useEffect(() => {
    if (visible) {
      // Reset focus to first tab when modal opens
      setFocusedTabIndex(0);
      setFocusedOptionIndex(0);
      setIsNavigatingTabs(true);
      // Focus first tab after a short delay
      setTimeout(() => {
        const firstTab = tabs[0];
        if (firstTab && tabRefs.current[firstTab]) {
          tabRefs.current[firstTab]?.focus?.();
          tabRefs.current[firstTab]?.requestTVFocus?.();
        }
      }, 150);
    }
  }, [visible]);

  // Reset option focus when tab changes
  useEffect(() => {
    if (!visible) return;
    setFocusedOptionIndex(0);
    setIsNavigatingTabs(false);
    // Focus first option when tab changes
    setTimeout(() => {
      const options = getCurrentOptions();
      if (options.length > 0) {
        const firstOption = options[0];
        const optionKey = `${activeTab}-${firstOption.value}`;
        if (optionRefs.current[optionKey]) {
          optionRefs.current[optionKey]?.focus?.();
          optionRefs.current[optionKey]?.requestTVFocus?.();
        }
      }
    }, 150);
  }, [activeTab, visible, getCurrentOptions]);

  // TV Event Handler for navigation
  useTVEventHandler((evt: any) => {
    if (!visible) return;

    const eventType = evt?.eventType;
    const currentOptions = getCurrentOptions();

    // Handle tab navigation (left/right) - only when navigating tabs
    if ((eventType === 'left' || eventType === 'right') && isNavigatingTabs) {
      if (focusedTabIndex !== null) {
        // Navigating tabs
        const newIndex =
          eventType === 'left'
            ? Math.max(0, focusedTabIndex - 1)
            : Math.min(tabs.length - 1, focusedTabIndex + 1);
        setFocusedTabIndex(newIndex);
        const newTab = tabs[newIndex];
        if (newTab && tabRefs.current[newTab]) {
          setTimeout(() => {
            tabRefs.current[newTab]?.focus?.();
            tabRefs.current[newTab]?.requestTVFocus?.();
          }, 50);
        }
      }
      return;
    }

    // Handle option navigation (up/down) - when not navigating tabs
    if ((eventType === 'up' || eventType === 'down') && !isNavigatingTabs) {
      const newIndex =
        eventType === 'up'
          ? Math.max(0, focusedOptionIndex - 1)
          : Math.min(currentOptions.length - 1, focusedOptionIndex + 1);
      setFocusedOptionIndex(newIndex);
      const option = currentOptions[newIndex];
      if (option) {
        const optionKey = `${activeTab}-${option.value}`;
        if (optionRefs.current[optionKey]) {
          setTimeout(() => {
            optionRefs.current[optionKey]?.focus?.();
            optionRefs.current[optionKey]?.requestTVFocus?.();
          }, 50);
        }
      }
      return;
    }

    // Handle down arrow to move from tabs to options
    if (eventType === 'down' && isNavigatingTabs) {
      setIsNavigatingTabs(false);
      setFocusedOptionIndex(0);
      const options = getCurrentOptions();
      if (options.length > 0) {
        const firstOption = options[0];
        const optionKey = `${activeTab}-${firstOption.value}`;
        if (optionRefs.current[optionKey]) {
          setTimeout(() => {
            optionRefs.current[optionKey]?.focus?.();
            optionRefs.current[optionKey]?.requestTVFocus?.();
          }, 50);
        }
      }
      return;
    }

    // Handle up arrow to move from options to tabs
    if (eventType === 'up' && !isNavigatingTabs && focusedOptionIndex === 0) {
      setIsNavigatingTabs(true);
      if (focusedTabIndex !== null) {
        const tab = tabs[focusedTabIndex];
        if (tab && tabRefs.current[tab]) {
          setTimeout(() => {
            tabRefs.current[tab]?.focus?.();
            tabRefs.current[tab]?.requestTVFocus?.();
          }, 50);
        }
      }
      return;
    }

    // Handle select button
    if (eventType === 'select') {
      if (
        isNavigatingTabs &&
        focusedTabIndex !== null &&
        focusedTabIndex >= 0
      ) {
        // Tab is focused, switch to that tab and move to options
        const tab = tabs[focusedTabIndex];
        if (tab) {
          handleTabSelect(tab, focusedTabIndex);
        }
      } else if (
        !isNavigatingTabs &&
        focusedOptionIndex >= 0 &&
        currentOptions[focusedOptionIndex]
      ) {
        // Option is focused, select it
        const option = currentOptions[focusedOptionIndex];
        handleOptionSelect(option.value);
      }
      return;
    }

    // Handle menu/back button to close modal
    if (eventType === 'menu' || eventType === 'longPress') {
      onClose();
      return;
    }
  });

  const renderRadioButton = (
    option: RadioOption,
    isSelected: boolean,
    index: number,
  ) => {
    const optionKey = `${activeTab}-${option.value}`;
    const isFocused = focusedOptionIndex === index;

    return (
      <Pressable
        key={option.value}
        ref={ref => {
          if (ref) {
            optionRefs.current[optionKey] = ref;
          }
        }}
        style={[styles.radioOption, isFocused && styles.radioOptionFocused]}
        onPress={() => {
          handleOptionSelect(option.value);
          setFocusedOptionIndex(index);
        }}
        onFocus={() => setFocusedOptionIndex(index)}
        accessible={true}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={option.label}
        tvFocusable={true}
        hasTVPreferredFocus={isFocused && !isNavigatingTabs}
      >
        <View style={styles.radioButtonContainer}>
          <View
            style={[
              styles.radioButton,
              isSelected && styles.radioButtonSelected,
              isFocused && styles.radioButtonFocused,
            ]}
          >
            {isSelected && <View style={styles.radioButtonInner} />}
          </View>
        </View>
        <Text
          style={[
            styles.optionText,
            isSelected && styles.optionTextSelected,
            isFocused && styles.optionTextFocused,
          ]}
        >
          {option.label}
        </Text>
      </Pressable>
    );
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <BlurView
          style={styles.modalContent}
          blurType="dark"
          blurAmount={40}
          blurRadius={10}
        >
          <Pressable
            style={styles.modalContent}
            onPress={e => e.stopPropagation()}
          >
            {/* Screen Container */}
            <View style={styles.screenContainer}>
              {/* Tabs Header */}
              <TVFocusGuideView style={styles.tabsContainer} autoFocus={false}>
                <View style={styles.tabsRow}>
                  {tabs.map((tab, index) => {
                    const isFocused = focusedTabIndex === index;
                    return (
                      <Pressable
                        key={tab}
                        ref={ref => {
                          if (ref) {
                            tabRefs.current[tab] = ref;
                          }
                        }}
                        style={[styles.tab, isFocused && styles.tabFocused]}
                        onPress={() => handleTabSelect(tab, index)}
                        onFocus={() => setFocusedTabIndex(index)}
                        accessible={true}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: activeTab === tab }}
                        tvFocusable={true}
                        hasTVPreferredFocus={
                          index === 0 && visible && isNavigatingTabs
                        }
                      >
                        <Text
                          style={[
                            styles.tabText,
                            activeTab === tab && styles.tabTextActive,
                            isFocused && styles.tabTextFocused,
                          ]}
                        >
                          {tab}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {/* Divider */}
                <View style={styles.divider} />
              </TVFocusGuideView>

              {/* Options List */}
              <ScrollView
                style={styles.optionsContainer}
                contentContainerStyle={styles.optionsContent}
                showsVerticalScrollIndicator={false}
              >
                <TVFocusGuideView
                  style={styles.optionsFocusGuide}
                  autoFocus={true}
                >
                  {getCurrentOptions().map((option, index) => {
                    const isSelected = getSelectedValue() === option.value;
                    return renderRadioButton(option, isSelected, index);
                  })}
                </TVFocusGuideView>
              </ScrollView>
            </View>
          </Pressable>
        </BlurView>
      </Pressable>
    </Modal>
  );
  },
);

SettingsModal.displayName = 'SettingsModal';

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingBottom: moderateScale(200),
    paddingRight: moderateScale(59),
    zIndex: 10,
  },
  modalContent: {
    width: moderateScale(407),
    height: moderateScale(456),
    borderRadius: moderateScale(8),
    overflow: 'hidden',
    zIndex: 10,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: moderateScale(8),
    paddingVertical: moderateScale(20),
    // Backdrop blur effect (iOS)
    ...(Platform.OS === 'ios' && {
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    }),
  },
  tabsContainer: {
    alignItems: 'center',
    gap: moderateScale(3),
    paddingHorizontal: moderateScale(32),
  },
  tabsRow: {
    flexDirection: 'row',
    gap: moderateScale(32),
    width: '100%',
  },
  tab: {
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(4),
  },
  tabFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: moderateScale(4),
  },
  tabText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(18),
    lineHeight: moderateScale(26),
    color: '#818286',
  },
  tabTextActive: {
    color: CommonColors.white,
  },
  tabTextFocused: {
    color: CommonColors.white,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.19)',
    marginTop: moderateScale(3),
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: moderateScale(32),
    paddingTop: moderateScale(8),
  },
  optionsContent: {
    gap: moderateScale(20),
    paddingBottom: moderateScale(20),
  },
  optionsFocusGuide: {
    gap: moderateScale(20),
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(22),
    paddingVertical: moderateScale(4),
    paddingHorizontal: moderateScale(4),
    borderRadius: moderateScale(4),
  },
  radioOptionFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  radioButtonContainer: {
    width: moderateScale(20),
    height: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButton: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: '#818286',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#6155F5',
  },
  radioButtonFocused: {
    borderColor: CommonColors.white,
    borderWidth: 2,
  },
  radioButtonInner: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: '#6155F5',
  },
  optionText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(16),
    lineHeight: moderateScale(22.4),
    color: '#D6D9DD',
  },
  optionTextSelected: {
    color: '#D6D9DD',
  },
  optionTextFocused: {
    color: CommonColors.white,
  },
});

export default SettingsModal;
