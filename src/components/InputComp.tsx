import React, { useState, useRef } from 'react'
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle, TextStyle, TouchableHighlight } from 'react-native'
import { CommonColors } from '../styles/Colors'
import { moderateScale, scale, verticalScale } from '../styles/scaling'
import FontFamily from '../constants/FontFamily'

interface InputCompProps extends TextInputProps {
  label?: string
  containerStyle?: ViewStyle
  inputWrapperStyle?: ViewStyle
  labelStyle?: TextStyle
  inputStyle?: TextStyle
  hasTVPreferredFocus?: boolean
  onFocus?: (event: any) => void
  onBlur?: (event: any) => void
}

const InputComp: React.FC<InputCompProps> = ({
  label,
  containerStyle,
  inputWrapperStyle,
  labelStyle,
  inputStyle,
  hasTVPreferredFocus,
  onFocus,
  onBlur,
  placeholderTextColor = CommonColors.placeholderTextColor,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const textInputRef = useRef<TextInput>(null)

  const handleTouchableFocus = (event: any) => {
    setIsFocused(true)
  }

  const handleTouchableBlur = (event: any) => {
    setIsFocused(false)
    onBlur?.(event)
  }

  const handleTouchablePress = () => {
    // Ensure TextInput gets focus when pressed
    textInputRef.current?.focus()
  }

  const handleTextInputFocus = (event: any) => {
    setIsFocused(true)
    onFocus?.(event)
  }

  const handleTextInputBlur = (event: any) => {
    setIsFocused(false)
    onBlur?.(event)
  }

  const getInputWrapperStyle = () => {
    const focusStyle = isFocused ? styles.inputWrapperFocused : {}
    return [styles.inputWrapper, focusStyle, inputWrapperStyle]
  }

  return (
    <View style={[styles.inputGroup, containerStyle]}>
      {label && (
        <Text style={[styles.inputLabel, labelStyle]}>{label}</Text>
      )}
      <TouchableHighlight
        style={getInputWrapperStyle()}
        onPress={handleTouchablePress}
        onFocus={handleTouchableFocus}
        onBlur={handleTouchableBlur}
        hasTVPreferredFocus={hasTVPreferredFocus}
        underlayColor="transparent"
        activeOpacity={1}
      >
        <TextInput
          ref={textInputRef}
          style={[styles.textInput, inputStyle]}
          placeholderTextColor={placeholderTextColor}
          onFocus={handleTextInputFocus}
          onBlur={handleTextInputBlur}
          {...props}
        />
      </TouchableHighlight>
    </View>
  )
}

export default InputComp

const styles = StyleSheet.create({
  inputGroup: {
    // marginBottom: verticalScale(29),
    width: '100%',
  },
  inputLabel: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: moderateScale(14),
    color: CommonColors.textWhite,
    marginBottom: verticalScale(8),
    lineHeight: moderateScale(16),
    letterSpacing: -0.16,
  },
  inputWrapper: {
    backgroundColor: CommonColors.inputBackgroundColor,
    borderColor: CommonColors.inputBorderColor,
    borderWidth: 1,
    borderRadius: moderateScale(8),
    // paddingVertical: verticalScale(14),
    paddingHorizontal: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapperFocused: {
    borderColor: CommonColors.white,
    borderWidth: moderateScale(2),
  },
  textInput: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(14),
    color: CommonColors.textWhite,
    height: moderateScale(48),
    // lineHeight: moderateScale(16),
    width: '100%',
    textAlign: 'left',
    padding: 0,
    margin: 0,
  },
}) 