// export const API_BASE_URL = "https://e6bd-14-194-168-22.ngrok-free.app/api";

// export const API_BASE_URL = "https://638b-125-20-102-34.ngrok-free.app/api";
export const API_BASE_URL = "http://192.168.102.208:5000/api";

export const getApiUrl = (endpoint: string) => API_BASE_URL + endpoint;

export const loginUrl = getApiUrl("/login");

export const fetchMedia = getApiUrl("/media");

export const categoryUrl = getApiUrl("/categories");

export const CategoryDataUrl = getApiUrl("/category-data");

export const getPlaylistData = getApiUrl("https://4856-125-20-102-34.ngrok-free.app/api/login-m3u");

export const ShowDetailsApi = "http://www.omdbapi.com";

export const TMDBBaseUrl = "https://api.themoviedb.org/3";
export const TMDB_BaseUrlImage = "https://image.tmdb.org/t/p/w1920";