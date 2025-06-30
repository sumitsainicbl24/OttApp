import { StyleSheet } from 'react-native'
import { CommonColors } from '../../../styles/Colors'
import { moderateScale, verticalScale, width, height, scale } from '../../../styles/scaling'
import FontFamily from '../../../constants/FontFamily'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: CommonColors.themeMain,
  },
  ShowDetailsContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems:'flex-start',
    paddingHorizontal: moderateScale(40),
    paddingVertical: verticalScale(45),
  },
  ShowImageContainer: {
    width: scale(680),
    height: scale(438),
    borderRadius: moderateScale(16),
    overflow: 'hidden',
  },
  ShowImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },  
  backgroundImagePlaceholder: {
    flex: 1,
    backgroundColor: '#2A2D32',
    resizeMode: 'contain',
    width: '100%',
    height: height/1.3,
    // justifyContent: 'center',
    marginBottom: verticalScale(-250),
    paddingTop: verticalScale(150),
  },
  gradientOverlay1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.7,
    backgroundColor: 'rgba(11, 24, 48, 0.95)',
  },
  gradientOverlay2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: 'rgba(23, 25, 28, 0.8)',
  },
  
  // New horizontal gradient overlay for left-to-right fade effect
  horizontalGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  
  scrollContainer: {
    flex: 1,
    backgroundColor: CommonColors.themeMain,
  },
  
  // Top Navigation Styles
  topNavContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(40),
    paddingVertical: verticalScale(20),
    zIndex: 10,
  },
  
  navMenuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(24),
  },
  
  activeMenuItem: {
    backgroundColor: CommonColors.white,
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(36),
  },
  
  activeMenuText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(26),
    color: CommonColors.themeMain,
  },
  
  menuText: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(26),
    color: CommonColors.white,
  },
  
  userActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(32),
  },
  
  iconButton: {
    width: moderateScale(50),
    height: moderateScale(50),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: moderateScale(25),
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  bellIconPlaceholder: {
    width: moderateScale(26.45),
    height: moderateScale(26.45),
    borderRadius: moderateScale(4),
    resizeMode: 'contain',
  },
  
  settingsIconPlaceholder: {
    width: moderateScale(26.45),
    height: moderateScale(26.45),
    resizeMode: 'contain',
    borderRadius: moderateScale(4),
  },
  
  profileIcon: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  profileImagePlaceholder: {
    width: '60%',
    height: '30%',
    borderRadius: moderateScale(20),
    backgroundColor: '#C4C4C4',
  },
  
  // Featured Content Styles
  featuredContainer: {
    width: '35%',
    height: '45%',
    zIndex: 10,
    marginLeft: moderateScale(40),
    justifyContent: 'space-between',
  },
  
  featuredImagePlaceholder: {
    height: '33%',
    width: '40%',
    resizeMode: 'contain',
    // alignSelf:'flex-start'
  },
  
  featuredContent: {
    // gap: verticalScale(40),
  },
  
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(36),
  },
  
  metadataText: {
    fontFamily: FontFamily.PublicSans_Medium,
    fontSize: scale(20),
    color: CommonColors.white,
  },
  
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '5%',
    width: '100%',
  },
  
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CommonColors.buttonPrimary,
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(12),
    width: '30%',
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    gap: scale(10),
  },
  
  playIconPlaceholder: {
    width: moderateScale(24),
    height: moderateScale(24),
    resizeMode: 'contain',
  },
  
  playButtonText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(20),
    color: CommonColors.white,
  },
  
  myListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    width: '30%',
    justifyContent: 'center',
    gap: moderateScale(12),
  },
  
  plusSymbol: {
    fontFamily: FontFamily.PublicSans_Bold,
    fontSize: scale(26),
    color: CommonColors.white,
  },
  
  myListButtonText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(20),
    color: CommonColors.white,
  },
  
  descriptionContainer: {
    width: '100%',
  },
  
  description: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(20),
    lineHeight: scale(30),
    color: CommonColors.white,
    textAlign: 'left',
  },
  
  // Section Styles
  sectionContainer: {
    marginTop: verticalScale(40),
    paddingHorizontal: moderateScale(20),
  },
  sectionContainerLiveChannels: {
    height: '30%',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(40),
    zIndex: 10,
  },
  
  sectionTitle: {
    fontFamily: FontFamily.PublicSans_Bold,
    fontSize: scale(30),
    color: CommonColors.white,
    marginBottom: verticalScale(24),
    marginLeft: moderateScale(20),
  },
  sectionTitleLiveChannels: {
    fontFamily: FontFamily.PublicSans_Bold,
    fontSize: scale(30),
    color: CommonColors.white,
    marginBottom: verticalScale(24),
  },
  
  // Live TV Channels Styles
  channelsContainer: {
    flexDirection: 'row',
    gap: moderateScale(40),
    flexWrap: 'wrap',
  },
  
  channelLogoContainer: {
    // width: moderateScale(300),
    // height: verticalScale(250),
    width: '15%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    padding: moderateScale(16),
    marginRight: moderateScale(20),
  },
  
  channelLogoPlaceholder: {
    width: moderateScale(60),
    height: moderateScale(60),
    backgroundColor: '#C4C4C4',
    borderRadius: moderateScale(8),
  },

  channelNumber: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(26),
    lineHeight: moderateScale(31),
    letterSpacing: moderateScale(0.52), // 2% of font size
    color: CommonColors.white,
    width: moderateScale(30),
    textAlign: 'center',
  },

  channelName: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(16),
    color: CommonColors.white,
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },

  liveIndicator: {
    backgroundColor: '#FF0000',
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(4),
    marginBottom: verticalScale(8),
  },

  liveText: {
    fontFamily: FontFamily.PublicSans_Bold,
    fontSize: moderateScale(12),
    color: CommonColors.white,
  },

  currentShow: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(14),
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  
  // Movie Carousel Styles
  carouselContainer: {
    paddingVertical: verticalScale(25),
    paddingHorizontal: moderateScale(20),
  },
  
  // Continue Watching Styles
  continueWatchingContainer: {
    flexDirection: 'row',
    gap: moderateScale(24),
    alignItems: 'stretch',
  },
  
  continueWatchingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  continueWatchingTitle: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(20),
    color: CommonColors.white,
  },

  categoryListContainer: {
    width: scale(450),
    paddingVertical: verticalScale(20),
    // paddingHorizontal: moderateScale(20),
    alignItems: 'center',
    gap: verticalScale(16),
  },
  
  categoryListTitle: {
    fontFamily: FontFamily.PublicSans_Bold,
    fontSize: scale(30),
    color: CommonColors.white,
    marginBottom: verticalScale(16),
    textAlign: 'center',
  },
  
  // TV Show Details Content Styles - based on Figma design
  ShowDetailsContent: {
    paddingLeft: moderateScale(50),
    paddingRight: moderateScale(40),
    justifyContent: 'center',
    gap: verticalScale(30),
  },
  
  showTitle: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(36),
    lineHeight: scale(42),
    letterSpacing: scale(0.72), // 2% of font size
    color: CommonColors.white,
  },
  
  showTimeSlot: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(28),
    lineHeight: scale(33),
    letterSpacing: scale(0.56), // 2% of font size
    color: CommonColors.white,
  },
  
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: moderateScale(25),
  },
  
  progressBarContainer: {
    width: scale(250),
    height: moderateScale(5),
    backgroundColor: '#1C2F4B',
    borderRadius: moderateScale(20),
    overflow: 'hidden',
    position: 'relative',
  },
  
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: CommonColors.white,
    borderRadius: moderateScale(20),
  },
  
  durationText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(24),
    lineHeight: scale(28),
    letterSpacing: scale(0.48), // 2% of font size
    color: CommonColors.white,
  },
  
  // TV Guide Styles
  tvGuideHeader: {
    paddingHorizontal: moderateScale(40),
    paddingVertical: verticalScale(20),
    alignItems: 'flex-start',
  },
  
  dateTimeText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(28),
    lineHeight: moderateScale(33),
    letterSpacing: moderateScale(0.56), // 2% of font size
    color: CommonColors.white,
    marginBottom: verticalScale(15),
  },
  
  dividerLine: {
    width: '100%',
    height: 1,
    backgroundColor: CommonColors.white,
  },
  
  tvGuideContainer: {
    paddingHorizontal: moderateScale(40),
    paddingBottom: verticalScale(40),
  },
  
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: moderateScale(250),
    marginRight: moderateScale(21),
  },
  
  channelLogo: {
    marginHorizontal: moderateScale(15),
  },
  
  channelNameText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(28),
    letterSpacing: moderateScale(0.28), // 1% of font size
    color: CommonColors.white,
    flex: 1,
  },
  
  programList: {
    flex: 1,
  },
  
  programListContent: {
    paddingRight: moderateScale(20),
  },
  
  programSlot: {
    width: moderateScale(250),
    height: moderateScale(50),
    borderRadius: moderateScale(8),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: moderateScale(2),
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(10),
  },
  
  programText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(28),
    lineHeight: moderateScale(33),
    letterSpacing: moderateScale(0.56), // 2% of font size
    textAlign: 'center',
  },
  
}) 