import React, { useState, useEffect } from 'react'
import { FlatList, Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native'
import { CommonColors } from '../styles/Colors'
import { moderateScale, scale, verticalScale } from '../styles/scaling'
import FontFamily from '../constants/FontFamily'
import imagepath from '../constants/imagepath'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { MainStackParamList } from '../navigation/NavigationsTypes'
import { imageResolutionHandlerForUrl } from '../utils/CommonFunctions'
import { setCurrentlyPlaying } from '../redux/reducers/main'
import { useDispatch } from 'react-redux'
import SimpleMarquee from './MarqueeText'

interface ShowData {
  group?: string
  title?: string
  logo?: string
  url?: string
  channelIndex?: number
}

interface ShowChannelCatCardProps {
  show: ShowData
  hasTVPreferredFocus?: boolean
  onFocus?: (event: any, programIndex: number) => void
  onBlur?: (event: any, programIndex: number) => void
  onPress?: (programIndex: number) => void
  channelIndex?: number
  setChannelUrl?: (url: string) => void
}

const ShowChannelCatCard: React.FC<ShowChannelCatCardProps> = ({
  show,
  hasTVPreferredFocus,
  onFocus,
  onBlur,
  onPress,
  channelIndex = 0,
  setChannelUrl
}) => {
  const [imageError, setImageError] = useState(false)
  const [focusedProgramIndex, setFocusedProgramIndex] = useState<number | null>(null)
  const [lastTap, setLastTap] = useState<number | null>(null)
  const navigation = useNavigation<NavigationProp<MainStackParamList>>()
  
  const dispatch = useDispatch()
  // Reset image error state when show changes  
  useEffect(() => {
    setImageError(false)
  }, [show.title, show.logo])

  const handleProgramFocus = (event: any, programIndex: number) => {
    setFocusedProgramIndex(programIndex)
    onFocus?.(event, programIndex)
  }

  const handleProgramBlur = (event: any, programIndex: number) => {
    setFocusedProgramIndex(null)
    onBlur?.(event, programIndex)
  }

  const handleProgramPress = (programIndex: number) => {
    onPress?.(programIndex)
  }

  const handleImageError = (e: any) => {
    console.log('Image failed to load, showing placeholder for:', show.title, e)
    setImageError(true)
  }

  const handleDoubleClick = () => {
    dispatch(setCurrentlyPlaying({
      ...show,
      type: 'live', // Mark this as a live TV channel
      url: show.url
    }))
    navigation.navigate('LiveChannelPlayScreen', { 
      channel: {
        ...show,
        url: show.url,
        type: 'live',
      } 
    })
  }

  const handlePress = (index: number) => {
    const now = Date.now()
    const DOUBLE_PRESS_DELAY = 300

    if (lastTap && (now - lastTap) < DOUBLE_PRESS_DELAY) {
      // Double click detected
      handleDoubleClick()
      setLastTap(null)
    } else {
      // Single click - execute original functionality
      console.log('show.url', show.url)
      setChannelUrl?.('')
      setTimeout(() => {
        setChannelUrl?.(show.url || '')
      }, 250);
      setLastTap(now)
    }
  }

  // Mock program data - in real app this would come from props or API
  const programs = [
    { title: 'No information', duration: 'current', color: '#3E4756' },
    { title: 'No information', duration: 'next', color: '#232629' },
    { title: 'No information', duration: 'later', color: 'rgba(255, 255, 255, 0.2)' },
    { title: 'No information', duration: 'evening', color: 'rgba(255, 255, 255, 0.2)' },
  ]
  const getProxyImageUrl = (url: any) => {
    if (!url) return null;
  
    // Remove protocol (weserv requires host/path only)
    const cleanUrl = url.replace(/^https?:\/\//, '');
  
    return `https://images.weserv.nl/?url=${cleanUrl}`;
  };
  return (
    <View style={styles.channelRow}>
      <View style={styles.channelInfo}>
        <Text style={styles.channelNumber}>{channelIndex + 1}</Text>
        
        <View style={styles.channelLogoContainer}>
          <Image 
            source={show?.logo ?  imageError ?  {uri:getProxyImageUrl(show?.logo)} : {uri:show?.logo} : imagepath.tv} 
            style={styles.channelLogo}
            tintColor={!show?.logo ? CommonColors.white : undefined}
            onError={(e) => {
              console.log('Image error:', e.nativeEvent.error)
              handleImageError(e.nativeEvent)
            }}
          />
        </View>

        <View style={{width:moderateScale(140),overflow:'hidden'}}> 
            <SimpleMarquee
              text={show.title || 'Channel Name'}
              shouldStart={focusedProgramIndex !== null}
              textStyle={[styles.channelNameText,focusedProgramIndex !== null && {color:CommonColors.blueText}]}
              speed={50}
            />
        </View>
      </View>

      

      <View style={styles.programSchedule}>
        {/* {programs.map((program, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.programBlock,
              { backgroundColor: 'rgba(27,30,33,1)' },
              focusedProgramIndex === index && styles.programBlockFocused,
            ]}
            hasTVPreferredFocus={hasTVPreferredFocus && index === 0}
            activeOpacity={1}
            onFocus={(event) => handleProgramFocus(event, index)}
            onBlur={(event) => handleProgramBlur(event, index)}
            onPress={() => handlePress(index)}
          >
            <Text style={[styles.programText, focusedProgramIndex === index && {color:CommonColors.black}]} numberOfLines={1}>
              {program.title}
            </Text>
          </TouchableOpacity>
        ))} */}
        <FlatList
          data={programs}
          renderItem={({item, index}) => (
            <TouchableOpacity
            key={index}
            style={[
              styles.programBlock,
              { backgroundColor: 'rgba(27,30,33,1)' },
              focusedProgramIndex === index && styles.programBlockFocused,
            ]}
            hasTVPreferredFocus={hasTVPreferredFocus && index === 0}
            activeOpacity={1}
            onFocus={(event) => handleProgramFocus(event, index)}
            onBlur={(event) => handleProgramBlur(event, index)}
            onPress={() => handlePress(index)}
          >
            <Text style={[styles.programText, focusedProgramIndex === index && {color:CommonColors.black}]} numberOfLines={1}>
              {item.title}
            </Text>
          </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap:moderateScale(8),
            paddingHorizontal:moderateScale(10),
            height:moderateScale(40),
          }}
        />
      </View>
    </View>
  )
}

export default ShowChannelCatCard

const styles = StyleSheet.create({
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: verticalScale(60),
    paddingHorizontal: moderateScale(12),
    marginVertical: verticalScale(4),
    borderRadius: moderateScale(8),
    // backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: moderateScale(280),
    marginRight: moderateScale(20),
  },
  channelNumber: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(18),
    lineHeight: moderateScale(26),
    letterSpacing: moderateScale(0.44),
    color: CommonColors.white,
    width: moderateScale(35),
    textAlign: 'center',
    marginRight: moderateScale(15),
  },
  channelLogoContainer: {
    marginRight: moderateScale(15),
    height: moderateScale(40),
    width: moderateScale(75),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(6),
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: CommonColors.backgroundBlue,
  },
  channelLogo: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(6),
    resizeMode: 'contain',
  },
  channelNameText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(18),
    letterSpacing: moderateScale(0.24),
    color: CommonColors.white,
    flex: 1,
  },
  programSchedule: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: moderateScale(10),
  },
  programBlock: {
    // flex: 1,
    // height: moderateScale(44),
    width: moderateScale(400),
    borderRadius: moderateScale(6),
    paddingHorizontal: moderateScale(12),
    // paddingVertical: moderateScale(8),
    justifyContent: 'center',
    // alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  programBlockFocused: {
    borderColor: CommonColors.white,
    backgroundColor: 'rgba(225, 226, 228, 1)',
    shadowColor: CommonColors.white,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  currentProgram: {
    backgroundColor: '#3E4756',
  },
  nextProgram: {
    backgroundColor: '#232629',
  },
  programText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: moderateScale(17),
    color: CommonColors.white,
    textAlign: 'left',
  },
}) 