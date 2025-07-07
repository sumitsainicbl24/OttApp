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
    backgroundColor: CommonColors.buttonTransparent,
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
  
  actionButtonsSection: {
    paddingHorizontal: moderateScale(60),
    paddingVertical: verticalScale(40),
    marginTop: -moderateScale(100),
    zIndex: 1000,
  },
  
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CommonColors.buttonTransparent,
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
    gap: moderateScale(12),
    borderWidth: 1,
    borderColor: CommonColors.buttonTransparent,
  },
  
  playIconPlaceholder: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(2),
  },
  
  playButtonText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(16),
    color: CommonColors.white,
  },
  
  externalPlayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CommonColors.buttonTransparent,
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
    gap: moderateScale(12),
    borderWidth: 1,
    borderColor: CommonColors.buttonTransparent,
  },
  
  externalPlayerIconPlaceholder: {
    width: moderateScale(20),
    height: moderateScale(20),
  },
  
  externalPlayerButtonText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: moderateScale(16),
    color: CommonColors.white,
  },
  
  trailerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CommonColors.buttonTransparent,
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
    gap: moderateScale(12),
    borderWidth: 1,
    borderColor: CommonColors.buttonTransparent,
  },
  
  trailerIconPlaceholder: {
    width: moderateScale(20),
    height: moderateScale(20),
  },
  
  trailerButtonText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: moderateScale(16),
    color: CommonColors.white,
  },
  
  addToListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CommonColors.buttonTransparent,
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
    gap: moderateScale(12),
    borderWidth: 1,
    borderColor: CommonColors.buttonTransparent,
  },
  
  addToListIconPlaceholder: {
    width: moderateScale(20),
    height: moderateScale(20),
  },
  
  addToListButtonText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: moderateScale(16),
    color: CommonColors.white,
  },

  gridItem: {
    width: scale(150),
    height: scale(200),
    marginRight: moderateScale(10),
    marginBottom: moderateScale(10),
  },
  
  // Episode styles
  episodesSection: {
    paddingHorizontal: moderateScale(60),
    paddingVertical: verticalScale(30),
  },
  
  episodesSectionTitle: {
    fontFamily: FontFamily.PublicSans_Bold,
    fontSize: moderateScale(24),
    color: CommonColors.white,
    marginBottom: verticalScale(20),
  },
  
  episodesList: {
    paddingRight: moderateScale(60),
  },
  
  episodeCard: {
    width: scale(250),
    height: verticalScale(400),
    borderRadius: scale(12),
    marginRight: moderateScale(15),
    overflow: 'hidden',
    backgroundColor: CommonColors.backgroundGrey,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  episodeCardFocused: {
    borderColor: CommonColors.white,
    transform: [{ scale: 1.05 }],
    shadowColor: CommonColors.white,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    zIndex: 1000,
  },
  
  episodeImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'cover',
  },
  
  episodeTitleContainer: {
    flex: 1,
    backgroundColor: CommonColors.backgroundGrey,
    justifyContent: 'center',
    paddingHorizontal: moderateScale(8),
  },
  
  episodeTitle: {
    fontSize: moderateScale(14),
    fontFamily: FontFamily.PublicSans_Regular,
    color: CommonColors.textWhite,
    textAlign: 'center',
  },
}) 