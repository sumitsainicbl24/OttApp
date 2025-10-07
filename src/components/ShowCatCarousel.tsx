import React, {useMemo, useRef, useCallback} from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TVFocusGuideView,
  View,
  ViewStyle,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import LinearGradient from 'react-native-linear-gradient';
import {CommonColors} from '../styles/Colors';
import {moderateScale, scale, verticalScale, width} from '../styles/scaling';
import FontFamily from '../constants/FontFamily';
import ShowCatCard from './ShowCatCard';
import {debounce} from '../utils/CommonFunctions';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {MainStackParamList} from '../navigation/NavigationsTypes';
import {setCurrentlyPlaying} from '../redux/reducers/main';
import {useAppDispatch} from '../redux/hooks';

interface ShowData {
  group?: string;
  title?: string;
  logo?: string;
  url?: string;
  type?: string;
}

interface ShowCatCarouselProps {
  title: string;
  data: ShowData[];
  onShowPress?: (show: ShowData) => void;
  onFocus?: (data: any) => void;
  getMovieDetails?: (movie: any) => void;
  horizontal?: boolean;
  mainStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  disableScroll?: boolean;
  type?: string;
  ListFooterComponent?:
    | React.ComponentType<any>
    | React.ReactElement<any>
    | null;
  ListEmptyComponent?:
    | React.ComponentType<any>
    | React.ReactElement<any>
    | null;
}

const ShowCatCarousel: React.FC<ShowCatCarouselProps> = ({
  title,
  data,
  onShowPress,
  onFocus,
  getMovieDetails,
  horizontal = false,
  mainStyle,
  titleStyle,
  disableScroll = false,
  type,
  ListEmptyComponent,
  ListFooterComponent,
}) => {
  const flashListRef = useRef<FlashList<ShowData>>(null);
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const dispatch = useAppDispatch();
  const currentFocusedRowRef = useRef(0);

  // Calculate number of columns based on screen width and card width
  const numColumns = useMemo(() => {
    if (horizontal) return 1;

    const cardWidth = scale(250); // ShowCatCard width
    const horizontalPadding = moderateScale(10); // Total horizontal padding
    const cardMargin = moderateScale(15); // Margin between cards
    const availableWidth = width - horizontalPadding;
    const minColumns = 1;
    const maxColumns = Math.floor(
      (availableWidth + cardMargin) / (cardWidth + cardMargin),
    );
    return Math.max(minColumns, maxColumns);
  }, [horizontal]);

  const handleShowPress = (show: ShowData) => {
    console.log(show, 'showshowshow');

    if (show?.type === 'series' || type === 'series') {
      dispatch(setCurrentlyPlaying(show));
      navigation.navigate('MoviePlayScreen', {show: show});
    }
    if (show?.type === 'movies' || type === 'movies') {
      dispatch(setCurrentlyPlaying(show));
      navigation.navigate('MoviePlayScreen', {movie: show});
    }
  };

  const handleItemFocus = useCallback((index: number, item: ShowData) => {
    console.log('item-->>>>>>>', item);
    onFocus?.(item);

    // Calculate which row this item is in (0-indexed)
    const rowIndex = Math.floor(index / numColumns);
    
    // Only scroll if we're not on the first row and not disabled
    if (!disableScroll && rowIndex !== currentFocusedRowRef.current) {
      currentFocusedRowRef.current = rowIndex;
      
      // Calculate the scroll position to show current row + peek of next row
      // Card height + vertical margins
      const itemHeight = verticalScale(400) + verticalScale(40); // card height + margins
      const scrollToY = rowIndex * itemHeight;
      
      // Use scrollToOffset for FlashList
      flashListRef.current?.scrollToOffset({
        offset: scrollToY,
        animated: true,
      });
    }
  }, [numColumns, disableScroll, onFocus]);

  const renderShowItem = ({item, index}: {item: ShowData; index: number}) => {
    return (
      <ShowCatCard
        show={item}
        onPress={() => handleShowPress(item)}
        onFocus={() => handleItemFocus(index, item)}
        style={horizontal ? styles.horizontalGridItem : styles.gridItem}
      />
    );
  };

  return (
    <View
      style={[
        styles.sectionContainer,
        horizontal && styles.horizontalSectionContainer,
        mainStyle,
      ]}>
      <Text style={[styles.sectionTitle, titleStyle]}>{title}</Text>
      <TVFocusGuideView  style={styles.carouselWrapper}>
        <FlashList
          ref={flashListRef}
          data={data}
          renderItem={renderShowItem}
          keyExtractor={(item, index) =>
            item?.url?.toString() || index.toString()
          }
          numColumns={numColumns}
          horizontal={horizontal}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={ListFooterComponent}
          contentContainerStyle={
            horizontal ? styles.horizontalGridContainer : styles.gridContainer
          }
          estimatedItemSize={horizontal ? scale(250) : verticalScale(400)}
          scrollEnabled={!disableScroll}
        />
        {/* Overlay to create fade effect at the bottom showing peek of next row */}
        {!horizontal && (
          <LinearGradient
            colors={[
              'transparent',
              'transparent',
              'transparent',
              CommonColors.themeMain + '90',
              CommonColors.themeMain,
            ]}
            style={styles.bottomOverlay}
            pointerEvents="none"
          />
        )}
      </TVFocusGuideView>
    </View>
  );
};

export default ShowCatCarousel;

const styles = StyleSheet.create({
  sectionContainer: {
    width: width,
    paddingHorizontal: moderateScale(20),
    height: verticalScale(560), // Adjusted to show one row + peek of next row
    // backgroundColor: 'red',
  },
  sectionTitle: {
    fontFamily: FontFamily.PublicSans_Bold,
    fontSize: scale(38),
    color: CommonColors.white,
    marginLeft: moderateScale(20),
    // marginTop: verticalScale(25),
    // marginBottom: verticalScale(20),
  },
  carouselWrapper: {
    flex: 1,
    position: 'relative',
    marginTop: verticalScale(20),
    overflow: 'hidden', // Ensure content beyond the wrapper is clipped
  },
  gridContainer: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(20),
  },
  gridItem: {
    // flex: 1,
    marginHorizontal: moderateScale(7.5), // Half of the original marginRight to center spacing
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: verticalScale(150), // Increased height for better fade effect
    zIndex: 10,
  },
  horizontalSectionContainer: {
    height: verticalScale(520),
  },
  horizontalGridContainer: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(20),
  },
  horizontalGridItem: {
    marginHorizontal: moderateScale(7.2),
  },
});
