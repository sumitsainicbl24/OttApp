// 1. React Native core imports
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  View
} from 'react-native';

import { RouteProp, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import MainLayout from '../../../components/MainLayout';
import ShowCatCarousel from '../../../components/ShowCatCarousel';
import { MainStackParamList } from '../../../navigation/NavigationsTypes';
import { getMyListApi } from '../../../redux/actions/main';
import { height } from '../../../styles/scaling';
import { styles } from './styles';

type FavoritesScreenRouteProp = RouteProp<MainStackParamList, 'Favorites'>;

const Favorites = () => {
  const route = useRoute<FavoritesScreenRouteProp>();
  const {activeScreen} = route.params;
  const [isFocused, setIsFocused] = useState(false);
  const [showCategoryAndSidebar, setShowCategoryAndSidebar] = useState(true);
  const [myListData, setMyListData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch my list data from API
  useEffect(() => {
    const fetchMyListData = async () => {
      try {
        setLoading(true);
        const response = await getMyListApi();
        console.log('My list API response:', response);

        // Extract videos from the response based on the structure seen in MoviePlayScreen
        const videos = response?.data?.data?.data?.videos || [];
        setMyListData(videos);
      } catch (error) {
        console.error('Error fetching my list:', error);
        setMyListData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyListData();
  }, []);

  // Handle focus events for ScrollView content
  // const handleScrollViewFocus = () => {
  //   setShowCategoryAndSidebar(false);
  // };

  // Handle navigation back to category list (when pressing left)
  // const handleCategoryListFocus = () => {
  //   setShowCategoryAndSidebar(true);
  // };

  return (
    <MainLayout
      activeScreen={activeScreen || 'Favorites'}
      hideSidebar={false}
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
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}>
          <ShowCatCarousel
            mainStyle={{height: height}}
            title="My List"
            data={myListData}
          />
        </ScrollView>
      </View>
    </MainLayout>
  );
};

export default Favorites;
