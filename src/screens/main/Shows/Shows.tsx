// 1. React Native core imports
import React, { useState } from 'react'
import { ImageBackground, ScrollView, StatusBar, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import { styles } from './styles'
import imagepath from '../../../constants/imagepath'
import ShowCatCarousel from '../../../components/ShowCatCarousel'
import ShowDetails from '../../../components/ShowDetails'
import MainLayout from '../../../components/MainLayout'
import CategoryList from '../../../components/CategoryList'
import { DramaShowData, FantasyShowData, RomanceShowData, ShowDetailsData } from './DummyData'
import { RouteProp, useRoute } from '@react-navigation/native'
import { MainStackParamList } from '../../../navigation/NavigationsTypes'

type ShowsScreenRouteProp = RouteProp<MainStackParamList, 'Shows'>

const Shows = () => {
  const route = useRoute<ShowsScreenRouteProp>()
  const { activeScreen } = route.params
  const [showCategoryAndSidebar, setShowCategoryAndSidebar] = useState(true)

  const handlePlayPress = () => {
    console.log('Play button pressed')
  }

  const handleMyListPress = () => {
    console.log('My List button pressed')
  }

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
    <MainLayout activeScreen={activeScreen || "Shows"} hideSidebar={!showCategoryAndSidebar}>
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
        <ImageBackground source={imagepath.sandManShow} style={styles.backgroundImagePlaceholder} resizeMode='cover'>
          {/* Horizontal gradient overlay - dark on left, transparent on right */}
          <LinearGradient
            colors={['rgba(11, 24, 48, 0.95)', 'rgba(11, 24, 48, 0.7)', 'rgba(11, 24, 48, 0.3)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.horizontalGradientOverlay}
          />
          
          <ShowDetails 
            onPlayPress={handlePlayPress}
            onMyListPress={handleMyListPress}
            showDetails={ShowDetailsData}
            onFocus={handleScrollViewFocus}
          />
        </ImageBackground>

        <ShowCatCarousel 
          title="Drama" 
          data={DramaShowData}
          onShowPress={(show) => console.log('Drama show selected:', show.title)}
          onFocus={handleScrollViewFocus}
        />

        <ShowCatCarousel 
          title="Romance" 
          data={RomanceShowData}
          onShowPress={(show) => console.log('Romance show selected:', show.title)}
          onFocus={handleScrollViewFocus}
        />

        <ShowCatCarousel 
          title="Fantasy" 
          data={FantasyShowData}
          onShowPress={(show) => console.log('Fantasy show selected:', show.title)}
          onFocus={handleScrollViewFocus}
        />
      </ScrollView>

      </View>
    </MainLayout>
  )
}

export default Shows 