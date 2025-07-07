import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, TouchableOpacityProps } from 'react-native'
import React, { useState } from 'react'
import { CommonColors } from '../styles/Colors'
import { moderateScale, scale, verticalScale } from '../styles/scaling'
import FontFamily from '../constants/FontFamily'

interface ButtonCompProps extends TouchableOpacityProps {
  title: string
  variant?: 'primary' | 'secondary' | 'Simple'
  hasTVPreferredFocus?: boolean
  onFocus?: (event: any) => void
  onBlur?: (event: any) => void
  innerTextStyle?: StyleProp<TextStyle>
}

const ButtonComp: React.FC<ButtonCompProps> = ({ 
  title, 
  variant = 'primary', 
  hasTVPreferredFocus,
  style,
  onFocus,
  onBlur,
  innerTextStyle,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = (event: any) => {
    setIsFocused(true)
    onFocus?.(event)
  }

  const handleBlur = (event: any) => {
    setIsFocused(false)
    onBlur?.(event)
  }

  const getButtonStyle = () => {
    const baseStyle = variant === 'primary' ? styles.primaryButton : variant === 'secondary' ? styles.secondaryButton : styles.simpleButton
    const focusStyle = isFocused ? (variant === 'primary' ? styles.primaryButtonFocus : variant === 'secondary' ? styles.secondaryButtonFocus : styles.simpleButtonFocus) : {}
    return [baseStyle, focusStyle]
  }

  const textStyle = variant === 'primary' ? styles.primaryButtonText : variant === 'secondary' ? styles.secondaryButtonText : styles.simpleButtonText

  return (
    <TouchableOpacity 
      style={[getButtonStyle(), style]}
      hasTVPreferredFocus={hasTVPreferredFocus}
      activeOpacity={0.8}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      <Text style={[textStyle, isFocused && styles.focusedText, innerTextStyle]}>{title}</Text>
    </TouchableOpacity>
  )
}

export default ButtonComp

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: CommonColors.buttonPrimary,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(16),
    paddingHorizontal: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: moderateScale(2),
  },
  primaryButtonFocus: {
    borderWidth: moderateScale(2),
    borderColor: CommonColors.white,
  },
  primaryButtonText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(32),
    color: CommonColors.textWhite,
  },
  secondaryButton: {
    backgroundColor: CommonColors.buttonSecondary,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(16),
    paddingHorizontal: moderateScale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonFocus: {
    borderWidth: moderateScale(2),
    borderColor: CommonColors.white,
  },
  secondaryButtonText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(32),
    color: CommonColors.textWhite,
  },
  simpleButton: {
    backgroundColor: CommonColors.white,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(16),
    paddingHorizontal: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  simpleButtonFocus: {
    borderWidth: moderateScale(2),
    borderColor: CommonColors.white,
    backgroundColor: CommonColors.themeMain,
  },
  focusedText: {
    color: CommonColors.white,
  },
  simpleButtonText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(32),
    color: CommonColors.textBlack,
  },
}) 