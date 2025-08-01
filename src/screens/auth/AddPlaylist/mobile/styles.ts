import { StyleSheet } from 'react-native'
import { CommonColors } from '../../../../styles/Colors'
import { moderateScale, scale, verticalScale } from '../../../../styles/scaling'
import FontFamily from '../../../../constants/FontFamily'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CommonColors.themeMain,
    justifyContent: 'center',
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: verticalScale(75),
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    gap: verticalScale(35),
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(24),
  },
  addPlaylistButton: {
    backgroundColor: CommonColors.buttonSecondary,
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(15),
    borderRadius: moderateScale(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlaylistButtonFocused: {
    backgroundColor: CommonColors.white,
    transform: [{ scale: 1.05 }],
  },
  addPlaylistButtonText: {
    color: CommonColors.white,
    fontSize: scale(10),
    fontFamily: FontFamily.PublicSans_Medium,
  },
  addPlaylistButtonTextFocused: {
    color: CommonColors.textBlack,
  },
  settingsButton: {
    backgroundColor: CommonColors.buttonSecondary,
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(15),
    borderRadius: moderateScale(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonFocused: {
    backgroundColor: CommonColors.white,
    transform: [{ scale: 1.05 }],
  },
  settingsButtonText: {
    color: CommonColors.white,
    fontSize: scale(10),
    fontFamily: FontFamily.PublicSans_Medium,
  },
  settingsButtonTextFocused: {
    color: CommonColors.textBlack,
  },
  Title: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(10),
    textAlign: "center",
    color: CommonColors.textWhite,
},
SubTitle: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: scale(10),
    textAlign: "center",
    color: CommonColors.textSecondary,
},
})
