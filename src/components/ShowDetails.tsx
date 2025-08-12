import React, { useEffect, useState } from 'react'
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import imagepath from '../constants/imagepath'
import { CommonColors } from '../styles/Colors'
import { moderateScale, verticalScale, scale } from '../styles/scaling'
import FontFamily from '../constants/FontFamily'
import { addToMyListApi, mylistCheckApi, removeFromMyList } from '../redux/actions/main'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { MainStackParamList } from '../navigation/NavigationsTypes'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'

interface ShowData {
  title: string
  year: string
  duration: string
  genre: string
  rating: string
  description: string
  image: ImageSourcePropType
}

interface ShowDetailsProps {
  onPlayPress?: () => void
  onMyListPress?: () => void
  showDetails?: any
  onFocus?: () => void
  PosterMovieName?: any
}

const ShowDetails: React.FC<ShowDetailsProps> = ({ 
  onPlayPress, 
  onMyListPress,
  showDetails,
  onFocus,
  PosterMovieName
}) => {
  const [focused, setFocused] = useState<string | null>(null)
  const [isInMyList, setIsInMyList] = useState<boolean>(false)
  const navigation = useNavigation<NavigationProp<MainStackParamList>>()
  const userToken = useSelector((state: RootState) => state.rootReducer.auth.userToken)
  const handleFocus = (item: string) => {
    setFocused(item)
    onFocus?.()
  }

  const handleBlur = () => {
    setFocused(null)
  }

  const handleMyListPress = () => {
    if(!userToken){
      navigation.navigate('LoginScreen')
      return
    }

    if (!PosterMovieName) {
      console.log('PosterMovieName is null, cannot perform my list action')
      return
    }
    
    const movieData = {...PosterMovieName, type: 'movies'}
    if(isInMyList){
      removeFromMyList(movieData)
      setIsInMyList(false)
    }else{
      addToMyListApi(movieData)
      setIsInMyList(true)
    }
  }

  useEffect(() => {
    console.log('checking useeffect 1', PosterMovieName)
    
    if (!PosterMovieName) {
      console.log('PosterMovieName is null, skipping API call')
      return
    }
    
    const checkMyList = async () => {
      console.log('checking useeffect 2', PosterMovieName)
      const movieData = {...PosterMovieName, type: 'movies'}
      const res = await mylistCheckApi(movieData)
      if(res?.data?.data?.exists){
        console.log('PosterMovieName', PosterMovieName)
        console.log('res', res)
        setIsInMyList(res?.data?.data?.exists)
      }
    }
    
    checkMyList()
  }, [PosterMovieName])

  return (
    <View style={styles.featuredContainer}>
      {/* <Image source={showDetails?.image} style={styles.featuredImagePlaceholder} /> */}
      <Text style={styles.title}>
        {showDetails?.title}
      </Text>
      <View style={styles.metadataContainer}>
        <Text style={styles.metadataText}>{showDetails?.Year}</Text>
        <Text style={styles.metadataText}>{showDetails?.Runtime}</Text>
        <Text style={styles.metadataText}>{showDetails?.Genre}</Text>
        <Text style={styles.metadataText}>{showDetails?.rating}</Text>
      </View>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
        style={[styles.playButton, focused === 'play' && styles.playButtonFocused]} 
        onPress={onPlayPress}
        activeOpacity={1}
        onFocus={() => handleFocus('play')}
        onBlur={handleBlur}
        >
          <Image source={imagepath.playIconWhite} style={styles.playIconPlaceholder} />
          <Text style={styles.playButtonText}>Play Now</Text>
        </TouchableOpacity>

        <TouchableOpacity 
        style={[styles.myListButton, focused === 'myList' && styles.myListButtonFocused]} 
        onPress={
          // onMyListPress
          handleMyListPress
        }
        activeOpacity={1}
        onFocus={() => handleFocus('myList')}
        onBlur={handleBlur}
        >
          <Text style={styles.plusSymbol}>{isInMyList ? '-' : '+'}</Text>
          <Text style={styles.myListButtonText}>{isInMyList ? 'Remove from My List' : 'Add to My List'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          {showDetails?.Plot}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  // Featured Content Styles
  featuredContainer: {
    // width: scale(665),
    paddingTop: verticalScale(50),
    width: '40%',
    height: verticalScale(450),
    zIndex: 10,
    marginLeft: moderateScale(40),
    // justifyContent: 'space-between',
    gap: verticalScale(35), 
  },
  
  featuredImagePlaceholder: {
    height: '33%',
    width: '40%',
    resizeMode: 'contain',
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
  title: {
    fontFamily: FontFamily.PublicSans_ExtraBold,
    fontSize: scale(55),
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
    width: scale(252),
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    gap: scale(10),
    borderWidth: 2,
    borderColor: 'transparent',
  },

  playButtonFocused: {
    borderColor: CommonColors.white,
    shadowColor: CommonColors.white,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
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
    width: scale(252),
    justifyContent: 'center',
    gap: moderateScale(12),
    borderWidth: 2,
    borderColor: 'transparent',
  },

  myListButtonFocused: {
    borderColor: CommonColors.white,
    shadowColor: CommonColors.white,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 10,
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
    fontFamily: FontFamily.PublicSans_Light,
    fontSize: scale(25),
    lineHeight: scale(30),
    color: CommonColors.white,
    textAlign: 'left',
  },
})

export default ShowDetails 