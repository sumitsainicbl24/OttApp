import { getMovieCastAndCrewWithTMDB_ID, getMovieDetailsWithTMDB_ID, getShowDetailsApi, getShowDetailsApiTMDB } from '../redux/actions/auth'
import { TMDB_BaseUrlImage } from '../config/urls'

export const cleanMovieName = (name: string) => {
    return name
        .replace(/^┃[^┃]*┃\s*/, '') // Remove ┃...┃ from beginning
        .replace(/\s*\[[^\]]*\]\s*$/, '') // Remove [...] from end
        .replace(/\s+\d{4}-\d{2}-\d{2}$/, '') // Remove date patterns (YYYY-MM-DD) from end
        .replace(/\s+(4K|HD|1080p|720p|480p|UHD|HDTV|BluRay|BRRip|WEBRip|DVDRip|HEVC)$/i, '') // Remove quality indicators
        .trim()
}

export const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout
    return (...args: any[]) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
}

export const imageResolutionHandlerForUrl = (url: string, resolution?: number) => {
    // Convert http to https if needed
    let processedUrl = url.replace('http://', 'https://')
    processedUrl = processedUrl.replace(/_V1_SX\d+/, `_V1_SX${resolution ? resolution : 1920}`)
    return processedUrl
}

export const getMovieDetailsOMDB = async (movie: any) => {
    const res1 = await getShowDetailsApi(movie)
    const result = res1?.data
    return {
        title: result?.Title || 'Not Available',
        rating: result?.imdbRating || 'N/A',
        Year: result?.Year || 'Not Available',
        Runtime: result?.Runtime || 'Not Available',
        Genre: result?.Genre || 'Not Available',
        Actors: result?.Actors || 'Not Available',
        Director: result?.Director || 'Director Information Not Available',
        Plot: result?.Plot || 'summary is not available',
        Poster: result?.Poster || null,
    }
}

export const getMovieDetailsTMDB = async (movie: any) => {
    try {
        
   
    //searching movie with title
    const res1 = await getShowDetailsApiTMDB(movie)

    if (!res1?.data?.results[0]?.id) {
        return await getMovieDetailsOMDB(movie)
    }

    else {
        //getting movie details with TMDB id
        const res2 = await getMovieDetailsWithTMDB_ID(res1?.data?.results[0]?.id)

        const result = res2?.data;
        const genres = result?.genres?.map((genre: any) => genre?.name).join(', ')

        //getting cast and crew from api call
        const res3 = await getMovieCastAndCrewWithTMDB_ID(res1?.data?.results[0]?.id)
        //take first 5 cast and crew
        const cast = res3?.data?.cast?.slice(0, 5)?.map((cast: any) => cast?.name).join(', ')
        //get director from crew in which job include Director
        const Director = res3?.data?.crew?.find((crew: any) => crew?.job?.toLowerCase()?.includes('director'))?.name

        return {
            title: result?.title || 'Not Available',
            rating: result?.vote_average ? Number(result?.vote_average).toFixed(1) : 'N/A',
            Year: result?.release_date || 'Not Available',
            Runtime: result?.runtime ? result?.runtime + ' mins' : 'Not Available',
            Genre: genres || 'Not Available',
            Actors: cast || 'Not Available',
            Director: Director || 'Director Information Not Available',
            Plot: result?.overview || 'summary is not available',
            Poster: result?.poster_path ? TMDB_BaseUrlImage + result?.poster_path : null,
        }
    }
        } catch (error) {
            console.log('error', error)
            return await getMovieDetailsOMDB(movie)
        }
}

export const getMovieDetails = async (movie: any) => {
    //clean the title
    const cleanTitle = cleanMovieName(movie)
    //  getMovieDetailsOMDB(cleanTitle)
    return await getMovieDetailsTMDB(cleanTitle)
}

