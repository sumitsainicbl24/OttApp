import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper functions
export const setItemLocalStorage = async (key: string, value: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(key, value);
    } catch (error) {
        console.error('Error setting item to AsyncStorage:', error);
    }
};

export const getItemLocalStorage = async (key: string): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(key);
    } catch (error) {
        console.error('Error getting item from AsyncStorage:', error);
        return null;
    }
};

export const deleteItemLocalStorage = async (key: string): Promise<void> => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error('Error deleting item from AsyncStorage:', error);
    }
};

export const clearAllLocalStorage = async (): Promise<void> => {
    try {
        await AsyncStorage.clear();
    } catch (error) {
        console.error('Error clearing AsyncStorage:', error);
    }
};

//language specific functions
export const getLanguageLocalStorage = async (): Promise<string> => {
    try {
        const language = await AsyncStorage.getItem('user-language');
        return language || 'en';
    } catch (error) {
        console.error('Error getting language from AsyncStorage:', error);
        return 'en';
    }
};

export const setLanguageLocalStorage = async (lang: string): Promise<void> => {
    try {
        await AsyncStorage.setItem('user-language', lang);
    } catch (error) {
        console.error('Error setting language to AsyncStorage:', error);
    }
};

//user
export const setUserDataLocalStorage = async (user: any): Promise<void> => {
    try {
        await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
        console.error('Error setting user data to AsyncStorage:', error);
    }
};

export const getUserDataLocalStorage = async (): Promise<any> => {
    try {
        const userData = await AsyncStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting user data from AsyncStorage:', error);
        return null;
    }
};

//auth token
export const setAuthTokenLocalStorage = async (token: string): Promise<void> => {
    try {
        await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
        console.error('Error setting auth token to AsyncStorage:', error);
    }
};

export const getAuthTokenLocalStorage = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem('auth_token');
    } catch (error) {
        console.error('Error getting auth token from AsyncStorage:', error);
        return null;
    }
};


//playlist data
export const setPlaylistToLocalStorage = async (playlist: any): Promise<void> => {
    try {
        await AsyncStorage.setItem('playlist', JSON.stringify(playlist));
    } catch (error) {
        console.error('Error setting playlist to AsyncStorage:', error);
    }
};

export const getPlaylistFromLocalStorage = async (): Promise<any> => {
    try {
        const playlist = await AsyncStorage.getItem('playlist');
        return playlist ? JSON.parse(playlist) : null;
    } catch (error) {
        console.error('Error getting playlist from AsyncStorage:', error);
        return null;
    }
};