// 1. React Native core imports
import React, { useState, useEffect } from 'react'
import { Text, View, TouchableOpacity, ScrollView, StatusBar, Image } from 'react-native'

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
  const route = useRoute<MoviePlayScreenRouteProp>()
  const { show } = route.params

  // Focus state management
  const [focusedButton, setFocusedButton] = useState<string | null>(null)
  const [isMoviePlaying, setIsMoviePlaying] = useState(false)

  // Mock data - in real app this would come from props or API
  const [movieData, setMovieData] = useState<MovieData>({
    title: 'De Thundermans keren terug',
    language: 'NL',
    rating: '7.0',
    year: '2024',
    duration: '2h 0m',
    genres: ['Familie', 'Sciencefiction', 'Actie'],
    cast: 'Kira Kosarin, Jack Griffo, Addison Riecke, Diego Velazquez...',
    director: 'Beth Correll, Sarah Schmaus, Trevor Kirschner',
    description: 'De tweeling Phoebe en Max genieten van hun superheldenlevensstijl, maar wanneer een \'save\' misgaat, worden de Thundermans teruggestuurd naar Hiddenville. Terwijl Hank en Barb genieten van hun terugkeer en Billy en Nora uitkijken naar een normaal leven op de middelbare school, zijn Max en Phoebe vastbesloten hun superheldenstatus terug te krijgen.',
  })

  // Get movie title from route params or fallback to mock data
  const movieTitle = show?.title || show?.name || movieData.title

  // Focus handlers
  const handleFocus = (buttonName: string) => {
    setFocusedButton(buttonName)
  }

  const handleBlur = () => {
    setFocusedButton(null)
  }

  const handlePlayPress = () => {
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

  const handleAddToListPress = () => {
    console.log('Add to My list pressed')
    // Handle add to list action
  }

  return (
    <MainLayout activeScreen="MoviePlayScreen" hideSidebar={true}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      {isMoviePlaying ? <LiveVideoComp streamUrl={show?.url} /> : (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ShowDetails1 Component - handles background, gradients, and movie details */}
        <ShowDetails1 movieName={movieTitle} />
        
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
              ]}>Play</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
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
            </TouchableOpacity>
            
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
                focusedButton === 'addToList' && { backgroundColor: CommonColors.white }
              ]}
              onPress={handleAddToListPress}
              onFocus={() => handleFocus('addToList')}
              onBlur={handleBlur}
              activeOpacity={1}
            >
              <Image 
                source={imagepath.wishlistIcon} 
                style={styles.addToListIconPlaceholder} 
                tintColor={focusedButton === 'addToList' ? CommonColors.black : CommonColors.white}
              />
              <Text style={[
                styles.addToListButtonText,
                focusedButton === 'addToList' && { color: CommonColors.black }
              ]}>Add to My list</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>)}
    </MainLayout>
  )
}

export default MoviePlayScreen 