import React, {useState, useMemo, useRef, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Text,
  Animated,
} from 'react-native';
import {height, moderateScale, scale, verticalScale} from '../styles/scaling';
import {CommonColors} from '../styles/Colors';
import imagepath from '../constants/imagepath';
import FontFamily from '../constants/FontFamily';
import {NavigationProp} from '@react-navigation/native';
import {MainStackParamList} from '../navigation/NavigationsTypes';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

interface SideNavigationProps {
  onNavigate?: (screen: string) => void;
  activeScreen?: string;
  setIsFocused?: (isFocused: boolean) => void;
}

const SideNavigation: React.FC<SideNavigationProps> = ({
  onNavigate = () => {},
  activeScreen = 'Movies',
  setIsFocused = () => {},
}) => {
  const [focusedItem, setFocusedItem] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const animatedWidth = useRef(new Animated.Value(50)).current;

  // Animate width when focusedItem changes
  useEffect(() => {
    const targetWidth = focusedItem ? scale(400) : 50;
    Animated.timing(animatedWidth, {
      toValue: targetWidth,
      duration: 50,
      useNativeDriver: false, // width animation requires layout animation
    }).start();
  }, [drawerOpen]);

  const handleNavPress = (screen: string) => {
    console.log(`${screen} pressed`);

    // Type-safe navigation
    switch (screen) {
      case 'Home':
      case 'Tv':
      case 'Movies':
      case 'Shows':
      case 'Favorites':
      case 'Search':
        navigation.navigate(screen, {activeScreen: screen});
        break;
      case 'Settings':
        // Settings doesn't take activeScreen parameter according to types
        navigation.navigate('Settings');
        break;
      case 'Radio':
      default:
        // Handle other screens or add them to MainStackParamList if needed
        console.log(`Navigation to ${screen} not implemented yet`);
        break;
    }
  };

  const handleFocus = (screen: string) => {
    setIsFocused(true);
    setDrawerOpen(true);

    setFocusedItem(screen);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setDrawerOpen(false);
    setFocusedItem(null);
  };

  // Memoize the getIconStyle function to prevent recreating style arrays on each render
  const getIconStyle = useMemo(() => {
    return (screen: string) => {
      const isActive = activeScreen === screen;
      const isFocused = focusedItem === screen;

      return [
        styles.sideNavIconContainer,
        !focusedItem && {justifyContent: 'center'},
        isActive && styles.sideNavActiveIconContainer,
        !isActive && styles.sideNavInactiveIconContainer,
        isFocused && styles.sideNavFocusedIconContainer,
      ];
    };
  }, [activeScreen, focusedItem]);

  // Memoize the container style with animated width
  const containerStyle = useMemo(
    () => [styles.sideNavigationContainer, {width: animatedWidth}],
    [animatedWidth],
  );

  // Memoize the logo section
  const logoSection = useMemo(
    () => (
      <View style={styles.sideNavLogoContainer}>
        <Image source={imagepath.appIconSiderBar} style={styles.sideNavLogo} />
      </View>
    ),
    [],
  );
  const navMenu = [
    {
      id: 'Home',
      icon:
        activeScreen === 'Home' || focusedItem === 'Home'
          ? imagepath.homeIconActive
          : imagepath.homeIcon,
    },
    {
      id: 'Search',
      icon:
        activeScreen === 'Search' || focusedItem === 'Search'
          ? imagepath.searchIconActive
          : imagepath.searchIcon,
    },
    {
      id: 'Tv',
      icon:
        activeScreen === 'Tv' || focusedItem === 'Tv'
          ? imagepath.TvIconActive
          : imagepath.TvIcon,
    },
    {
      id: 'Movies',
      icon:
        activeScreen === 'Movies' || focusedItem === 'Movies'
          ? imagepath.movieIconActive
          : imagepath.movieIcon,
    },
    {
      id: 'Shows',
      icon:
        activeScreen === 'Shows' || focusedItem === 'Shows'
          ? imagepath.showIconActive2
          : imagepath.showsIcon,
    },
    {
      id: 'Favorites',
      icon:
        activeScreen === 'Favorites' || focusedItem === 'Favorites'
          ? imagepath.favlistIconActive
          : imagepath.favlistIcon,
    },
  ];

  // Navigation items configuration to reduce repetitive code
  const navItems = useMemo(() => navMenu, [activeScreen, focusedItem]);

  // Memoize the settings button
  const settingsButton = useMemo(
    () => (
      <TouchableOpacity
        style={getIconStyle('Settings')}
        onPress={() => handleNavPress('Settings')}
        onFocus={() => handleFocus('Settings')}
        onBlur={handleBlur}
        activeOpacity={1}
        {...({
          isTVSelectable: true,
          nextFocusLeft: undefined,
          nextFocusRight: undefined,
        } as any)}>
        <Image
          source={
            focusedItem == 'Settings'
              ? imagepath.settingIconActive
              : imagepath.settingIcon
          }
          style={[
            styles.sideNavIcon,
            focusedItem == 'Settings' && {
              tintColor: CommonColors.white,
              opacity: 1,
            },
          ]}
        />
        {focusedItem && (
          <Text
            style={[
              styles.sideNavIconText,
              focusedItem == 'Settings' && styles.focusedTextGlow,
            ]}>
            Settings
          </Text>
        )}
      </TouchableOpacity>
    ),
    [focusedItem, getIconStyle],
  );

  return (
    <Animated.View style={containerStyle}>
      {/* Logo */}
      {logoSection}

      <View>
        {/* Main Navigation Icons */}
        {navItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={getIconStyle(item.id)}
            onPress={() => handleNavPress(item.id)}
            onFocus={() => handleFocus(item.id)}
            onBlur={handleBlur}
            activeOpacity={1}
            {...({
              isTVSelectable: true,
              nextFocusLeft: undefined,
              nextFocusRight: undefined,
            } as any)}>
            {/* {focusedItem === item.id && <View style={styles.glow} />} */}
            {(focusedItem === item.id || activeScreen === item.id) && (
              <Image
                source={imagepath.blur}
                style={
                  activeScreen === item.id ? styles.blurActive : styles.blur
                }
              />
            )}
            <Image
              source={item.icon}
              style={[
                styles.sideNavIcon,
                (focusedItem === item.id || activeScreen === item.id) && {
                  tintColor: CommonColors.white,
                  opacity: 1,
                },
              ]}
            />
            {drawerOpen && (
              <Text
                style={[
                  styles.sideNavIconText,
                  focusedItem === item.id && styles.focusedTextGlow,
                ]}>
                {item?.id}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Section */}
      <View style={styles.sideNavBottomSection}>{settingsButton}</View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sideNavigationContainer: {
    left: 0,
    backgroundColor: CommonColors.black,
    // backgroundColor:'transparent',
    paddingVertical: moderateScale(20),
    paddingHorizontal: moderateScale(20),
    justifyContent: 'space-between',
    zIndex: 3000,
    height: height,
    width: 50,
    position: 'absolute',
  },
  blur: {
    position: 'absolute',
    width: 30,
    height: 30,
    left: 1,
  },

  blurActive: {
    width: 30,
    height: 30,
    position: 'absolute',
  },

  sideNavIconContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: moderateScale(10),
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(10),
    marginVertical: moderateScale(8),
    flexDirection: 'row',
  },

  sideNavIcon: {
    width: moderateScale(25),
    height: moderateScale(25),
    borderRadius: moderateScale(2),
    tintColor: CommonColors.white,
    opacity: 0.5,
  },

  sideNavActiveIconContainer: {
    // backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: moderateScale(6),
  },

  sideNavInactiveIconContainer: {
    // opacity: 0.5,
  },

  sideNavLogoContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: moderateScale(16),
    paddingHorizontal: moderateScale(10),
    marginBottom: moderateScale(20),
  },

  sideNavLogo: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(4),
  },

  sideNavBottomSection: {},

  sideNavFocusedIconContainer: {
    borderRadius: moderateScale(6),
    transform: [{scale: 1.05}],
  },
  sideNavIconText: {
    fontSize: scale(32),
    fontFamily: FontFamily.PublicSans_Bold,
    color: CommonColors.white,
    opacity: 1,
    zIndex: -1000,
    marginLeft: moderateScale(16),
  },
  focusedTextGlow: {
    color: CommonColors.white,
    opacity: 1,
    textShadowColor: CommonColors.white,
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 20,
    elevation: 5,
  },
  glow: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 60,
    opacity: 0.8,
    shadowColor: CommonColors.white,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    elevation: 1,
    alignSelf: 'center',
    left: 10,
  },
});

export default SideNavigation;
