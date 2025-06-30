import { StyleSheet } from 'react-native';
import { CommonColors } from '../../../styles/Colors';
import { moderateScale, scale, verticalScale } from '../../../styles/scaling';
import FontFamily from '../../../constants/FontFamily';

export const styles = StyleSheet.create({
  backgroundOverlay: {
    position: 'absolute',
    left: 0,
    width: '75%',
    height: '100%',
    backgroundColor: '#070809CC',
    opacity: 0.8,
    zIndex: 1,
  },
  container: {
    position: 'absolute',
    right: 0,
    backgroundColor: '#1E1E1E', // Darker background to match screenshot
    width: '25%',
    height: '100%',
    paddingHorizontal: 0, // Remove horizontal padding
    zIndex: 2,
  },
  header: {
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(15),
    paddingHorizontal: moderateScale(20),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(15),
  },
  backIcon: {
    width: moderateScale(24),
    height: moderateScale(24),
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Placeholder for icon
    marginRight: moderateScale(10),
  },
  backText: {
    color: CommonColors.white,
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(20),
  },
  headerTitle: {
    color: CommonColors.white,
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(36),
  },
  premiumInfoContainer: {
    backgroundColor: '#2A2A2A',
    padding: moderateScale(15),
    paddingHorizontal: moderateScale(20),
  },
  premiumInfoText: {
    color: CommonColors.white,
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(22.6),
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    padding: moderateScale(15),
    paddingHorizontal: moderateScale(20),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  crownIcon: {
    width: scale(40),
    height: scale(40),
    marginRight: moderateScale(10),
    resizeMode: 'contain',
  },
  lockIcon: {
    width: scale(40),
    height: scale(40),
    marginRight: moderateScale(10),
    resizeMode: 'contain',
  },
  premiumButtonText: {
    color: CommonColors.white,
    fontFamily: FontFamily.PublicSans_Bold,
    fontSize: scale(32),
  },
  optionsContainer: {
    flex: 1,
  },
  settingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(25),
    paddingHorizontal: moderateScale(20),
  },
  selectedOption: {
    borderColor: CommonColors.white,
    borderWidth: 1,
    transform: [{ scale: 1.05 }]
  },
  settingOptionText: {
    color: CommonColors.white,
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(20),
    width: '65%',
  },
}); 