// 1. React Native core imports
import React, { useState, useRef } from 'react'
import { Text, View, TouchableOpacity, Image, TextInput } from 'react-native'

// 2. Navigation imports
import { NavigationProp, RouteProp, useNavigation } from '@react-navigation/native'

// 3. OTP Entry import
import { OtpInput } from 'react-native-otp-entry'

// 4. Redux imports (if needed for future verification logic)
// import { useAppSelector, useAppDispatch } from '../../../redux/hooks'

// 5. Global styles and utilities
import { CommonColors } from '../../../styles/Colors'
import { moderateScale, verticalScale, scale, width, height } from '../../../styles/scaling'
import FontFamily from '../../../constants/FontFamily'

// 6. Component imports
import WrapperContainer from '../../../components/WrapperContainer'
import ButtonComp from '../../../components/ButtonComp'

// 7. Local styles import (ALWAYS LAST)
import { styles } from './styles'
import imagepath from '../../../constants/imagepath'
import { MainStackParamList } from '../../../navigation/NavigationsTypes'
import { verifyOtpApi } from '../../../redux/actions/main'
import Toast from 'react-native-toast-message'

const VerifyOtp = ({route}: {route: RouteProp<MainStackParamList, 'VerifyOtp'>}) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>()
  const {data} = route.params
  console.log(data);

  console.log(data, "email");
  
  
  // State management
  const [otp, setOtp] = useState('')
  const [focused, setFocused] = useState<string | null>(null)
  
  // Ref for OTP input
  const otpInputRef = useRef<any>(null)
  
  // Handler functions
  const handleVerifyOtp = async() => {
    try {
      if(otp.length !== 4){
        Toast.show({
          text1: 'Please enter the 4 digit OTP',
          type: 'error',
        })
        return
      }
    const ApiData:any = {
      email: data.username,
      otp: otp,
    }
    const response = await verifyOtpApi(ApiData)
    console.log(response);

    if(response.status === 200){
      //show toast
      Toast.show({
        text1: 'OTP verified successfully',
        type: 'success',
      })
      navigation.navigate('LoginScreen')
    }

    } catch (error:any) {
      {error?.response?.data?.error &&
        Toast.show({
            text1: error?.response?.data?.error,
            type: 'error',
          })
      }
      console.log(error);
    }
  }

  const handleResendOtp = () => {
    console.log('Resend OTP pressed')
    // TODO: Implement resend OTP logic
  }

  const handleFocus = (buttonName: string) => {
    console.log(buttonName, "buttonName");
    setFocused(buttonName)
  }

  const handleBlur = () => {
    setFocused(null)
  }

  return (
    <WrapperContainer containerStyle={styles.container}>
      {/* Background Image with Blur Effect */}
      <View style={styles.backgroundImageContainer}>
        <Image
          source={imagepath.LoginBg}
          style={styles.imagePlaceholderText}
          resizeMode="cover"
        />
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Left Side - Welcome Section */}
        <View style={styles.leftSection}>
          <Text style={styles.logoText}>Logo</Text>
          <View>
            <Text style={styles.welcomeTitle}>Verify</Text>
            <Text style={styles.LoraDigitalWorksText}>YOUR ACCOUNT</Text>
          </View>
          <Text style={styles.welcomeSubtitle}>
            We've sent a verification code to your email address.
            Please enter the code below to verify your account.
          </Text>
        </View>

        {/* Right Side - OTP Form */}
        <View style={styles.rightSection}>
          <View style={styles.formContainer}>
            {/* Form Header */}
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Enter Verification Code</Text>
              <Text style={styles.formSubtitle}>
                Please enter the 4-digit code sent to your email
              </Text>
            </View>

            {/* OTP Input Fields */}
            <TouchableOpacity 
            style={[styles.otpContainer, {borderColor: focused === 'otpContainer' ? CommonColors.white : 'transparent'}]}
            onPress={() => {
              if (otpInputRef.current) {
                otpInputRef.current.focus();
              }
            }}
            onFocus={() => handleFocus('otpContainer')}
            activeOpacity={1}
            >
              <OtpInput
                ref={otpInputRef}
                numberOfDigits={4}
                focusColor={CommonColors.yellow}
                onTextChange={setOtp}
                onFilled={(text: string) => {
                  console.log('OTP filled:', text)
                  setOtp(text)
                }}
                textInputProps={{
                  accessibilityLabel: 'One-Time Password',
                }}
                theme={{
                  containerStyle: styles.otpEntryContainer,
                  pinCodeContainerStyle: styles.otpInputContainer,
                  pinCodeTextStyle: styles.otpInputText,
                  focusedPinCodeContainerStyle: styles.otpInputContainerFocused,
                }}
              />
            </TouchableOpacity>

            {/* Verify Button */}
            <View style={styles.verifyButtonContainer}>
              <ButtonComp
                title="Verify"
                variant="primary"
                onPress={handleVerifyOtp}
                style={styles.verifyButton}
                innerTextStyle={styles.verifyButtonText}
                onFocus={() => handleFocus('verify')}
                onBlur={handleBlur}
              />
            </View>

            {/* Separator */}
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>Or</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Resend OTP */}
            <View style={styles.resendContainer}>
              <TouchableOpacity 
                onPress={handleResendOtp}
                style={styles.resendButton}
                onFocus={() => handleFocus('resend')}
                onBlur={handleBlur}>
                <Text style={styles.resendText}>Didn't receive code? </Text>
                <Text style={styles.resendActionText}>Resend</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </WrapperContainer>
  );
}

export default VerifyOtp 