import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/urls';
import { store } from '../redux/store';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // timeout: 150000,
  headers: {
    'Content-Type': 'application/json',
    // Add ngrok-skip-browser-warning header to avoid ngrok browser warning page
    'ngrok-skip-browser-warning': 'true',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Always add the ngrok bypass header
    config.headers['ngrok-skip-browser-warning'] = 'true';
    
    const state = store.getState();
    const token = state.rootReducer.auth.auth_token;
    
    console.log('Request interceptor - Current token:', token ? '***TOKEN_SET***' : 'NO_TOKEN');
    console.log('Request interceptor - URL:', config.url);
    console.log('Request interceptor - Method:', config.method?.toUpperCase());
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('Response success:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase()
    });
    return response;
  },
  (error: AxiosError) => {
    console.error('Response error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: error.response?.data,
      message: error.message
    });
    
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      console.log('Unauthorized access - clearing token');
      // You can dispatch logout action here if needed
    }
    
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// Generic request function
const makeRequest = async <T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  try {
    const response = await apiClient.request<T>({
      method,
      url,
      data,
      ...config,
    });
    return response;
  } catch (error) {
    console.error(`${method} request to ${url} failed:`, error);
    throw error;
  }
};

// GET request
export const apiGet = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return makeRequest<T>('GET', url, undefined, config);
};

// POST request
export const apiPost = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return makeRequest<T>('POST', url, data, config);
};

// PUT request
export const apiPut = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return makeRequest<T>('PUT', url, data, config);
};

// DELETE request
export const apiDelete = async <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return makeRequest<T>('DELETE', url, undefined, config);
};

// File upload helper
export const uploadFile = async <T = any>(
  url: string,
  formData: FormData,
  onUploadProgress?: (progressEvent: any) => void
): Promise<AxiosResponse<T>> => {
  return apiPost<T>(url, formData, {
    headers: {
      'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

// Download file helper for React Native
export const downloadFile = async (
  url: string
): Promise<Blob> => {
  const response = await apiGet(url, {
    responseType: 'blob',
  });
  
  return response.data;
};

// Utility functions for common operations
export const handleApiError = (error: AxiosError): string => {
  if (error.response) {
    // Server responded with error status
    const message = (error.response.data as any)?.message || error.response.statusText;
    return `Error ${error.response.status}: ${message}`;
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error: No response from server';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

// Format response data helper
export const formatResponse = <T>(response: AxiosResponse<T>) => {
  return {
    data: response.data,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  };
};

// Check if response is successful
export const isSuccessResponse = (status: number): boolean => {
  return status >= 200 && status < 300;
};

// Utility to create query string from object
export const createQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
};

// GET request with query parameters
export const apiGetWithParams = async <T = any>(
  url: string,
  params?: Record<string, any>,
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  const queryString = params ? createQueryString(params) : '';
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  
  return apiGet<T>(fullUrl, config);
};

export default apiClient;
