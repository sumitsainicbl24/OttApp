import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, Image } from 'react-native';
import { CommonColors } from '../../../styles/Colors';
import FontFamily from '../../../constants/FontFamily';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import imagepath from '../../../constants/imagepath';
import SettingOverlay from '../../../components/SettingOverlay';

const GeneralSettings = () => {
  const navigation = useNavigation();
  const [selectedOption, setSelectedOption] = useState('General');
  const [focusedOption, setFocusedOption] = useState('');

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleOptionPress = (option: string) => {
    setSelectedOption(option);
  };

  const renderSettingOption = (title: string) => {
    const isSelected = selectedOption === title;
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
        <Image source={imagepath.LockIcon} style={styles.lockIcon} />
        <Text style={styles.settingOptionText}>{title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SettingOverlay topTitle='General'>

        {/* Settings Options */}
        <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
          {renderSettingOption('Auto start app on boot')}
          {renderSettingOption('Auto start app on wake up for sleep mode')}
          {renderSettingOption('Switch to picture-in-picture on press Home')}
          {renderSettingOption('Confirm exit by second press')}
          {renderSettingOption('User-Agent')}
          {renderSettingOption('UDP proxy (address: port)')}
        </ScrollView>
    </SettingOverlay>
  );
};

export default GeneralSettings; 