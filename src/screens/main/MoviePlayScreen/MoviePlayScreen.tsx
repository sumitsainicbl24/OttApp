// 1. React Native core imports
import React, { useState, useEffect } from 'react'
import { Text, View, TouchableOpacity, ScrollView, StatusBar, Image, FlatList } from 'react-native'

// 2. Third-party library imports
import LinearGradient from 'react-native-linear-gradient'

// 3. Navigation imports
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native'

// 4. Redux imports
import { useAppSelector, useAppDispatch } from '../../../redux/hooks'

// 5. Global styles and utilities
import CommonStyles from '../../../styles/CommonStyles'
import { CommonColors } from '../../../styles/Colors'
import { moderateScale, verticalScale, scale } from '../../../styles/scaling'
import FontFamily from '../../../constants/FontFamily'
import imagepath from '../../../constants/imagepath'

// 6. Component imports
import ButtonComp from '../../../components/ButtonComp'
import MainLayout from '../../../components/MainLayout'
import ShowDetails1 from '../../../components/ShowDetails1'

// 7. Utils and helpers
import { MainStackParamList } from '../../../navigation/NavigationsTypes'

// 8. Local styles import (ALWAYS LAST)
import { styles } from './styles'
import LiveVideoComp from '../../../components/LiveVideoComp'
import { addToMyListApi, continueWatchingUpdateApi, getMyListApi, getSeriesEpisodes, removeFromMyList } from '../../../redux/actions/main'
import ShowCatCard from '../../../components/ShowCatCard'
import { getEpisodeAndSeasonNumber, imageResolutionHandlerForUrl } from '../../../utils/CommonFunctions'
import { setCurrentSeriesEpisodes } from '../../../redux/reducers/main'
import { useSelector } from 'react-redux'
import { RootState } from '../../../redux/store'

type MoviePlayScreenRouteProp = RouteProp<MainStackParamList, 'MoviePlayScreen'>

interface MovieData {
  title: string
  language: string
  rating: string
  year: string
  duration: string
  genres: string[]
  cast: string
  director: string
  description: string
  posterUrl?: string
}

const MoviePlayScreen = () => {
  const navigation = useNavigation()
  const dispatch = useAppDispatch()
  const route = useRoute<MoviePlayScreenRouteProp>()

  const {currentlyPlaying} = useSelector((state: RootState) => state.rootReducer.main)
  const { show, movie } = route.params
  const [movieTitle, setMovieTitle] = useState(movie?.title || movie?.name )
  const [showTitle, setShowTitle] = useState(show?.title || show?.name )
  const [seriesEpisodes, setSeriesEpisodes] = useState<any[]>([])
  // Focus state management
  const [focusedButton, setFocusedButton] = useState<string | null>(null)
  const [isMoviePlaying, setIsMoviePlaying] = useState(false)
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null)
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [addedToMyList, setAddedToMyList] = useState<boolean>(false)

  console.log(show, movie, "show and movie");
  


  // Focus handlers
  const handleFocus = (buttonName: string) => {
    setFocusedButton(buttonName)
  }

  const handleBlur = () => {
    setFocusedButton(null)
  }

  const handlePlayPress = async() => {
    if(currentlyPlaying){
      const currentPlayingData = {
        ...currentlyPlaying, 
        type: route?.params.show? 'series': 'movies',
        progress: 5,
        last_watched: new Date().toISOString(),
        duration: 1454,
        currentTime: 1454,
      };
      await continueWatchingUpdateApi(currentPlayingData)
    }
    setIsMoviePlaying(true)
  }

  const handleExternalPlayerPress = () => {
    console.log('Open in external player pressed')
    // Handle external player action
  }

  const handleTrailerPress = () => {
    console.log('Trailer pressed')
    // Handle trailer action
  }

  const handleAddToListPress = async() => {
    if(currentlyPlaying){
      const currentPlayingData = {...currentlyPlaying, type: route?.params.show? 'series': 'movies', url: streamUrl};
      if(addedToMyList){
        const res = await removeFromMyList(currentPlayingData)
        console.log('res from remove from my list', res)
        setAddedToMyList(false)
      }else{
        const res = await addToMyListApi(currentPlayingData)
        console.log('res from add to my list', res)
        setAddedToMyList(true)
      }
    }
  }

  // Episode card component
  const EpisodeCard = ({ episode }: { episode: any }) => {
    const [isFocused, setIsFocused] = useState(false)

    const handleFocus = () => {
      setIsFocused(true)
    }

    const handleBlur = () => {
      setIsFocused(false)
    }

    return (
      <TouchableOpacity 
        style={[
          styles.episodeCard,
          isFocused && styles.episodeCardFocused
        ]}
        onPress={() => {
          setSelectedEpisode(episode)
          setStreamUrl(episode?.url)
          setIsMoviePlaying(true)
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        activeOpacity={1}
      >
        <Image 
          source={episode?.logo && episode.logo.includes('https://') 
            ? { uri: imageResolutionHandlerForUrl(episode.logo) } 
            : imagepath.VideoPlaceHolder
          } 
          style={styles.episodeImage}
        />
        <View style={styles.episodeTitleContainer}>
          <Text numberOfLines={1} style={styles.episodeTitle}>
            {episode.title || episode.name || 'Episode'}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  useEffect(() => {
    if(movie){
      console.log('moviedata in play screen', movie)
      dispatch(setCurrentSeriesEpisodes([]))
      setMovieTitle(movie?.title || movie?.name)
      setStreamUrl(movie?.url)
    }
    if(show){
      (async () => {
      try {
        const res = await getSeriesEpisodes(show?.title || show?.name)
        console.log('res from series episodes', res)
        dispatch(setCurrentSeriesEpisodes(res?.data?.data?.data?.episodes || []))
        setSeriesEpisodes(res?.data?.data?.data?.episodes || [])
        setStreamUrl(res?.data?.data?.data?.episodes[0]?.url)
        } catch (error) {
          console.log('error', error)
        }
      })()
    }
  }, [movie, show])


  useEffect(() => {
    (async () => {
      const res = await getMyListApi()
      console.log('res from get my list', res)
      if(currentlyPlaying){
        const found = res?.data?.data?.data?.videos?.find((item: any) => item.title === currentlyPlaying.title && item.url === currentlyPlaying.url)
        if(found){
          setAddedToMyList(true)
        }
      }
    })()
  }, [currentlyPlaying])

  return (
    <MainLayout activeScreen="MoviePlayScreen" hideSidebar={true}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      {isMoviePlaying ? <LiveVideoComp streamUrl={streamUrl || ''} /> : (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ShowDetails1 Component - handles background, gradients, and movie details */}
        <ShowDetails1 movieName={movieTitle} showName={showTitle} />

        {seriesEpisodes?.length > 0 && (
          <View style={styles.episodesSection}>
            <Text style={styles.episodesSectionTitle}>Episodes</Text>
            <FlatList
              data={seriesEpisodes}
              renderItem={({ item }) => <EpisodeCard episode={item} />}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.episodesList}
            />
          </View>
        )}
        
        {/* Action Buttons Section */}
        <View style={styles.actionButtonsSection}>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[
                styles.playButton,
                focusedButton === 'play' && { backgroundColor: CommonColors.white }
              ]}
              onPress={handlePlayPress}
              onFocus={() => handleFocus('play')}
              onBlur={handleBlur}
              activeOpacity={1}
            >
              <Image 
                source={imagepath.playbuttonarrowhead} 
                style={styles.playIconPlaceholder} 
                tintColor={focusedButton === 'play' ? CommonColors.black : CommonColors.white}
              />
              <Text style={[
                styles.playButtonText,
                focusedButton === 'play' && { color: CommonColors.black }
              ]}>Play {selectedEpisode? getEpisodeAndSeasonNumber(selectedEpisode?.title) : ''}</Text>
            </TouchableOpacity>
            
            {/* <TouchableOpacity 
              style={[
                styles.externalPlayerButton,
                focusedButton === 'externalPlayer' && { backgroundColor: CommonColors.white }
              ]}
              onPress={handleExternalPlayerPress}
              onFocus={() => handleFocus('externalPlayer')}
              onBlur={handleBlur}
              activeOpacity={1}
            >
              <Image 
                source={imagepath.maximizeIcon} 
                style={styles.externalPlayerIconPlaceholder} 
                tintColor={focusedButton === 'externalPlayer' ? CommonColors.black : CommonColors.white}
              />
              <Text style={[
                styles.externalPlayerButtonText,
                focusedButton === 'externalPlayer' && { color: CommonColors.black }
              ]}>Open in external player</Text>
            </TouchableOpacity> */}
            
            <TouchableOpacity 
              style={[
                styles.trailerButton,
                focusedButton === 'trailer' && { backgroundColor: CommonColors.white }
              ]}
              onPress={handleTrailerPress}
              onFocus={() => handleFocus('trailer')}
              onBlur={handleBlur}
              activeOpacity={1}
            >
              <Image 
                source={imagepath.movieTrailerIcon} 
                style={styles.trailerIconPlaceholder} 
                tintColor={focusedButton === 'trailer' ? CommonColors.black : CommonColors.white}
              />
              <Text style={[
                styles.trailerButtonText,
                focusedButton === 'trailer' && { color: CommonColors.black }
              ]}>Trailer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.addToListButton,
                addedToMyList && {backgroundColor: CommonColors.backgroundBlue},
                focusedButton === 'addToList' && {backgroundColor: CommonColors.white}
              ]}
              onPress={handleAddToListPress}
              onFocus={() => handleFocus('addToList')}
              onBlur={handleBlur}
              activeOpacity={1}
            >
              <Image 
                source={addedToMyList ? focusedButton === 'addToList' ? imagepath.remove : imagepath.check : imagepath.wishlistIcon} 
                style={[styles.addToListIconPlaceholder]} 
                tintColor={focusedButton === 'addToList' ? CommonColors.black : CommonColors.white}
              />
              <Text style={[
                styles.addToListButtonText,
                focusedButton === 'addToList' && { color: CommonColors.black }
              ]}>{addedToMyList ? focusedButton === 'addToList' ? 'Remove from My list' : 'Added to My list' : 'Add to My list'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      
        
      </ScrollView>)}
    </MainLayout>
  )
}

export default MoviePlayScreen 