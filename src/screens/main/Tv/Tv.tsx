import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  StatusBar,
  useTVEventHandler,
  View,
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
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
import {styles} from './styles';

type TvScreenRouteProp = RouteProp<MainStackParamList, 'Tv'>;

const Tv = () => {
  const route = useRoute<TvScreenRouteProp>();
  const {channelsData} = useSelector(
    (state: RootState) => state.rootReducer.auth,
  );
  const {activeScreen} = route.params;
  const [showCategoryAndSidebar, setShowCategoryAndSidebar] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<any>(0);
  const [selectedCategoryData, setSelectedCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState<string>('');

  useEffect(() => {
    setSelectedCategory(channelsData[0]?.category_id);
  }, []);

  const handleScrollViewFocus = () => {
    setShowCategoryAndSidebar(false);
  };

  const handleCategoryListFocus = useCallback((category: number) => {
    setShowCategoryAndSidebar(true);
    setSelectedCategory(category);
  }, []);

  const handleChannelUrl = (url: string) => {
    setStreamUrl(url);
  };

  const memorizeChannelsData = useMemo(() => {
    return Object.values(channelsData) as any[];
  }, [channelsData]);

  const memorizeSelectedCategory = useMemo(() => {
    return selectedCategory;
  }, [selectedCategory]);

  const memorizeStreamUrl = useMemo(() => {
    return streamUrl;
  }, [streamUrl]);

  const getMovieData = async (category: string) => {
    try {
      const res = await getCategoryData('live', category);
      const movieData = res?.data?.data?.data?.channels;
      if (movieData && movieData.length > 0) {
        setSelectedCategoryData(movieData);
      }
    } catch (error) {
      console.error('Error fetching movie data:', error);
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
    <MainLayout
      activeScreen={activeScreen || 'Movies'}
      hideSidebar={!showCategoryAndSidebar}>
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
          />
        </View>

        <View>
          <ChannelMediaPlayer
            imageSource={imagepath.TvDemoImage}
            showTitle="No Information"
            timeSlot="02:00 - 03:00PM"
            progressPercentage={65}
            duration="26 min"
            streamUrl={memorizeStreamUrl}
            loading={loading}
          />
          <View style={styles.scrollContainer}>
            <View style={styles.showChannelCatCarouselContainer}>
              {(selectedCategory && channelsData) ||
              selectedCategoryData.length > 0 ? (
                <ShowChannelCatCarousel
                  title={`${selectedCategory}`}
                  data={selectedCategoryData}
                  onFocus={handleScrollViewFocus}
                  type="channels"
                  setChannelUrl={handleChannelUrl}
                />
              ) : (
                <ActivityIndicator size="large" color={CommonColors.white} />
              )}
            </View>
          </View>
        </View>
      </View>
    </MainLayout>
  );
};

export default Tv;
