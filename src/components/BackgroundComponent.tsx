import React, {useState, useEffect} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {CommonColors} from '../styles/Colors';
import {moderateScale, verticalScale, scale, height, width} from '../styles/scaling';
import FontFamily from '../constants/FontFamily';
import {
  getMovieDetails,
  getSeriesShowDetails,
  imageResolutionHandlerForUrl,
} from '../utils/CommonFunctions';
import {getDiaPosterDetail} from '../redux/actions/main';
import YoutubeComp from '../screens/main/Home/YoutubeComp';
import ShowDetails from './ShowDetails';

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

interface ShowDetails1Props {
  movieName?: string;
  showName?: string;
  movie?: any;
}

const BackgroundComponent: React.FC<ShowDetails1Props> = ({
  movieName,
  showName,
  movie,
}) => {
  const [showDetails, setShowDetails] = useState<any | null>(null);

  useEffect(() => {
    if (movieName) {
      fetchMovieDetails();
    }
    if (showName) {
      fetchShowDetails();
    }
  }, [movieName, showName]);

  const fetchMovieDetails = async () => {
    if (!movieName) return;
    try {
      const details = await getDiaPosterDetail(movie?.stream_id!);
      console.log('details=--->>', details);
      setShowDetails({info: details?.data?.info});
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  const fetchShowDetails = () => {
    if (!showName) return;
    console.log('showdedededed', movie);
    setShowDetails({info: movie});
  };

  return (
    <View style={styles.backgroundImagePlaceholder}>
      {!showDetails?.info?.youtube_trailer ? (
        <ImageBackground
          source={{uri: showDetails?.info?.backdrop_path?.[0]}}
          style={{
            ...styles.backgroundImageStyle,
          }}
          resizeMode="cover"></ImageBackground>
      ) : (
        <View style={styles.backgroundImagePlaceholder}>
          <YoutubeComp data={showDetails?.info} height={height} VideoWidth={width} />
        </View>
      )}

      {/* Horizontal gradient overlay - dark on left, transparent on right */}
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
        style={styles.horizontalGradientOverlay}
      />

      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 1)',
          'rgba(0, 0, 0, 1)',
          'rgba(0, 0, 0, 0.5)',
          'rgba(0, 0, 0, 0.1)',
          'transparent',
          'transparent',
        ]}
        start={{x: 0, y: 1}}
        end={{x: 0, y: 0}}
        style={styles.horizontalGradientOverlay}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}>
        <ShowDetails
          showDetails={showDetails}
          PosterMovieName={showDetails}
          showButtons={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundImagePlaceholder: {
    flex: 1,
    resizeMode: 'contain',
    width: '100%',
    height: height / 1.5,
    justifyContent: 'center',
  },

  backgroundImageStyle: {
    width: '100%',
    height: height / 1.2,
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

export default BackgroundComponent;
