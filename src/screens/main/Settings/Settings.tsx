import React, { useState } from 'react';
import { Text, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import { MainStackParamList } from '../../../navigation/NavigationsTypes';
import SettingOverlay from '../../../components/SettingOverlay';

const Settings = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const [focusedOption, setFocusedOption] = useState('');

  const handleOptionPress = (option: string) => {
    switch(option) {
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
        break;
    }
  };

  const renderSettingOption = (title: string) => {
    const isFocused = focusedOption === title;
    
    return (
      <TouchableOpacity 
        key={title}
        style={[
          styles.settingOption, 
          isFocused && styles.selectedOption,
        ]}
        onPress={() => handleOptionPress(title)}
        onFocus={() => setFocusedOption(title)}
        onBlur={() => setFocusedOption('')}
        activeOpacity={1}
        {...({ 
          isTVSelectable: true,
        } as any)}
      >
        <Text style={styles.settingOptionText}>{title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SettingOverlay topTitle='Settings'>
        {/* Settings Options */}
        <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
          {renderSettingOption('General')}
          {renderSettingOption('Playlists')}
          {renderSettingOption('EPG')}
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