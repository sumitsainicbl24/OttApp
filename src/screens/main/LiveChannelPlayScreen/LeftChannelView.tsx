import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  StatusBar,
  Text,
  TVFocusGuideView,
  useTVEventHandler,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import CategoryList from '../../../components/CategoryList';
import {getCategoryData} from '../../../redux/actions/auth';
import {RootState} from '../../../redux/store';
import {moderateScale} from '../../../styles/scaling';
import {debounce} from '../../../utils/CommonFunctions';
import {decodeEPGTitle} from '../../../utils/epgUtils';
import EPGList from './EPGList';
import LeftChannelItem from './LeftChannelItem';
import {styles} from './LeftChannelViewStyles';
import ProgramDescriptionBox from './ProgramDescriptionBox';
import {CommonColors} from '../../../styles/Colors';
import LinearGradient from 'react-native-linear-gradient';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

// Layer system
type LayerIndex = 1 | 2; // Layer 1: category+channel, Layer 2: channel+epg
type FocusIndex = 0 | 1; // 0: left list, 1: right list

export interface channelData {
  num: number;
  name: string;
  stream_type: string;
  stream_id: number;
  stream_icon: string;
  epg_channel_id: string;
  added: string;
  is_adult: number;
  category_id: string;
  category_ids: number[];
  custom_sid: string;
  tv_archive: number;
  direct_source: string;
  tv_archive_duration: number;
  title: string;
  logo: string;
  group: string;
  url: string;
  epg: Epg[];
  type: string;
}

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

const LeftChannelView = ({
  channelData,
  handleBlockPress,
}: {
  channelData: channelData;
  handleBlockPress: (show: any) => void;
}) => {
  const {channelsData} = useSelector(
    (state: RootState) => state.rootReducer.auth,
  );

  const [layerIndex, setLayerIndex] = useState<LayerIndex>(1);
  const [focusIndex, setFocusIndex] = useState<FocusIndex>(0);
  const [selectedCategory, setSelectedCategory] = useState<any>(0);
  const [selectedCategoryData, setSelectedCategoryData] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [showProgramDescription, setShowProgramDescription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>('');
  const channelListRef = useRef<FlatList>(null);
  const categoryListRef = useRef<FlatList>(null);
  const epgListRef = useRef<FlatList>(null);
  useEffect(() => {
    setSelectedCategory(channelData?.category_id);
  }, []);

  const handleLeftNavigation = useCallback(() => {
    if (focusIndex === 0 && layerIndex === 2) {
      setLayerIndex(1);
      setFocusIndex(1);
      return;
    } else if (focusIndex === 0 && layerIndex === 1) {
      setFocusIndex(0);
      return;
    }
    setShowProgramDescription(false);
  }, [layerIndex, focusIndex]);

  const handleRightNavigation = useCallback(() => {
    if (focusIndex === 0) {
      setFocusIndex(1);
    } else if (focusIndex === 1 && layerIndex === 1) {
      setLayerIndex(2);
      setFocusIndex(0);
    } else if (focusIndex === 1 && layerIndex === 2) {
    }
  }, [layerIndex, focusIndex]);

  // TV Event Handler for navigation
  useTVEventHandler((evt: any) => {
    if (evt?.eventType === 'focus') {
      return;
    }

    if (evt?.eventType === 'blur') {
      return;
    }

    if (evt?.eventType === 'select') {
      return;
    }

    if (evt?.eventType === 'longSelect') {
      return;
    }

    // Handle left/right navigation
    if (evt?.eventType === 'left') {
      handleLeftNavigation();
      return;
    }

    if (evt?.eventType === 'right') {
      handleRightNavigation();
      return;
    }
  });

  const handleCategoryListFocus = useCallback(
    (category: number, categoryName: string) => {
      setLoading(true);
      setSelectedCategory(category);
      setCategoryName(categoryName);
      setSelectedCategoryData([]);
    },
    [],
  );

  const memorizeChannelsData = useMemo(() => {
    return Object.values(channelsData) as any[];
  }, [channelsData]);

  const memorizeSelectedCategory = useMemo(() => {
    return selectedCategory;
  }, [selectedCategory]);

  const getMovieData = async (category: string) => {
    try {
      setLoading(true);
      const res = await getCategoryData('live', category);
      const movieData = res?.data?.data?.data?.channels;
      console.log('movieData--->>>>>', movieData);
      if (movieData && movieData.length > 0) {
        const processedChannels = movieData.map((channel: any) => {
          if (
            channel.epg &&
            Array.isArray(channel.epg) &&
            channel.epg.length > 0
          ) {
            return {
              ...channel,
              epg: channel.epg,
            };
          }
          return channel; // Return original object to avoid unnecessary re-renders
        });
        setSelectedCategoryData(processedChannels);
      } else {
        setSelectedCategoryData([]);
      }
    } catch (error) {
      console.error('Error fetching movie data:', error);
      setSelectedCategoryData([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedGetMovieData = useCallback(
    debounce((category: string) => {
      getMovieData(category);
    }, 500),
    [],
  );

  useEffect(() => {
    if (selectedCategory) {
      debouncedGetMovieData(selectedCategory);
    }
  }, [selectedCategory, debouncedGetMovieData]);

  const renderChannelItem = useCallback(
    ({item}: {item: channelData}) => {
      const isFocused = selectedChannel === item;
      const currentProgram = item?.epg?.[0]?.title
        ? decodeEPGTitle(item.epg[0].title)
        : 'No information';

      return (
        <LeftChannelItem
          item={item}
          isFocused={isFocused}
          currentProgram={currentProgram}
          onPress={handleBlockPress}
          onItemFocus={setSelectedChannel}
        />
      );
    },
    [selectedChannel, handleBlockPress],
  );

  const handleProgramFocus = useCallback((program: any) => {
    setSelectedProgram(program);
    setShowProgramDescription(true);
  }, []);

  const handleProgramBlur = useCallback(() => {
    setShowProgramDescription(false);
  }, []);
  return (
    <View style={{flex: 1, backgroundColor: 'transparent'}}>
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="light-content"
      />

      <View style={[styles.container, {width: screenWidth - 300}]}>
        {/* Layer 1: Category + Channel */}
        {layerIndex === 1 && (
          <View style={styles.sideBySideContainer}>
            {/* Category List */}
            <View
              style={styles.categoryListContainer}
              onFocus={() => setFocusIndex(0)}>
              <CategoryList
                categories={memorizeChannelsData}
                selectedCategory={memorizeSelectedCategory}
                onFocus={handleCategoryListFocus}
                style={{backgroundColor: 'transparent'}}
              />
            </View>
          </View>
        )}

        <TVFocusGuideView
          autoFocus={true}
          // enabled={layerIndex === 1 ? focusIndex === 1 : focusIndex === 0}
          style={styles.channelListContainer}
          onFocus={() => setFocusIndex(layerIndex === 1 ? 1 : 0)}>
          <>
            <View style={{paddingVertical: moderateScale(16)}}>
              <Text style={styles.categoryListTitleChannel}>
                {categoryName}
              </Text>
            </View>
            <View style={styles.dividerLineTitle} />
            <FlatList
              ref={channelListRef}
              data={selectedCategoryData}
              renderItem={renderChannelItem}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={10}
              updateCellsBatchingPeriod={50}
            />
          </>
        </TVFocusGuideView>

        {/* Layer 2: Channel + EPG */}
        {layerIndex === 2 && (
          <View
            style={{
              ...styles.sideBySideContainer,
              backgroundColor: 'transparent',
            }}>
            {/* EPG List */}
            <TVFocusGuideView
              enabled={layerIndex === 2}
              style={styles.epgListContainer}
              onFocus={() => setFocusIndex(1)}
              onBlur={() => {}}>
              <LinearGradient
                colors={[
                  'rgba(19, 23, 27, 0.8)',
                  'rgba(19, 23, 27, 0.8)',
                  'rgba(19, 23, 27, 0.7)',
                  'rgba(19, 23, 27, 0.6)',
                 'rgba(19, 23, 27, 0.5)',
                 'transparent',
                 'transparent',


                ]}
                start={{x: 0, y: 1}}
                end={{x: 1, y: 1}}
                style={{flex: 1}}>
                <EPGList
                  epgData={selectedChannel?.epg || []}
                  selectedProgram={selectedProgram}
                  onProgramFocus={handleProgramFocus}
                  onProgramBlur={handleProgramBlur}
                  channelName={selectedChannel?.name || 'No Channel Selected'}
                />
              </LinearGradient>
            </TVFocusGuideView>
          </View>
        )}
      </View>

      {/* Program Description Box */}
      <ProgramDescriptionBox
        program={selectedProgram}
        channelName={selectedChannel?.name || ''}
        channelLogo={selectedChannel?.logo}
        visible={showProgramDescription && layerIndex === 2 && focusIndex === 1}
      />
    </View>
  );
};

export default LeftChannelView;
