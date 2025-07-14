import { TMDB_BaseUrlImage } from '../config/urls'
import { getMovieCastAndCrewWithTMDB_ID, getMovieDetailsWithTMDB_ID, getSeriesShowDetailsOMDB, getSeriesShowDetailsWithTMDB, getSeriesShowDetailsWithTMDB_ID, getShowDetailsApi, getShowDetailsApiTMDB } from '../redux/actions/main'

export const cleanMovieName = (name: string) => {
    return name
        .replace(/^┃[^┃]*┃\s*/, '') // Remove ┃...┃ from beginning
        .replace(/\s*\[[^\]]*\]\s*$/, '') // Remove [...] from end
        .replace(/\s+\d{4}-\d{2}-\d{2}$/, '') // Remove date patterns (YYYY-MM-DD) from end
        .replace(/\s+(4K|HD|1080p|720p|480p|UHD|HDTV|BluRay|BRRip|WEBRip|DVDRip|HEVC)$/i, '') // Remove quality indicators
        .trim()
}

export const getEpisodeAndSeasonNumber = (title: string) => {
    // Use regex to match pattern like "S01 E05" or "S1 E5"
    const match = title.match(/S\d+\s+E\d+/i);
    
    if (match) {
        return match[0];
    }
    
    // If no match found, return empty string or null
    return '';
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
    
    // Handle TMDB image URLs - replace w{number} with resolution if provided, otherwise original
    if (processedUrl.includes('image.tmdb.org/t/p/')) {
        processedUrl = resolution ? processedUrl.replace(/\/w\d+\//, `/w${resolution}/`) : processedUrl.replace(/\/w\d+\//, '/original/')
    }
    
    // For IMDb URLs: if resolution is provided, replace _V1_SX{number} with _V1_SX{resolution}, otherwise remove the pattern
    if (resolution) {
        processedUrl = processedUrl.replace(/_V1_SX\d+/, `_V1_SX${resolution}`)
    } else {
        processedUrl = processedUrl.replace(/_V1_SX\d+/, '')
    }
    return processedUrl
}

// for movie details
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


// for series show details
export const getSeriesShowDetails = async (show: any) => {
    try {
    const cleanTitle = cleanMovieName(show)
    const res = await getSeriesShowDetailsWithTMDB(cleanTitle)

    if (!res) {
        // const res2 = await getSeriesShowDetailsOMDB(cleanTitle)
        // return res2?.data
        return await getSeriesShowDetailsOMDBAPI(cleanTitle)
    }

    else {
        const res2 = await getSeriesShowDetailsWithTMDB_ID(res)
        // console.log('res2 getSeriesShowDetails', res2?.data)
        const genres = res2?.data?.genres?.map((genre: any) => genre?.name).join(', ')
        let cast = 'Not Available'
        let Director = 'Director Information Not Available'

        try {
        const res3 = await getMovieCastAndCrewWithTMDB_ID(res2?.data?.id)
        cast = res3?.data?.cast?.slice(0, 5)?.map((cast: any) => cast?.name).join(', ')
        Director = res3?.data?.crew?.find((crew: any) => crew?.job?.toLowerCase()?.includes('director'))?.name
        } catch (error) {
            console.log('error', error)
        }

        return {
            title: res2?.data?.original_name || 'Not Available',
            rating: res2?.data?.vote_average ? Number(res2?.data?.vote_average).toFixed(1) : 'N/A',
            Year: res2?.data?.release_date || 'Not Available',
            Runtime: res2?.data?.runtime ? res2?.data?.runtime + ' mins' : 'Not Available',
            Genre: genres || 'Not Available',
            Actors: cast || 'Not Available',
            Director: Director || 'Director Information Not Available',
            Plot: res2?.data?.overview || 'summary is not available',
            Poster: res2?.data?.poster_path ? TMDB_BaseUrlImage + res2?.data?.poster_path : null,
        }
    }
    } catch (error) {
        console.log('error', error)
        // return await getSeriesShowDetailsOMDB(show)
    }
}


export const getSeriesShowDetailsOMDBAPI = async (show: any) => {
    const res1 = await getSeriesShowDetailsOMDB(show)
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





