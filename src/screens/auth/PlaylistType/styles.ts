import {StyleSheet} from 'react-native';
import {CommonColors} from '../../../styles/Colors';
import {moderateScale, scale, verticalScale} from '../../../styles/scaling';
import FontFamily from '../../../constants/FontFamily';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  contentContainer: {
    height: '100%',
    flex: 1,
    // width: '60%',
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    // paddingHorizontal: moderateScale(45),
  },
  LeftContainer: {
    height: '100%',
    width: '40%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(20),
    backgroundColor: CommonColors.themeSecondary,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: moderateScale(100),
    height: moderateScale(100),
  },
  optionsContainer: {
    alignItems: 'center',
    gap: verticalScale(41),
    height: '100%',
    flex: 0.8,
    justifyContent: 'center',
    backgroundColor: CommonColors.themeTertiary,
  },
  optionButton: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: moderateScale(15),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOption: {
    backgroundColor: CommonColors.white,
    borderColor: CommonColors.white,
  },
  selectedOptionText: {
    color: CommonColors.buttonSecondary,
  },
  cancelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(25),
    // marginTop: verticalScale(20),
    backgroundColor: CommonColors.themeMain,
    justifyContent: 'center',
    height: '100%',
    flex: 0.2,
  },
  separator: {
    width: moderateScale(1),
    height: moderateScale(500),
    backgroundColor: CommonColors.textSecondary, // #60758C from Figma
  },
  cancelText: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(26),
    color: CommonColors.textSecondary,
  },
  optionText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(28),
    color: CommonColors.textWhite,
  },
  cancelTextFocused: {
    color: CommonColors.white,
    transform: [{scale: 1.05}],
  },
});
