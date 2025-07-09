import { StyleSheet } from 'react-native';
import { CommonColors } from '../../../styles/Colors';
import { moderateScale, scale, verticalScale } from '../../../styles/scaling';
import FontFamily from '../../../constants/FontFamily';

export const styles = StyleSheet.create({
  backgroundOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1,
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    zIndex: 2,
  },
  leftSection: {
    // flex: 3,
    height: '100%',
    width: '60%',
    paddingVertical: verticalScale(60),
    paddingHorizontal: moderateScale(60),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: moderateScale(20),
  },
  rightSection: {
    flex: 1,
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    paddingHorizontal: moderateScale(75),
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    height: '65%',
  },
  subscriptionInfoContainer:{
    height: '50%',
    width: '60%',
  },
  lockIcon: {
    width: scale(250),
    height: scale(250),
    borderRadius: moderateScale(8),
  },
  subscriptionTitle: {
    color: CommonColors.white,
    fontFamily: FontFamily.PublicSans_Light,
    fontSize: scale(85),
    marginBottom: verticalScale(20),
  },
  subscriptionDescription: {
    color: CommonColors.textSecondary,
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: scale(25),
    marginBottom: verticalScale(25),
  },
  optionsList: {
    marginBottom: verticalScale(25),
  },
  optionText: {
    color: CommonColors.textSecondary,
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: scale(25),
    marginBottom: verticalScale(25),
  },
  instructionText: {
    color: CommonColors.textSecondary,
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: scale(25),
    marginBottom: verticalScale(25),
  },
  cancelText: {
    color: CommonColors.textSecondary,
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: scale(16),
  },
  paymentOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: verticalScale(20),
    paddingHorizontal: moderateScale(20),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(15),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedOption: {
    borderColor: CommonColors.white,
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
  },
  paymentOptionText: {
    color: CommonColors.white,
    fontFamily: FontFamily.PublicSans_Light,
    fontSize: scale(25),
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: verticalScale(18),
    paddingHorizontal: moderateScale(20),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionButtonText: {
    color: CommonColors.white,
    fontFamily: FontFamily.PublicSans_Light,
    fontSize: scale(25),
    textAlign: 'center',
  },
}); 