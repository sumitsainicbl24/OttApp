import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Image, Text } from 'react-native';
import SideNavigation from './SideNavigation';
import { moderateScale } from '../styles/scaling';
import { CommonColors } from '../styles/Colors';
import imagepath from '../constants/imagepath';

interface DrawerLayoutProps {
  children: React.ReactNode;
  activeScreen: string;
}

const DrawerLayout: React.FC<DrawerLayoutProps> = ({ children, activeScreen }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerAnimation = new Animated.Value(isDrawerOpen ? 0 : -250);

  const toggleDrawer = () => {
    const toValue = isDrawerOpen ? -250 : 0;
    
    Animated.timing(drawerAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Drawer Toggle Button */}
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={toggleDrawer}
          {...({ 
            isTVSelectable: true,
            hasTVPreferredFocus: true
          } as any)}
        >
          <Image 
            source={imagepath.appIconSiderBar} 
            style={styles.menuIcon} 
          />
        </TouchableOpacity>
        
        {/* Main Content */}
        {children}
      </View>
      
      {/* Drawer */}
      <Animated.View 
        style={[
          styles.drawer,
          { transform: [{ translateX: drawerAnimation }] }
        ]}
      >
        <SideNavigation activeScreen={activeScreen} />
      </Animated.View>
      
      {/* Overlay when drawer is open */}
      {isDrawerOpen && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={toggleDrawer}
          activeOpacity={1}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: CommonColors.themeMain,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: moderateScale(90),
    zIndex: 100,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 90,
  },
  menuButton: {
    position: 'absolute',
    top: moderateScale(20),
    left: moderateScale(20),
    zIndex: 50,
    padding: moderateScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuIcon: {
    width: moderateScale(30),
    height: moderateScale(30),
  },
});

export default DrawerLayout; 