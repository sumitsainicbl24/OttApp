// 1. React Native core imports
import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TVFocusGuideView,
  View,
} from 'react-native';

import {styles} from './styles';
import MainLayout from '../../../components/MainLayout';
import CategoryList from '../../../components/CategoryList';
import {RouteProp, useRoute} from '@react-navigation/native';
import {MainStackParamList} from '../../../navigation/NavigationsTypes';
import ShowCatCarousel from '../../../components/ShowCatCarousel';
import ShowDetails1 from '../../../components/ShowDetails1';
import {getCategoryData} from '../../../redux/actions/auth';
import {debounce} from '../../../utils/CommonFunctions';
import {RootState} from '../../../redux/store';
import {useSelector} from 'react-redux';
import {CommonColors} from '../../../styles/Colors';
import {moderateScale} from '../../../styles/scaling';
import {
  saveMoviesDataToMMKV,
  getMoviesDataFromMMKV,
} from '../../../localStorage/mmkv';
import LinearGradient from 'react-native-linear-gradient';

type MoviesScreenRouteProp = RouteProp<MainStackParamList, 'Movies'>;

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

const Movies = () => {
  const route = useRoute<MoviesScreenRouteProp>();
  const {moviesData} = useSelector(
    (state: RootState) => state.rootReducer.auth,
  );
  const {activeScreen} = route.params;
  const [showCategoryAndSidebar, setShowCategoryAndSidebar] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<any>(0);
  const [selectedCategoryData, setSelectedCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');

  // Load movie data from MMKV on component mount
  useEffect(() => {
    setSelectedCategory(moviesData[0]?.category_id);
  }, []);

  const handleScrollViewFocus = (res: any) => {
    setShowCategoryAndSidebar(false);
    setSelectedMovie(res);
  };

  const handleCategoryListFocus = async (
    category: any,
    categoryName: string,
  ) => {
    setShowCategoryAndSidebar(true);
    setSelectedCategory(category);
    setSelectedCategoryName(categoryName);
  };

  const getMovieData = async (category: string) => {
    try {
      const res = await getCategoryData('movies', category);
      const movieData = res?.data?.data?.data?.movies;
      if (movieData && movieData.length > 0) {
        setSelectedCategoryData(movieData);
        if (movieData[0]?.stream_id) {
          setSelectedMovie(movieData[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching movie data:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedGetMovieData = useCallback(
    debounce((category: string) => {
      setLoading(true);
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
  const scrollContainerRef = useRef<any>(null);
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
        <View
          style={[
            styles.categoryListContainer,
            !showCategoryAndSidebar && {width: 0, overflow: 'hidden'},
          ]}
          nativeID="categoryList">
          <CategoryList
            categories={Object.values(moviesData)}
            selectedCategory={selectedCategory}
            onFocus={handleCategoryListFocus}
          />
        </View>

        <View>
          {((selectedCategory && moviesData) ||
            selectedCategoryData.length > 0) &&
            !loading && (
              <ShowDetails1
                movieName={selectedMovie?.title}
                movie={selectedMovie}
              />
            )}

          <View style={styles.scrollContainer}>
            {((selectedCategory && moviesData) ||
              selectedCategoryData.length > 0) &&
              !loading && (
                <ShowCatCarousel
                  title={`${selectedCategoryName}`}
                  data={selectedCategoryData}
                  onFocus={handleScrollViewFocus}
                  type="movies"
                />
              )}

            {loading && (
              <ActivityIndicator size="large" color={CommonColors.white} />
            )}
          </View>
        </View>
      </View>
    </MainLayout>
  );
};

export default Movies;
