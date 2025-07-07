import { StyleSheet } from 'react-native'
import { CommonColors } from '../../../styles/Colors'
import { moderateScale, verticalScale, scale, width, height } from '../../../styles/scaling'
import FontFamily from '../../../constants/FontFamily'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    // zIndex: -1,
  },
  backgroundPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  imagePlaceholderText: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    paddingHorizontal: moderateScale(60),
    paddingVertical: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    paddingRight: moderateScale(60),
    justifyContent: 'center',
    gap: verticalScale(25),
  },
  logoText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(25),
    color: CommonColors.white,
    lineHeight: moderateScale(39),
  },
  welcomeTitle: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(25),
    color: CommonColors.white,
  },
  LoraDigitalWorksText: {
    fontFamily: FontFamily.PublicSans_ExtraBold,
    fontSize: moderateScale(33),
    color: CommonColors.yellow,
  },
  welcomeSubtitle: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(33),
    color: CommonColors.white,
    opacity: 0.9,
  },
  rightSection: {
    width: moderateScale(500),
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(15, 15, 28, 0.5)', // Figma form background
    borderColor: '#2F3A4F', // Figma border color
    borderWidth: 1,
    borderRadius: moderateScale(24),
    paddingHorizontal: moderateScale(40),
    paddingVertical: moderateScale(40),
    alignItems: 'center',
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: verticalScale(30),
  },
  formTitle: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(26),
    color: CommonColors.white,
    textAlign: 'center',
    marginBottom: verticalScale(8),
    lineHeight: moderateScale(33),
  },
  formSubtitle: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(16),
    color: CommonColors.white,
    textAlign: 'center',
    opacity: 0.58,
    lineHeight: moderateScale(23),
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: verticalScale(30),
    paddingHorizontal: moderateScale(20),
    borderWidth: 1,
    borderColor: CommonColors.inputBorderColor,
    borderRadius: moderateScale(8),
    paddingVertical: moderateScale(10),
  },
  otpInputContainer: {
    width: moderateScale(60),
    height: moderateScale(60),
    backgroundColor: CommonColors.inputBackgroundColor,
    borderColor: CommonColors.inputBorderColor,
    borderWidth: 1,
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInputContainerFocused: {
    borderColor: CommonColors.yellow,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 223, 40, 0.1)',
    transform: [{ scale: 1.05 }],
  },
  otpInput: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    borderWidth: 0,
    textAlign: 'center',
    color: CommonColors.white,
    fontSize: moderateScale(24),
    fontFamily: FontFamily.PublicSans_SemiBold,
  },
  otpInputFocused: {
    borderColor: CommonColors.yellow,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 223, 40, 0.1)',
    transform: [{ scale: 1.05 }],
  },
  verifyButtonContainer: {
    width: '100%',
    marginBottom: verticalScale(30),
  },
  verifyButton: {
    width: '100%',
    backgroundColor: '#4177B1', // Figma button color
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(15),
    color: CommonColors.white,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: verticalScale(20),
  },
  separatorLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: CommonColors.white,
    opacity: 0.3,
  },
  separatorText: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(12),
    color: CommonColors.white,
    marginHorizontal: moderateScale(15),
    textAlign: 'center',
    lineHeight: moderateScale(15),
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
    paddingHorizontal: moderateScale(20),
  },
  resendText: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(16),
    color: CommonColors.white,
    textAlign: 'center',
    lineHeight: moderateScale(24),
  },
  resendActionText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(16),
    color: '#FFDF28', // Figma yellow color
    textAlign: 'center',
    lineHeight: moderateScale(24),
  },
  // OTP Entry specific styles
  otpEntryContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateScale(15),
  },
  otpInputText: {
    color: CommonColors.white,
    fontSize: moderateScale(24),
    fontFamily: FontFamily.PublicSans_SemiBold,
  },
}) 