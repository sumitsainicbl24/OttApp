import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { CommonColors } from '../styles/Colors'
import { moderateScale, verticalScale } from '../styles/scaling'
import FontFamily from '../constants/FontFamily'
import imagepath from '../constants/imagepath'

interface CheckboxCompProps {
  label: string
  isChecked: boolean
  onToggle: (checked: boolean) => void
}

const CheckboxComp: React.FC<CheckboxCompProps> = ({ label, isChecked, onToggle }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onToggle(!isChecked)}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox]}>
        {isChecked && <Image source={imagepath.checkboxTickBlue} style={styles.checkmark}/>}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
  },
  checkbox: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(4),
    backgroundColor: CommonColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(5),
  },
  checkmark: {
    width: "100%",
    height: "100%",
    resizeMode: 'contain',
  },
  label: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: moderateScale(14),
    color: CommonColors.textWhite,
  },
})

export default CheckboxComp 