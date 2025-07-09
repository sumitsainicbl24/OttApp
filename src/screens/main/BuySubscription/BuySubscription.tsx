import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, StatusBar, Image } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import { MainStackParamList } from '../../../navigation/NavigationsTypes';
import { setUserAction, setUserTokenAction } from '../../../redux/actions/main';
import { getUserTokenLocalStorage } from '../../../localStorage/mmkv';
import imagepath from '../../../constants/imagepath';
import Toast from 'react-native-toast-message';

const BuySubscription = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const [focusedOption, setFocusedOption] = useState('yearly');

  const handleOptionPress = (option: string) => {
    switch(option) {
      case 'yearly':
        // Handle yearly subscription
        console.log('Yearly subscription selected');
        break;
      case 'onetime':
        // Handle one-time payment
        console.log('One-time payment selected');
        break;
      case 'logout':
        // Handle logout
        setUserTokenAction('')
        setUserAction({})
        Toast.show({
          text1: 'Logged out successfully',
          type: 'success',
        });
        //reset navigation
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home', params: { activeScreen: 'Home' } }],
        });
        break;
      case 'back':
        navigation.goBack();
        break;
    }
  };

  const renderPaymentOption = (
    key: string, 
    title: string, 
    price: string, 
    isSelected = false
  ) => {
    const isFocused = focusedOption === key;
    
    return (
      <TouchableOpacity 
        key={key}
        style={[
          styles.paymentOption, 
          isFocused && styles.selectedOption,
          isSelected && styles.activeOption,
        ]}
        onPress={() => handleOptionPress(key)}
        onFocus={() => setFocusedOption(key)}
        onBlur={() => setFocusedOption('')}
        activeOpacity={1}
        {...({ 
          isTVSelectable: true,
        } as any)}
      >
        <Text style={styles.paymentOptionText}>
          {title} {price}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderActionButton = (key: string, title: string) => {
    const isFocused = focusedOption === key;
    
    return (
      <TouchableOpacity 
        key={key}
        style={[
          styles.actionButton, 
          isFocused && styles.selectedOption,
        ]}
        onPress={() => handleOptionPress(key)}
        onFocus={() => setFocusedOption(key)}
        onBlur={() => setFocusedOption('')}
        activeOpacity={1}
        {...({ 
          isTVSelectable: true,
        } as any)}
      >
        <Text style={styles.actionButtonText}>{title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      
      {/* Background Overlay */}
      <View style={styles.backgroundOverlay} />

      {/* Main Container */}
      <View style={styles.container}>
        
        {/* Left Section - Subscription Info */}
        <View style={styles.leftSection}>
          <View style={styles.subscriptionHeader}>
            {/* Lock Icon Placeholder */}
            <Image source={imagepath.SubscitionIcon1} style={styles.lockIcon} resizeMode='contain' />
          </View>

          <View style={styles.subscriptionInfoContainer}>
        <Text style={styles.subscriptionTitle}>Subscription</Text>
          <Text style={styles.subscriptionDescription}>
            TiviMate Premium is available with a limit of 5 devices and one of the next payment options:
          </Text>
          
          <View style={styles.optionsList}>
            <Text style={styles.optionText}>
              • Subscription ₹990.00 per year and 7-day free trial
            </Text>
            <Text style={styles.optionText}>
              • One-time payment ₹2,950.00
            </Text>
          </View>
          
          <Text style={styles.instructionText}>
            Select your option to proceed with the purchase in Google Play.
          </Text>
          
          <Text style={styles.cancelText}>
            You can cancel the subscription on Google Play:{'\n'}
            https://play.google.com/store/account{'\n'}
            /subscriptions
          </Text>
          </View>
        </View>

        {/* Right Section - Payment Options */}
        <View style={styles.rightSection}>
          {renderPaymentOption(
            'yearly', 
            'Subscription', 
            '₹990.00 per year',
          )}
          
          {renderPaymentOption(
            'onetime', 
            'One-time payment', 
            '₹2,950.00'
          )}
          
          {renderActionButton('logout', 'Log out')}
          
          {renderActionButton('back', 'Back')}
        </View>
      </View>
    </>
  );
};

export default BuySubscription; 