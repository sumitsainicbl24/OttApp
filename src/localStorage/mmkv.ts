import { MMKV } from 'react-native-mmkv';
const storage = new MMKV();

// Helper functions
export const setItemLocalStorage = async (key: string, value: string): Promise<void> => {
    try {
        await storage.set(key, value);
    } catch (error) {
        console.error('Error setting item to AsyncStorage:', error);
    }
};

export const getItemLocalStorage = async (key: string): Promise<string | null> => {
    try {
        return await storage.getString(key) || null;
    } catch (error) {
        console.error('Error getting item from AsyncStorage:', error);
        return null;
    }
};

export const deleteItemLocalStorage = async (key: string): Promise<void> => {
    try {
        await storage.delete(key);
    } catch (error) {
        console.error('Error deleting item from AsyncStorage:', error);
    }
};

export const clearAllLocalStorage = async (): Promise<void> => {
    try {
        await storage.clearAll();
    } catch (error) {
        console.error('Error clearing AsyncStorage:', error);
    }
};

//language specific functions
export const getLanguageLocalStorage = async (): Promise<string> => {
    try {
        const language = await storage.getString('user-language');
        return language || 'en';
    } catch (error) {
        console.error('Error getting language from AsyncStorage:', error);
        return 'en';
    }
};

export const setLanguageLocalStorage = async (lang: string): Promise<void> => {
    try {
        await storage.set('user-language', lang);
    } catch (error) {
        console.error('Error setting language to AsyncStorage:', error);
    }
};

//user
export const setUserDataLocalStorage = async (user: any): Promise<void> => {
    try {
        await storage.set('user', JSON.stringify(user));
    } catch (error) {
        console.error('Error setting user data to AsyncStorage:', error);
    }
};

export const getUserDataLocalStorage = async (): Promise<any> => {
    try {
        const userData = await storage.getString('user');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting user data from AsyncStorage:', error);
        return null;
    }
};

//auth token
export const setAuthTokenLocalStorage = async (token: string): Promise<void> => {
    try {
        await storage.set('auth_token', token);
    } catch (error) {
        console.error('Error setting auth token to AsyncStorage:', error);
    }
};

export const setIsPlaylistProcessedLocalStorage = async (isplaylistprocessed: boolean): Promise<void> => {
    try {
        await storage.set('isplaylistprocessed', isplaylistprocessed);
    } catch (error) {
        console.error('Error setting isplaylistprocessed to AsyncStorage:', error);
    }
};

export const getIsPlaylistProcessedLocalStorage = async (): Promise<boolean> => {
    try {
        return await storage.getBoolean('isplaylistprocessed') || false;
    } catch (error) {
        console.error('Error getting isplaylistprocessed from AsyncStorage:', error);
        return false;
    }
};
export const getAuthTokenLocalStorage = async (): Promise<string | null> => {
    try {
        return await storage.getString('auth_token') || null;
    } catch (error) {
        console.error('Error getting auth token from AsyncStorage:', error);
        return null;
    }
};

export const setPlaylistToLocalStorage = async (playlist: any): Promise<void> => {
    try {
         storage.set('playlist', JSON.stringify(playlist));
    } catch (error) {
        console.error('Error setting playlist to AsyncStorage:', error);
    }
};

export const getPlaylistFromLocalStorage = async (): Promise<any> => {
    try {
        const playlist =  storage.getString('playlist') || null;
        return playlist ? JSON.parse(playlist) : null;
    } catch (error) {
        console.error('Error getting playlist from AsyncStorage:', error);
        return null;
    }
};

//series data
export const saveSeriesDataToMMKV = async (seriesData: any): Promise<void> => {
    try {
        storage.set('seriesData', JSON.stringify(seriesData));
    } catch (error) {
        console.error('Error saving series data to MMKV:', error);
    }
};

export const getSeriesDataFromMMKV = async (): Promise<any> => {
    try {
        const seriesData =  storage.getString('seriesData') || null;
        return seriesData ? JSON.parse(seriesData) : null;
    } catch (error) {
        console.error('Error getting media data from MMKV:', error);
        return null;
    }
};

//movies data
export const saveMoviesDataToMMKV = async (moviesData: any): Promise<void> => {
    try {
       storage.set('moviesData', JSON.stringify(moviesData));
    } catch (error) {
        console.error('Error saving movies data to MMKV:', error);
    }
};

export const getMoviesDataFromMMKV = async (): Promise<any> => {
    try {
        const moviesData =  storage.getString('moviesData') || null;
        return moviesData ? JSON.parse(moviesData) : null;
    } catch (error) {
        console.error('Error getting movies data from MMKV:', error);
        return null;
    }
};

//channels data
export const saveChannelsDataToMMKV = async (channelsData: any): Promise<void> => {
    try {
         storage.set('channelsData', JSON.stringify(channelsData));
    } catch (error) {
        console.error('Error saving channels data to MMKV:', error);
    }
};

export const getChannelsDataFromMMKV = async (): Promise<any> => {
    try {
        const channelsData =  storage.getString('channelsData') || null;
        return channelsData ? JSON.parse(channelsData) : null;
    } catch (error) {
        console.error('Error getting channels data from MMKV:', error);
        return null;
    }
};

//user token
export const setUserTokenLocalStorage = async (userToken: string): Promise<void> => {
    try {
        storage.set('userToken', userToken);
    } catch (error) {
        console.error('Error setting user token to MMKV:', error);
    }
};

export const getUserTokenLocalStorage = async (): Promise<string | null> => {
    try {
        return await storage.getString('userToken') || null;
    } catch (error) {
        console.error('Error getting user token from MMKV:', error);
        return null;
    }
};