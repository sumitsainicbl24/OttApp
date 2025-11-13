import { memo, useCallback, useMemo } from 'react';
import { FlatList, Pressable, Text, TVFocusGuideView, View } from 'react-native';
import { decodeEPGTitle } from '../../../utils/epgUtils';
import { styles } from './LeftChannelViewStyles';

export interface Epg {
  id: string;
  epg_id: string;
  title: string;
  lang: string;
  start: string;
  end: string;
  description: string;
  channel_id: string;
  start_timestamp: string;
  stop_timestamp: string;
  now_playing: number;
  has_archive: number;
}

interface EPGListProps {
  epgData: Epg[];
  selectedProgram: Epg | null;
  onProgramSelect?: (program: Epg) => void;
  onProgramFocus: (program: Epg) => void;
  onProgramBlur?: () => void;
  channelName: string;
}

// Helper function to format time
const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

// Helper function to decode channel name
const decodeChannelName = (encodedName: string): string => {
  try {
    // Check if it looks like base64 encoded
    if (encodedName && /^[A-Za-z0-9+/=]+$/.test(encodedName)) {
      return atob(encodedName);
    }
    return encodedName;
  } catch (error) {
    return encodedName;
  }
};

// Helper function to check if program is currently playing
const isCurrentlyPlaying = (program: Epg): boolean => {
  const now = new Date();
  const startTime = new Date(program.start);
  const endTime = new Date(program.end);
  return now >= startTime && now <= endTime;
};

const EPGList = memo<EPGListProps>(
  ({
    epgData,
    selectedProgram,
    onProgramSelect,
    onProgramFocus,
    onProgramBlur,
    channelName,
  }) => {
    const renderProgramItem = useCallback(
      ({item}: {item: Epg}) => {
        const isFocused = selectedProgram?.id === item.id;
        const isPlaying = isCurrentlyPlaying(item);
        const startTime = formatTime(item.start);
        const endTime = formatTime(item.end);
        const title = decodeEPGTitle(item.title);

        return (
          <Pressable
            accessible={true}
            accessibilityRole="button"
            onFocus={() => onProgramFocus(item)}
            onPress={() => onProgramSelect?.(item)}
            style={[styles.epgProgramItem]}>
            <View style={styles.epgProgramContent}>
              <Text
                style={[
                  styles.epgProgramTime,
                  isFocused && styles.epgProgramItemFocused,
                ]}
                numberOfLines={1}>
                {startTime}
                {'   '}
                {title}
              </Text>

              {isPlaying && (
                <View>
                  <Text style={styles.epgLiveText}> </Text>
                </View>
              )}
            </View>
          </Pressable>
        );
      },
      [selectedProgram, onProgramFocus, onProgramSelect],
    );

    const epgListData = useMemo(() => {
      if (!epgData || epgData.length === 0) {
        return [];
      }
      return epgData.sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
    }, [epgData]);

    if (!epgData || epgData.length === 0) {
      return (
        <View style={styles.epgListContainer}>
          <Text style={styles.epgListTitle}>
            {decodeChannelName(channelName)}
          </Text>
          <View style={styles.epgEmptyContainer}>
            <Text style={styles.epgEmptyText}>
              No program information available
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.epgListContainer}>
        <Text style={styles.epgListTitle}>
          {decodeChannelName(channelName)}
        </Text>
        <TVFocusGuideView style={styles.epgListContent} onBlur={onProgramBlur}>
          <FlatList
            data={epgListData}
            renderItem={renderProgramItem}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={10}
            updateCellsBatchingPeriod={50}
            keyExtractor={item => item.id}
          />
        </TVFocusGuideView>
      </View>
    );
  },
);

EPGList.displayName = 'EPGList';

export default EPGList;
