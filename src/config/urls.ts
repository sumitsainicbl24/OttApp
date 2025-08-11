export const API_BASE_URL = "https://api-ott.netsolutionindia.com/api";
// export const API_BASE_URL = "http://192.168.102.208:3001/api";

export const getApiUrl = (endpoint: string) => API_BASE_URL + endpoint;

export const loginUrl = getApiUrl("/login");

export const fetchMedia = getApiUrl("/media");

export const categoryUrl = getApiUrl("/categories");

export const CategoryDataUrl = getApiUrl("/category-data");

export const getPlaylistData = getApiUrl("https://4856-125-20-102-34.ngrok-free.app/api/login-m3u");

export const searchUrl = getApiUrl("/search");

export const getSeriesEpisodesUrl = getApiUrl("/series-episodes");

export const signupUrl = getApiUrl("/signup");

export const signInUrl = getApiUrl("/signin");

export const verifyOtpUrl = getApiUrl("/verify-otp");

export const addToMyListUrl = getApiUrl("/mylist/add");

export const removeFromMyListUrl = getApiUrl("/mylist/remove");

export const clearMyListUrl = getApiUrl("/mylist/clear");

export const getMyListUrl = getApiUrl("/mylist");

export const continueWatchingUpdateUrl = getApiUrl("/continue-watching/update");

export const continueWatchingGetUrl = getApiUrl("/continue-watching");

export const mylistCheckUrl = getApiUrl("/mylist/check");



// movie details urls
export const ShowDetailsApi = "http://www.omdbapi.com";

export const TMDBBaseUrl = "https://api.themoviedb.org/3";
export const TMDB_BaseUrlImage = "https://image.tmdb.org/t/p/original";