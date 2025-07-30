import React, { useState, useRef } from 'react'
import { Image, Text, TouchableOpacity, View, TVFocusGuideView, useTVEventHandler } from 'react-native'
import { StyleSheet } from 'react-native'
import { CommonColors } from '../styles/Colors'
import { moderateScale, scale, verticalScale } from '../styles/scaling'
import FontFamily from '../constants/FontFamily'
import imagepath from '../constants/imagepath'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { MainStackParamList } from '../navigation/NavigationsTypes'

interface TopNavigationProps {
  activeTab?: string
  hasTVPreferredFocus?: boolean
  hasScrolled?: boolean
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  activeTab = 'Home',
  hasTVPreferredFocus = false,
  hasScrolled = false,
}) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>()
  const menuItems = ['Home',
     'Search', 
     'Tv', 
     'Movies', 
     'Shows',
     'Favorites',
    ]
  
  const [focusedItem, setFocusedItem] = useState<string | null>(null)
  const [initialFocus, setInitialFocus] = useState(true)
  
  // Refs for focus management
  const menuRefs = useRef<{[key: string]: any}>({})
  const settingsRef = useRef<any>(null)
  
  const handleTabPress = (tab: string) => {
    navigation.navigate(tab as any, {activeScreen: tab})
  }

  const handleFocus = (item: string) => {
    setFocusedItem(item)
    if (initialFocus) {
      setInitialFocus(false)
    }
  }

  const handleBlur = () => {
    setFocusedItem(null)
  }

  // TV remote event handler
  useTVEventHandler((evt: any) => {
    if (evt && evt.eventType === 'select') {
      if (focusedItem) {
        if (focusedItem === 'Settings') {
          handleTabPress('Settings')
        } else {
          handleTabPress(focusedItem)
        }
      }
    }
  })

  return (
    <View style={[
      styles.topNavContainer,
      hasScrolled && styles.scrolledBackground
    ]}>
      <TVFocusGuideView style={styles.navFocusGuideView} autoFocus>
        <View style={styles.navMenuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item}
              ref={el => menuRefs.current[item] = el}
              style={[
                item === activeTab ? styles.activeMenuItem : undefined,
                styles.menuItem,
                focusedItem === item && styles.focusedMenuItem
              ]}
              onPress={() => handleTabPress(item)}
              onFocus={() => handleFocus(item)}
              onBlur={handleBlur}
              activeOpacity={1}
              hasTVPreferredFocus={hasTVPreferredFocus && index === 0}
              nextFocusRight={index < menuItems.length - 1 ? menuRefs.current[menuItems[index + 1]] : settingsRef.current}
              nextFocusLeft={index > 0 ? menuRefs.current[menuItems[index - 1]] : undefined}
            >
              <Text style={[
                item === activeTab ? styles.activeMenuText : styles.menuText,
                focusedItem === item && styles.focusedMenuText
              ]}>
                { item === 'Favorites' ? 'My List' : item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TVFocusGuideView>
      
      <View style={styles.userActionsContainer}>
        {/* <TouchableOpacity 
          style={[
            styles.iconButton,
            focusedItem === 'Notification' && styles.focusedIconButton
          ]} 
          onPress={()=>handleTabPress('Notification')}
          onFocus={() => handleFocus('Notification')}
          onBlur={handleBlur}
          activeOpacity={0.8}
        >
          <Image source={imagepath.BellIcon} style={styles.bellIconPlaceholder} />
        </TouchableOpacity> */}
        <TouchableOpacity 
          ref={settingsRef}
          style={[
            styles.iconButton,
            focusedItem === 'Settings' && styles.focusedIconButton
          ]} 
          onPress={()=>handleTabPress('Settings')}
          onFocus={() => handleFocus('Settings')}
          onBlur={handleBlur}
          activeOpacity={0.8}
          nextFocusLeft={menuRefs.current[menuItems[menuItems.length - 1]]}
        >
          <Image source={imagepath.settingIcon} style={styles.settingsIconPlaceholder} />
        </TouchableOpacity>
        {/* <TouchableOpacity 
          style={[
            styles.profileIcon,
            focusedItem === 'Profile' && styles.focusedProfileIcon
          ]} 
          onPress={()=>handleTabPress('Profile')}
          onFocus={() => handleFocus('Profile')}
          onBlur={handleBlur}
          activeOpacity={0.8}
        >
          <View style={styles.profileImagePlaceholder} />
        </TouchableOpacity> */}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  topNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(40),
    paddingVertical: verticalScale(40),
    zIndex: 10,
  },
  
  navFocusGuideView: {
    flex: 1,
  },

  navMenuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(15),
  },
  
  activeMenuItem: {
    backgroundColor: CommonColors.white,
    // paddingHorizontal: moderateScale(20),
    // paddingVertical: verticalScale(6),
    // borderRadius: moderateScale(36),
  },

  menuItem: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(36),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  focusedMenuItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: CommonColors.white,
    // transform: [{ scale: 1.05 }],
    shadowColor: CommonColors.white,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  
  activeMenuText: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: scale(26),
    color: CommonColors.themeMain,
  },
  
  menuText: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: scale(26),
    color: CommonColors.white,
  },
  
  focusedMenuText: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: scale(26),
    color: CommonColors.white,
  },
  
  userActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(32),
  },
  
  iconButton: {
    width: moderateScale(50),
    height: moderateScale(50),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: moderateScale(25),
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  focusedIconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: CommonColors.white,
    transform: [{ scale: 1.1 }],
    shadowColor: CommonColors.white,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  
  bellIconPlaceholder: {
    width: moderateScale(26.45),
    height: moderateScale(26.45),
    borderRadius: moderateScale(4),
    resizeMode: 'contain',
  },
  
  settingsIconPlaceholder: {
    width: moderateScale(26.45),
    height: moderateScale(26.45),
    resizeMode: 'contain',
    borderRadius: moderateScale(4),
  },
  
  profileIcon: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  focusedProfileIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: CommonColors.white,
    transform: [{ scale: 1.1 }],
    shadowColor: CommonColors.white,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  
  profileImagePlaceholder: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#C4C4C4',
  },
  
  scrolledBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
})

export default TopNavigation 