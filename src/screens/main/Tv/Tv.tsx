import {RouteProp, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StatusBar, TVFocusGuideView, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSelector} from 'react-redux';
import CategoryList from '../../../components/CategoryList';
import ChannelMediaPlayer from '../../../components/ChannelMediaPlayer';
import MainLayout from '../../../components/MainLayout';
import ShowChannelCatCarousel from '../../../components/ShowChannelCatCarousel';
import imagepath from '../../../constants/imagepath';
import {MainStackParamList} from '../../../navigation/NavigationsTypes';
import {getCategoryData} from '../../../redux/actions/auth';
import {RootState} from '../../../redux/store';
import {debounce} from '../../../utils/CommonFunctions';
import {clearEPGCaches} from '../../../utils/epgUtils';
import {styles} from './styles';
import {CommonColors} from '../../../styles/Colors';

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
  const [currentProgramDetails, setCurrentProgramDetails] = useState<{
    showTitle: string;
    timeSlot: string;
    progressPercentage: number;
    duration: string;
    description: string;
  }>({
    showTitle: 'No Information',
    timeSlot: '02:00 - 03:00PM',
    progressPercentage: 0,
    duration: '26 min',
    description: 'No description available',
  });

  useEffect(() => {
    setSelectedCategory(channelsData[0]?.category_id);
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

  const handleChannelUrl = (url: string) => {
    setStreamUrl(url);
  };

  const handleProgramDetails = (details: {
    showTitle: string;
    timeSlot: string;
    progressPercentage: number;
    duration: string;
    description: string;
  }) => {
    console.log('details', details);
    setCurrentProgramDetails(details);
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

  // Get category name from category ID
  const getCategoryName = useCallback(
    (categoryId: any) => {
      if (!channelsData || !categoryId) return 'Unknown Category';

      // Find the category in channelsData
      const category = Object.values(channelsData).find(
        (cat: any) =>
          cat.category_id === categoryId ||
          cat.category_id === String(categoryId),
      ) as any;

      return category?.category_name || 'Unknown Category';
    },
    [channelsData],
  );

  // Memoize the selected category name
  const selectedCategoryName = useMemo(() => {
    return getCategoryName(selectedCategory);
  }, [selectedCategory, getCategoryName]);

  const getMovieData = async (category: string) => {
    try {
      setLoading(true);
      const res = await getCategoryData('live', category);
      const movieData = res?.data?.data?.data?.channels;
      if (movieData && movieData.length > 0) {
        // Optimized processing - only process channels that actually have EPG data
        const processedChannels = movieData.map((channel: any) => {
          // Only create new object if EPG data exists, otherwise return original
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
        // Set empty array if no data
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

  const [isFocused, setIsFocused] = useState(false);

  return (
    <MainLayout
      activeScreen={activeScreen || 'Movies'}
      hideSidebar={!showCategoryAndSidebar}
      setIsFocused={setIsFocused}>
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="light-content"
      />

      {isFocused && (
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 1)',
            'rgba(0, 0, 0, 1)',
            'rgba(0, 0, 0, 1)',
            'rgba(0, 0, 0, 0.9)',
            'rgba(0, 0, 0, 0.7)',
            'rgba(0, 0, 0, 0.5)',
            'rgba(0, 0, 0, 0.3)',
            'rgba(0, 0, 0, 0.1)',
            'transparent',
            'transparent',
          ]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.homeGradientFocused}
        />
      )}

      <View style={styles.container}>
        <TVFocusGuideView
          style={categoryListContainerStyle}
          nativeID="categoryList"
          autoFocus>
          <CategoryList
            categories={memorizeChannelsData}
            selectedCategory={memorizeSelectedCategory}
            onFocus={handleCategoryListFocus}
            style={{
              borderRightWidth: 1.5,
              borderRightColor: CommonColors.whiteOpacity20,
            }}
          />
        </TVFocusGuideView>

        <TVFocusGuideView>
          <ChannelMediaPlayer
            imageSource={imagepath.TvDemoImage}
            showTitle={currentProgramDetails.showTitle}
            timeSlot={currentProgramDetails.timeSlot}
            progressPercentage={currentProgramDetails.progressPercentage}
            duration={currentProgramDetails.duration}
            description={currentProgramDetails.description}
            streamUrl={memorizeStreamUrl}
            selectedCategory={selectedCategoryName}
            loading={loading}
          />
          <View style={styles.scrollContainer}>
            <View style={styles.showChannelCatCarouselContainer}>
              <ShowChannelCatCarousel
                title={`${selectedCategory}`}
                data={selectedCategoryData}
                onFocus={handleScrollViewFocus}
                type="channels"
                setChannelUrl={handleChannelUrl}
                setProgramDetails={handleProgramDetails}
                loading={loading}
              />
            </View>
          </View>
        </TVFocusGuideView>
      </View>
    </MainLayout>
  );
};

export default Tv;
