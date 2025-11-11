import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  Pressable,
  FlatList,
  BackHandler,
  Platform,
  useTVEventHandler,
  TVFocusGuideView,
  Image,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {moderateScale, scale, verticalScale} from '../../styles/scaling';
import {CommonColors} from '../../styles/Colors';
import FontFamily from '../../constants/FontFamily';
import imagepath from '../../constants/imagepath';
import {getEpisodeAndSeasonNumber} from '../../utils/CommonFunctions';

interface EpisodeModalProps {
  visible: boolean;
  onClose: () => void;
  episodes: any[];
  currentEpisodeUrl?: string;
  onEpisodeSelect?: (episode: any) => void;
}

const EpisodeModal: React.FC<EpisodeModalProps> = ({
  visible,
  onClose,
  episodes,
  currentEpisodeUrl,
  onEpisodeSelect,
}) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const episodeRefs = useRef<{[key: number]: any}>({});

  // Find current episode index
  const currentEpisodeIndex = episodes.findIndex(
    ep => ep.url === currentEpisodeUrl,
  );

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
      // Focus current episode or first episode
      const initialIndex = currentEpisodeIndex >= 0 ? currentEpisodeIndex : 0;
      setFocusedIndex(initialIndex);
      setTimeout(() => {
        if (episodeRefs.current[initialIndex]) {
          episodeRefs.current[initialIndex]?.focus?.();
          episodeRefs.current[initialIndex]?.requestTVFocus?.();
        }
      }, 150);
    }
  }, [visible, currentEpisodeIndex]);

  // TV Event Handler for navigation
  useTVEventHandler((evt: any) => {
    if (!visible) return;

    const eventType = evt?.eventType;

    // Handle up/down navigation
    if (eventType === 'up' || eventType === 'down') {
      const newIndex =
        eventType === 'up'
          ? Math.max(0, focusedIndex - 1)
          : Math.min(episodes.length - 1, focusedIndex + 1);
      setFocusedIndex(newIndex);
      if (episodeRefs.current[newIndex]) {
        setTimeout(() => {
          episodeRefs.current[newIndex]?.focus?.();
          episodeRefs.current[newIndex]?.requestTVFocus?.();
        }, 50);
      }
      return;
    }

    // Handle select button
    if (eventType === 'select') {
      if (episodes[focusedIndex]) {
        onEpisodeSelect?.(episodes[focusedIndex]);
        onClose();
      }
      return;
    }

    // Handle menu/back button to close modal
    if (eventType === 'menu' || eventType === 'longPress') {
      onClose();
      return;
    }
  });

  // Calculate unique seasons count
  const getSeasonsCount = () => {
    const seasons = new Set();
    episodes.forEach(ep => {
      const seasonMatch = (ep.title || ep.name || '').match(/S(\d+)/i);
      if (seasonMatch) {
        seasons.add(seasonMatch[1]);
      } else {
        seasons.add('1'); // Default to season 1 if no season info
      }
    });
    return seasons.size;
  };

  const renderEpisodeItem = ({item, index}: {item: any; index: number}) => {
    const isFocused = focusedIndex === index;
    // const isCurrentEpisode = item.url === currentEpisodeUrl;
    const isCurrentEpisode = false;
    const episodeTitle = item.title || item.name || `Episode ${index + 1}`;
    const episodeNumber = `${index + 1}. ${episodeTitle}`;
    const episodeDescription =
      item?.info?.description || item?.description || item?.overview || '';

    return (
      <Pressable
        ref={ref => {
          episodeRefs.current[index] = ref;
        }}
        style={[
          styles.episodeItem,
          isFocused && styles.episodeItemFocused,
          isCurrentEpisode && styles.episodeItemCurrent,
        ]}
        onPress={() => {
          onEpisodeSelect?.(item);
          onClose();
        }}
        onFocus={() => setFocusedIndex(index)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Episode ${index + 1}: ${episodeTitle}`}
        tvFocusable={true}>
        <Image
          source={
            item?.info?.movie_image
              ? {uri: item.info.movie_image}
              : imagepath.VideoPlaceHolder
          }
          style={styles.episodeImage}
        />
        <View style={styles.episodeInfo}>
          <View style={styles.episodeTextContainer}>
            <Text
              style={[
                styles.episodeTitle,
                isFocused && styles.episodeTitleFocused,
              ]}
              numberOfLines={1}>
              {episodeNumber}
            </Text>
            {episodeDescription ? (
              <Text
                style={[
                  styles.episodeDescription,
                  isFocused && styles.episodeDescriptionFocused,
                ]}
                numberOfLines={2}>
                {episodeDescription}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.blurContainer}>
          <View style={styles.modalContainer}>
            <TVFocusGuideView style={styles.header}>
              <Text style={styles.headerTabActive}>
                Episodes({episodes.length})
              </Text>
              {/* <Text style={styles.headerTabInactive}>
                Seasons({getSeasonsCount()})
              </Text> */}
            </TVFocusGuideView>

            <TVFocusGuideView style={styles.content}>
              <FlatList
                data={episodes}
                renderItem={renderEpisodeItem}
                keyExtractor={(item, index) => `episode-${index}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                initialScrollIndex={
                  currentEpisodeIndex >= 0 ? currentEpisodeIndex : 0
                }
                getItemLayout={(data, index) => {
                  // Calculate item height based on whether it has description
                  const hasDescription =
                    episodes[index]?.info?.description ||
                    episodes[index]?.description ||
                    episodes[index]?.overview;
                  const itemHeight = hasDescription
                    ? moderateScale(109)
                    : moderateScale(80);
                  let offset = 0;
                  for (let i = 0; i < index; i++) {
                    const prevHasDescription =
                      episodes[i]?.info?.description ||
                      episodes[i]?.description ||
                      episodes[i]?.overview;
                    offset += prevHasDescription
                      ? moderateScale(109)
                      : moderateScale(80);
                  }
                  return {
                    length: itemHeight,
                    offset: offset,
                    index,
                  };
                }}
                onScrollToIndexFailed={() => {
                  // Handle scroll failure gracefully
                }}
              />
            </TVFocusGuideView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: 'transparent',
  },
  blurContainer: {
    width: moderateScale(480),
    height: moderateScale(500),
    borderRadius: moderateScale(8),
    overflow: 'hidden',
    position: 'absolute',
    bottom: 150,
    // left: 0,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContainer: {
    flex: 1,
    // paddingVertical: moderateScale(20),
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(32),
    marginBottom: moderateScale(14),
    paddingVertical: moderateScale(10),
    gap: moderateScale(32),
  },

  headerTabActive: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(30),
    color: CommonColors.white,
    // lineHeight: scale(26),
  },
  headerTabInactive: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(30),
    color: '#818286',
  },
  closeButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: CommonColors.white,
    fontSize: scale(24),
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.19)',
    marginBottom: moderateScale(20),
  },
  content: {
    // flex: 1,
  },
  listContent: {
    paddingHorizontal: 0,
    paddingBottom:100,
  },
  episodeItem: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: moderateScale(12),
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(32),
    borderWidth: 0,
    minHeight: moderateScale(80),
  },
  episodeItemFocused: {
    borderWidth: 2,
    borderColor: CommonColors.white,
    borderRadius: moderateScale(4),
  },
  episodeItemCurrent: {
    borderWidth: 2,
    borderColor: '#7300FF',
  },
  episodeImage: {
    width: moderateScale(124),
    height: '100%',
    minHeight: moderateScale(80),
    borderRadius: moderateScale(4),
    resizeMode: 'cover',
  },
  episodeInfo: {
    flex: 1,
    justifyContent: 'center',
    width: moderateScale(240),
  },
  episodeTextContainer: {
    gap: moderateScale(2),
  },
  episodeTitle: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(28),
    color: '#E6E7EA',
    // lineHeight: scale(22.4),
  },
  episodeTitleFocused: {
    fontFamily: FontFamily.PublicSans_SemiBold,
  },
  episodeDescription: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(14),
    color: '#818286',
    lineHeight: scale(19.6),
    marginTop: moderateScale(2),
  },
  episodeDescriptionFocused: {
    color: '#818286',
  },
});

export default EpisodeModal;
