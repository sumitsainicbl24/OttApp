import { StyleSheet } from 'react-native'
import { CommonColors } from '../../../styles/Colors'
import { moderateScale, verticalScale } from '../../../styles/scaling'
import FontFamily from '../../../constants/FontFamily'

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  LeftContainer: {
    height: '100%',
    width: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(20),
    backgroundColor: CommonColors.themeMain, 
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: moderateScale(100),
    height: moderateScale(100),
  },
  headerTextContainer: {
    gap: verticalScale(18),
  },
  contentContainer: {
    height: '100%',
    width: '60%',
    backgroundColor: CommonColors.themeSecondary, 
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: moderateScale(45)
  },
  formContainer: {
    width: moderateScale(400),
    gap: verticalScale(45),
  },
  formTitle: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(26),
    color: CommonColors.textWhite,
  },
  inputsContainer: {
    alignItems: 'flex-start',
    gap: verticalScale(35),
  },
  inputContainer: {
    width: moderateScale(320),
  },
  checkboxContainer: {
    flexDirection: 'row',
    gap: verticalScale(40),
    alignItems: 'flex-start',
  },
  rightContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    gap: verticalScale(35),
  },
  separator: {
    width: moderateScale(1),
    height: verticalScale(500),
    backgroundColor: CommonColors.textSecondary,
  },
  bottomButtonsContainer: {
    gap: verticalScale(42),
    // alignItems: 'flex-end',
  },
  nextButtonText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: moderateScale(26),
    color: CommonColors.textSecondary,
  },
  cancelButtonText: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(26),
    color: CommonColors.textSecondary,
  },
  nextButtonTextFocused: {
    color: CommonColors.white,
    transform: [{ scale: 1.05 }],
  },
  cancelButtonTextFocused: {
    color: CommonColors.white,
    transform: [{ scale: 1.05 }],
  },
}) 