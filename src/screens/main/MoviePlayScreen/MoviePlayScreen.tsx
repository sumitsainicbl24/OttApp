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

// 7. Utils and helpers
import { MainStackParamList } from '../../../navigation/NavigationsTypes'

// 8. Local styles import (ALWAYS LAST)
import { styles } from './styles'

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
  const { activeScreen } = route.params

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

  const handlePlayPress = () => {
    console.log('Play pressed')
    // Handle play action
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
    <MainLayout activeScreen={activeScreen || "MoviePlayScreen"} hideSidebar={true}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Background Image Placeholder */}
        <View style={styles.backgroundContainer}>
          {/* Image placeholder - will be added later */}
          <View style={styles.backgroundImagePlaceholder} />
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={[
              'rgba(19, 22, 25, 0.3)',
              'rgba(19, 22, 25, 0.7)',
              'rgba(19, 22, 25, 0.9)',
              CommonColors.themeMain
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.gradientOverlay}
          />
          
          {/* Content Overlay */}
          <View style={styles.contentContainer}>
            {/* Movie Title with Language */}
            <Text style={styles.movieTitle}>
              | {movieData.language} | {movieData.title}
            </Text>
            
            {/* Rating and Metadata */}
            <View style={styles.metadataRow}>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>{movieData.rating}</Text>
              </View>
              <Text style={styles.yearText}>{movieData.year}</Text>
              <Text style={styles.durationText}>{movieData.duration}</Text>
              <View style={styles.genresContainer}>
                {movieData.genres.map((genre, index) => (
                  <Text key={index} style={styles.genreText}>
                    {genre}{index < movieData.genres.length - 1 ? ', ' : ''}
                  </Text>
                ))}
              </View>
            </View>
            
            {/* Cast Information */}
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Cast:</Text>
              <Text style={styles.infoText}>{movieData.cast}</Text>
            </View>
            
            {/* Director Information */}
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Director:</Text>
              <Text style={styles.infoText}>{movieData.director}</Text>
            </View>
            
            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionText}>{movieData.description}</Text>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={styles.playButton}
                onPress={handlePlayPress}
                hasTVPreferredFocus={true}
              >
                <View style={styles.playIconPlaceholder} />
                <Text style={styles.playButtonText}>Play</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.externalPlayerButton}
                onPress={handleExternalPlayerPress}
              >
                <View style={styles.externalPlayerIconPlaceholder} />
                <Text style={styles.externalPlayerButtonText}>Open in external player</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.trailerButton}
                onPress={handleTrailerPress}
              >
                <View style={styles.trailerIconPlaceholder} />
                <Text style={styles.trailerButtonText}>Trailer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.addToListButton}
                onPress={handleAddToListPress}
              >
                <View style={styles.addToListIconPlaceholder} />
                <Text style={styles.addToListButtonText}>Add to My list</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </MainLayout>
  )
}

export default MoviePlayScreen 