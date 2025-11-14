import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import SettingOverlay from '../../../components/SettingOverlay';
import { MainStackParamList } from '../../../navigation/NavigationsTypes';
import { fetchChannelsDataWithEpg } from '../../../redux/actions/main';
import { CommonColors } from '../../../styles/Colors';
import { styles } from './styles';
import { RootState } from '../../../redux/store';

const Settings = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const { epgDataLoading } = useSelector(
    (state: RootState) => state.rootReducer.auth,
  );
  const [focusedOption, setFocusedOption] = useState('');
  const dispatch = useDispatch();
  const handleOptionPress = (option: string) => {
    switch (option) {
      case 'General':
        navigation.navigate('GeneralSettings');
        break;
      case 'Playlists':
        navigation.navigate('PlaylistSettings');
        break;
      case 'Appearance':
        navigation.navigate('AppearanceSettings');
        break;
      case 'Playback':
        navigation.navigate('PlaybackSettings');
        break;
      case 'Remote control':
        navigation.navigate('RemoteControlSettings');
        break;
      case 'Other':
        navigation.navigate('OtherSettings');
      case 'Update EPG':
        dispatch(fetchChannelsDataWithEpg() as any);
        break;
    }
  };

  const renderSettingOption = (title: string) => {
    const isFocused = focusedOption === title;

    return (
      <TouchableOpacity
        key={title}
        style={[styles.settingOption, isFocused && styles.selectedOption]}
        onPress={() => handleOptionPress(title)}
        onFocus={() => setFocusedOption(title)}
        onBlur={() => setFocusedOption('')}
        activeOpacity={1}
        disabled={epgDataLoading}
        {...({
          isTVSelectable: true,
        } as any)}
      >
        {epgDataLoading && title === 'Update EPG' && (
          <ActivityIndicator size="small" color={CommonColors.black} />
        )}
        <Text
          style={{
            ...styles.settingOptionText,
            color: isFocused ? CommonColors.black : CommonColors.white,
          }}
        >
          {title}
        </Text>

        {/* <Text
          style={{
            ...styles.settingOptionText,
            color: isFocused ? CommonColors.black : CommonColors.white,
          }}
        >
          {title}
        </Text> */}
      </TouchableOpacity>
    );
  };

  return (
    <SettingOverlay topTitle="Settings">
      {/* Settings Options */}
      <ScrollView
        style={styles.optionsContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderSettingOption('General')}
        {renderSettingOption('Playlists')}
        {renderSettingOption('Update EPG')}
        {renderSettingOption('Appearance')}
        {renderSettingOption('Playback')}
        {renderSettingOption('Remote control')}
        {renderSettingOption('Parental controls')}
        {renderSettingOption('Other')}
      </ScrollView>
    </SettingOverlay>
  );
};

export default Settings;
