// 1. React Native core imports
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StatusBar,
  View,
} from 'react-native';
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
  getDiaPosterDetail,
  getHomepageApi,
} from '../../../redux/actions/main';
import {useAppDispatch} from '../../../redux/hooks';
import {setCurrentlyPlaying} from '../../../redux/reducers/main';
import {RootState} from '../../../redux/store';
import {moderateScale, verticalScale} from '../../../styles/scaling';
import {
  extractStreamIdFromUrl,
  imageResolutionHandlerForUrl,
} from '../../../utils/CommonFunctions';
import {styles} from './styles';
import YoutubeComp from './YoutubeComp';

const Home = () => {
  const {userToken} = useSelector((state: RootState) => state.rootReducer.auth);
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

  const handleOnFocus = async (data: any) => {
    if (data?.category_id) {
      setPosterMovieName({
        info: data,
      });
    } else {
      let stream_id = extractStreamIdFromUrl(data?.url);
      let diaPosterDetail = await getDiaPosterDetail(stream_id!);
      setPosterMovieName({
        info: diaPosterDetail?.data?.info,
      });
    }
  };

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
    let stream_id = extractStreamIdFromUrl(
      res?.data?.data?.randomPoster?.data?.url,
    );
    let diaPosterDetail = await getDiaPosterDetail(stream_id!);
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
    setPosterMovieName({
      info: diaPosterDetail?.data?.info,
    });
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

  const getImageSource = (info: any) => {
    if (info?.cover_big) {
      return {
        uri: info.backdrop_path[0],
      };
    } else if (info?.cover) {
      return {
        uri: info.backdrop_path[0],
      };
    }
    return undefined;
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

        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 1)',
            'rgba(0, 0, 0, 0.6)',
            'rgba(0, 0, 0, 0.7)',
            'transparent',
          ]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.homeGradient}
        />

        {/* <LinearGradient
          colors={[
            'rgba(0, 0, 0, 1)',
            'transparent',
          ]}
          start={{x: 1, y: 0}}
          end={{x: 0, y: 0}}
          style={styles.homeGradient}
        /> */}

        {isFocused && (
          <LinearGradient
            colors={[
              'rgba(0, 0, 0, 1)',
              'rgba(0, 0, 0, 0.8)',
              'rgba(0, 0, 0, 0)',
              'transparent',
            ]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.homeGradientFocused}
          />
        )}

        {!PosterMovieName?.info?.youtube_trailer ? (
          <ImageBackground
            source={getImageSource(PosterMovieName?.info)}
            style={{
              ...styles.backgroundImagePlaceholder,
            }}
            resizeMode="cover">
            <ShowDetails
              onPlayPress={handlePlayPress}
              showDetails={PosterMovieName}
              PosterMovieName={PosterMovieName}
            />
          </ImageBackground>
        ) : (
          <View style={styles.backgroundImagePlaceholder}>
            <View
              style={{
                position: 'absolute',
                // top: moderateScale(120),
                left: 0,
                right: 0,
                width: '100%',
                zIndex: 1000,
              }}>
              <ShowDetails
                onPlayPress={handlePlayPress}
                showDetails={PosterMovieName}
                PosterMovieName={PosterMovieName}
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
