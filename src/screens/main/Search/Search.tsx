// 1. React Native core imports
import React, { useState, useEffect, useRef } from 'react'
import { ScrollView, StatusBar, View, TouchableOpacity, Text, Image, ActivityIndicator } from 'react-native'

import { styles } from './styles'
import imagepath from '../../../constants/imagepath'
import MainLayout from '../../../components/MainLayout'
import InputComp from '../../../components/InputComp'
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
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

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

  const loadSearchData = async (query: string) => {
    if (!query.trim()) {
      setSearchedMovies([])
      setSearchedShows([])
      setSearchedChannels([])
      setIsLoading(false)
      // Abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
      return
    }

    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new AbortController for this search
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setIsLoading(true)
    try{
      // Check if request was aborted before making API calls
      if (abortController.signal.aborted) {
        return
      }

      let res = await getSearchData('movies', query, { signal: abortController.signal })
      console.log('res movies-->>>>', res)
      
      // Check again after each API call
      if (abortController.signal.aborted) {
        return
      }
      setSearchedMovies(res?.data?.data?.data || [])

      res = await getSearchData('series', query, { signal: abortController.signal })
      console.log('res sereis-->>>>', res)

      // Check again after each API call
      if (abortController.signal.aborted) {
        return
      }
      setSearchedShows(res?.data?.data?.data || [])

      // res = await getSearchData('channel', query, { signal: abortController.signal })

      
      // console.log('res movies-->>>>', res)

      // Check again before setting channels
      if (abortController.signal.aborted) {
        return
      }
      setSearchedChannels(res?.data?.data?.data || [])
    }catch(error: any){
      // Ignore abort errors
      if (error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') {
        console.log('Search request aborted')
        return
      }
      console.log('error in loadSearchData', error)
    }finally{
      // Only set loading to false if this is still the current request
      if (abortControllerRef.current === abortController) {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    }
  }

  const handleScrollViewFocus = () => {
    setShowCategoryAndSidebar(false)
  }

  const handleSearchSubmit = () => {
    if (searchText.trim()) {
      loadSearchData(searchText)
    }
  }

  // Debounced search effect - searches on each keystroke with 500ms delay
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // If search text is empty, clear results immediately
    if (!searchText.trim()) {
      setSearchedMovies([])
      setSearchedShows([])
      setSearchedChannels([])
      setIsLoading(false)
      return
    }
    
    loadSearchData(searchText)
    // // Set new timeout for debounced search
    // debounceTimeoutRef.current = setTimeout(() => {
    // }, 500) // 500ms debounce delay

    // // Cleanup function to clear timeout on unmount or when searchText changes
    // return () => {
    //   if (debounceTimeoutRef.current) {
    //     clearTimeout(debounceTimeoutRef.current)
    //   }
    // }
  }, [searchText])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [])

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

        {/* Show loader when searching */}
        {isLoading && searchText.trim() !== '' && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={CommonColors.white} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        )}

        {/* Show API search results if available */}
        {!isLoading && searchedMovies.length > 0 && (
          <ShowCatCarousel 
            title="Movies" 
            data={searchedMovies}
            // horizontal={true}
            onShowPress={(show) => console.log('Movie selected:', show.title)}
            type='movies'
          />
        )}

        {!isLoading && searchedShows.length > 0 && (
          <ShowCatCarousel 
            title="Shows" 
            data={searchedShows}
            onShowPress={(show) => console.log('Show selected:', show.title)}
            type='series'
          />
        )}

        {!isLoading && searchedChannels.length > 0 && (
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