// 1. React Native core imports
import {Text, View, TouchableOpacity, Image} from 'react-native';
import React, {useState} from 'react';

// 2. Global styles and utilities
import CommonStyles from '../../../styles/CommonStyles';
import {CommonColors} from '../../../styles/Colors';
import {moderateScale, scale, verticalScale} from '../../../styles/scaling';

// 3. Component imports
import WrapperContainer from '../../../components/WrapperContainer';
import InputComp from '../../../components/InputComp';
import CheckboxComp from '../../../components/CheckboxComp';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import {AuthStackParamList} from '../../../navigation/NavigationsTypes';
import imagepath from '../../../constants/imagepath';

// 4. Local styles import (ALWAYS LAST)
import {styles} from './styles';
import FontFamily from '../../../constants/FontFamily';

// Type definitions for field configuration
interface InputField {
  key: string;
  label: string;
  placeholder: string;
  type: 'input';
  required: boolean;
  secureTextEntry?: boolean;
}

interface CheckboxField {
  key: string;
  label: string;
  defaultValue: boolean;
}

interface CheckboxGroupField {
  key: string;
  type: 'checkbox';
  fields: CheckboxField[];
}

type FieldConfig = InputField | CheckboxGroupField;

// Field configuration for different playlist types
const getFieldConfig = (playlistType: string): FieldConfig[] => {
  const baseConfig = {
    'M3U Playlist': [
      {
        key: 'playlistUrl',
        label: 'M3U Playlist playlist URL',
        placeholder: 'Enter your Playlist URL',
        type: 'input' as const,
        required: true,
      },
    ],
    'Stalker Portal': [
      {
        key: 'serverAddress',
        label: 'Server address',
        placeholder: 'Enter Your Server Address',
        type: 'input' as const,
        required: true,
      },
      {
        key: 'macAddress',
        label: 'MAC Address',
        placeholder: '00:01a:79:d0:C5:Db',
        type: 'input' as const,
        required: true,
      },
      {
        key: 'username',
        label: 'Username (Optional)',
        placeholder: 'Enter Your Username',
        type: 'input' as const,
        required: false,
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: 'Enter Your Password',
        type: 'input' as const,
        secureTextEntry: true,
        required: true,
      },
      {
        key: 'deviceId1',
        label: 'Device ID 1',
        placeholder: 'Enter Device ID',
        type: 'input' as const,
        required: true,
      },
      {
        key: 'deviceId2',
        label: 'Device ID 2',
        placeholder: 'Enter Device ID',
        type: 'input' as const,
        required: true,
      },
      {
        key: 'checkboxes',
        type: 'checkbox' as const,
        fields: [
          {
            key: 'includeTvChannels',
            label: 'Include TV channels',
            defaultValue: true,
          },
          {
            key: 'includeVod',
            label: 'Include VOD',
            defaultValue: true,
          },
        ],
      },
    ],
    default: [
      {
        key: 'serverAddress',
        label: 'Server address',
        placeholder: 'Enter Your Server Address',
        type: 'input' as const,
        required: true,
      },
      {
        key: 'username',
        label: 'Username',
        placeholder: 'Enter your Username',
        type: 'input' as const,
        required: true,
      },
      {
        key: 'password',
        label: 'Password',
        placeholder: 'Enter your Password',
        type: 'input' as const,
        secureTextEntry: true,
        required: true,
      },
    ],
  };

  return (
    baseConfig[playlistType as keyof typeof baseConfig] || baseConfig.default
  );
};

const PlaylistSetup = ({
  route,
}: {
  route: RouteProp<AuthStackParamList, 'PlaylistSetup'>;
}) => {
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  const {type} = route.params;

  // Initialize all possible form states
  const [formData, setFormData] = useState({
    playlistUrl:
      'http://line.diatunnel.link/get.php?username=mrKQdWmJ&password=jSxeKrs&type=m3u_plus&output=ts',
    username: '',
    password: '',
    serverAddress: '',
    macAddress: '00:01a:79:d0:C5:Db',
    deviceId1: '',
    deviceId2: '',
    includeTvChannels: true,
    includeVod: true,
  });

  // Focus state for buttons
  const [focused, setFocused] = useState<string | null>(null);

  // Get field configuration for current playlist type
  const fieldConfig = getFieldConfig(type);

  // Update form data
  const updateFormData = (key: string, value: string | boolean) => {
    setFormData(prev => ({...prev, [key]: value}));
  };

  // Dynamic field renderer
  const renderField = (field: FieldConfig) => {
    if (field.type === 'input') {
      return (
        <InputComp
          key={field.key}
          label={field.label}
          placeholder={field.placeholder}
          value={formData[field.key as keyof typeof formData] as string}
          onChangeText={value => updateFormData(field.key, value)}
          secureTextEntry={field.secureTextEntry}
          containerStyle={styles.inputContainer}
        />
      );
    }

    if (field.type === 'checkbox') {
      return (
        <View key={field.key} style={styles.checkboxContainer}>
          {field.fields.map(checkboxField => (
            <CheckboxComp
              key={checkboxField.key}
              label={checkboxField.label}
              isChecked={
                formData[checkboxField.key as keyof typeof formData] as boolean
              }
              onToggle={value => updateFormData(checkboxField.key, value)}
            />
          ))}
        </View>
      );
    }

    return null;
  };

  const handleNext = () => {
    // Navigate to next screen or handle form submission
    navigation.navigate('PlaylistProcessed', {
      type,
      playlistUrl: formData.serverAddress
        ? formData.serverAddress
        : formData.playlistUrl,
      username: formData.username,
      password: formData.password,
    });
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleNextFocus = () => {
    setFocused('next');
  };

  const handleCancelFocus = () => {
    setFocused('cancel');
  };

  const handleBlur = () => {
    setFocused(null);
  };

  return (
    <WrapperContainer containerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.LeftContainer}>
        <View style={styles.iconContainer}>
          <Image
            source={
              type === 'xtream'
                ? imagepath.xstreamCodes
                : imagepath.PlaylistIcon
            }
            style={styles.iconPlaceholder}
          />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={CommonStyles.Heading}>
            {type === 'xtream' ? 'Xtream \n Codes Login' : 'Playlist Setup'}
          </Text>
          <Text
            style={{
              ...CommonStyles.SubHeading,
              width: 200,
              color: CommonColors.textSecondary,
              fontFamily: FontFamily.PublicSans_Medium,
              fontSize: scale(26),
            }}>
            {type === 'xtream'
              ? 'Enter Xcode Server Address , your username and password'
              : type}
          </Text>
        </View>
      </View>

      {/* Main Content Section */}
      <View style={styles.contentContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Playlist Setup</Text>

          <View style={styles.inputsContainer}>
            {fieldConfig.map(renderField)}
          </View>
        </View>
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={1}
            onFocus={handleNextFocus}
            onBlur={handleBlur}
            hasTVPreferredFocus={true}>
            <Text
              style={[
                styles.nextButtonText,
                focused === 'next' && styles.nextButtonTextFocused,
              ]}>
              Next
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCancel}
            activeOpacity={1}
            onFocus={handleCancelFocus}
            onBlur={handleBlur}>
            <Text
              style={[
                styles.cancelButtonText,
                focused === 'cancel' && styles.cancelButtonTextFocused,
              ]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </WrapperContainer>
  );
};

export default PlaylistSetup;
