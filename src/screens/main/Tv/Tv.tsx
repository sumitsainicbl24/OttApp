import { RouteProp, useRoute } from '@react-navigation/native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  TVFocusGuideView,
  unstable_batchedUpdates,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import CategoryList from '../../../components/CategoryList';
import ChannelMediaPlayer from '../../../components/ChannelMediaPlayer';
import MainLayout from '../../../components/MainLayout';
import ShowChannelCatCarousel from '../../../components/ShowChannelCatCarousel';
import imagepath from '../../../constants/imagepath';
import { MainStackParamList } from '../../../navigation/NavigationsTypes';
import { getCategoryData } from '../../../redux/actions/auth';
import { RootState } from '../../../redux/store';
import { debounce } from 'lodash';
import { clearEPGCaches } from '../../../utils/epgUtils';
import { styles } from './styles';
import { CommonColors } from '../../../styles/Colors';
import ChannelEpgCarousal from '../../../components/ChannelEpgCarousal';

type TvScreenRouteProp = RouteProp<MainStackParamList, 'Tv'>;

const Tv = () => {
  const route = useRoute<TvScreenRouteProp>();
  const { channelsData } = useSelector(
    (state: RootState) => state.rootReducer.auth,
  );
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoader(false);
    }, 3000);
  }, []);

  const { activeScreen } = route.params;
  const [showCategoryAndSidebar, setShowCategoryAndSidebar] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<any>(0);
  const [selectedCategoryData, setSelectedCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string>('');
  const categoryListRef = useRef<any>(null);
  const [isFocused, setIsFocused] = useState(false);
  const firstChannelProgramRef = useRef<any>(null);

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
    setSelectedCategoryData(channelsData[0]?.channels || []);
  }, []);

  const handleScrollViewFocus = useCallback(() => {
    categoryListRef?.current?.setNativeProps({
      style: { width: 0, overflow: 'hidden' as const },
    });
  }, []);

  const handleCategoryListFocus = useCallback(
    (category: number, categoryName: string, categoryItem: any) => {
      // clearEPGCaches();
      // unstable_batchedUpdates(() => {
        categoryListRef?.current?.setNativeProps({
          style: styles.categoryListContainer,
        });
      setSelectedCategoryData(categoryItem);
      // });
    },
    [],
  );

  const handleChannelUrl = useCallback(
    (url: string) => {
      setStreamUrl(url);
    },
    [setStreamUrl],
  );

  const handleProgramDetails = useCallback(
    (details: {
      showTitle: string;
      timeSlot: string;
      progressPercentage: number;
      duration: string;
      description: string;
    }) => {
      console.log('details', details);
      setCurrentProgramDetails(details);
    },
    [setCurrentProgramDetails],
  );

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

  // const categoryListContainerStyle = React.useMemo(() => {
  //   return [
  //     styles.categoryListContainer,
  //     !showCategoryAndSidebar && { width: 0, overflow: 'hidden' as const },
  //   ];
  // }, [showCategoryAndSidebar]);

  return (
    <MainLayout
      activeScreen={activeScreen || 'Movies'}
      // hideSidebar={!showCategoryAndSidebar}
      setIsFocused={setIsFocused}
    >
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
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.homeGradientFocused}
        />
      )}

      {!loader ? (
        <View style={styles.container}>
          <TVFocusGuideView
            ref={categoryListRef}
            style={styles.categoryListContainer}
            nativeID="categoryList"
            autoFocus
          >
            <CategoryList
              categories={memorizeChannelsData}
              selectedCategory={memorizeSelectedCategory}
              onFocus={handleCategoryListFocus}
              nextFocusRightRef={firstChannelProgramRef}
            />
          </TVFocusGuideView>

          <View>
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
              <TVFocusGuideView
                autoFocus
                style={styles.showChannelCatCarouselContainer}
              >
                <ShowChannelCatCarousel
                  title={selectedCategory}
                  data={selectedCategoryData}
                  onFocus={handleScrollViewFocus}
                  type="channels"
                  setChannelUrl={handleChannelUrl}
                  setProgramDetails={handleProgramDetails}
                  firstFocusableRef={firstChannelProgramRef}
                />
              </TVFocusGuideView>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CommonColors.white} />
        </View>
      )}
    </MainLayout>
  );
};

export default Tv;
