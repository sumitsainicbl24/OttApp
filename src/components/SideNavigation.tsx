import React, { useState, useMemo } from 'react'
import { View, TouchableOpacity, StyleSheet, Image, Text } from 'react-native'
import { height, moderateScale, scale, verticalScale } from '../styles/scaling'
import { CommonColors } from '../styles/Colors'
import imagepath from '../constants/imagepath'
import FontFamily from '../constants/FontFamily'
import { NavigationProp } from '@react-navigation/native'
import { MainStackParamList } from '../navigation/NavigationsTypes'
import { useNavigation } from '@react-navigation/native'

interface SideNavigationProps {
  onNavigate?: (screen: string) => void
  activeScreen?: string
}

const SideNavigation: React.FC<SideNavigationProps> = ({ 
  onNavigate = () => {}, 
  activeScreen = 'Movies' 
}) => {
  const [focusedItem, setFocusedItem] = useState<string | null>(null)
  const navigation = useNavigation<NavigationProp<MainStackParamList>>()

  const handleNavPress = (screen: string) => {
    console.log(`${screen} pressed`)
    // Type-safe navigation
    switch(screen) {
      case 'Home':
      case 'Tv':
      case 'Movies':
      case 'Shows':
      case 'Favorites':
      case 'Search':
        navigation.navigate(screen, { activeScreen: screen })
        break
      case 'Settings':
        // Settings doesn't take activeScreen parameter according to types
        navigation.navigate('Settings')
        break
      case 'Radio':
      default:
        // Handle other screens or add them to MainStackParamList if needed
        console.log(`Navigation to ${screen} not implemented yet`)
        break
    }
  }

  const handleFocus = (screen: string) => {
    setFocusedItem(screen)
  }

  const handleBlur = () => {
    setFocusedItem(null)
  }

  // Memoize the getIconStyle function to prevent recreating style arrays on each render
  const getIconStyle = useMemo(() => {
    return (screen: string) => {
      const isActive = activeScreen === screen
      const isFocused = focusedItem === screen
      
      return [
        styles.sideNavIconContainer,
        !focusedItem && {justifyContent: 'center'},
        isActive && styles.sideNavActiveIconContainer,
        !isActive && styles.sideNavInactiveIconContainer,
        isFocused && styles.sideNavFocusedIconContainer
      ]
    }
  }, [activeScreen, focusedItem])

  // Memoize the container style
  const containerStyle = useMemo(() => [
    styles.sideNavigationContainer, 
    focusedItem && {width: scale(410)}
  ], [focusedItem])

  // Memoize the logo section
  const logoSection = useMemo(() => (
    <View style={styles.sideNavLogoContainer}>
      <Image source={imagepath.appIconSiderBar} style={styles.sideNavLogo} />
    </View>
  ), [])

  // Navigation items configuration to reduce repetitive code
  const navItems = useMemo(() => [
    {
      id: 'Home',
      icon: activeScreen === 'Home' || focusedItem === 'Home' ? imagepath.homeIcon : imagepath.homeIcon,
    },
    {
      id: 'Search',
      icon: activeScreen === 'Search' || focusedItem === 'Search' ? imagepath.searchIconActive : imagepath.searchIcon,
    },
    {
      id: 'Tv',
      icon: activeScreen === 'Tv' || focusedItem === 'Tv' ? imagepath.TvIconActive : imagepath.TvIcon,
    },
    {
      id: 'Movies',
      icon: activeScreen === 'Movies' || focusedItem === 'Movies' ? imagepath.movieIconActive : imagepath.movieIcon,
    },
    {
      id: 'Shows',
      icon: activeScreen === 'Shows' || focusedItem === 'Shows' ? imagepath.showIconActive : imagepath.showsIcon,
    },
    {
      id: 'Radio',
      icon: activeScreen === 'Radio' || focusedItem === 'Radio' ? imagepath.radioIconActive : imagepath.radioIcon,
    },
    {
      id: 'Favorites',
      icon: activeScreen === 'Favorites' || focusedItem === 'Favorites' ? imagepath.favlistIconActive : imagepath.favlistIcon,
    }
  ], [activeScreen, focusedItem])

  // Memoize the settings button
  const settingsButton = useMemo(() => (
    <TouchableOpacity 
      style={getIconStyle('Settings')}
      onPress={() => handleNavPress('Settings')}
      onFocus={() => handleFocus('Settings')}
      onBlur={handleBlur}
      activeOpacity={1}
      {...({ 
        isTVSelectable: true,
        nextFocusLeft: undefined,
        nextFocusRight: undefined
      } as any)}
    >
      <Image source={imagepath.settingIcon} style={[styles.sideNavIcon, focusedItem=='Settings' && {tintColor: CommonColors.black}]} />
      {
        focusedItem && (
          <Text style={[styles.sideNavIconText, focusedItem=='Settings' && {color: CommonColors.black, opacity: 1}]}>Settings</Text>
        )
      }
    </TouchableOpacity>
  ), [focusedItem, getIconStyle])

  return (
    <View style={containerStyle}>
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
            nextFocusRight: undefined
          } as any)}
        >
          <Image 
            source={item.icon} 
            style={[styles.sideNavIcon, focusedItem===item.id && {tintColor: CommonColors.black, opacity: 1}]} 
          />
          {
            focusedItem && (
              <Text style={[styles.sideNavIconText, focusedItem===item.id && {color: CommonColors.black, opacity: 1}]}>{item.id}</Text>
            )
          }
        </TouchableOpacity>
      ))}
      </View>

      {/* Bottom Section */}
      <View style={styles.sideNavBottomSection}>
        {settingsButton}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  sideNavigationContainer: {
    // position: 'absolute',
    left: 0,
    // top: '50%',
    // transform: [{ translateY: -150 }], // Center vertically
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: CommonColors.themeSecondary,
    paddingVertical: moderateScale(20),
    paddingHorizontal: moderateScale(20),
    justifyContent: 'space-between',
    // width: moderateScale(80),
    zIndex: 100,
    height: height,
  },

  sideNavIconContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: moderateScale(10),
    paddingVertical: moderateScale(16),
    paddingHorizontal: moderateScale(10),
    marginVertical: moderateScale(8),
    flexDirection: 'row',
  },

  sideNavIcon: {
    width: moderateScale(25),
    height: moderateScale(25),
    borderRadius: moderateScale(2),
    tintColor: CommonColors.white,
    opacity: 0.5
  },

  sideNavActiveIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: moderateScale(6),
  },

  sideNavInactiveIconContainer: {
    // opacity: 0.5,
  },

  sideNavLogoContainer: {
    alignItems: 'center',
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

  sideNavBottomSection: {
    marginTop: moderateScale(40),
  },

  sideNavFocusedIconContainer: {
    borderRadius: moderateScale(6),
    borderWidth: 1,
    // borderColor: CommonColors.white,
    transform: [{ scale: 1.05 }],
    backgroundColor: CommonColors.white,
  },
  sideNavIconText: {
    fontSize: scale(20),
    fontFamily: FontFamily.PublicSans_SemiBold,
    color: CommonColors.white,
    opacity: 0.5
  },
})

export default SideNavigation 