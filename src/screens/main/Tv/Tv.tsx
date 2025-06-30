// 1. React Native core imports
import React, { useState, useRef, useEffect } from 'react'
import { Image, ImageBackground, ScrollView, StatusBar, Text, View, FlatList, TouchableOpacity } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import { styles } from './styles'
import imagepath from '../../../constants/imagepath'
import MovieCatCarousel from '../../../components/MovieCatCarousel'
import ShowDetails from '../../../components/ShowDetails'
import MainLayout from '../../../components/MainLayout'
import CategoryList from '../../../components/CategoryList'
import { ActionMovieData, ComedyMovieData, DramaMovieData, ShowDetailsData } from './DummyData'
import { RouteProp, useRoute } from '@react-navigation/native'
import { MainStackParamList } from '../../../navigation/NavigationsTypes'
import LiveVideoComp from '../../../components/LiveVideoComp'
import ShowCatCarousel from '../../../components/ShowCatCarousel'
import { getMoviesFromMMKV } from '../../../utils/m3uParseAndGet'
import { moderateScale } from '../../../styles/scaling'

type MoviesScreenRouteProp = RouteProp<MainStackParamList, 'Movies'>

type MovieEntry = {
  type: 'movie';
  groupTitle: string;
  name: string;
  logo: string;
  url: string;
};

type MovieData = {
  [groupTitle: string]: MovieEntry[];
};

const Tv = () => {
  const route = useRoute<MoviesScreenRouteProp>()
  const { activeScreen } = route.params
  const [isLiveVideo, setIsLiveVideo] = useState(false)
  const [showCategoryAndSidebar, setShowCategoryAndSidebar] = useState(true)
  const [movieData, setMovieData] = useState<MovieData>({})
  const [movieCategories, setMovieCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [focusedChannel, setFocusedChannel] = useState<number>(0)
  const [focusedProgram, setFocusedProgram] = useState<number>(0)

  // Load movie data from MMKV on component mount
  useEffect(() => {
    loadMovieData()
  }, [])

  const loadMovieData = async () => {
    try {
      setLoading(true)
      console.log('Loading movie data from MMKV...')
      
      const movies = await getMoviesFromMMKV()
      console.log('Loaded movies:', Object.keys(movies).length, 'categories',movies)
      
      if (Object.keys(movies).length > 0) {
        // Filter only movie entries and convert to correct type
        const movieOnlyData: MovieData = {}
        Object.keys(movies).forEach(category => {
          const movieEntries = movies[category].filter(entry => entry.type === 'movie') as MovieEntry[]
          if (movieEntries.length > 0) {
            movieOnlyData[category] = movieEntries
          }
        })
        
        setMovieData(movieOnlyData)
        const categories = Object.keys(movieOnlyData).sort()
        setMovieCategories(categories)
        console.log('Movie categories:', categories)
        
        // Set first category as selected by default
        if (categories.length > 0 && !selectedCategory) {
          setSelectedCategory(categories[0])
        }
      } else {
        console.log('No movie data found in MMKV, using dummy data')
        // Fallback to dummy data structure
        const dummyData: MovieData = {
          'Action': ActionMovieData.map(movie => ({
            type: 'movie' as const,
            groupTitle: 'Action',
            name: movie.title,
            logo: movie.image || imagepath.guardianOfGalaxyMovie,
            url: ''
          })),
          'Comedy': ComedyMovieData.map(movie => ({
            type: 'movie' as const,
            groupTitle: 'Comedy', 
            name: movie.title,
            logo: movie.image || imagepath.guardianOfGalaxyMovie,
            url: ''
          })),
          'Drama': DramaMovieData.map(movie => ({
            type: 'movie' as const,
            groupTitle: 'Drama',
            name: movie.title,
            logo: movie.image || imagepath.guardianOfGalaxyMovie,
            url: ''
          }))
        }
        setMovieData(dummyData)
        setMovieCategories(['Action', 'Comedy', 'Drama'])
        setSelectedCategory('Action')
      }
    } catch (error) {
      console.error('Error loading movie data:', error)
      // Use dummy data as fallback
      const dummyData: MovieData = {
        'Action': ActionMovieData.map(movie => ({
          type: 'movie' as const,
          groupTitle: 'Action',
          name: movie.title,
          logo: movie.image || imagepath.guardianOfGalaxyMovie,
          url: ''
        })),
        'Comedy': ComedyMovieData.map(movie => ({
          type: 'movie' as const,
          groupTitle: 'Comedy',
          name: movie.title,
          logo: movie.image || imagepath.guardianOfGalaxyMovie,
          url: ''
        })),
        'Drama': DramaMovieData.map(movie => ({
          type: 'movie' as const,
          groupTitle: 'Drama',
          name: movie.title,
          logo: movie.image || imagepath.guardianOfGalaxyMovie,
          url: ''
        }))
      }
      setMovieData(dummyData)
      setMovieCategories(['Action', 'Comedy', 'Drama'])
      setSelectedCategory('Action')
    } finally {
      setLoading(false)
    }
  }

  const handlePlayPress = () => {
    console.log('Play button pressed')
    setIsLiveVideo(true)
  }

  const handleMyListPress = () => {
    console.log('My List button pressed')
  }

  const handleCategoryPress = (category: string) => {
    console.log('Category selected:', category)
    setSelectedCategory(category)
  }

  // Handle focus events for ScrollView content
  const handleScrollViewFocus = () => {
    setShowCategoryAndSidebar(false)
  }

  // Handle navigation back to category list (when pressing left)
  const handleCategoryListFocus = () => {
    setShowCategoryAndSidebar(true)
  }

  // Convert movie data to format expected by ShowCatCarousel
  const convertToCarouselData = (movies: MovieEntry[]) => {
    return movies.map((movie, index) => ({
      id: index + 1, // ShowData expects number id
      title: movie.name,
      image: movie.logo || imagepath.guardianOfGalaxyMovie, // ShowData expects 'image' not 'poster'
      category: movie.groupTitle
    }))
  }

  const handleProgramFocus = (channelIndex: number, programIndex: number) => {
    setFocusedChannel(channelIndex)
    setFocusedProgram(programIndex)
    setShowCategoryAndSidebar(false)
  }

  const handleProgramPress = (channelIndex: number, programIndex: number) => {
    console.log(`Program selected: Channel ${channelIndex + 1}, Program ${programIndex + 1}`)
    // Handle program selection logic here
  }

  // Get program background color based on channel and program index
  const getProgramBackgroundColor = (channelIndex: number, programIndex: number) => {
    // Channel 1 - first program is selected, second is white
    if (channelIndex === 0) {
      if (programIndex === 0) return '#3E4756' // Selected (darker gray)
      if (programIndex === 1) return '#FFFFFF' // Current program (white)
    }
    
    // Channels 2-3 - second program is current
    if ((channelIndex === 1 || channelIndex === 2) && programIndex === 1) {
      return '#232629' // Current program (medium gray)
    }
    
    // Channels 7-9 - first program is selected, second is current
    if (channelIndex >= 6) {
      if (programIndex === 0) return '#3E4756' // Selected (darker gray)
      if (programIndex === 1) return '#1C2F4B' // Current program (blue-gray)
    }
    
    return 'rgba(255, 255, 255, 0.2)' // Default (light transparent)
  }

  // Get program text color
  const getProgramTextColor = (channelIndex: number, programIndex: number) => {
    // if (channelIndex === 0 && programIndex === 1) {
    //   return '#000000' // Black text on white background
    // }
    return '#FFFFFF' // White text for others
  }

  // Get program width
  const getProgramWidth = (channelIndex: number, programIndex: number) => {
    if (channelIndex === 0 && programIndex === 1) {
      return moderateScale(350) // Smaller width for current program
    }
    return moderateScale(350) // Default width
  }

  if (loading) {
    return (
      <MainLayout activeScreen={activeScreen || "Movies"}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: 'white', fontSize: 18 }}>Loading Movies...</Text>
        </View>
      </MainLayout>
    )
  }

  return (
    <MainLayout activeScreen={activeScreen || "Movies"} hideSidebar={!showCategoryAndSidebar}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      {
        isLiveVideo && <LiveVideoComp />
      }
      
      <View style={styles.container}>
      
      {/* category list */}
      {(
        <View style={[styles.categoryListContainer, !showCategoryAndSidebar && {width: 0}] } nativeID="categoryList">
          <CategoryList 
            categories={movieCategories}
            selectedCategory={selectedCategory}
            onCategoryPress={handleCategoryPress}
            onFocus={handleCategoryListFocus}
          />
        </View>
      )}

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
       <View style={styles.ShowDetailsContainer}>
        <View style={styles.ShowImageContainer}>
          <Image
            source={imagepath.TvDemoImage}
            style={styles.ShowImage}
            resizeMode='cover'
          />
        </View>

        <View style={styles.ShowDetailsContent}>
          <Text style={styles.showTitle}>No Information</Text>
          <Text style={styles.showTimeSlot}>02:00 - 03:00PM</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: '65%' }]} />
            </View>
            <Text style={styles.durationText}>26 min</Text>
          </View>
        </View>
       </View>

        {/* Render categories dynamically */}
        {/* {movieCategories.slice(0, 5).map((category, index) => {
          const categoryMovies = movieData[category] || []
          const carouselData = convertToCarouselData(categoryMovies)
          
          return (
            <ShowCatCarousel 
              key={`${category}_${index}`}
              title={category} 
              data={carouselData}
              onShowPress={(show) => console.log(`${category} movie selected:`, show.title)}
              onFocus={handleScrollViewFocus}
            />
          )
        })} */}

        {/* Show selected category if available */}
        {/* {selectedCategory && movieData[selectedCategory] && (
          <ShowCatCarousel 
            title={`Featured ${selectedCategory}`}
            data={convertToCarouselData(movieData[selectedCategory])}
            onShowPress={(show) => console.log(`Featured ${selectedCategory} movie selected:`, show.title)}
            onFocus={handleScrollViewFocus}
          />
        )} */}

        <View>
          {/* Date/Time Header */}
          <View style={styles.tvGuideHeader}>
            <Text style={styles.dateTimeText}>Tue, May 13, 2:36 PM</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* TV Guide Channels */}
          <View style={styles.tvGuideContainer}>
            {[...Array(9)].map((_, channelIndex) => (
              <View key={channelIndex} style={styles.channelRow}>
                {/* Channel Info */}
                <View style={styles.channelInfo}>
                  <Text style={styles.channelNumber}>{channelIndex + 1}</Text>
                  <View style={styles.channelLogo}>
                    <View style={styles.channelLogoPlaceholder} />
                  </View>
                  <Text style={styles.channelNameText} numberOfLines={1}>
                    I US I NBA REPLAY...
                  </Text>
                </View>

                {/* Program Schedule */}
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={[...Array(4)]}
                  keyExtractor={(_, index) => `${channelIndex}-program-${index}`}
                  renderItem={({ item, index: programIndex }) => (
                    <TouchableOpacity
                      style={[
                        styles.programSlot,
                        {
                          // backgroundColor: getProgramBackgroundColor(channelIndex, programIndex),
                          borderColor: focusedChannel === channelIndex && focusedProgram === programIndex ? '#FFFFFF' : 'transparent',
                          width: getProgramWidth(channelIndex, programIndex),
                        }
                      ]}
                      onPress={() => handleProgramPress(channelIndex, programIndex)}
                      onFocus={() => handleProgramFocus(channelIndex, programIndex)}
                      activeOpacity={1}
                      {...({ isTVSelectable: true } as any)}
                    >
                      <Text 
                        style={[
                          styles.programText,
                          { color: getProgramTextColor(channelIndex, programIndex) }
                        ]} 
                        numberOfLines={1}
                      >
                        No information
                      </Text>
                    </TouchableOpacity>
                  )}
                  style={styles.programList}
                  contentContainerStyle={styles.programListContent}
                />
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      </View>
    </MainLayout>
  )
}

export default Tv 