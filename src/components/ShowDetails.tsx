import {NavigationProp, useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React, {useState} from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import FontFamily from '../constants/FontFamily';
import imagepath from '../constants/imagepath';
import {MainStackParamList} from '../navigation/NavigationsTypes';
import {addToMyListApi, removeFromMyList} from '../redux/actions/main';
import {RootState} from '../redux/store';
import {CommonColors} from '../styles/Colors';
import {moderateScale, scale, verticalScale} from '../styles/scaling';
import FastImage from 'react-native-fast-image';

interface ShowDetailsProps {
  onPlayPress?: () => void;
  onMyListPress?: () => void;
  showDetails?: any;
  onFocus?: () => void;
  PosterMovieName?: any;
  showButtons?: boolean;
}

const ShowDetails: React.FC<ShowDetailsProps> = ({
  onPlayPress,
  onMyListPress,
  showDetails,
  onFocus,
  PosterMovieName,
  showButtons = true,
}) => {
  console.log(showDetails, '-------showDetailsshowDetails');
  const [focused, setFocused] = useState<string | null>(null);
  const [isInMyList, setIsInMyList] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const userToken = useSelector(
    (state: RootState) => state.rootReducer.auth.userToken,
  );
  const handleFocus = (item: string) => {
    setFocused(item);
    onFocus?.();
  };

  console.log('showDetails', showDetails);
  const handleBlur = () => {
    setFocused(null);
  };

  const releaseYear = showDetails?.info?.releasedate
    ? moment(showDetails?.info?.releasedate).format('YYYY')
    : undefined;
  const runtime = showDetails?.info?.runtime
    ? Math.floor(Number(showDetails?.info?.runtime) / 60) +
      ' h ' +
      (Number(showDetails?.info?.runtime) % 60).toFixed(0) +
      ' m'
    : 0;
  const genre = showDetails?.info?.genre;
  const rating = Number(showDetails?.info?.rating).toFixed(1);
  const cast = showDetails?.info?.cast;
  const director = showDetails?.info?.director;
  const metadataItems = [rating, releaseYear, runtime, genre].filter(Boolean);

  const handleMyListPress = () => {
    if (!userToken) {
      navigation.navigate('LoginScreen');
      return;
    }

    if (!PosterMovieName) {
      console.log('PosterMovieName is null, cannot perform my list action');
      return;
    }

    const movieData = {...PosterMovieName, type: 'movies'};
    if (isInMyList) {
      removeFromMyList(movieData);
      setIsInMyList(false);
    } else {
      addToMyListApi(movieData);
      setIsInMyList(true);
    }
  };

  return (
    <View style={styles.featuredContainer}>
      {/* <Image source={showDetails?.image} style={styles.featuredImagePlaceholder} /> */}
      {showDetails?.logos?.length > 0 ? (
        <FastImage
          source={{uri: showDetails?.logos?.[0]?.file_path}}
          style={{
            height: 70,
            width: '100%',
          }}
          resizeMode="contain"
        />
      ) : (
        <Text style={styles.title} numberOfLines={2}>
          {showDetails?.info?.name}
        </Text>
      )}

      <View style={styles.metadataContainer}>
        {metadataItems.map((item: any, index: number) => (
          <React.Fragment key={`meta-${index}`}>
            {item === rating && Number(rating) > 0 ? (
              <View style={{flexDirection: 'row'}}>
                <View style={styles.tmdbContainer}>
                  <Text
                    style={{
                      ...styles.metadataText,
                      fontSize: scale(16),
                      color: CommonColors.pine,
                      fontFamily: FontFamily.PublicSans_ExtraBold,
                    }}>
                    {Number(rating) > 0 ? 'TMDB' : ''}
                  </Text>
                </View>
                <Text style={styles.metadataText}> {item}</Text>
              </View>
            ) : item !== rating ? (
              <Text
                style={{
                  ...styles.metadataText,
                  backgroundColor: 'transparent',
                  color: CommonColors.white,
                }}>
                {item}
              </Text>
            ) : null}

            {index < metadataItems.length - 1 && (
              <Text style={styles.metadataSeparator}>•</Text>
            )}
          </React.Fragment>
        ))}
      </View>
      {cast && (
        <View style={{flexDirection: 'row'}}>
          <Text style={styles.titleText}>Cast: </Text>
          <Text numberOfLines={1} style={styles.description}>
            {cast}
          </Text>
        </View>
      )}
      {director && (
        <View style={{flexDirection: 'row'}}>
          <Text style={styles.titleText}>Director: </Text>
          <Text numberOfLines={1} style={styles.description}>
            {director}
          </Text>
        </View>
      )}

      {showButtons && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.playButton,
              focused === 'play' && styles.playButtonFocused,
            ]}
            onPress={onPlayPress}
            activeOpacity={1}
            onFocus={() => handleFocus('play')}
            onBlur={handleBlur}>
            <Image
              source={imagepath.playIconWhite}
              style={styles.playIconPlaceholder}
            />
            <Text style={styles.playButtonText}>Play Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.myListButton,
              focused === 'myList' && styles.myListButtonFocused,
            ]}
            onPress={
              // onMyListPress
              handleMyListPress
            }
            activeOpacity={1}
            onFocus={() => handleFocus('myList')}
            onBlur={handleBlur}>
            <Text style={styles.plusSymbol}>{isInMyList ? '-' : '+'}</Text>
            <Text style={styles.myListButtonText}>
              {isInMyList ? 'Remove from My List' : 'Add to My List'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.descriptionContainer}>
        <Text numberOfLines={5} style={styles.description}>
          {showDetails?.info?.plot}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Featured Content Styles
  featuredContainer: {
    // paddingTop: verticalScale(50),
    width: '40%',
    height: verticalScale(450),
    zIndex: 10,
    marginLeft: moderateScale(40),
    gap: verticalScale(12),
    // backgroundColor: 'red',
  },

  featuredImagePlaceholder: {
    height: '33%',
    width: '40%',
    resizeMode: 'contain',
  },

  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
    // backgroundColor:'red'
  },

  metadataText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(22),
    color: CommonColors.white,
    paddingHorizontal: 4,
    borderRadius: moderateScale(4),
  },
  metadataSeparator: {
    marginHorizontal: moderateScale(4),
    // fontSize: scale(60),
    color: CommonColors.white,
    opacity: 1,
  },
  title: {
    fontFamily: FontFamily.PublicSans_ExtraBold,
    fontSize: scale(55),
    color: CommonColors.white,
  },
  tmdbContainer: {
    height: 16,
    alignSelf: 'flex-end',
    backgroundColor: CommonColors.springGreen,
    borderRadius: 2,
    justifyContent: 'center',
  },

  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '5%',
    width: '100%',
  },

  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CommonColors.buttonPrimary,
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(12),
    width: scale(252),
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    gap: scale(10),
    borderWidth: 2,
    borderColor: 'transparent',
  },

  playButtonFocused: {
    borderColor: CommonColors.white,
    shadowColor: CommonColors.white,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },

  playIconPlaceholder: {
    width: moderateScale(24),
    height: moderateScale(24),
    resizeMode: 'contain',
  },

  playButtonText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(20),
    color: CommonColors.white,
  },

  myListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    width: scale(252),
    justifyContent: 'center',
    gap: moderateScale(12),
    borderWidth: 2,
    borderColor: 'transparent',
  },

  myListButtonFocused: {
    borderColor: CommonColors.white,
    shadowColor: CommonColors.white,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },

  plusSymbol: {
    fontFamily: FontFamily.PublicSans_Bold,
    fontSize: scale(26),
    color: CommonColors.white,
  },

  myListButtonText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(20),
    color: CommonColors.white,
  },

  descriptionContainer: {
    width: '100%',
  },

  description: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: scale(20),
    lineHeight: scale(30),
    color: CommonColors.white,
    textAlign: 'left',
  },

  titleText: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: scale(25),
    lineHeight: scale(30),
    color: CommonColors.white,
    textAlign: 'left',
  },
});

export default React.memo(ShowDetails);
