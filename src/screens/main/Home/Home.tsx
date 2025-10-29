// 1. React Native core imports
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ImageBackground, ScrollView, StatusBar, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {YoutubeIframeRef} from 'react-native-youtube-iframe';
import {useSelector} from 'react-redux';
import ContinueWatchingCarousel from '../../../components/ContinueWatchingCarousel';
import MainLayout from '../../../components/MainLayout';
import ShowCatCarousel from '../../../components/ShowCatCarousel';
import ShowDetails from '../../../components/ShowDetails';
import {MainStackParamList} from '../../../navigation/NavigationsTypes';
import {
  continueWatchingGetApi,
  getHomepageApi,
  getSeriesDetailsNew,
} from '../../../redux/actions/main';
import {useAppDispatch} from '../../../redux/hooks';
import {setCurrentlyPlaying} from '../../../redux/reducers/main';
import {RootState} from '../../../redux/store';
import {verticalScale} from '../../../styles/scaling';
import {styles} from './styles';
import YoutubeComp from './YoutubeComp';

const Home = () => {
  const {userToken, auth_token} = useSelector(
    (state: RootState) => state.rootReducer.auth,
  );
  const dispatch = useAppDispatch();
  const [PosterMovieName, setPosterMovieName] = useState<any>(null);
  const [homeContent, setHomeContent] = useState<any>([]);
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const [isFocused, setIsFocused] = useState(false);
  const [ContinueWatchingDynamicData, setContinueWatchingDynamicData] =
    useState<any>(null);
  const playerRef = useRef<YoutubeIframeRef>(null);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.seekTo(10, true);
    }
  }, []);

  const handlePlayPress = () => {
    dispatch(setCurrentlyPlaying(PosterMovieName));
    navigation.navigate('MoviePlayScreen', {movie: PosterMovieName});
  };

  // Debounced focus handler to avoid excessive API calls on rapid focus changes
  const handleOnFocus = React.useMemo(() => {
    const {debounce} = require('../../../utils/CommonFunctions');
    return debounce(async (data: any) => {
      try {
        if (data?.category_id) {
          await fetchSeriesDetails(data?.series_id);
        } else {
          await fetchMovieDetails(data?.stream_id);
        }
      } catch (error) {
        console.error('Error handling focus change:', error);
      }
    }, 400);
  }, []);

  const loadContinueWatchingData = async () => {
    setTimeout(async () => {
      if (userToken) {
        const res = await continueWatchingGetApi();
        console.log('res from continue watching get', res?.data?.data?.data);
        if (res?.data?.data?.data?.videos?.length > 0) {
          setContinueWatchingDynamicData(res?.data?.data?.data?.videos);
        }
      }
    }, 1000);
  };

  const allHomepageData = async () => {
    const res = await getHomepageApi();
    console.log('res from homepage', res?.data?.data);
    let stream_id = res?.data?.data?.randomPoster?.data?.stream_id;
    await fetchMovieDetails(stream_id!);
    setHomeContent([
      {
        id: 1,
        title: 'Recently Added',
        data: res?.data?.data?.recentUploaded?.data?.slice(0, 7),
        type: 'movies',
      },
      {
        id: 2,
        title: 'Popular Movies',
        data: res?.data?.data?.popularMovies?.data?.slice(0, 7),
        type: 'movies',
      },

      {
        id: 3,
        title: 'Popular Shows',
        data: res?.data?.data?.popularShows?.data?.slice(0, 7),
        type: 'series',
      },
    ]);
  };

  useEffect(() => {
    allHomepageData();
  }, []);

  // Load continue watching data when screen gains focus and user token exists
  useFocusEffect(
    useCallback(() => {
      if (userToken) {
        loadContinueWatchingData();
      }
    }, [userToken]),
  );

  const fetchMovieDetails = async (streamId: number): Promise<void> => {
    try {
      const response = await getSeriesDetailsNew('movies', streamId);
      const movieInfo = response?.data?.data?.info;
      const logos = response?.data?.data?.logos;

      console.log('responseresponsemoviedetails---->>>>>', response);
      if (movieInfo) {
        setPosterMovieName({info: movieInfo, logos: logos});
      }
    } catch (error) {
      console.error(
        'Failed to fetch movie details for stream_id:',
        streamId,
        error,
      );
    }
  };

  const fetchSeriesDetails = async (seriesId: number): Promise<void> => {
    try {
      const response = await getSeriesDetailsNew('series', seriesId);
      const seriesInfo = response?.data?.data?.info;
      const logos = response?.data?.data?.logos;

      if (seriesInfo) {
        setPosterMovieName({info: seriesInfo, logos: logos});
      }
    } catch (error) {
      console.error(
        'Failed to fetch series details for series_id:',
        seriesId,
        error,
      );
    }
  };

  const ListFooterComponent = () => {
    if (ContinueWatchingDynamicData?.length > 0) {
      return <ContinueWatchingCarousel data={ContinueWatchingDynamicData} />;
    }
    return null;
  };

  return (
    <MainLayout
      activeScreen={'Home'}
      hideSidebar={false}
      setIsFocused={setIsFocused}>
      <View style={styles.container}>
        <StatusBar
          backgroundColor="transparent"
          translucent
          barStyle="light-content"
        />
        {!isFocused && (
          <LinearGradient
            colors={[
              'rgba(0, 0, 0, 1)',
              'rgba(0, 0, 0, 1)',
              'rgba(0, 0, 0, 0.2)',
              'transparent',
              'transparent',
            ]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.homeGradient}
          />
        )}
        {isFocused && (
          <LinearGradient
            colors={[
              'rgba(0, 0, 0, 1)',
              'rgba(0, 0, 0, 0.5)',
              'rgba(0, 0, 0, 0.2)',
              'transparent',
              'transparent',
            ]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.homeGradientFocused}
          />
        )}

        {!PosterMovieName?.info?.youtube_trailer ? (
          <ImageBackground
            source={{uri: PosterMovieName?.info?.backdrop_path?.[0]}}
            style={{
              ...styles.backgroundImagePlaceholder,
            }}
            resizeMode="cover">
            <ShowDetails
              onPlayPress={handlePlayPress}
              showDetails={PosterMovieName}
              PosterMovieName={PosterMovieName}
              showButtons={false}
            />
          </ImageBackground>
        ) : (
          <View style={styles.backgroundImagePlaceholder}>
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                width: '100%',
                zIndex: 1000,
              }}>
              <ShowDetails
                onPlayPress={handlePlayPress}
                showDetails={PosterMovieName}
                PosterMovieName={PosterMovieName}
                showButtons={false}
              />
            </View>
            <YoutubeComp data={PosterMovieName?.info} />
          </View>
        )}

        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={{}}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          pagingEnabled={false}
          snapToInterval={verticalScale(540)}
          snapToAlignment="center"
          decelerationRate="fast"
          bounces={false}
          alwaysBounceVertical={false}
          directionalLockEnabled={true}
          automaticallyAdjustContentInsets={false}>
          {homeContent?.map((item: any) => (
            <View key={item.id} style={styles.categoryContainer}>
              <ShowCatCarousel
                title={item.title}
                data={item.data}
                type={item.type}
                titleStyle={styles.carouselTitle}
                mainStyle={{height: verticalScale(540)}}
                disableScroll={true}
                onFocus={handleOnFocus}
              />
            </View>
          ))}
          {ListFooterComponent()}
        </ScrollView>

        {/* <View
          style={{
            marginBottom: verticalScale(55),
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ActivityIndicator size="large" color="#fff" />
        </View> */}
      </View>
    </MainLayout>
  );
};

export default Home;
