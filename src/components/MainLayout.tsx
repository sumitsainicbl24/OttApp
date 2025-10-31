import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {CommonColors} from '../styles/Colors';
import SideNavigation from './SideNavigation';

interface MainLayoutProps {
  children: React.ReactNode;
  activeScreen: string;
  hideSidebar?: boolean;
  setIsFocused?: (isFocused: boolean) => void;
  mainStyle?: any;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeScreen,
  hideSidebar = false,
  setIsFocused,
  mainStyle,
}) => {
  // Memoize the isSettings value
  const isSettings = useMemo(() => activeScreen === 'Settings', [activeScreen]);

  // Memoize the content container style
  const contentContainerStyle = useMemo(
    () => [styles.contentContainer, isSettings && styles.contentWithSettings],
    [isSettings],
  );

  // Memoize the side navigation
  const sideNav = useMemo(() => {
    return (
      !isSettings &&
      !hideSidebar && (
        <SideNavigation
          activeScreen={activeScreen}
          setIsFocused={setIsFocused}
        />
      )
    );
  }, [isSettings, activeScreen, hideSidebar]);

  return (
    <View style={[styles.container,mainStyle]}>
      {/* Show SideNavigation only when not on Settings screen and not hidden */}
      {sideNav}

      {/* Content container for all screens */}
      <View style={contentContainerStyle}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: CommonColors.black,
    width: '100%',
    paddingLeft: 50,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: CommonColors.themeMain,
  },
  contentWithSettings: {},
});

export default MainLayout;
