// 1. React Native core imports
import React, { useEffect, useState } from 'react'
import { Image, ImageBackground, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import { styles } from './styles'
import imagepath from '../../../constants/imagepath'
import TopNavigation from '../../../components/TopNavigation'
import MovieCarousel from '../../../components/MovieCarousel'
import ContinueWatchingCarousel from '../../../components/ContinueWatchingCarousel'
import ShowDetails from '../../../components/ShowDetails'
import LiveTVChannels from '../../../components/LiveTVChannels'
import { ContinueWatchingData, liveTVChannelsData, PopularMovieData, PopularShowsData, RecentlyAddedData } from './DummyData'
import { ShowDetailsData } from '../Movies/DummyData'
import { getMoviesFromMMKV, getSeriesFromMMKV } from '../../../utils/m3uParseAndGet'
import { useSelector } from 'react-redux'
import { RootState } from '../../../redux/store'
import { getCategoryData } from '../../../redux/actions/auth'
import ShowCatCarousel from '../../../components/ShowCatCarousel'
import { verticalScale } from '../../../styles/scaling'


const Home = () => {
  const {moviesData, channelsData, seriesData} = useSelector((state: RootState) => state.rootReducer.auth)

  const [DynamicPopularMovieData, setDynamicPopularMovieData] = useState<any>(null)
  const [DynamicPopularShowsData, setDynamicPopularShowsData] = useState<any>(null)
  const [DynamicRecentlyAddedMovieData, setDynamicRecentlyAddedMovieData] = useState<any>(null)
  
  const handleTabPress = (tab: string) => {
    // Handle navigation to different tabs
    console.log('Tab pressed:', tab)
  }

  const handlePlayPress = () => {
    console.log('Play button pressed')
  }

  const handleMyListPress = () => {
    console.log('My List button pressed')
  }

  const handleChannelPress = (channel: any) => {
    console.log('Channel pressed:', channel.name)
  }

  const loadMovieData = async () => {
    try{
      const res= await getCategoryData('movies', moviesData[0])
      console.log('response from getCategoryData for movies', res?.data?.data?.data?.movies)
      setDynamicPopularMovieData(res?.data?.data?.data?.movies?.slice(0, 7))
      setDynamicRecentlyAddedMovieData(res?.data?.data?.data?.movies?.slice(7, 14))
    }catch(error){
      console.log('error in loadMovieData', error)
    }
  }

  const loadShowsData = async () => {
    try{
      const res= await getCategoryData('series', seriesData[7])
      console.log('response from getCategoryData for series', res?.data?.data?.data?.series)
      setDynamicPopularShowsData(res?.data?.data?.data?.series?.slice(0, 7))
    }catch(error){
      console.log('error', error)
    }
  }


  useEffect(() => {
    loadMovieData()
    loadShowsData()
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground source={imagepath.guardianOfGalaxyMovie} style={styles.backgroundImagePlaceholder} resizeMode='cover'>
          {/* Horizontal gradient overlay - dark on left, transparent on right */}
          <LinearGradient
            colors={['rgba(11, 24, 48, 0.95)', 'rgba(11, 24, 48, 0.7)', 'rgba(11, 24, 48, 0.3)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.horizontalGradientOverlay}
          />
          <TopNavigation
            activeTab="Home"
            // hasTVPreferredFocus={true}
          />
          <ShowDetails 
            onPlayPress={handlePlayPress}
            onMyListPress={handleMyListPress}
            showDetails={ShowDetailsData}
          />
          <LiveTVChannels 
            data={liveTVChannelsData}
            onChannelPress={handleChannelPress}
          />
        </ImageBackground>
        {/* <MovieCarousel 
          title="Popular movies" 
          data={DynamicPopularMovieData?.length > 0 ? DynamicPopularMovieData : PopularMovieData}
          onMoviePress={(movie) => console.log('Popular movie selected:', movie.title)}
        /> */}
        <View style={{marginBottom: verticalScale(55)}}/>
         <ShowCatCarousel
                  title="Popular movies"
                  data={DynamicPopularMovieData?.length > 0 ? DynamicPopularMovieData : PopularMovieData}
                  onShowPress={(show) => console.log(`Featured Popular movies selected:`, show.title)}
                  onFocus={()=>{}}
                  getMovieDetails={()=>{}}
                  type="movies"
          />
          <View style={{marginBottom: verticalScale(-35)}}/>
          <ShowCatCarousel
                  title="Popular Shows"
                  data={DynamicPopularShowsData?.length > 0 ? DynamicPopularShowsData : PopularShowsData}
                  onShowPress={(show) => console.log(`Featured Popular movies selected:`, show.title)}
                  onFocus={()=>{}}
                  getMovieDetails={()=>{}}
                  type="series"
          />
        {/* <MovieCarousel 
          title="Popular Shows" 
          data={DynamicPopularShowsData?.length > 0 ? DynamicPopularShowsData : PopularShowsData}
          onMoviePress={(movie) => console.log('Popular show selected:', movie.title)}
        /> */}
        <View style={{marginBottom: verticalScale(-35)}}/>
        <ContinueWatchingCarousel 
          data={ContinueWatchingData}
          onItemPress={(item) => console.log('Continue watching selected:', item.title)}
        />
        {/* <MovieCarousel 
          title="Recently Added" 
          data={DynamicRecentlyAddedMovieData?.length > 0 ? DynamicRecentlyAddedMovieData : RecentlyAddedData}
          onMoviePress={(movie) => console.log('Recently added selected:', movie.title)}
        /> */}
        <View style={{marginBottom: verticalScale(35)}}/>
        <ShowCatCarousel
                  title="Recently Added"
                  data={DynamicRecentlyAddedMovieData?.length > 0 ? DynamicRecentlyAddedMovieData : RecentlyAddedData}
                  onShowPress={(show) => console.log(`Featured Popular movies selected:`, show.title)}
                  onFocus={()=>{}}
                  getMovieDetails={()=>{}}
                  type="movies"
          />
      </ScrollView>
    </View>
  )
}

export default Home 