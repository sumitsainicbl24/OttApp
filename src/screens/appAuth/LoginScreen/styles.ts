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
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    // backgroundColor: 'rgba(15, 15, 28, 0.85)', // Figma overlay
  },
  blurCircle: {
    position: 'absolute',
    top: '20%',
    right: '10%',
    width: moderateScale(400),
    height: moderateScale(400),
    borderRadius: moderateScale(200),
    backgroundColor: CommonColors.white,
    opacity: 0.2,
    zIndex: 0,
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
    fontFamily: FontFamily.PublicSans_Regular, // Using Inter equivalent
    fontSize: moderateScale(25),
    color: CommonColors.white,
    // marginBottom: verticalScale(20),
    // lineHeight: moderateScale(30),
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
    // lineHeight: moderateScale(25),
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
    marginBottom: verticalScale(40),
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
  inputsContainer: {
    width: '100%',
    marginBottom: verticalScale(29),
  },
  inputContainer: {
    marginBottom: verticalScale(29),
  },
  loginButtonContainer: {
    width: '100%',
    marginBottom: verticalScale(40),
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#4177B1', // Figma login button color
    borderRadius: moderateScale(8),
    paddingVertical: verticalScale(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
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
    fontFamily: FontFamily.PublicSans_Regular, // Using Poppins equivalent
    fontSize: moderateScale(12),
    color: CommonColors.white,
    marginHorizontal: moderateScale(15),
    textAlign: 'center',
    lineHeight: moderateScale(15),
  },
  alternativeLoginContainer: {
    alignItems: 'center',
  },
  xtreamCodesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(10),
    paddingHorizontal: moderateScale(20),
  },
  loginViaText: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(16),
    color: CommonColors.white,
    textAlign: 'center',
    lineHeight: moderateScale(24),
  },
  xtreamCodesText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(16),
    color: '#FFDF28', // Figma yellow color
    textAlign: 'center',
    lineHeight: moderateScale(24),
  },
}) 