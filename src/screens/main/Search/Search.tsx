// 1. React Native core imports
import React, { useState, useRef, useMemo } from 'react'
import { ImageBackground, ScrollView, StatusBar, View, TextInput, TouchableOpacity, Text, Image } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import { styles } from './styles'
import imagepath from '../../../constants/imagepath'
import MovieCatCarousel from '../../../components/MovieCatCarousel'
import ShowDetails from '../../../components/ShowDetails'
import MainLayout from '../../../components/MainLayout'
import InputComp from '../../../components/InputComp'
import { ActionMovieData, ComedyMovieData, DramaMovieData, ShowDetailsData } from './DummyData'
import { CommonColors } from '../../../styles/Colors'
import ShowCatCarousel from '../../../components/ShowCatCarousel'
import { RouteProp, useRoute } from '@react-navigation/native'
import { MainStackParamList } from '../../../navigation/NavigationsTypes'

type SearchScreenRouteProp = RouteProp<MainStackParamList, 'Search'>

const Search = () => {
  const route = useRoute<SearchScreenRouteProp>()
  const { activeScreen } = route.params
  
  const [searchText, setSearchText] = useState('')
  const [microphoneFocused, setMicrophoneFocused] = useState(false)

  // Filter data based on search text
  const filteredComedyData = useMemo(() => {
    if (!searchText.trim()) return ComedyMovieData;
    return ComedyMovieData.filter(item => 
      item.title.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText]);

  const filteredDramaData = useMemo(() => {
    if (!searchText.trim()) return DramaMovieData;
    return DramaMovieData.filter(item => 
      item.title.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText]);

  const filteredActionData = useMemo(() => {
    if (!searchText.trim()) return ActionMovieData;
    return ActionMovieData.filter(item => 
      item.title.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText]);

  const handlePlayPress = () => {
    console.log('Play button pressed')
  }

  const handleMyListPress = () => {
    console.log('My List button pressed')
  }

  const handleMicrophonePress = () => {
    console.log('Microphone button pressed')
    // Handle voice search functionality here
  }

  const handleSearchChange = (text: string) => {
    setSearchText(text)
  }

  const handleMicrophoneFocus = () => {
    setMicrophoneFocused(true)
  }

  const handleMicrophoneBlur = () => {
    setMicrophoneFocused(false)
  }

  return (
    <MainLayout activeScreen={activeScreen || "Search"}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          {/* Microphone Button */}
          <TouchableOpacity 
            style={[styles.microphoneButton, microphoneFocused && styles.microphoneButtonFocused]}
            onPress={handleMicrophonePress}
            onFocus={handleMicrophoneFocus}
            onBlur={handleMicrophoneBlur}
            activeOpacity={1}
          >
            {/* Placeholder for microphone icon */}
            <Image source={imagepath.microphone} style={[styles.microphoneIconPlaceholder, microphoneFocused && {tintColor: CommonColors.white}]} />
          </TouchableOpacity>

          {/* Search Input */}
          <InputComp
            placeholder="Search"
            placeholderTextColor={CommonColors.textSecondary}
            value={searchText}
            onChangeText={handleSearchChange}
            inputWrapperStyle={styles.searchInputContainer}
            inputStyle={styles.searchInput}
          />
        </View>

        {/* Show search results count if searching */}
        {searchText.trim() !== '' && (
          <Text style={styles.searchResultsCount}>
            {filteredComedyData.length + filteredDramaData.length} results found
          </Text>
        )}

        {/* Only render carousel if it has data */}
        {filteredComedyData.length > 0 && (
          <ShowCatCarousel 
            title="Movies" 
            data={filteredComedyData}
            onShowPress={(show) => console.log('Comedy show selected:', show.title)}
          />
        )}

        {filteredDramaData.length > 0 && (
          <ShowCatCarousel 
            title="Shows" 
            data={filteredDramaData}
            onShowPress={(show) => console.log('Drama show selected:', show.title)}
          />
        )}
      </ScrollView>
    </MainLayout>
  )
}

export default Search 