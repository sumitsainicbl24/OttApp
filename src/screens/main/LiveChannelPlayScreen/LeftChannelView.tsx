import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  StatusBar,
  TVFocusGuideView,
  useTVEventHandler,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import CategoryList from '../../../components/CategoryList';
import {MainStackParamList} from '../../../navigation/NavigationsTypes';
import {getCategoryData} from '../../../redux/actions/auth';
import {setCurrentlyPlaying} from '../../../redux/reducers/main';
import {RootState} from '../../../redux/store';
import {debounce} from '../../../utils/CommonFunctions';
import {decodeEPGTitle} from '../../../utils/epgUtils';
import LeftChannelItem from './LeftChannelItem';
import EPGList from './EPGList';
import ProgramDescriptionBox from './ProgramDescriptionBox';
import {styles} from './LeftChannelViewStyles';
import { CommonColors } from '../../../styles/Colors';

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

type TvScreenRouteProp = RouteProp<MainStackParamList, 'Tv'>;

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
  const channelListRef = useRef<FlatList>(null);
  const categoryListRef = useRef<FlatList>(null);
  const epgListRef = useRef<FlatList>(null);
  useEffect(() => {
    setSelectedCategory(channelData?.category_id);
  }, []);

  const handleLeftNavigation = useCallback(() => {
    console.log('Left navigation pressed, layer:', layerIndex, 'focus:', focusIndex);
    
    if (focusIndex === 0 && layerIndex === 2) {
      // From channel list in layer 2, go back to layer 1
      setLayerIndex(1);
      setFocusIndex(1); // Focus on channel list in layer 1
      console.log('Going back to layer 1, focusing on channel list');
      return;
    }
    
    if (focusIndex === 0) {
      // Already at left list, do nothing
      console.log('Already at left list');
      return;
    }
    
    // Move focus to left list
    setFocusIndex(0);
    setShowProgramDescription(false);
  }, [layerIndex, focusIndex]);

  const handleRightNavigation = useCallback(() => {
    console.log('Right navigation pressed, layer:', layerIndex, 'focus:', focusIndex);
    
    if (focusIndex === 0) {
      // Move focus to right list
      setFocusIndex(1);
      console.log('Moving focus to right list');
    } else if (focusIndex === 1 && layerIndex === 1) {
      // From channel list in layer 1, switch to layer 2
      setLayerIndex(2);
      setFocusIndex(0); // Focus on channel list in layer 2
      console.log('Switching to layer 2, focusing on channel list');
    } else if (focusIndex === 1 && layerIndex === 2) {
      // Already at right list in layer 2, do nothing
      console.log('Already at right list in layer 2');
    }
  }, [layerIndex, focusIndex]);

  // TV Event Handler for navigation
  useTVEventHandler((evt: any) => {
    console.log('TV Event:', evt?.eventType, 'Layer:', layerIndex, 'Focus:', focusIndex);
    
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

  const handleCategoryListFocus = useCallback((category: number) => {
    setLoading(true);
    setSelectedCategory(category);
    setSelectedCategoryData([]);
  }, []);

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

  const categoryListContainerStyle = React.useMemo(() => {
    return [
      styles.categoryListContainer,
      layerIndex !== 1 && {width: 0, overflow: 'hidden' as const},
    ];
  }, [layerIndex]);

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

  const handleCategoryListBlur = useCallback(() => {
    channelListRef?.current?.scrollToOffset({
      offset: 0,
      animated: true,
    });
  }, []);


  const handleProgramSelect = useCallback((program: any) => {
    // Handle program selection if needed
    console.log('Program selected:', program);
  }, []);

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


      <View style={[styles.container, {width: screenWidth - 400}]}>
        {/* Layer 1: Category + Channel */}
        {layerIndex === 1 && (
          <View style={styles.sideBySideContainer}>
            {/* Category List */}
            <TVFocusGuideView
              autoFocus={focusIndex === 0}
              style={styles.categoryListContainer}
              onFocus={() => setFocusIndex(0)}
              onBlur={() => {}}>
              <CategoryList
                categories={memorizeChannelsData}
                selectedCategory={memorizeSelectedCategory}
                onFocus={handleCategoryListFocus}
                onBlur={handleCategoryListBlur}
                
              />
            </TVFocusGuideView>

            {/* Channel List */}
            <TVFocusGuideView
              autoFocus={focusIndex === 1}
              style={styles.channelListContainer}
              onFocus={() => setFocusIndex(1)}
              onBlur={() => {}}>
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
            </TVFocusGuideView>
          </View>
        )}

        {/* Layer 2: Channel + EPG */}
        {layerIndex === 2 && (
          <View style={styles.sideBySideContainer}>
            {/* Channel List */}
            <TVFocusGuideView
              autoFocus={focusIndex === 0}
              style={styles.channelListContainer}
              onFocus={() => setFocusIndex(0)}
              onBlur={() => {}}>
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
            </TVFocusGuideView>

            {/* EPG List */}
            <TVFocusGuideView
              autoFocus={focusIndex === 1}
              style={styles.epgListContainer}
              onFocus={() => setFocusIndex(1)}
              onBlur={() => {}}>
              <EPGList
                epgData={selectedChannel?.epg || []}
                selectedProgram={selectedProgram}
                onProgramSelect={handleProgramSelect}
                onProgramFocus={handleProgramFocus}
                onProgramBlur={handleProgramBlur}
                channelName={selectedChannel?.name || 'No Channel Selected'}
              />
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
