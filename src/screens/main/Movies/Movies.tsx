// 1. React Native core imports
import React, { useState, useEffect, useCallback } from 'react'
import { ActivityIndicator, ScrollView, StatusBar, Text, View } from 'react-native'

import { styles } from './styles'
import MainLayout from '../../../components/MainLayout'
import CategoryList from '../../../components/CategoryList'
import { RouteProp, useRoute } from '@react-navigation/native'
import { MainStackParamList } from '../../../navigation/NavigationsTypes'
import ShowCatCarousel from '../../../components/ShowCatCarousel'
import ShowDetails1 from '../../../components/ShowDetails1'
import { getCategoryData } from '../../../redux/actions/auth'
import { debounce } from '../../../utils/CommonFunctions'
import { RootState } from '../../../redux/store'
import { useSelector } from 'react-redux'
import { CommonColors } from '../../../styles/Colors'
import { moderateScale } from '../../../styles/scaling'
import { saveMoviesDataToMMKV, getMoviesDataFromMMKV } from '../../../localStorage/mmkv'

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
  const [selectedMovieName, setSelectedMovieName] = useState<string>('')

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
  }

  // Handle navigation back to category list (when pressing left)
  const handleCategoryListFocus = async (category: string) => {
    setLoading(true)
    setShowCategoryAndSidebar(true)
    setSelectedCategory(category)
  }

  const getMovieData = async (category: string) => {
    try {
      // Create a cache key specific to this category
      const cacheKey = `movies_${category}`
      
      // First, try to get cached data
      const cachedData = await getMoviesDataFromMMKV()
      const cachedCategoryData = cachedData?.[cacheKey]
      
      if (cachedCategoryData && cachedCategoryData.length > 0) {
        // Use cached data
        setSelectedCategoryData(cachedCategoryData)
        setLoading(false)
        
        if (cachedCategoryData[0]?.title) {
          setSelectedMovieName(cachedCategoryData[0]?.title)
        }
        return
      }
      
      // If no cached data, fetch from API
      const res = await getCategoryData('movies', category)
      const movieData = res?.data?.data?.data?.movies
      
      if (movieData && movieData.length > 0) {
        // Update state
        setSelectedCategoryData(movieData)
        
        // Save to cache
        const existingCache = await getMoviesDataFromMMKV() || {}
        const updatedCache = {
          ...existingCache,
          [cacheKey]: movieData
        }
        await saveMoviesDataToMMKV(updatedCache)
        
        if (movieData[0]?.title) {
          setSelectedMovieName(movieData[0]?.title)
        }
      }
    } catch (error) {
      console.error('Error fetching movie data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMovieSelect = (movieTitle: string) => {
    setSelectedMovieName(movieTitle)
  }

  // Create debounced version of getMovieData
  const debouncedGetMovieData = useCallback(
    debounce((category: string) => {
      getMovieData(category)
    }, 500), // 500ms delay
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
          <View style={[styles.categoryListContainer, !showCategoryAndSidebar && { width: 0, overflow: 'hidden' }]} nativeID="categoryList">
            <CategoryList
              categories={movieCategories}
              selectedCategory={selectedCategory}
              onFocus={handleCategoryListFocus}
            />
          </View>
        )}

        <View>
          <ShowDetails1
            movieName={selectedMovieName}
          />

          <View
            style={styles.scrollContainer}
          // showsVerticalScrollIndicator={false}
          >
            <View style={{
              // marginTop: -moderateScale(250),
              zIndex: 1000
            }}>
              {/* Show selected category if available */}
              {(selectedCategory && moviesData || selectedCategoryData.length > 0) && !loading && (
                <ShowCatCarousel
                  title={`${selectedCategory}`}
                  data={selectedCategoryData}
                  onShowPress={(show) => console.log(`Featured ${selectedCategory} movie selected:`, show.title)}
                  onFocus={handleScrollViewFocus}
                  getMovieDetails={handleMovieSelect}
                  type="movies"
                />
              )}

              {loading && (
                <ActivityIndicator size="large" color={CommonColors.white} />
              )}
            </View>
          </View>
        </View>
      </View>
    </MainLayout>
  )
}

export default Movies 