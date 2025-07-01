// 1. React Native core imports
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ActivityIndicator, Image, ImageBackground, ScrollView, StatusBar, Text, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import { styles } from './styles'
import MainLayout from '../../../components/MainLayout'
import CategoryList from '../../../components/CategoryList'
import { RouteProp, useRoute } from '@react-navigation/native'
import { MainStackParamList } from '../../../navigation/NavigationsTypes'
import ShowCatCarousel from '../../../components/ShowCatCarousel'
import ShowDetails1 from '../../../components/ShowDetails1'
import { getCategoryData, getMovieCastAndCrewWithTMDB_ID, getMovieDetailsWithTMDB_ID, getShowDetailsApi, getShowDetailsApiTMDB } from '../../../redux/actions/auth'
import { cleanMovieName, debounce, imageResolutionHandlerForUrl } from '../../../utils/CommonFunctions'
import { RootState } from '../../../redux/store'
import { useSelector } from 'react-redux'
import { CommonColors } from '../../../styles/Colors'
import { moderateScale } from '../../../styles/scaling'
import { TMDB_BaseUrlImage } from '../../../config/urls'

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
  const { moviesData } = useSelector((state: RootState) => state.rootReducer.auth)
  const { activeScreen } = route.params
  const [showCategoryAndSidebar, setShowCategoryAndSidebar] = useState(true)
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

      setMovieCategories(moviesData)
      setSelectedCategory(moviesData[0])

    } catch (error) {

    } finally {
      setLoading(false)
    }
  }



  // Handle focus events for ScrollView content
  const handleScrollViewFocus = () => {
    setShowCategoryAndSidebar(false)
    // setShowDetails(null)
  }

  // Handle navigation back to category list (when pressing left)
  const handleCategoryListFocus = async (category: string) => {
    setLoading(true)
    setShowCategoryAndSidebar(true)
    setSelectedCategory(category)

  }

  const getMovieData = async (category: string) => {
    const res = await getCategoryData('movies', category)
    setSelectedCategoryData(res?.data?.data?.movies)
    setLoading(false)

    getMovieDetails(res?.data?.data?.movies[0]?.title)

  }

  const getMovieDetails = async (movie: any) => {

    //clean the title
     const cleanTitle = cleanMovieName(movie)
    //  getMovieDetailsOMDB(cleanTitle)
    getMovieDetailsTMDB(cleanTitle)
  }

  const getMovieDetailsOMDB = async (movie: any) => {
    const res1 = await getShowDetailsApi(movie)
    const result = res1?.data
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

  const getMovieDetailsTMDB = async (movie: any) => {

    //searching movie with title
    const res1 = await getShowDetailsApiTMDB(movie)

    if (!res1?.data?.results[0]?.id) {
      getMovieDetailsOMDB(movie)
    }

    else {
      //getting movie details with TMDB id
      const res2 = await getMovieDetailsWithTMDB_ID(res1?.data?.results[0]?.id)

      const result = res2?.data;
      const genres = result?.genres?.map((genre: any) => genre?.name).join(', ')

      //getting cast and crew from api call
      const res3 = await getMovieCastAndCrewWithTMDB_ID(res1?.data?.results[0]?.id)
      //take first 5 cast and crew
      const cast = res3?.data?.cast?.slice(0, 5)?.map((cast: any) => cast?.name).join(', ')
      //get director from crew in which job include Director
      const Director = res3?.data?.crew?.find((crew: any) => crew?.job?.toLowerCase()?.includes('director'))?.name

      setShowDetails({
        title: result?.title || 'Not Available',
        rating: result?.vote_average || 'N/A',
        Year: result?.release_date || 'Not Available',
        Runtime: result?.runtime ? result?.runtime + ' mins' : 'Not Available',
        Genre: genres || 'Not Available',
        Actors: cast || 'Not Available',
        Director: Director || 'Director Information Not Available',
        Plot: result?.overview || 'summary is not available',
        Poster: result?.poster_path ? TMDB_BaseUrlImage + result?.poster_path : null,
      })
    }
  }

  // Create debounced version of getMovieData
  const debouncedGetMovieData = useCallback(
    debounce((category: string) => {
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


  return (
    <MainLayout activeScreen={activeScreen || "Movies"} hideSidebar={!showCategoryAndSidebar}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />

      <View style={styles.container}>

        {/* category list */}
        {(
          <View style={[styles.categoryListContainer, !showCategoryAndSidebar && { width: 0 }]} nativeID="categoryList">
            <CategoryList
              categories={movieCategories}
              selectedCategory={selectedCategory}
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
            <Image source={showDetails?.Poster ? { uri: imageResolutionHandlerForUrl(showDetails?.Poster) } : undefined} style={styles.backgroundImageStyle} />
            {/* Horizontal gradient overlay - dark on left, transparent on right */}
            <LinearGradient
              colors={[CommonColors.themeMain, 'rgba(19, 22, 25, 0.95)', 'rgba(19, 22, 25, 0.5)', 'rgba(19, 22, 25, 0.5)', CommonColors.themeMain]}
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
            zIndex: 1000
          }}>


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