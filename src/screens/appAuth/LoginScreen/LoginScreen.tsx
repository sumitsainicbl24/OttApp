// 1. React Native core imports
import React, { useState } from 'react'
import { Text, View, TouchableOpacity, ImageBackground, Image } from 'react-native'

// 2. Navigation imports
import { NavigationProp, useNavigation } from '@react-navigation/native'

// 3. Redux imports (if needed for future login logic)
// import { useAppSelector, useAppDispatch } from '../../../redux/hooks'

// 4. Global styles and utilities
import { CommonColors } from '../../../styles/Colors'
import { moderateScale, verticalScale, scale, width, height } from '../../../styles/scaling'
import FontFamily from '../../../constants/FontFamily'

// 5. Component imports
import WrapperContainer from '../../../components/WrapperContainer'
import InputComp from '../../../components/InputComp'
import ButtonComp from '../../../components/ButtonComp'

// 6. Local styles import (ALWAYS LAST)
import { styles } from './styles'
import imagepath from '../../../constants/imagepath'
import { MainStackParamList } from '../../../navigation/NavigationsTypes'
import { setUserAction, setUserTokenAction, signinApi } from '../../../redux/actions/main'
import Toast from 'react-native-toast-message'

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>()
  
  // State management
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [focused, setFocused] = useState<string | null>(null)
  
  // Handler functions
  const handleLogin = async() => {
    // TODO: Implement login logic
    try {
        const data:any = {
          email:username,
          password
        }
        const response = await signinApi(data)
        if(response.status === 200){
          Toast.show({
            text1: 'Login successful',
            type: 'success',
          })

          setUserAction(response?.data?.data?.user)
          setUserTokenAction(response?.data?.data?.token)
          navigation.navigate('Home', {activeScreen: 'Home'})
        }
        console.log(response);
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

  const handleSignUp = () => {
    navigation.navigate('SignupScreen')
  }

  const handleFocus = (buttonName: string) => {
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
            <Text style={styles.welcomeTitle}>Welcome to</Text>
            <Text style={styles.LoraDigitalWorksText}>LORA DIGITAL WORKS</Text>
          </View>
          <Text style={styles.welcomeSubtitle}>
            Log in to access your favorite movies, series, and exclusive content
            anytime, anywhere.
          </Text>
        </View>

        {/* Right Side - Login Form */}
        <View style={styles.rightSection}>
          <View style={styles.formContainer}>
            {/* Form Header */}
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Let's sign you in</Text>
              <Text style={styles.formSubtitle}>
                Welcome back, you have been missed!
              </Text>
            </View>

            {/* Input Fields */}
            <View style={styles.inputsContainer}>
              <InputComp
                label="Username"
                placeholder="Enter your Username"
                value={username}
                onChangeText={setUsername}
                containerStyle={styles.inputContainer}
              />

              <InputComp
                label="Password"
                placeholder="Enter your Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                containerStyle={styles.inputContainer}
              />
            </View>

            {/* Login Button */}
            <View style={styles.loginButtonContainer}>
              <ButtonComp
                title="Login"
                variant="primary"
                onPress={handleLogin}
                style={styles.loginButton}
                onFocus={() => handleFocus('login')}
                onBlur={handleBlur}
                innerTextStyle={styles.loginButtonText}
              />
            </View>

            {/* Separator */}
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>Or</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Alternative Login */}
            <View style={styles.alternativeLoginContainer}>
              <TouchableOpacity
                onPress={handleSignUp}
                style={styles.xtreamCodesButton}
                onFocus={() => handleFocus('xtream')}
                onBlur={handleBlur}>
                <Text style={styles.loginViaText}>Don't have an account? </Text>
                <Text style={styles.xtreamCodesText}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </WrapperContainer>
  );
}

export default LoginScreen 