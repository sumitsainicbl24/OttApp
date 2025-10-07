import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView, Image } from 'react-native';
import { CommonColors } from '../../../styles/Colors';
import FontFamily from '../../../constants/FontFamily';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import imagepath from '../../../constants/imagepath';
import SettingOverlay from '../../../components/SettingOverlay';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';

const OtherSettings = () => {
  const navigation = useNavigation();
  const [selectedOption, setSelectedOption] = useState('General');
  const [focusedOption, setFocusedOption] = useState('');
  const userToken = useSelector((state: RootState) => state.rootReducer.auth.userToken);
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
        <Image source={imagepath.LockIcon} style={styles.lockIcon} tintColor={userToken ? CommonColors.white : CommonColors.textSecondary}/>
        <Text style={{...styles.settingOptionText , color:userToken ? CommonColors.white : CommonColors.textSecondary}}>{title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SettingOverlay topTitle='Other'>

        {/* Settings Options */}
        <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
          {renderSettingOption('Search')}
          {renderSettingOption('Reminders')}
          {renderSettingOption('Recording')}
          {renderSettingOption('VOD')}
        </ScrollView>
    </SettingOverlay>
  );
};

export default OtherSettings; 