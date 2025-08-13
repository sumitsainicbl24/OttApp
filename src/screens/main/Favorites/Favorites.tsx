// 1. React Native core imports
import React, { useState, useEffect } from 'react'
import { ScrollView, StatusBar, TouchableOpacity, View, Text } from 'react-native'

import { styles } from './styles'
import ShowCatCarousel from '../../../components/ShowCatCarousel'
import MainLayout from '../../../components/MainLayout'
import CategoryList from '../../../components/CategoryList'
import { RouteProp, useRoute } from '@react-navigation/native'
import { MainStackParamList } from '../../../navigation/NavigationsTypes'
import { getMyListApi } from '../../../redux/actions/main'
import { height, width } from '../../../styles/scaling'

type FavoritesScreenRouteProp = RouteProp<MainStackParamList, 'Favorites'>

const Favorites = () => {
  const route = useRoute<FavoritesScreenRouteProp>()
  const { activeScreen } = route.params
  const [showCategoryAndSidebar, setShowCategoryAndSidebar] = useState(true)
  const [myListData, setMyListData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const handleCategoryPress = (category: string) => {
    console.log('Category selected:', category)
  }

  // Fetch my list data from API
  useEffect(() => {
    const fetchMyListData = async () => {
      try {
        setLoading(true)
        const response = await getMyListApi()
        console.log('My list API response:', response)
        
        // Extract videos from the response based on the structure seen in MoviePlayScreen
        const videos = response?.data?.data?.data?.videos || []
        setMyListData(videos)
      } catch (error) {
        console.error('Error fetching my list:', error)
        setMyListData([])
      } finally {
        setLoading(false)
      }
    }

    fetchMyListData()
  }, [])

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

      <View
      style={{flexDirection: 'row'}}
      >

      

      <TouchableOpacity
      onFocus={handleCategoryListFocus}
      >
        <View style={{height: height, width: 1,}}>
          
        </View>
      </TouchableOpacity>

      <View style={styles.container}>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <ShowCatCarousel
          mainStyle={{height: height}}
          title="My List"
          data={myListData}
          onShowPress={(show) => console.log('Show selected:', show.title)}
          onFocus={handleScrollViewFocus}
        />
      </ScrollView>
      
      </View>
      </View>
    </MainLayout>
  )
}

export default Favorites 