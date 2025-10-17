import {StyleSheet} from 'react-native';
import {CommonColors} from '../../../styles/Colors';
import {moderateScale, scale, verticalScale} from '../../../styles/scaling';
import FontFamily from '../../../constants/FontFamily';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A', // Dark gray background from screenshot
  },
  contentContainer: {
    height: '100%',
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
  },
  LeftContainer: {
    height: '100%',
    width: '50%', // Adjusted to match screenshot proportions
    // flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(50),
    backgroundColor: 'rbg(35, 38, 40)',
    flexDirection: 'row',
  },
  iconContainer: {
    // justifyContent: 'center',
    // alignItems: 'center',
    marginBottom: verticalScale(40),
  },
  iconPlaceholder: {
    width: moderateScale(80),
    height: moderateScale(80),
    tintColor: CommonColors.white,
  },
  activationTitle: {
    fontFamily: FontFamily.PublicSans_Bold,
    fontSize: scale(50),
    color: CommonColors.white,
    marginBottom: verticalScale(10),
    textAlign: 'left',
  },
  activationText: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(16),
    color: CommonColors.white,
    lineHeight: moderateScale(22),
    textAlign: 'left',
  },
  rightContainer: {
    height: '100%',
    width: '35%', // Adjusted to match screenshot proportions
    backgroundColor: 'rgb(19,22,25)',

    paddingHorizontal: moderateScale(30),
    paddingVertical: verticalScale(40),
    justifyContent: 'center',
  },
  deviceHeader: {
    alignItems: 'center',
    marginBottom: verticalScale(30),
  },
  deviceHeaderText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(22),
    color: CommonColors.white,
  },
  deviceList: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(40),
    // backgroundColor: 'red',
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(18),
    paddingHorizontal: moderateScale(12),
    marginBottom: verticalScale(6),
    borderRadius: moderateScale(4),
    width: '100%',
    maxWidth: moderateScale(400),
  },
  selectedDeviceItem: {
    backgroundColor: CommonColors?.white, // Slightly more visible selection
  },
  radioButton: {
    width: moderateScale(18),
    height: moderateScale(18),
    borderRadius: moderateScale(9),
    borderWidth: moderateScale(1.5),
    borderColor: CommonColors.white,
    marginRight: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    backgroundColor: CommonColors.white,
  },
  radioButtonInner: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: '#2A2A2A', // Dark background for inner dot
  },
  deviceName: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(18),
    color: CommonColors.white,
    flex: 1,
  },
  actionButtons: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: verticalScale(20),
    width: '15%',
    backgroundColor: 'rgb(19,22,25)',
    borderLeftWidth: 1,
    borderLeftColor: CommonColors.textSecondary,
  },
  activateButton: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: moderateScale(20),
    borderRadius: moderateScale(4),
  },
  backButton: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: moderateScale(20),
    borderRadius: moderateScale(4),
  },
  activateButtonText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(18),
    color: CommonColors.white,
  },
  backButtonText: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(18),
    color: CommonColors.white,
  },
});
