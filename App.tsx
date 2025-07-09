/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  useColorScheme
} from 'react-native';

import {
  Colors
} from 'react-native/Libraries/NewAppScreen';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';
import { getAuthTokenLocalStorage, getIsPlaylistProcessedLocalStorage, getUserDataLocalStorage, getUserTokenLocalStorage } from './src/localStorage/mmkv';
import Routes from './src/navigation/Routes';
import { setAuthToken , setIsPlaylistProcessed, setUserData, setUserToken} from './src/redux/reducers/auth';
import { store } from './src/redux/store';

if (__DEV__) {
  require("./ReactotronConfig");
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const loadAuthToken = async () => {
    const auth_token = await getAuthTokenLocalStorage();
    if (auth_token) {
      store.dispatch(setAuthToken(auth_token));
    }
    const isplaylistprocessed = await getIsPlaylistProcessedLocalStorage();
    if(isplaylistprocessed){
      store.dispatch(setIsPlaylistProcessed(isplaylistprocessed))
    }

    const userToken = await getUserTokenLocalStorage();
    if(userToken){
      store.dispatch(setUserToken(userToken))
    }

    const user = await getUserDataLocalStorage();
    if(user){
      store.dispatch(setUserData(user))
    }

  };

  

  useEffect(() => {
    loadAuthToken();
  }, [])

  return (
    <Provider store={store}>
      <SafeAreaView style={styles.container}>
        <Routes />
      </SafeAreaView>
      <Toast />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
