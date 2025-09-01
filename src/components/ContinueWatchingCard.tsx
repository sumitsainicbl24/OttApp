import React, {useState} from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import {CommonColors} from '../styles/Colors';
import {moderateScale, scale, verticalScale, width} from '../styles/scaling';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {MainStackParamList} from '../navigation/NavigationsTypes';
import {setCurrentlyPlaying} from '../redux/reducers/main';
import {useAppDispatch} from '../redux/hooks';
import FontFamily from '../constants/FontFamily';
import SimpleMarquee from './MarqueeText';
import {formatTime} from '../utils/CommonFunctions';

interface ContinueWatchingData {
  id: number;
  title: string;
  image: ImageSourcePropType;
  logo?: ImageSourcePropType;
  type?: string;
  currentTime?: number;
  duration?: number;
}

interface ContinueWatchingCardProps extends TouchableOpacityProps {
  data: ContinueWatchingData;
  hasTVPreferredFocus?: boolean;
  onFocus?: (event: any) => void;
  onBlur?: (event: any) => void;
  onPress?: () => void;
}

const ContinueWatchingCard: React.FC<ContinueWatchingCardProps> = ({
  data,
  hasTVPreferredFocus,
  style,
  onFocus,
  onBlur,
  onPress,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const dispatch = useAppDispatch();
  const handleFocus = (event: any) => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: any) => {
    setIsFocused(false);
    onBlur?.(event);
  };

  const handlePress = () => {
    console.log('Continue watching pressed:', data.title);
    if (data?.type == 'series') {
      dispatch(setCurrentlyPlaying(data));
      navigation.navigate('MoviePlayScreen', {show: data});
    } else {
      dispatch(setCurrentlyPlaying(data));
      navigation.navigate('MoviePlayScreen', {movie: data});
    }
    // onPress?.()
  };

  console.log('data from continue watching card', data);

  return (
    <TouchableOpacity
      hasTVPreferredFocus={hasTVPreferredFocus}
      activeOpacity={0.8}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onPress={handlePress}
      {...props}>
      <View
        style={[
          styles.continueWatchingCard,
          isFocused && styles.continueWatchingCardFocused,
          style,
        ]}>
        <Image
          source={data.image ? (data.image as any) : {uri: data.logo}}
          style={[
            styles.continueWatchingImage,
            isFocused && styles.continueWatchingImageFocused,
          ]}
        />
        {data?.currentTime && data?.duration && (
          <View
            style={{
              ...styles.progressBarContainer,
              bottom: isFocused ? 2 : 1,
              left: isFocused ? 3 : 2,
            }}>
            <View
              style={{
                ...styles.progressBar,
                width: `${(data?.currentTime / data?.duration) * 100}%`,
                // paddingHorizontal: moderateScale(4),
                // alignSelf: 'center',
              }}
            />
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {data?.title}
      </Text>
      <Text style={styles.remainingTime} numberOfLines={1}>
        {formatTime(Number(data?.duration) - Number(data?.currentTime))}
      </Text>
    </TouchableOpacity>
  );
};

export default ContinueWatchingCard;

const styles = StyleSheet.create({
  continueWatchingCard: {
    height: verticalScale(260),
    borderRadius: scale(18),
    width: scale(400),
    overflow: 'hidden',
    position: 'relative',
    marginRight: moderateScale(20),
    borderColor: 'transparent',
    marginTop: verticalScale(20),
    flexDirection: 'column',
    padding: moderateScale(2),
  },
  continueWatchingCardFocused: {
    borderColor: CommonColors.white,
    transform: [{scale: 1.07}],
    borderRadius: scale(10),
    borderWidth: 1,
    shadowColor: CommonColors.white,
    padding: moderateScale(4),
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  continueWatchingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  continueWatchingImageFocused: {
    // Additional image styling when focused if needed
  },
  progressBarContainer: {
    position: 'absolute',
    height: verticalScale(10),
    width: '100%',
    backgroundColor: CommonColors.blackOpacity40,
    right: 3,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    height: verticalScale(10),
    width: '100%',
    backgroundColor: CommonColors.buttonPrimary,
    // alignSelf: 'center',
  },
  title: {
    fontSize: moderateScale(16),
    fontFamily: FontFamily.PublicSans_Bold,
    color: CommonColors.textWhite,
    marginTop: verticalScale(20),
    maxWidth: scale(388),
  },
  remainingTime: {
    fontSize: moderateScale(16),
    fontFamily: FontFamily.PublicSans_Regular,
    color: CommonColors.blackOpacity70,
    marginTop: verticalScale(10),
  },
});
