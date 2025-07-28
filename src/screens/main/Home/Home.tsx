// 1. React Native core imports
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ImageBackground, ScrollView, StatusBar, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import ContinueWatchingCarousel from '../../../components/ContinueWatchingCarousel'
import LiveTVChannels from '../../../components/LiveTVChannels'
import ShowCatCarousel from '../../../components/ShowCatCarousel'
import ShowDetails from '../../../components/ShowDetails'
import TopNavigation from '../../../components/TopNavigation'
import { MainStackParamList } from '../../../navigation/NavigationsTypes'
import { getCategoryData } from '../../../redux/actions/auth'
import { RootState } from '../../../redux/store'
import { verticalScale } from '../../../styles/scaling'
import { getMovieDetails, imageResolutionHandlerForUrl } from '../../../utils/CommonFunctions'
import { ContinueWatchingData, liveTVChannelsData } from './DummyData'
import { styles } from './styles'
import { CommonColors } from '../../../styles/Colors'
import { setCurrentlyPlaying } from '../../../redux/reducers/main'
import { useAppDispatch } from '../../../redux/hooks'


const Home = () => {
  const {moviesData, channelsData, seriesData} = useSelector((state: RootState) => state.rootReducer.auth)
  const dispatch = useAppDispatch()

  const [DynamicPopularMovieData, setDynamicPopularMovieData] = useState<any>(null)
  const [DynamicPopularShowsData, setDynamicPopularShowsData] = useState<any>(null)
  const [DynamicRecentlyAddedMovieData, setDynamicRecentlyAddedMovieData] = useState<any>(null)
  const [LiveChannelData, setLiveChannelData] = useState<any>(null)
  const [PosterMovieName, setPosterMovieName] = useState<any>(null)
  const [PosterMovieData, setPosterMovieData] = useState<any>(null)
  const [hasScrolled, setHasScrolled] = useState<boolean>(false)
  const navigation = useNavigation<NavigationProp<MainStackParamList>>()
  
  const handleTabPress = (tab: string) => {
    // Handle navigation to different tabs
    console.log('Tab pressed:', tab)
  }

  const handlePlayPress = () => {
    dispatch(setCurrentlyPlaying(PosterMovieName))
    navigation.navigate('MoviePlayScreen', { movie: PosterMovieName })
  }

  const handleMyListPress = () => {
    console.log('My List button pressed')
  }

  const handleChannelPress = (channel: any) => {
    console.log('Channel pressed:', channel.name)
  }

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y
    setHasScrolled(scrollY > 50) // Change background after scrolling 50 pixels
  }

  const loadMovieData = async () => {
    try{
      const res= await getCategoryData('movies', moviesData[0])
      console.log('response from getCategoryData for movies', res?.data?.data?.data?.movies)
      setDynamicPopularMovieData(res?.data?.data?.data?.movies?.slice(0, 7))
      setDynamicRecentlyAddedMovieData(res?.data?.data?.data?.movies?.slice(7, 14))
      //select ramndom data from dynamicPopularMovieData  
      setPosterMovieName(res?.data?.data?.data?.movies[Math.floor(Math.random() * 5)])
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

  const loadLiveChannelData = async () => {
    setLiveChannelData(channelsData?.slice(0, 8))
  }


  useEffect(() => {
    loadMovieData()
    loadShowsData()
    loadLiveChannelData()
  }, [])

  useEffect(() => {
    if (PosterMovieName) {
      getMovieDetails(PosterMovieName?.title).then((res) => {
        console.log('details for poseter movie', res)
        setPosterMovieData(res)
      })
    }
  }, [PosterMovieName])

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />

      <View style={{position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000}}>
        <TopNavigation
            activeTab="Home"
            hasScrolled={hasScrolled}
            // hasTVPreferredFocus={true}
          />
          </View>
          
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        
        <ImageBackground source={PosterMovieData?.Poster ? {uri: imageResolutionHandlerForUrl(PosterMovieData?.Poster, 1000) } : undefined } style={styles.backgroundImagePlaceholder}>
          {/* Horizontal gradient overlay - dark on left, transparent on right */}
          <LinearGradient
            colors={['rgba(11, 24, 48, 0.95)', 'rgba(11, 24, 48, 0.7)', 'rgba(11, 24, 48, 0.3)', 'transparent']}
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
          
          <ShowDetails 
            onPlayPress={handlePlayPress}
            onMyListPress={handleMyListPress}
            showDetails={PosterMovieData}
          />
        </ImageBackground>
        {/* <MovieCarousel 
          title="Popular movies" 
          data={DynamicPopularMovieData?.length > 0 ? DynamicPopularMovieData : PopularMovieData}
          onMoviePress={(movie) => console.log('Popular movie selected:', movie.title)}
        /> */}
        <View style={{marginBottom: verticalScale(-105)}}/>
        <View style={{marginBottom: verticalScale(75)}}/>

        <LiveTVChannels 
            data={liveTVChannelsData}
            onChannelPress={handleChannelPress}
          />
          <View style={{marginBottom: verticalScale(35)}}/>
          {
            DynamicPopularMovieData?.length > 0 ? (
              <ShowCatCarousel
                  title="Popular movies"
                  data={DynamicPopularMovieData?.length > 0 ? DynamicPopularMovieData : []}
                  onShowPress={(show) => console.log(`Featured Popular movies selected:`, show.title)}
                  onFocus={()=>{}}
                  getMovieDetails={()=>{}}
                  type="movies"
          />):
          (<View style={{marginBottom: verticalScale(55), alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator size="large" color="#fff" />
          </View>)
          }
         
          <View style={{marginBottom: verticalScale(-35)}}/>

          {
            DynamicPopularShowsData?.length > 0 ? (
              <ShowCatCarousel
                  title="Popular Shows"
                  data={DynamicPopularShowsData?.length > 0 ? DynamicPopularShowsData : []}
                  onShowPress={(show) => console.log(`Featured Popular movies selected:`, show.title)}
                  onFocus={()=>{}}
                  getMovieDetails={()=>{}}
                  type="series"
          />
            ):
            (<View style={{marginBottom: verticalScale(55), alignItems: 'center', justifyContent: 'center'}}>
              <ActivityIndicator size="large" color="#fff" />
            </View>)
          }
          
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

        {
          DynamicRecentlyAddedMovieData?.length > 0 ? (
            <ShowCatCarousel
                  title="Recently Added"
                  data={DynamicRecentlyAddedMovieData?.length > 0 ? DynamicRecentlyAddedMovieData : []}
                  onShowPress={(show) => console.log(`Featured Popular movies selected:`, show.title)}
                  onFocus={()=>{}}
                  getMovieDetails={()=>{}}
                  type="movies"
          />
          ):
          (<View style={{marginBottom: verticalScale(55), alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator size="large" color="#fff" />
          </View>)
        }
        
      </ScrollView>
    </View>
  )
}

export default Home 