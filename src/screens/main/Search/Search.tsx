// 1. React Native core imports
import React, { useState, useRef, useMemo, useEffect } from 'react'
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
import { getSearchData } from '../../../redux/actions/main'

type SearchScreenRouteProp = RouteProp<MainStackParamList, 'Search'>

const Search = () => {
  const route = useRoute<SearchScreenRouteProp>()
  const { activeScreen } = route.params
  
  const [searchText, setSearchText] = useState('')
  const [searchedMovies, setSearchedMovies] = useState<any[]>([])
  const [searchedShows, setSearchedShows] = useState<any[]>([])
  const [searchedChannels, setSearchedChannels] = useState<any[]>([])
  const [microphoneFocused, setMicrophoneFocused] = useState(false)
  const [showCategoryAndSidebar, setShowCategoryAndSidebar] = useState(true)
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

  const loadSearchData = async () => {
    try{
      let res = await getSearchData('movies', searchText)
      setSearchedMovies(res?.data?.data?.data || [])

      res = await getSearchData('series', searchText)
      setSearchedShows(res?.data?.data?.data || [])

      res = await getSearchData('channel', searchText)
      setSearchedChannels(res?.data?.data?.data || [])
    }catch(error){
      console.log('error in loadSearchData', error)
    }
  }

  const handleScrollViewFocus = () => {
    setShowCategoryAndSidebar(false)
  }

  const handleSearchSubmit = () => {
    if (searchText.trim()) {
      loadSearchData()
    }
  }

  // // Clear search results when search text is cleared
  // useEffect(() => {
  //   if (!searchText.trim()) {
  //     setSearchedMovies([])
  //     setSearchedShows([])
  //     setSearchedChannels([])
  //   }
  // }, [searchText])

  return (
    <MainLayout activeScreen={activeScreen || "Search"} hideSidebar={!showCategoryAndSidebar}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onFocus={handleScrollViewFocus}
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
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            inputWrapperStyle={styles.searchInputContainer}
            inputStyle={styles.searchInput}
          />
        </View>

        {/* Show search results count if searching */}
        {searchText.trim() !== '' && (
          <Text style={styles.searchResultsCount}>
              {searchedMovies.length + searchedShows.length + searchedChannels.length} results found
          </Text>
        )}

        {/* Show API search results if available */}
        {searchedMovies.length > 0 && (
          <ShowCatCarousel 
            title="Movies" 
            data={searchedMovies}
            // horizontal={true}
            onShowPress={(show) => console.log('Movie selected:', show.title)}
            type='movies'
          />
        )}

        {searchedShows.length > 0 && (
          <ShowCatCarousel 
            title="Shows" 
            data={searchedShows}
            onShowPress={(show) => console.log('Show selected:', show.title)}
            type='series'
          />
        )}

        {searchedChannels.length > 0 && (
          <ShowCatCarousel 
            title="Channels" 
            data={searchedChannels}
            onShowPress={(show) => console.log('Channel selected:', show.title)}
            type='channels'
          />
        )}

      </ScrollView>
    </MainLayout>
  )
}

export default Search 