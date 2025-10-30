// 1. React Native core imports
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  StatusBar,
  TVFocusGuideView,
  View,
} from 'react-native';

import {RouteProp, useRoute} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {useSelector} from 'react-redux';
import CategoryList from '../../../components/CategoryList';
import MainLayout from '../../../components/MainLayout';
import ShowCatCarousel from '../../../components/ShowCatCarousel';
import ShowDetails1 from '../../../components/ShowDetails1';
import {MainStackParamList} from '../../../navigation/NavigationsTypes';
import {getCategoryData} from '../../../redux/actions/auth';
import {RootState} from '../../../redux/store';
import {CommonColors} from '../../../styles/Colors';
import {debounce} from '../../../utils/CommonFunctions';
import {styles} from './styles';

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

const Shows = () => {
  const route = useRoute<MoviesScreenRouteProp>();
  const {seriesData} = useSelector(
    (state: RootState) => state.rootReducer.auth,
  );
  const {activeScreen} = route.params;
  const [showCategoryAndSidebar, setShowCategoryAndSidebar] = useState(true);
  const [movieCategories, setMovieCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(0);
  const [selectedCategoryData, setSelectedCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovieName, setSelectedMovieName] = useState<string>('');
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  // Load movie data from MMKV on component mount
  useEffect(() => {
    setSelectedCategory(seriesData[0]?.category_id);
  }, []);

  const handleScrollViewFocus = (res: any) => {
    setShowCategoryAndSidebar(false);
    setSelectedMovie(res);
  };

  // Handle navigation back to category list (when pressing left)
  const handleCategoryListFocus = async (
    category: number,
    categoryName: string,
  ) => {
    // setLoading(true)
    setShowCategoryAndSidebar(true);
    setSelectedCategory(category);
    setSelectedCategoryName(categoryName);
  };

  const getMovieData = async (category: string) => {
    const res = await getCategoryData('series', category);
    setSelectedCategoryData(res?.data?.data?.data?.series);
    setLoading(false);
    if (res?.data?.data?.data?.series[0]?.title) {
      setSelectedMovie(res?.data?.data?.data?.series[0]);
    }
  };

  const debouncedGetMovieData = useCallback(
    debounce((category: string) => {
      setLoading(true);
      getMovieData(category);
    }, 500),
    [],
  );

  // Call debounced getMovieData whenever selectedCategory changes
  useEffect(() => {
    if (selectedCategory) {
      debouncedGetMovieData(selectedCategory);
    }
  }, [selectedCategory, debouncedGetMovieData]);

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
            categories={seriesData}
            selectedCategory={selectedCategory}
            onFocus={handleCategoryListFocus}
          />
        </View>

        <View>
          <ShowDetails1 movie={selectedMovie} showName={selectedMovie?.title} />

          <TVFocusGuideView style={styles.scrollContainer} autoFocus>
            {((selectedCategory && seriesData) ||
              selectedCategoryData.length > 0) &&
              !loading && (
                <ShowCatCarousel
                  title={`${selectedCategoryName}`}
                  data={selectedCategoryData}
                  onFocus={handleScrollViewFocus}
                  type="series"
                />
              )}

            {loading && (
              <ActivityIndicator size="large" color={CommonColors.white} />
            )}
          </TVFocusGuideView>
        </View>
      </View>
    </MainLayout>
  );
};

export default Shows;
