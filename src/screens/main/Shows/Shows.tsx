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

const Shows = () => {
  const route = useRoute<MoviesScreenRouteProp>()
  const { seriesData } = useSelector((state: RootState) => state.rootReducer.auth)
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

      setMovieCategories(seriesData)
      setSelectedCategory(seriesData[0])

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
    const res = await getCategoryData('series', category)
    setSelectedCategoryData(res?.data?.data?.data?.series)
    setLoading(false)

    if (res?.data?.data?.data?.series[0]?.title) {
      setSelectedMovieName(res?.data?.data?.data?.series[0]?.title)
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
            // movieName={selectedMovieName},
            showName={selectedMovieName}
          />

          <View
            style={styles.scrollContainer}
          // showsVerticalScrollIndicator={false}
          >
            <View style={{
              // position: 'absolute',
              // bottom: 0,
              zIndex: 1000
            }}>
              {/* Show selected category if available */}
              {(selectedCategory && seriesData || selectedCategoryData.length > 0) && !loading && (
                <ShowCatCarousel
                  title={`${selectedCategory}`}
                  data={selectedCategoryData}
                  onShowPress={(show) => console.log(`Featured ${selectedCategory} movie selected:`, show.title)}
                  onFocus={handleScrollViewFocus}
                  getMovieDetails={handleMovieSelect}
                  type="series"
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

export default Shows 