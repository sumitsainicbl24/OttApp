// 1. React Native core imports
import {
  Text,
  View,
  Pressable,
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native';
import React, {useState} from 'react';

import {styles} from './styles';
import WrapperContainer from '../../../components/WrapperContainer';
import imagepath from '../../../constants/imagepath';
import {Image} from 'react-native';
import CommonStyles from '../../../styles/CommonStyles';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import {
  AuthStackParamList,
  MainStackParamList,
} from '../../../navigation/NavigationsTypes';
import {CommonColors} from '../../../styles/Colors';
import {
  setUserAction,
  setUserTokenAction,
  signinApi,
} from '../../../redux/actions/main';
import Toast from 'react-native-toast-message';

interface Device {
  id: string;
  name: string;
}

const DevicesList = ({
  route,
}: {
  route: RouteProp<MainStackParamList, 'DevicesList'>;
}) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {data: loginData, devicesList} = route.params;
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [focused, setFocused] = useState<string | null>(null);

  console.log('devicesList--->>>>', devicesList);
  // Sample device data matching the screenshot
  const devices: Device[] = devicesList;

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDevice(deviceId);
  };

  const handleActivate = async () => {
    // TODO: Implement login logic
    try {
      if (!selectedDevice) {
        Toast.show({
          text1: 'Please select a device',
          type: 'error',
        });
        return;
      }
      const data: any = {
        ...loginData,
        deviceIdsToRemove: [selectedDevice],
      };
      console.log('data--->>>>', data);
      const response = await signinApi(data);
      if (response.status === 200) {
        Toast.show({
          text1: 'Login successful',
          type: 'success',
        });

        setUserAction(response?.data?.data?.user);
        setUserTokenAction(response?.data?.data?.token);
        navigation.navigate('Home', {activeScreen: 'Home'});
      }
      console.log(response);
    } catch (error: any) {
      // {
      //   error?.response?.data?.error &&
      //     Toast.show({
      //       text1: error?.response?.data?.error,
      //       type: 'error',
      //     });
      // }
      console.log(error);
    }
  };

  // const handleActivate = () => {
  //   // Handle device activation logic here
  //   console.log('Activating device:', selectedDevice);
  //   // You can add your activation logic here
  // };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleFocus = (element: string) => {
    setFocused(element);
  };

  const handleBlur = () => {
    setFocused('');
  };

  return (
    <WrapperContainer containerStyle={styles.container}>
      <View style={styles.contentContainer}>
        {/* Left Container - Activation Info */}
        <View style={styles.LeftContainer}>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'space-between',
            }}>
            <View style={styles.iconContainer}>
              <Image
                source={imagepath.unlockIcon}
                style={styles.iconPlaceholder}
              />
            </View>
            <View style={{width: '80%'}}>
              <Text style={styles.activationTitle}>Activation</Text>
              <Text style={styles.activationText}>
                Limit of 5 devices is reached.{'\n\n'}
                Select your existing device if you want to restore the
                activation and press Activate.{'\n\n'}
              </Text>
            </View>
          </View>
        </View>

        {/* Right Container - Device Selection */}
        <View style={styles.rightContainer}>
          <View style={styles.deviceHeader}>
            <Text style={styles.deviceHeaderText}>
              Activate existing device (5/5)
            </Text>
          </View>

          <View style={styles.deviceList}>
            {devices?.map((device: any) => (
              <TouchableOpacity
                key={device.id}
                onFocus={() => handleFocus(device?.deviceId)}
                style={[
                  styles.deviceItem,
                  focused === device.deviceId && styles.selectedDeviceItem,
                ]}
                onPress={() => handleDeviceSelect(device?.deviceId)}
                activeOpacity={0.7}>
                <View
                  style={[
                    styles.radioButton,
                    selectedDevice === device.deviceId &&
                      styles.radioButtonSelected,
                  ]}>
                  {selectedDevice === device.deviceId && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text
                  style={{
                    ...styles.deviceName,
                    color:
                      focused === device.deviceId
                        ? CommonColors.black
                        : CommonColors.white,
                  }}>
                  {device?.deviceId}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.activateButton}
            onPress={handleActivate}
            activeOpacity={0.7}
            onFocus={() => handleFocus('activate')}
            onBlur={handleBlur}>
            <Text style={styles.activateButtonText}>Activate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            onFocus={() => handleFocus('back')}
            onBlur={handleBlur}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </WrapperContainer>
  );
};

export default DevicesList;
