import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { moderateScale, scale } from '../styles/scaling'
import { verticalScale } from '../styles/scaling'
import { CommonColors } from '../styles/Colors'
import FontFamily from '../constants/FontFamily'
import imagepath from '../constants/imagepath'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { MainStackParamList } from '../navigation/NavigationsTypes'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'

const SettingOverlay = ({children, topTitle}: {children: React.ReactNode, topTitle: string}) => {

    const [focusedOption, setFocusedOption] = useState('');
    const navigation = useNavigation<NavigationProp<MainStackParamList>>();
    const userToken = useSelector((state: RootState) => state.rootReducer.auth.userToken);

    const handlePremiumPress = () => {
        if(userToken){
          navigation.navigate('BuySubscription')
        }else{
            navigation.navigate('LoginScreen')
        }
    }

  return (
    <>
      <View style={styles.backgroundOverlay} />

      <View style={styles.container}>
        <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />

        {/* settig title */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{topTitle}</Text>
        </View>

        {/* Premium Banner */}
        <View style={styles.premiumInfoContainer}>
          <Text style={styles.premiumInfoText}>All features are available in Premium version</Text>
        </View>

        {/* Unlock Premium Button */}
        <TouchableOpacity 
          style={[styles.premiumButton, focusedOption === 'premium' && { borderColor: CommonColors.white, borderWidth: 1 }]}
          onFocus={() => setFocusedOption('premium')}
          onBlur={() => setFocusedOption('')}
          onPress={() => handlePremiumPress()}
          activeOpacity={1}
          {...({ 
            isTVSelectable: true,
          } as any)}
        >
          <Image source={imagepath.PremiumIcon} style={styles.crownIcon} />
          <Text style={styles.premiumButtonText}>Unlock Premium</Text>
        </TouchableOpacity>

        {children}
      </View>
    </>
  )
}

export default SettingOverlay

const styles = StyleSheet.create({
    backgroundOverlay: {
        position: 'absolute',
        left: 0,
        width: '75%',
        height: '100%',
        backgroundColor: '#070809CC',
        opacity: 0.8,
        zIndex: 1,
      },
      container: {
        position: 'absolute',
        right: 0,
        backgroundColor: '#1E1E1E', // Darker background to match screenshot
        width: '25%',
        height: '100%',
        paddingHorizontal: 0, // Remove horizontal padding
        zIndex: 2,
      },
      header: {
        paddingTop: verticalScale(20),
        paddingBottom: verticalScale(15),
        paddingHorizontal: moderateScale(20),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
      },
      headerTitle: {
        color: CommonColors.white,
        fontFamily: FontFamily.PublicSans_SemiBold,
        fontSize: scale(36),
      },
      premiumInfoContainer: {
        backgroundColor: '#2A2A2A',
        padding: moderateScale(15),
        paddingHorizontal: moderateScale(20),
      },
      premiumInfoText: {
        color: CommonColors.white,
        fontFamily: FontFamily.PublicSans_Medium,
        fontSize: scale(22.6),
      },
      premiumButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333333',
        padding: moderateScale(15),
        paddingHorizontal: moderateScale(20),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
      },
      premiumButtonText: {
        color: CommonColors.white,
        fontFamily: FontFamily.PublicSans_Bold,
        fontSize: scale(32),
      },
      crownIcon: {
        width: scale(40),
        height: scale(40),
        marginRight: moderateScale(10),
        resizeMode: 'contain',
      },
})