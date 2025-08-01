import React, { useEffect } from 'react';
import {
  View,
  StatusBar,
  Platform,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import Orientation from 'react-native-orientation-locker';
import { CommonColors } from '../styles/Colors';

interface MobileWrapperProps {
  children: React.ReactNode;
}

const MobileWrapper: React.FC<MobileWrapperProps> = ({
  children,
}) => {
  useEffect(() => {
    // Lock orientation to landscape on mount
    Orientation.lockToLandscape();
    
    // Optional: You can also use lockToLandscapeLeft() or lockToLandscapeRight()
    // for more specific landscape orientation
    
    return () => {
      // Unlock orientation when component unmounts
      Orientation.unlockAllOrientations();
    };
  }, []);

  return (
    <View style={[styles.container]}>
      {/* Hide status bar for both platforms */}
      <StatusBar
        hidden={true}
        backgroundColor={CommonColors.themeMain}
        barStyle="light-content"
        translucent={Platform.OS === 'android'}
      />
      
      {Platform.OS === 'ios' ? (
        // For iOS, use SafeAreaView to handle notch and safe areas
        <SafeAreaView style={styles.safeArea}>
          {children}
        </SafeAreaView>
      ) : (
        // For Android, use regular View
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CommonColors.themeMain,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    // Add top padding for Android to account for hidden status bar
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
});

export default MobileWrapper;
