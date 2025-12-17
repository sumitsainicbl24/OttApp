import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ImageBackground,
  StyleSheet,
  TVFocusGuideView,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontFamily from '../constants/FontFamily';
import {getSeriesDetailsNew} from '../redux/actions/main';
import YoutubeComp from '../screens/main/Home/YoutubeComp';
import {CommonColors} from '../styles/Colors';
import {height, moderateScale, scale} from '../styles/scaling';
import ShowDetails from './ShowDetails';

// Constants
const DEBOUNCE_DELAY_MS = 300;

// Types
interface ShowData {
  title: string;
  rating: string;
  Year: string;
  Runtime: string;
  Genre: string;
  Actors: string;
  Director: string;
  Plot: string;
  Poster: string;
}

interface Movie {
  stream_id?: number;
  series_id?: number;
  title?: string;
  name?: string;
}

interface ShowDetails1Props {
  movieName?: string;
  showName?: string;
  movie?: Movie;
}

interface ShowDetailsState {
  info?: {
    youtube_trailer?: string;
    backdrop_path?: string[];
    [key: string]: any;
  };
  logos: any[];
}

const ShowDetails1: React.FC<ShowDetails1Props> = ({
  movieName,
  showName,
  movie,
}) => {
  // State management
  const [contentDetails, setContentDetails] = useState<ShowDetailsState | null>(
    null,
  );
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // API call handlers
  const fetchMovieDetails = async (streamId: number): Promise<void> => {
    try {
      const response = await getSeriesDetailsNew('movies', streamId);
      const movieInfo = response?.data?.data?.info;
      const logos = response?.data?.data?.logos;

      console.log('responseresponsemoviedetails---->>>>>', response);

      if (movieInfo) {
        setContentDetails({info: movieInfo, logos: logos});
        console.log(
          'Movie details fetched successfully for stream_id:',
          streamId,
        );
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

      console.log('responseresponseseriesdetails---->>>>>', response);

      if (seriesInfo) {
        setContentDetails({info: seriesInfo, logos: logos});
        console.log(
          'Series details fetched successfully for series_id:',
          seriesId,
        );
      }
    } catch (error) {
      console.error(
        'Failed to fetch series details for series_id:',
        seriesId,
        error,
      );
    }
  };

  // Debounced content loading logic
  const loadContentDetails = useCallback(() => {
    const isMovie = movieName && movie?.stream_id;
    const isSeries = showName && movie?.series_id;

    if (isMovie) {
      fetchMovieDetails(movie.stream_id!);
    } else if (isSeries) {
      fetchSeriesDetails(movie.series_id!);
    }
  }, [movieName, showName, movie?.stream_id, movie?.series_id]);

  // Debounce effect to prevent excessive API calls
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      console.log('Cancelled previous API call due to rapid selection changes');
    }

    debounceTimeoutRef.current = setTimeout(() => {
      loadContentDetails();
    }, DEBOUNCE_DELAY_MS);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [loadContentDetails]);

  // Render helpers
  const renderBackgroundContent = () => {
    const hasTrailer = contentDetails?.info?.youtube_trailer;
    const backdropImage = contentDetails?.info?.backdrop_path?.[0];

    // if (hasTrailer) {
    //   return (
    //     <View style={styles.backgroundImagePlaceholder}>
    //       <YoutubeComp data={contentDetails?.info} />
    //     </View>
    //   );
    // }

    return (
      <ImageBackground
        source={{uri: backdropImage}}
        style={styles.backgroundImageStyle}
        resizeMode="cover"
      />
    );
  };

  const renderGradientOverlays = () => (
    <>
      {/* Horizontal gradient overlay - dark on left, transparent on right */}
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 1)',
          'rgba(0, 0, 0, 1)',
          'rgba(0, 0, 0, 0.2)',
          'transparent',
          'transparent',
          'transparent',

        ]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.horizontalGradientOverlay}
      />

      {/* Vertical gradient overlay - dark at bottom, transparent at top */}
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 1)',
          'rgba(0, 0, 0, 1)',
          'rgba(0, 0, 0, 1)',
          'rgba(0, 0, 0, 0.1)',
          'transparent',
          'transparent',
          'transparent',

        ]}
        start={{x: 0, y: 1}}
        end={{x: 0, y: 0}}
        style={styles.horizontalGradientOverlay}
      />
    </>
  );

  const renderContentDetails = () => (
    <View style={styles.contentDetailsContainer}>
      <ShowDetails
        showDetails={contentDetails}
        PosterMovieName={contentDetails}
        showButtons={false}
      />
    </View>
  );

  return (
    <TVFocusGuideView
      focusable={false}
      style={styles.backgroundImagePlaceholder}>
      {renderBackgroundContent()}
      {renderGradientOverlays()}
      {renderContentDetails()}
    </TVFocusGuideView>
  );
};

const styles = StyleSheet.create({
  backgroundImagePlaceholder: {
    flex: 1,
    resizeMode: 'contain',
    width: '100%',
    height: height / 1.5,
    justifyContent: 'center',
    // paddingTop: verticalScale(40),
  },

  backgroundImageStyle: {
    width: '100%',
    height: height / 1.5,
    flex: 1,
    alignSelf: 'flex-end',
  },

  horizontalGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    height: height / 1,
  },

  contentDetailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },

  container: {
    // width: scale(855),
    // height: verticalScale(300),
    zIndex: 10,
    marginLeft: moderateScale(40),
    justifyContent: 'center',
    // gap: moderateScale(21),
    backgroundColor: 'red',
  },

  title: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(60),
    lineHeight: scale(75), // 1.25em
    color: '#EFEFEF',
    textAlign: 'left',
  },

  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(15),
  },

  ratingBadge: {
    backgroundColor: CommonColors.textGrey,
    borderRadius: moderateScale(6),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(2),
    alignItems: 'center',
    justifyContent: 'center',
  },

  ratingText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(24),
    lineHeight: scale(28), // 1.175em
    color: '#1D1D1D',
  },

  metadataText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(26),
    lineHeight: scale(30), // 1.175em
    color: CommonColors.textGrey,
  },

  descriptionContainer: {
    width: scale(855),
  },

  description: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(24),
    lineHeight: scale(28), // 1.175em
    color: CommonColors.textGrey,
    textAlign: 'left',
  },
});

export default ShowDetails1;
