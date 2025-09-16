import React, {useEffect} from 'react';
import {BackHandler, Dimensions, Modal, StatusBar, View} from 'react-native';
import TvWithoutMediaPlayer, {channelData} from '../Tv/TvWithoutMediaPlayer';
import {styles} from './styles';
import LeftChannelView from './LeftChannelView';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

interface LeftChannelModalProps {
  visible: boolean;
  onClose: () => void;
  channelData?: channelData;
  onChannelSelect: (channel: channelData) => void;
}

const LeftChannelModal: React.FC<LeftChannelModalProps> = ({
  visible,
  onClose,
  channelData = [],
  onChannelSelect,
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
          <LeftChannelView
            channelData={channelData as any}
            handleBlockPress={onChannelSelect}
          />
        </View>
      </View>
    </Modal>
  );
};

export default LeftChannelModal;
