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
    width: moderateScale(80),
    height: moderateScale(80),
    backgroundColor: CommonColors.white,
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },

  channelNumber: {
    fontFamily: FontFamily.PublicSans_Bold,
    fontSize: moderateScale(18),
    color: CommonColors.themeMain,
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
  
}) 