// 1. React Native core imports
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ActivityIndicator, Image, ImageBackground, ScrollView, StatusBar, Text, View } from 'react-native'
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
import ShowDetails1 from '../../../components/ShowDetails1'
import { getCategoryData, getShowDetailsApi } from '../../../redux/actions/auth'
import { cleanMovieName, debounce, imageResolutionHandlerForUrl } from '../../../utils/CommonFunctions'
import { RootState } from '../../../redux/store'
import { useSelector } from 'react-redux'
import { CommonColors } from '../../../styles/Colors'
import { height, moderateScale } from '../../../styles/scaling'

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

const Movies = () => {
  const route = useRoute<MoviesScreenRouteProp>()
  const {moviesData} = useSelector((state: RootState) => state.rootReducer.auth)
  const { activeScreen } = route.params
  const [isLiveVideo, setIsLiveVideo] = useState(false)
  const [showCategoryAndSidebar, setShowCategoryAndSidebar] = useState(true)
  // const [movieData, setMovieData] = useState<MovieData>({})
  const [movieCategories, setMovieCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedCategoryData, setSelectedCategoryData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState<any>({})

  console.log('moviesDatamoviesData', moviesData)

  // Load movie data from MMKV on component mount
  useEffect(() => {
    loadMovieData()
  }, [])

  const loadMovieData = async () => {
    try {
      setLoading(true)
      // console.log('Loading movie data from MMKV...')
      
      // const movies = await getMoviesFromMMKV()
      // console.log('Loaded movies:', Object.keys(movies).length, 'categories',movies)
      
      // if (Object.keys(movies).length > 0) {
      //   // Filter only movie entries and convert to correct type
      //   const movieOnlyData: MovieData = {}
      //   Object.keys(movies).forEach(category => {
      //     const movieEntries = movies[category].filter(entry => entry.type === 'movie') as MovieEntry[]
      //     if (movieEntries.length > 0) {
      //       movieOnlyData[category] = movieEntries
      //     }
      //   })
        
      //   setMovieData(movieOnlyData)
      //   const categories = Object.keys(movieOnlyData).sort()
        setMovieCategories(moviesData)
        setSelectedCategory(moviesData[0])
        
        // Set first category as selected by default
        // if (categories.length > 0 && !selectedCategory) {
        //   setSelectedCategory(categories[0])
        // }
      // } else {
      //   console.log('No movie data found in MMKV, using dummy data')
      //   // Fallback to dummy data structure
      //   const dummyData: MovieData = {
      //     'Action': ActionMovieData.map(movie => ({
      //       type: 'movie' as const,
      //       groupTitle: 'Action',
      //       name: movie.title,
      //       logo: movie.image || imagepath.guardianOfGalaxyMovie,
      //       url: ''
      //     })),
      //     'Comedy': ComedyMovieData.map(movie => ({
      //       type: 'movie' as const,
      //       groupTitle: 'Comedy', 
      //       name: movie.title,
      //       logo: movie.image || imagepath.guardianOfGalaxyMovie,
      //       url: ''
      //     })),
      //     'Drama': DramaMovieData.map(movie => ({
      //       type: 'movie' as const,
      //       groupTitle: 'Drama',
      //       name: movie.title,
      //       logo: movie.image || imagepath.guardianOfGalaxyMovie,
      //       url: ''
      //     }))
      //   }
      //   setMovieData(dummyData)
      //   setMovieCategories(['Action', 'Comedy', 'Drama'])
      //   setSelectedCategory('Action')
      // }
    } catch (error) {
      // console.error('Error loading movie data:', error)
      // // Use dummy data as fallback
      // const dummyData: MovieData = {
      //   'Action': ActionMovieData.map(movie => ({
      //     type: 'movie' as const,
      //     groupTitle: 'Action',
      //     name: movie.title,
      //     logo: movie.image || imagepath.guardianOfGalaxyMovie,
      //     url: ''
      //   })),
      //   'Comedy': ComedyMovieData.map(movie => ({
      //     type: 'movie' as const,
      //     groupTitle: 'Comedy',
      //     name: movie.title,
      //     logo: movie.image || imagepath.guardianOfGalaxyMovie,
      //     url: ''
      //   })),
      //   'Drama': DramaMovieData.map(movie => ({
      //     type: 'movie' as const,
      //     groupTitle: 'Drama',
      //     name: movie.title,
      //     logo: movie.image || imagepath.guardianOfGalaxyMovie,
      //     url: ''
      //   }))
      // }
      // setMovieData(dummyData)
      // setMovieCategories(['Action', 'Comedy', 'Drama'])
      // setSelectedCategory('Action')
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
    setSelectedCategory((prev) => {
      if(prev === category) return prev
      return category
    })
  }

  // Handle focus events for ScrollView content
  const handleScrollViewFocus = () => {
    setShowCategoryAndSidebar(false)
    // setShowDetails(null)
  }

  // Handle navigation back to category list (when pressing left)
  const handleCategoryListFocus = () => {
    setLoading(true)
    setShowCategoryAndSidebar(true)
  }

  const getMovieData = async (category: string) => {
    const res = await getCategoryData('movies', category)
    console.log('res in getMovieData from movies', res?.data?.data?.movies)
    setSelectedCategoryData(res?.data?.data?.movies)
    setLoading(false)

    getMovieDetails(res?.data?.data?.movies[0]?.title)
   
  }

  const getMovieDetails = async (movie: any) => {
   
     //clean the title
     const cleanTitle = cleanMovieName(movie)
     console.log('cleanTitle in getMovieData from movies', cleanTitle)
     const res1 = await getShowDetailsApi(cleanTitle)
     const result = res1?.data
     console.log('res1 in getMovieData from movies', res1)
     setShowDetails({
       title: result?.Title || 'Not Available',
       rating: result?.imdbRating || 'N/A', 
       Year: result?.Year || 'Not Available',
       Runtime: result?.Runtime || 'Not Available',
       Genre: result?.Genre || 'Not Available',
       Actors: result?.Actors || 'Not Available',
       Director: result?.Director || 'Director Information Not Available',
       Plot: result?.Plot || 'summary is not available',
       Poster: result?.Poster || null,
     })
  }

  // Create debounced version of getMovieData
  const debouncedGetMovieData = useCallback(
    debounce((category: string) => {
      console.log('debouncedGetMovieData', category)
      getMovieData(category)
    }, 500), // 300ms delay
    []
  )

  // Call debounced getMovieData whenever selectedCategory changes
  useEffect(() => {
    if (selectedCategory) {
      debouncedGetMovieData(selectedCategory)
    }
  }, [selectedCategory, debouncedGetMovieData])

  // Convert movie data to format expected by ShowCatCarousel
  const convertToCarouselData = (movies: MovieEntry[]) => {
    return movies.map((movie, index) => ({
      id: index + 1, // ShowData expects number id
      title: movie.name,
      image: movie.logo || imagepath.VideoPlaceHolder, // ShowData expects 'image' not 'poster'
      category: movie.groupTitle
    }))
  }


  // useEffect(() => {
  //   if(selectedCategory && movieData[selectedCategory] && movieData[selectedCategory].length > 0){
  //     // Get the clean name from the first movie in the selected category
  //     const firstMovieName = cleanMovieName(movieData[selectedCategory][0].name)
  //     getShowDetailsData(firstMovieName, 1, 1)
  //   }
  // }, [selectedCategory])

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
        <View 
        // source={showDetails?.Poster ? {uri: imageResolutionHandlerForUrl(showDetails?.Poster)} : undefined} 
        style={styles.backgroundImagePlaceholder} 
        // imageStyle={styles.backgroundImageStyle}
        >
          <Image source={showDetails?.Poster ? {uri: imageResolutionHandlerForUrl(showDetails?.Poster)} : undefined} style={styles.backgroundImageStyle} />
          {/* Horizontal gradient overlay - dark on left, transparent on right */}
          <LinearGradient
            colors={[CommonColors.themeMain, 'rgba(19, 22, 25, 0.95)', 'rgba(19, 22, 25, 0.5)', 'rgba(19, 22, 25, 0.5)',CommonColors.themeMain]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.horizontalGradientOverlay}
          />

          <LinearGradient
            colors={[CommonColors.themeMain, 'transparent', 'transparent', 'transparent']}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={styles.horizontalGradientOverlay}
          />
          
          <ShowDetails1
            showDetails={showDetails}
          />

        </View>

        <View style={{
          // marginTop: height/1.85,
          marginTop: -moderateScale(250),
         zIndex: 1000}}>

       
        {/* Show selected category if available */}
        {(selectedCategory && moviesData || selectedCategoryData.length > 0) && !loading && (
          <ShowCatCarousel 
            title={`${selectedCategory}`}
            // data={convertToCarouselData(movieData[selectedCategory])}
            data={selectedCategoryData}
            onShowPress={(show) => console.log(`Featured ${selectedCategory} movie selected:`, show.title)}
            onFocus={handleScrollViewFocus}
            getMovieDetails={getMovieDetails}
          />
        )}

        {loading && (
           //loading indicator
           <ActivityIndicator size="large" color={CommonColors.white} />
        )}
         </View>

      </ScrollView>

      </View>
    </MainLayout>
  )
}

export default Movies 