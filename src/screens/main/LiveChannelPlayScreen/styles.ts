import { StyleSheet } from 'react-native'
import { CommonColors } from '../../../styles/Colors'
import { moderateScale, scale, verticalScale } from '../../../styles/scaling'
import FontFamily from '../../../constants/FontFamily'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CommonColors.black,
  },
  videoPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  touchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  
  // Loading states
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  loadingText: {
    color: CommonColors.white,
    fontSize: moderateScale(16),
    fontFamily: FontFamily.PublicSans_Medium,
    marginTop: verticalScale(10),
    textAlign: 'center',
  },
  
  // Error states
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CommonColors.black,
  },
  errorContent: {
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  errorIcon: {
    width: scale(80),
    height: scale(80),
    tintColor: CommonColors.white,
    marginBottom: verticalScale(20),
  },
  errorTitle: {
    color: CommonColors.white,
    fontSize: moderateScale(24),
    fontFamily: FontFamily.PublicSans_Bold,
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  errorMessage: {
    color: CommonColors.white,
    fontSize: moderateScale(16),
    fontFamily: FontFamily.PublicSans_Regular,
    textAlign: 'center',
    lineHeight: moderateScale(22),
    marginBottom: verticalScale(30),
    maxWidth: scale(400),
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CommonColors.backgroundBlue,
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(20),
    borderRadius: moderateScale(8),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  retryButtonFocused: {
    backgroundColor: CommonColors.white,
    borderColor: CommonColors.white,
  },
  retryIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: CommonColors.white,
    marginRight: scale(8),
  },
  retryButtonText: {
    color: CommonColors.white,
    fontSize: moderateScale(16),
    fontFamily: FontFamily.PublicSans_Medium,
  },
  
  // Controls overlay
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  
  // Top info section
  topInfoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    // paddingTop: verticalScale(350),
    paddingHorizontal: scale(40),
    paddingBottom: verticalScale(50),
  },
  topLeftInfo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    flex: 1,
  },
  tvLogo: {
    width: scale(140),
    height: scale(140),
    tintColor: CommonColors.white,
    marginRight: scale(45),
  },
  channelInfoSection: {
    flex: 1,
    gap: verticalScale(10),
  },
  noInfoText: {
    color: CommonColors.white,
    fontSize: moderateScale(18),
    fontFamily: FontFamily.PublicSans_Medium,
    marginBottom: verticalScale(8),
  },
  channelDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: verticalScale(25),
  },
  channelNumber: {
    color: CommonColors.white,
    fontSize: moderateScale(16),
    fontFamily: FontFamily.PublicSans_Bold,
    marginRight: scale(8),
  },
  channelDetails: {
    color: CommonColors.white,
    fontSize: moderateScale(16),
    fontFamily: FontFamily.PublicSans_Regular,
    marginRight: scale(15),
  },
  qualityBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qualityBadge: {
    backgroundColor: 'rgba(128, 128, 128, 0.8)',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(4),
    marginRight: scale(6),
  },
  qualityText: {
    color: CommonColors.white,
    fontSize: moderateScale(12),
    fontFamily: FontFamily.PublicSans_Medium,
  },
  backButton: {
    width: scale(50),
    height: scale(50),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(8),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  backIcon: {
    width: scale(24),
    height: scale(24),
    tintColor: CommonColors.white,
  },
  
  // Progress bar
  progressContainer: {
    paddingHorizontal: scale(40),
    marginBottom: verticalScale(30),
  },
  progressBar: {
    height: verticalScale(4),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: moderateScale(2),
  },
  progressFill: {
    height: '100%',
    width: '35%', // This would be dynamic in a real implementation
    backgroundColor: CommonColors.white,
    borderRadius: moderateScale(2),
  },
  
  // Bottom controls bar
  bottomControlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(40),
    paddingBottom: verticalScale(40),
    justifyContent: 'center',
  },
  controlButton: {
    width: scale(50),
    height: scale(50),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(25),
    borderWidth: 2,
    borderColor: 'transparent',
    marginHorizontal: scale(8),
  },
  controlButtonIcon: {
    width: scale(24),
    height: scale(24),
    tintColor: CommonColors.textGrey,
  },
  largePlayButton: {
    width: scale(70),
    height: scale(70),
    borderRadius: moderateScale(35),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: scale(20),
    borderWidth: 3,
    borderColor: 'transparent',
  },
  largePlayButtonFocused: {
    backgroundColor: CommonColors.white,
  },
  largePlayIcon: {
    width: scale(30),
    height: scale(30),
  },
  controlsSpacer: {
    flex: 1,
  },
  liveIndicatorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(4),
    marginHorizontal: scale(10),
  },
  liveIndicatorText: {
    color: CommonColors.white,
    fontSize: moderateScale(12),
    fontFamily: FontFamily.PublicSans_Bold,
    fontWeight: 'bold',
  },
  
  // Common control styles
  controlButtonFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: CommonColors.white,
  },
})
