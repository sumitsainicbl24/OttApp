import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import SideNavigation from './SideNavigation';
import { moderateScale, width, height } from '../styles/scaling';
import { CommonColors } from '../styles/Colors';

interface MainLayoutProps {
  children: React.ReactNode;
  activeScreen: string;
  hideSidebar?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, activeScreen, hideSidebar = false }) => {
  // Memoize the isSettings value
  const isSettings = useMemo(() => activeScreen === 'Settings', [activeScreen]);
  
  // Memoize the content container style
  const contentContainerStyle = useMemo(() => [
    styles.contentContainer,
    isSettings && styles.contentWithSettings
  ], [isSettings]);

  // Memoize the side navigation
  const sideNav = useMemo(() => {
    return !isSettings && !hideSidebar && <SideNavigation activeScreen={activeScreen} />;
  }, [isSettings, activeScreen, hideSidebar]);

  return (
    <View style={styles.container}>
      {/* Show SideNavigation only when not on Settings screen and not hidden */}
      {sideNav}
      
      {/* Content container for all screens */}
      <View style={contentContainerStyle}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: CommonColors.themeMain,
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: CommonColors.themeMain,
  },
  contentWithSettings: {
    
  },
});

export default MainLayout; 