import React, { useEffect } from 'react';
import {
  BackHandler,
  Dimensions,
  Modal,
  StatusBar,
  View
} from 'react-native';
import TvWithoutMediaPlayer, { channelData } from '../Tv/TvWithoutMediaPlayer';
import { styles } from './styles';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

interface TvGuideModalProps {
  visible: boolean;
  onClose: () => void;
  channelData?: channelData;
}

const TvGuideModal: React.FC<TvGuideModalProps> = ({
  visible,
  onClose,
  channelData = [],
}) => {

  // Handle back button press
  useEffect(() => {
    const backAction = () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [visible, onClose]);


  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <StatusBar
        backgroundColor="rgba(0, 0, 0, 0.8)"
        translucent
        barStyle="light-content"
      />

      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TvWithoutMediaPlayer
            channelData={channelData as any}
            handleBlockPress={onClose}
          />
        </View>
      </View>
    </Modal>
  );
};

export default TvGuideModal;
