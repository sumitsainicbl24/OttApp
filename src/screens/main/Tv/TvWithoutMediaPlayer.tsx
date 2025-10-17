import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  StatusBar,
  useTVEventHandler,
  View,
} from 'react-native';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import CategoryList from '../../../components/CategoryList';
import ChannelMediaPlayer from '../../../components/ChannelMediaPlayer';
import MainLayout from '../../../components/MainLayout';
import ShowChannelCatCarousel from '../../../components/ShowChannelCatCarousel';
import imagepath from '../../../constants/imagepath';
import {MainStackParamList} from '../../../navigation/NavigationsTypes';
import {getCategoryData} from '../../../redux/actions/auth';
import {RootState} from '../../../redux/store';
import {CommonColors} from '../../../styles/Colors';
import {debounce} from '../../../utils/CommonFunctions';
import {clearEPGCaches} from '../../../utils/epgUtils';
import {styles} from './TvwithoutPlayerStyles';
import {height} from '../../../styles/scaling';
import {setCurrentlyPlaying} from '../../../redux/reducers/main';
import TvGuideCarousel from '../../../components/TvGuideCarousel';

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

const TvWithoutMediaPlayer = ({
  channelData,
  handleBlockPress,
}: {
  channelData: channelData;
  handleBlockPress: (show: any) => void;
}) => {
  const {channelsData} = useSelector(
    (state: RootState) => state.rootReducer.auth,
  );
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const dispatch = useDispatch();

  const [showCategoryAndSidebar, setShowCategoryAndSidebar] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(0);
  const [selectedCategoryData, setSelectedCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedCategory(channelData?.category_id);
  }, []);

  const handleScrollViewFocus = () => {
    setShowCategoryAndSidebar(false);
  };

  const handleCategoryListFocus = useCallback((category: number) => {
    setLoading(true);
    setShowCategoryAndSidebar(true);
    setSelectedCategory(category);
    clearEPGCaches();
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
      !showCategoryAndSidebar && {width: 0, overflow: 'hidden' as const},
    ];
  }, [showCategoryAndSidebar]);

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

  return (
    <View style={{flex: 1, backgroundColor: 'transparent'}}>
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="light-content"
      />

      <View style={styles.container}>
        <View style={categoryListContainerStyle} nativeID="categoryList">
          <CategoryList
            categories={memorizeChannelsData}
            selectedCategory={memorizeSelectedCategory}
            onFocus={handleCategoryListFocus}
            style={{backgroundColor: 'transparent'}}
          />
        </View>

        <View>
          <View style={styles.scrollContainer}>
            <View style={styles.showChannelCatCarouselContainer}>
              <TvGuideCarousel
                title={`${selectedCategory}`}
                channels={selectedCategoryData}
                onFocus={handleScrollViewFocus}
                loading={loading}
                onChannelPress={handleBlockPress}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TvWithoutMediaPlayer;
