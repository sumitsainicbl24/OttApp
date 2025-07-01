import { StyleSheet } from 'react-native'
import { CommonColors } from '../../../styles/Colors'
import { moderateScale, verticalScale, scale, width, height } from '../../../styles/scaling'
import FontFamily from '../../../constants/FontFamily'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CommonColors.themeMain,
  },
  
  backgroundContainer: {
    position: 'relative',
    width: '100%',
    height: height,
  },
  
  backgroundImagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: CommonColors.themeSecondary,
    // This will be replaced with actual image later
  },
  
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  
  contentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    paddingHorizontal: moderateScale(60),
    paddingTop: verticalScale(100),
    paddingBottom: verticalScale(60),
    justifyContent: 'flex-end',
  },
  
  movieTitle: {
    fontFamily: FontFamily.PublicSans_Bold,
    fontSize: moderateScale(48),
    color: CommonColors.white,
    marginBottom: verticalScale(20),
    lineHeight: moderateScale(56),
  },
  
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(30),
    gap: moderateScale(20),
  },
  
  ratingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(4),
  },
  
  ratingText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(18),
    color: CommonColors.white,
  },
  
  yearText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: moderateScale(18),
    color: CommonColors.white,
  },
  
  durationText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: moderateScale(18),
    color: CommonColors.white,
  },
  
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  genreText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: moderateScale(18),
    color: CommonColors.white,
  },
  
  infoSection: {
    marginBottom: verticalScale(15),
  },
  
  infoLabel: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(16),
    color: CommonColors.white,
    marginBottom: verticalScale(5),
  },
  
  infoText: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(16),
    color: CommonColors.textSecondary,
    lineHeight: moderateScale(24),
  },
  
  descriptionSection: {
    marginBottom: verticalScale(40),
    maxWidth: scale(600),
  },
  
  descriptionText: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(18),
    color: CommonColors.white,
    lineHeight: moderateScale(28),
  },
  
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: moderateScale(20),
    flexWrap: 'wrap',
  },
  
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CommonColors.white,
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
    gap: moderateScale(12),
  },
  
  playIconPlaceholder: {
    width: moderateScale(20),
    height: moderateScale(20),
    backgroundColor: CommonColors.themeMain,
    borderRadius: moderateScale(2),
  },
  
  playButtonText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(16),
    color: CommonColors.themeMain,
  },
  
  externalPlayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
    gap: moderateScale(12),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  externalPlayerIconPlaceholder: {
    width: moderateScale(20),
    height: moderateScale(20),
    backgroundColor: CommonColors.white,
    borderRadius: moderateScale(2),
  },
  
  externalPlayerButtonText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: moderateScale(16),
    color: CommonColors.white,
  },
  
  trailerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
    gap: moderateScale(12),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  trailerIconPlaceholder: {
    width: moderateScale(20),
    height: moderateScale(20),
    backgroundColor: CommonColors.white,
    borderRadius: moderateScale(2),
  },
  
  trailerButtonText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: moderateScale(16),
    color: CommonColors.white,
  },
  
  addToListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
    gap: moderateScale(12),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  addToListIconPlaceholder: {
    width: moderateScale(20),
    height: moderateScale(20),
    backgroundColor: CommonColors.white,
    borderRadius: moderateScale(2),
  },
  
  addToListButtonText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: moderateScale(16),
    color: CommonColors.white,
  },
}) 