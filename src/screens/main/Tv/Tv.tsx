// 1. React Native core imports
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';

import { styles } from './styles';
import MainLayout from '../../../components/MainLayout';
import CategoryList from '../../../components/CategoryList';
import { RouteProp, useRoute } from '@react-navigation/native';
import { MainStackParamList } from '../../../navigation/NavigationsTypes';
import ShowCatCarousel from '../../../components/ShowCatCarousel';
import ShowDetails1 from '../../../components/ShowDetails1';
import { getCategoryData } from '../../../redux/actions/auth';
import { debounce } from '../../../utils/CommonFunctions';
import { RootState } from '../../../redux/store';
import { useSelector } from 'react-redux';
import { CommonColors } from '../../../styles/Colors';
import { moderateScale } from '../../../styles/scaling';
import {
  saveMoviesDataToMMKV,
  getMoviesDataFromMMKV,
} from '../../../localStorage/mmkv';
import imagepath from '../../../constants/imagepath';
import ShowChannelCatCarousel from '../../../components/ShowChannelCatCarousel';
import ChannelMediaPlayer from '../../../components/ChannelMediaPlayer';
import Video from 'react-native-video';

type TvScreenRouteProp = RouteProp<MainStackParamList, 'Tv'>;

type MovieEntry = {
  type: 'movie';
  groupTitle: string;
  name: string;
  logo: string;
  url: string;
};

type MovieData = {
  [groupTitle: string]: MovieEntry[];
};

const Tv = () => {
  const route = useRoute<TvScreenRouteProp>();
  const { channelsData } = useSelector(
    (state: RootState) => state.rootReducer.auth,
  );
  const { activeScreen } = route.params;
  const [showCategoryAndSidebar, setShowCategoryAndSidebar] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCategoryData, setSelectedCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovieName, setSelectedMovieName] = useState<string>('');
  const [streamUrl, setStreamUrl] = useState<string>('');

  // Load movie data from MMKV on component mount
  useEffect(() => {
    loadMovieData();
  }, []);

  const loadMovieData = async () => {
    try {
      setLoading(true);

      setSelectedCategory(channelsData[0]);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Handle focus events for ScrollView content
  const handleScrollViewFocus = () => {
    setShowCategoryAndSidebar(false);
  };

  // Handle navigation back to category list (when pressing left)
  const handleCategoryListFocus = useCallback((category: string) => {
    setLoading(true);
    setShowCategoryAndSidebar(true);
    setSelectedCategory(category);
  }, []);
  

  const handleChannelUrl = (url: string) => {
    setStreamUrl(url);
  };

  const getMovieData = async (category: string) => {
    try {
      const res = await getCategoryData('live', category);

      const movieData = res?.data?.data?.data?.channels;

      if (movieData && movieData.length > 0) {
        // Update state
        setSelectedCategoryData(movieData);

        if (movieData[0]?.title) {
          setSelectedMovieName(movieData[0]?.title);
        }
      }
    } catch (error) {
      console.error('Error fetching movie data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieSelect = (movieTitle: string) => {
    setSelectedMovieName(movieTitle);
  };

  const categoryListContainerStyle = React.useMemo(() => {
    return [
      styles.categoryListContainer,
      !showCategoryAndSidebar && { width: 0, overflow: 'hidden' as const  },
    ]
  }, [showCategoryAndSidebar])

  const memorizeChannelsData = useMemo(() => {
    return Object.values(channelsData) as string[]
  }, [channelsData])

      const memorizeSelectedCategory = useMemo(() => {
        return selectedCategory
      }, [selectedCategory])

  const memorizeStreamUrl = useMemo(() => {
    return streamUrl
  }, [streamUrl])

  // Create debounced version of getMovieData
  const debouncedGetMovieData = useCallback(
    debounce((category: string) => {
      getMovieData(category);
    }, 500), // 500ms delay
    [],
  );

  // Call debounced getMovieData whenever selectedCategory changes
  useEffect(() => {
    if (selectedCategory) {
      debouncedGetMovieData(selectedCategory);
    }
  }, [selectedCategory, debouncedGetMovieData]);


  console.log("showCategoryAndSidebar", showCategoryAndSidebar);

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
        {/* category list */}
        {
          <View
            style={categoryListContainerStyle}
            nativeID="categoryList"
          >
            <CategoryList
              categories={memorizeChannelsData}
              selectedCategory={memorizeSelectedCategory}
              onFocus={handleCategoryListFocus}
              
            />
          </View>
        }

        <View>
          <ChannelMediaPlayer
            imageSource={imagepath.TvDemoImage}
            showTitle="No Information"
            timeSlot="02:00 - 03:00PM"
            progressPercentage={65}
            duration="26 min"
            streamUrl={memorizeStreamUrl}
          />
          <View
            style={styles.scrollContainer}
          // showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                // marginTop: -moderateScale(250),
                zIndex: 1000,
              }}>
              {/* Show selected category if available */}
              {((selectedCategory && channelsData) ||
                selectedCategoryData.length > 0) &&
                !loading && (
                  <ShowChannelCatCarousel
                    title={`${selectedCategory}`}
                    data={selectedCategoryData}
                    onShowPress={show =>
                      console.log(
                        `Featured ${selectedCategory} movie selected:`,
                        show.title,
                      )
                    }
                    onFocus={handleScrollViewFocus}
                    getMovieDetails={handleMovieSelect}
                    type="channels"
                    setChannelUrl={handleChannelUrl}
                  />
                )}

              {loading && (
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
