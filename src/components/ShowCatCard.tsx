import React, {useState, useEffect} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import {CommonColors} from '../styles/Colors';
import {moderateScale, scale, verticalScale} from '../styles/scaling';
import FontFamily from '../constants/FontFamily';
import imagepath from '../constants/imagepath';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {MainStackParamList} from '../navigation/NavigationsTypes';
import {imageResolutionHandlerForUrl} from '../utils/CommonFunctions';
import SimpleMarquee from './MarqueeText';
import CircularProgressBar from './CircularProgressBar';

interface ShowData {
  group?: string;
  title?: string;
  logo?: string;
  url?: string;
  type?: string;
  num?: number;
  name?: string;
  series_id?: number;
  cover?: string;
  plot?: string;
  cast?: string;
  director?: string;
  genre?: string;
  releaseDate?: string;
  release_date?: string;
  last_modified?: string;
  rating?: string;
  rating_5based?: string;
  backdrop_path?: string[];
  youtube_trailer?: string;
  tmdb?: string;
  episode_run_time?: string;
  category_id?: string;
  category_ids?: number[];
}

interface ShowCatCardProps extends TouchableOpacityProps {
  show: ShowData;
  hasTVPreferredFocus?: boolean;
  onFocus?: (event: any) => void;
  onBlur?: (event: any) => void;
  onPress?: () => void;
  currentFocusedItem?: ShowData;
}

const ShowCatCard: React.FC<ShowCatCardProps> = ({
  show,
  hasTVPreferredFocus,
  style,
  onFocus,
  onBlur,
  onPress,
  currentFocusedItem,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  // Reset image error state when show changes
  useEffect(() => {
    setImageError(false);
  }, [show.title, show.logo]);

  const handleFocus = (event: any) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: any) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  const handlePress = () => {
    onPress?.();
  };

  const handleSource = () => {
    if (imageError) {
      return imagepath.VideoPlaceHolder;
    }

    if (show?.logo?.toString().includes('https://')) {
      return {uri: imageResolutionHandlerForUrl(show?.logo?.toString(), 500)};
    }
    return imagepath.VideoPlaceHolder;
  };

  const handleImageError = () => {
    console.log('Image failed to load, showing placeholder for:', show.title);
    setImageError(true);
  };

  return (
    <TouchableOpacity
      style={[styles.showCard, isFocused && styles.showCardFocused, style]}
      hasTVPreferredFocus={hasTVPreferredFocus}
      activeOpacity={1}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onPress={handlePress}
      {...props}>
      <Image
        source={show?.cover ? {uri: show?.cover} : handleSource()}
        style={[styles.showImage, isFocused && styles.showImageFocused]}
        onError={handleImageError}
      />
      {show?.rating && Number(show?.rating) > 0 && (
        <View style={styles.ratingContainer}>
          <CircularProgressBar
            rating={Number(show?.rating)}
            size={16}
            strokeWidth={1}
            fontSize={scale(13)}
          />
        </View>
      )}
      <View
        style={[
          styles.showTitleContainer,
          isFocused && styles.showTitleContainerFocused,
        ]}>
        {/* <Text numberOfLines={1} style={styles.showTitle}>{show.title}</Text> */}
        <SimpleMarquee
          text={show.title || show?.name || 'Channel Name'}
          shouldStart={isFocused}
          textStyle={[styles.showTitle, isFocused && styles.showTitleFocused]}
        />
      </View>
    </TouchableOpacity>
  );
};

export default ShowCatCard;

const styles = StyleSheet.create({
  showCard: {
    width: scale(250),
    height: verticalScale(400),
    borderRadius: scale(24),
    marginVertical: verticalScale(15),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: verticalScale(25),
    backgroundColor: '#333333',
  },

  showTitleContainerFocused: {
    flex: 1,
    backgroundColor: CommonColors.white,
    borderBottomLeftRadius: scale(12),
    borderBottomRightRadius: scale(12),
    justifyContent: 'center',
    paddingHorizontal: moderateScale(10),
  },
  showTitleFocused: {
    fontSize: moderateScale(16),
    fontFamily: FontFamily.PublicSans_Bold,
    color: CommonColors.black,
  },
  ratingContainer: {
    position: 'absolute',
    bottom: 22,
    left: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: moderateScale(5),
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  showCardFocused: {
    borderColor: CommonColors.white,
    transform: [{scale: 1.05}],
    shadowColor: CommonColors.white,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    zIndex: 1000,
  },
  showImage: {
    width: '100%',
    height: '90%',
    resizeMode: 'cover',
    borderTopLeftRadius: scale(21),
    borderTopRightRadius: scale(21),
  },
  showImageFocused: {
    // Additional image styling when focused if needed
  },
  showTitleContainer: {
    flex: 1,
    backgroundColor: '#333333',
    borderBottomLeftRadius: scale(12),
    borderBottomRightRadius: scale(12),
    justifyContent: 'center',
    paddingHorizontal: moderateScale(10),
  },
  showTitle: {
    fontSize: moderateScale(16),
    fontFamily: FontFamily.PublicSans_Regular,
    color: CommonColors.textWhite,
  },
});
