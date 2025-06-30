// 1. React Native core imports
import React, { useState } from 'react'
import { ScrollView, StatusBar, View } from 'react-native'

import { styles } from './styles'
import FavListCarousel from '../../../components/FavListCarousel'
import MainLayout from '../../../components/MainLayout'
import CategoryList from '../../../components/CategoryList'
import { FavListData } from './DummyData'
import { RouteProp, useRoute } from '@react-navigation/native'
import { MainStackParamList } from '../../../navigation/NavigationsTypes'

type FavoritesScreenRouteProp = RouteProp<MainStackParamList, 'Favorites'>

const Favorites = () => {
  const route = useRoute<FavoritesScreenRouteProp>()
  const { activeScreen } = route.params
  const [showCategoryAndSidebar, setShowCategoryAndSidebar] = useState(true)

  const handleCategoryPress = (category: string) => {
    console.log('Category selected:', category)
  }

  // Handle focus events for ScrollView content
  const handleScrollViewFocus = () => {
    setShowCategoryAndSidebar(false)
  }

  // Handle navigation back to category list (when pressing left)
  const handleCategoryListFocus = () => {
    setShowCategoryAndSidebar(true)
  }

  return (
    <MainLayout activeScreen={activeScreen || "Favorites"} hideSidebar={!showCategoryAndSidebar}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />

      <View style={styles.container}>
      
      {/* category list */}
      {(
        <View style={[styles.categoryListContainer, !showCategoryAndSidebar && {width: 0}] } nativeID="categoryList">
          <CategoryList 
            onCategoryPress={handleCategoryPress}
            onFocus={handleCategoryListFocus}
          />
        </View>
      )}

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <FavListCarousel 
          title="My List" 
          data={FavListData}
          onShowPress={(show) => console.log('Fantasy show selected:', show.title)}
          onFocus={handleScrollViewFocus}
        />
      </ScrollView>
      
      </View>
    </MainLayout>
  )
}

export default Favorites 