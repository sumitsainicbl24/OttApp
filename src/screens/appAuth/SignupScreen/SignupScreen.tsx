// 1. React Native core imports
import React, { useState } from 'react'
import { Text, View, TouchableOpacity, Image } from 'react-native'

// 2. Navigation imports
import { useNavigation } from '@react-navigation/native'

// 3. Redux imports (if needed for future signup logic)
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
import { signupApi } from '../../../redux/actions/main'
import { NavigationProp } from '@react-navigation/native'
import { MainStackParamList } from '../../../navigation/NavigationsTypes'
import Toast from 'react-native-toast-message'

const SignupScreen = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>()
  
  // State management
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [focused, setFocused] = useState<string | null>(null)
  
  // Handler functions
  const handleSignup = async() => {
    // TODO: Implement signup logic
    try {
    const data={
        name,
        username,
        password,
    }
    const response = await signupApi(data);
    console.log(response);
    
    navigation.navigate('VerifyOtp', {data:data})

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
            <Text style={styles.welcomeTitle}>Join</Text>
            <Text style={styles.LoraDigitalWorksText}>LORA DIGITAL WORKS</Text>
          </View>
          <Text style={styles.welcomeSubtitle}>
            Create your account to access exclusive movies, series, and premium content
            anytime, anywhere.
          </Text>
        </View>

        {/* Right Side - Signup Form */}
        <View style={styles.rightSection}>
          <View style={styles.formContainer}>
            {/* Form Header */}
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Create your account</Text>
              <Text style={styles.formSubtitle}>
                Welcome! Please fill in the details to get started.
              </Text>
            </View>

            {/* Input Fields */}
            <View style={styles.inputsContainer}>
              <InputComp
                label="Full Name"
                placeholder="Enter your Full Name"
                value={name}
                onChangeText={setName}
                containerStyle={styles.inputContainer}
              />
              
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

              <InputComp
                label="Confirm Password"
                placeholder="Confirm your Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                containerStyle={styles.inputContainer}
              />
            </View>

            {/* Signup Button */}
            <View style={styles.signupButtonContainer}>
              <ButtonComp
                title="Sign Up"
                variant="primary"
                onPress={handleSignup}
                style={styles.signupButton}
                innerTextStyle={styles.signupButtonText}
                onFocus={() => handleFocus('signup')}
                onBlur={handleBlur}
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
                onPress={handleSignup}
                style={styles.loginNavigationButton}
                onFocus={() => handleFocus('login')}
                onBlur={handleBlur}>
                <Text style={styles.loginViaText}>Already have an account? </Text>
                <Text style={styles.loginNavigationText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </WrapperContainer>
  );
}

export default SignupScreen 