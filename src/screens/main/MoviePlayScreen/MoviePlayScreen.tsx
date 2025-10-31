// 1. React Native core imports
import React, {useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// 2. Third-party library imports

// 3. Navigation imports
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

// 4. Redux imports
import {useAppDispatch} from '../../../redux/hooks';

// 5. Global styles and utilities
import imagepath from '../../../constants/imagepath';
import {CommonColors} from '../../../styles/Colors';

// 6. Component imports
import MainLayout from '../../../components/MainLayout';

// 7. Utils and helpers
import {MainStackParamList} from '../../../navigation/NavigationsTypes';

// 8. Local styles import (ALWAYS LAST)
import {useSelector} from 'react-redux';
import BackgroundComponent from '../../../components/BackgroundComponent';
import LiveVideoComp from '../../../components/LiveVideoComp';
import {
  addToMyListApi,
  continueWatchingCurrentApi,
  getDiaPosterDetail,
  getSeriesDetails,
  getSeriesDetailsNew,
  mylistCheckApi,
  removeFromMyList,
} from '../../../redux/actions/main';
import {setCurrentSeriesEpisodes} from '../../../redux/reducers/main';
import {RootState} from '../../../redux/store';
import {
  extractStreamIdFromUrl,
  getEpisodeAndSeasonNumber,
  imageResolutionHandlerForUrl,
} from '../../../utils/CommonFunctions';
import {styles} from './styles';

type MoviePlayScreenRouteProp = RouteProp<
  MainStackParamList,
  'MoviePlayScreen'
>;

interface MovieData {
  title: string;
  language: string;
  rating: string;
  year: string;
  duration: string;
  genres: string[];
  cast: string;
  director: string;
  description: string;
  posterUrl?: string;
}

const MoviePlayScreen = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const dispatch = useAppDispatch();
  const route = useRoute<MoviePlayScreenRouteProp>();
  const {currentlyPlaying} = useSelector(
    (state: RootState) => state.rootReducer.main,
  );
  const {userToken} = useSelector((state: RootState) => state.rootReducer.auth);
  const {show, movie, live} = route.params;

  console.log('show--->>>>', show);
  const [movieTitle, setMovieTitle] = useState();
  const [showTitle, setShowTitle] = useState();
  const [seriesEpisodes, setSeriesEpisodes] = useState<any[]>([]);
  // Focus state management
  const [focusedButton, setFocusedButton] = useState<string | null>(null);
  const [isMoviePlaying, setIsMoviePlaying] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [addedToMyList, setAddedToMyList] = useState<boolean>(false);
  const [timing, setTiming] = useState<any>(null);
  const [posterMovieName, setPosterMovieName] = useState<any>(null);

  // Focus handlers
  const handleFocus = (buttonName: string) => {
    setFocusedButton(buttonName);
  };

  const handleBlur = () => {
    setFocusedButton(null);
  };

  const handlePlayPress = async () => {
    setIsMoviePlaying(true);
  };

  const handleTrailerPress = async () => {
    try {
      const youtubeTrailer = posterMovieName?.info?.youtube_trailer;
      if (youtubeTrailer) {
        let youtubeUrl = youtubeTrailer;
        if (
          !youtubeTrailer.includes('youtube.com') &&
          !youtubeTrailer.includes('youtu.be')
        ) {
          youtubeUrl = `https://www.youtube.com/watch?v=${youtubeTrailer}`;
        }

        // Check if YouTube app is available, otherwise open in browser
        const supported = await Linking.canOpenURL(youtubeUrl);
        if (supported) {
          await Linking.openURL(youtubeUrl);
        } else {
          // Fallback to browser
          await Linking.openURL(youtubeUrl);
        }
      } else {
        Alert.alert(
          'No Trailer Available',
          'This movie/show does not have a trailer available.',
          [{text: 'OK'}],
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open trailer. Please try again.', [
        {text: 'OK'},
      ]);
    }
  };

  const handleAddToListPress = async () => {
    if (currentlyPlaying) {
      const currentPlayingData = {
        ...currentlyPlaying,
        type: route?.params.show ? 'series' : 'movies',
        url: streamUrl,
      };

      console.log('currentPlayingData', currentPlayingData);
      if (addedToMyList) {
        const res = await removeFromMyList(currentPlayingData);
        console.log('res from remove from my list', res);
        setAddedToMyList(false);
      } else {
        if (!userToken) {
          navigation.navigate('LoginScreen');
          return;
        }
        const res = await addToMyListApi(currentPlayingData);
        console.log('res from add to my list', res);
        setAddedToMyList(true);
      }
    }
  };

  // Episode card component
  const EpisodeCard = ({episode}: {episode: any}) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    function onPressEpisode() {
      setSelectedEpisode(episode);
      if (episode?.url !== streamUrl) {
        setTiming(null);
      }
      setStreamUrl(episode?.url);
      setIsMoviePlaying(true);
    }

    return (
      <TouchableOpacity
        style={[styles.episodeCard, isFocused && styles.episodeCardFocused]}
        onPress={onPressEpisode}
        onFocus={handleFocus}
        onBlur={handleBlur}
        activeOpacity={1}>
        <Image
          source={
            episode?.info?.movie_image
              ? {uri: episode?.info?.movie_image}
              : imagepath.VideoPlaceHolder
          }
          style={styles.episodeImage}
        />
        <View style={styles.episodeTitleContainer}>
          <Text numberOfLines={1} style={styles.episodeTitle}>
            {episode.title || episode.name || 'Episode'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  async function getMovieDetails() {
    try {
      const moviesDetailsResponse = await getSeriesDetailsNew(
        'movies',
        movie?.stream_id,
      );
      setPosterMovieName({
        info: moviesDetailsResponse?.data?.data?.info,
      });
      dispatch(setCurrentSeriesEpisodes([]));
      setMovieTitle(
        moviesDetailsResponse?.data?.data?.movie_data?.title ||
          moviesDetailsResponse?.data?.data?.movie_data?.name,
      );
      setStreamUrl(moviesDetailsResponse?.data?.data?.movie_data?.url);
    } catch (error) {
      console.log('error', error);
    }
  }

  async function getSeriesDetails() {
    try {
      const sereisDetailsResponse = await getSeriesDetailsNew(
        'series',
        show?.series_id,
      );

      console.log('sereisDetailsResponse', sereisDetailsResponse);
      setPosterMovieName({
        info: sereisDetailsResponse?.data?.data?.info,
      });
      dispatch(
        setCurrentSeriesEpisodes(sereisDetailsResponse?.data?.data?.episodes),
      );
      setShowTitle(sereisDetailsResponse?.data?.data?.info?.name);
      setSeriesEpisodes(sereisDetailsResponse?.data?.data?.episodes);
      if (!streamUrl) {
        setStreamUrl(sereisDetailsResponse?.data?.data?.episodes[0]?.url);
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  useEffect(() => {
    if (movie) {
      getMovieDetails();
    } else if (show) {
      getSeriesDetails();
    } else if (live) {
      setStreamUrl(live?.url);
      setIsMoviePlaying(true);
    }
  }, [movie, show, live]);

  useEffect(() => {
    if (userToken) {
      getContinueWatchingCurrent();
    }
  }, [currentlyPlaying, userToken]);

  async function getContinueWatchingCurrent() {
    const res = await mylistCheckApi(currentlyPlaying);
    if (res?.data?.data?.exists) {
      setAddedToMyList(true);
    }
    const res2 = await continueWatchingCurrentApi({
      url: currentlyPlaying?.url || ' ',
      type: currentlyPlaying?.type || 'series',
      title: currentlyPlaying?.baseTitle || currentlyPlaying?.title,
    });
    if (res2?.data?.data?.found) {
      setTiming(res2?.data?.data?.timing);
      setStreamUrl(res2?.data?.data?.video?.url);
    }
  }

  function renderEpisodes({item}: any) {
    return <EpisodeCard episode={item} />;
  }

  return (
    <MainLayout activeScreen="MoviePlayScreen" hideSidebar={true}>
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="light-content"
      />
      {isMoviePlaying ? (
        <LiveVideoComp
          streamUrl={streamUrl || ''}
          timing={timing}
          hideControls={live?.type === 'live'}
        />
      ) : (
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}>
          {movie ? (
            <BackgroundComponent movieName={movieTitle} movie={movie} numofLines={10}/>
          ) : (
            <BackgroundComponent showName={showTitle} movie={show} />
          )}
          {seriesEpisodes?.length > 0 && (
            <View style={styles.episodesSection}>
              <Text style={styles.episodesSectionTitle}>Episodes</Text>
              <FlatList
                data={seriesEpisodes}
                renderItem={renderEpisodes}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.episodesList}
              />
            </View>
          )}
          <View style={styles.actionButtonsSection}>
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.playButton,
                  focusedButton === 'play' && {
                    backgroundColor: CommonColors.white,
                  },
                ]}
                onPress={handlePlayPress}
                onFocus={() => handleFocus('play')}
                onBlur={handleBlur}
                activeOpacity={1}>
                <Image
                  source={imagepath.playbuttonarrowhead}
                  style={styles.playIconPlaceholder}
                  tintColor={
                    focusedButton === 'play'
                      ? CommonColors.black
                      : CommonColors.white
                  }
                />
                <Text
                  style={[
                    styles.playButtonText,
                    focusedButton === 'play' && {color: CommonColors.black},
                  ]}>
                  {timing ? 'Continue' : 'Play'}{' '}
                  {selectedEpisode
                    ? getEpisodeAndSeasonNumber(selectedEpisode?.title)
                    : ''}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.trailerButton,
                  focusedButton === 'trailer' && {
                    backgroundColor: CommonColors.white,
                  },
                ]}
                onPress={handleTrailerPress}
                onFocus={() => handleFocus('trailer')}
                onBlur={handleBlur}
                activeOpacity={1}>
                <Image
                  source={imagepath.movieTrailerIcon}
                  style={styles.trailerIconPlaceholder}
                  tintColor={
                    focusedButton === 'trailer'
                      ? CommonColors.black
                      : CommonColors.white
                  }
                />
                <Text
                  style={[
                    styles.trailerButtonText,
                    focusedButton === 'trailer' && {color: CommonColors.black},
                  ]}>
                  Trailer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.addToListButton,
                  addedToMyList && {
                    backgroundColor: CommonColors.backgroundBlue,
                  },
                  focusedButton === 'addToList' && {
                    backgroundColor: CommonColors.white,
                  },
                ]}
                onPress={handleAddToListPress}
                onFocus={() => handleFocus('addToList')}
                onBlur={handleBlur}
                activeOpacity={1}>
                <Image
                  source={
                    addedToMyList
                      ? focusedButton === 'addToList'
                        ? imagepath.remove
                        : imagepath.check
                      : imagepath.wishlistIcon
                  }
                  style={[styles.addToListIconPlaceholder]}
                  tintColor={
                    focusedButton === 'addToList'
                      ? CommonColors.black
                      : CommonColors.white
                  }
                />
                <Text
                  style={[
                    styles.addToListButtonText,
                    focusedButton === 'addToList' && {
                      color: CommonColors.black,
                    },
                  ]}>
                  {addedToMyList
                    ? focusedButton === 'addToList'
                      ? 'Remove from My list'
                      : 'Added to My list'
                    : 'Add to My list'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </MainLayout>
  );
};

export default MoviePlayScreen;
