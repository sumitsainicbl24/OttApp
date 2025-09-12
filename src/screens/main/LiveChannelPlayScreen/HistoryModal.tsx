import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StatusBar,
  Text,
  TouchableOpacity,
  useTVEventHandler,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {CommonColors} from '../../../styles/Colors';
import {moderateScale, scale, verticalScale} from '../../../styles/scaling';
import FontFamily from '../../../constants/FontFamily';
import imagepath from '../../../constants/imagepath';
import {getProxyImageUrl} from '../../../utils/CommonFunctions';
import {decodeEPGTitle} from '../../../utils/epgUtils';
import moment from 'moment';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

interface HistoryItem {
  _id: string;
  name: string;
  stream_id: number;
  stream_icon?: string;
  lastWatchedAt: string;
  createdAt: string;
  updatedAt: string;
  watchDuration?: number;
  stream_type?: string;
  url?: string;
  category_id?: string;
  epg_channel_id?: string;
  epg: any;
}

interface HistoryDateGroup {
  date: string;
  totalChannels: number;
  channels: HistoryItem[];
}

interface HistoryModalProps {
  visible: boolean;
  onClose: () => void;
  historyData: HistoryDateGroup[];
  onItemSelect?: (item: HistoryItem) => void;
  onClearHistory?: () => void;
  onDeleteItem?: (item: HistoryItem) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  visible,
  onClose,
  historyData,
  onItemSelect,
  onClearHistory,
  onDeleteItem,
}) => {
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [focusedItem, setFocusedItem] = useState<HistoryItem | null>(null);
  const [focusedDeleteIndex, setFocusedDeleteIndex] = useState<number | null>(
    null,
  );
  const focusIndexRef = useRef<number>(0);

  // Create a list that includes date headers and items
  type ListItem =
    | {type: 'dateHeader'; date: string; id: string}
    | {
        type: 'historyItem';
        item: HistoryItem;
        id: string;
        dateGroupIndex: number;
        itemIndex: number;
      };

  const listItems = useMemo(() => {
    const items: ListItem[] = [];
    historyData.forEach((dateGroup, dateGroupIndex) => {
      // Add date header
      items.push({
        type: 'dateHeader',
        date: dateGroup.date,
        id: `date_${dateGroupIndex}`,
      });

      // Add history items for this date
      dateGroup.channels.forEach((item, itemIndex) => {
        items.push({
          type: 'historyItem',
          item,
          id: `item_${dateGroupIndex}_${itemIndex}`,
          dateGroupIndex,
          itemIndex,
        });
      });
    });
    return items;
  }, [historyData]);

  // Flatten all history items for easy access
  const allHistoryItems = useMemo(() => {
    return historyData.flatMap(dateGroup => dateGroup.channels);
  }, [historyData]);

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

  // Reset focus when modal opens
  useEffect(() => {
    if (visible && listItems.length > 0) {
      console.log(listItems, 'Modal opened - listItems:');
      // Find first history item (skip date headers)
      const firstHistoryItem = listItems.find(
        item => item.type === 'historyItem',
      );
      if (firstHistoryItem && firstHistoryItem.type === 'historyItem') {
        setSelectedItem(firstHistoryItem.item);
        setFocusedItem(firstHistoryItem.item);
        // Find the index of the first history item
        const firstItemIndex = listItems.findIndex(
          item => item.type === 'historyItem',
        );
        setFocusedIndex(firstItemIndex + 1); // +1 because clear button is at index 0
        focusIndexRef.current = firstItemIndex + 1;
      }
    }
  }, [visible, listItems]);

  // Reset focus when data changes
  useEffect(() => {
    if (visible && allHistoryItems.length > 0) {
      // Ensure focus is within bounds
      if (focusIndexRef.current >= allHistoryItems.length + 1) {
        console.log('Resetting focus - was out of bounds');
        focusIndexRef.current = 1;
        setFocusedIndex(1);
        setFocusedItem(allHistoryItems[0]);
      }
    }
  }, [allHistoryItems, visible]);

  // TV remote event handler
  const myTVEventHandler = (evt: any) => {
    if (evt && evt.eventType === 'select') {
      if (focusedIndex === 0 && onClearHistory) {
        onClearHistory();
      } else if (focusedIndex > 0) {
        const listItem = listItems[focusedIndex - 1];
        if (listItem && listItem.type === 'historyItem') {
          if (focusedDeleteIndex !== null) {
            // Delete button is focused
            if (onDeleteItem) {
              onDeleteItem(listItem.item);
              setFocusedDeleteIndex(null);
            }
          } else {
            // History item is focused
            setSelectedItem(listItem.item);
            onItemSelect?.(listItem.item);
          }
        }
      }
    } else if (evt && evt.eventType === 'up') {
      // Find previous focusable item (skip date headers)
      let newIndex = focusedIndex - 1;
      while (newIndex > 0) {
        const listItem = listItems[newIndex - 1];
        if (listItem && listItem.type === 'historyItem') {
          break;
        }
        newIndex--;
      }
      if (newIndex === 0) newIndex = 0; // Go to clear button
      focusIndexRef.current = newIndex;
      setFocusedIndex(newIndex);
      setFocusedDeleteIndex(null); // Reset delete focus when navigating
      // Update focused item
      if (newIndex > 0) {
        const listItem = listItems[newIndex - 1];
        if (listItem && listItem.type === 'historyItem') {
          setFocusedItem(listItem.item);
        }
      } else {
        setFocusedItem(null);
      }
    } else if (evt && evt.eventType === 'down') {
      // Find next focusable item (skip date headers)
      let newIndex = focusedIndex + 1;

      // Look for the next history item
      while (newIndex <= listItems.length) {
        if (newIndex === listItems.length) {
          // Reached the end, wrap to clear button
          newIndex = 0;
          break;
        }

        const listItem = listItems[newIndex - 1];
        if (listItem && listItem.type === 'historyItem') {
          break;
        }
        newIndex++;
      }

      focusIndexRef.current = newIndex;
      setFocusedIndex(newIndex);
      setFocusedDeleteIndex(null); // Reset delete focus when navigating
      // Update focused item
      if (newIndex > 0) {
        const listItem = listItems[newIndex - 1];
        if (listItem && listItem.type === 'historyItem') {
          setFocusedItem(listItem.item);
        }
      } else {
        setFocusedItem(null);
      }
    } else if (evt && evt.eventType === 'right') {
      // Navigate to delete button within the same item
      if (focusedIndex > 0) {
        const listItem = listItems[focusedIndex - 1];
        if (listItem && listItem.type === 'historyItem') {
          setFocusedDeleteIndex(listItem.itemIndex);
        }
      }
    } else if (evt && evt.eventType === 'left') {
      if (focusedDeleteIndex !== null) {
        // Go back to item from delete button
        setFocusedDeleteIndex(null);
      } else {
        // Close modal
        onClose();
      }
    }
  };

  useTVEventHandler(myTVEventHandler);

  const renderDateHeader = ({
    item,
  }: {
    item: {type: 'dateHeader'; date: string; id: string};
  }) => {
    return (
      <View style={styles.dateHeader}>
        <Text style={styles.dateHeaderText}>
          {moment(item.date).format('dddd, MMM DD')}
        </Text>
      </View>
    );
  };

  const renderHistoryItem = ({
    item,
    index,
  }: {
    item: {
      type: 'historyItem';
      item: HistoryItem;
      id: string;
      dateGroupIndex: number;
      itemIndex: number;
    };
    index: number;
  }) => {
    const isFocused = focusedIndex === index + 1; // +1 because clear button is at index 0
    const isDeleteFocused = focusedDeleteIndex === item.itemIndex;

    console.log(`Item `, item.item);

    return (
      <Pressable
        style={[
          styles.historyItem,
          isFocused && !isDeleteFocused && styles.historyItemFocused,
        ]}
        onPress={() => {
          setSelectedItem(item.item);
          setFocusedItem(item.item);
          onItemSelect?.(item.item);
        }}>
        <View style={styles.historyItemHeader}>
          <Text style={styles.historyItemTitle} numberOfLines={1}>
            {decodeEPGTitle(item.item.epg.title)}
          </Text>
          <View style={styles.historyItemTimeContainer}>
            <Text style={styles.historyItemTime}>
              {moment(item.item.epg.start).format('ddd, MMM DD, HH:mm a')} -{' '}
              {moment(item.item.epg.end).format('HH:mm a')}
            </Text>
          </View>
        </View>
        <View style={styles.historyItemFooter}>
          <Text style={styles.historyItemRecordedTime}>
            {moment(item.item.lastWatchedAt).format('MMM DD')}
          </Text>
          <FastImage
            source={{uri: getProxyImageUrl(item.item.stream_icon)!}}
            style={styles.tvIcon}
          />
          <View style={styles.historyItemChannel}>
            <Text style={styles.historyItemChannelText}>{item.item.name}</Text>
            {isFocused && (
              <Pressable
                style={[
                  styles.deleteButton,
                  isDeleteFocused && styles.deleteButtonFocused,
                ]}
                onPress={() => {
                  if (onDeleteItem) {
                    onDeleteItem(item.item);
                  }
                }}>
                <Image
                  source={imagepath.clear}
                  style={styles.deleteIcon}
                  tintColor={CommonColors.black}
                />
              </Pressable>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  const renderListItem = ({item, index}: {item: ListItem; index: number}) => {
    if (item.type === 'dateHeader') {
      return renderDateHeader({item});
    } else {
      return renderHistoryItem({item, index});
    }
  };

  const renderClearButton = () => {
    const isFocused = focusedIndex === 0;
    return (
      <Pressable
        style={[styles.clearButton, isFocused && styles.clearButtonFocused]}
        onPress={onClearHistory}>
        <Image
          source={imagepath.clear}
          style={styles.clearButtonIcon}
          tintColor={CommonColors.white}
        />
        {/* <Text style={styles.clearButtonText}>Clear History</Text> */}
      </Pressable>
    );
  };

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
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerDate}></Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.headerTitle}>History</Text>
              {renderClearButton()}
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Left Panel - History List */}
            <View style={styles.leftPanel}>
              <FlatList
                data={listItems}
                keyExtractor={item => item.id}
                renderItem={renderListItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.historyList}
              />
            </View>

            {/* Right Panel - Focused Item Details */}
            <View style={styles.rightPanel}>
              {focusedItem ? (
                <View style={styles.selectedItemDetails}>
                  <Text style={styles.selectedItemTitle} numberOfLines={2}>
                    {decodeEPGTitle(focusedItem.epg.title)}
                  </Text>
                  <View style={styles.selectedItemTimeContainer}>
                    <Text style={styles.selectedItemTime}>
                      {moment(focusedItem.epg.start).format(
                        'ddd, MMM DD, HH:mm a',
                      )}{' '}
                      - {moment(focusedItem.epg.end).format('HH:mm a')}
                    </Text>
                  </View>
                  <Text
                    style={styles.selectedItemDescription}
                    numberOfLines={3}>
                    {decodeEPGTitle(focusedItem.epg.description)}
                  </Text>
                </View>
              ) : (
                <View style={styles.noSelectionContainer}>
                  <Text style={styles.noSelectionText}>
                    Select a program to view details
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>NL | HD NEDERLAND terugkijken</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  tvIcon: {
    width: 40,
    height: 40,
    tintColor: CommonColors.white,
    borderRadius: moderateScale(10),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'rgba(25, 24, 24, 0.9)',
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-end' as const,
    paddingHorizontal: scale(60),
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(40),
  },
  headerLeft: {
    flex: 1,
  },
  headerDate: {
    color: CommonColors.white,
    fontSize: moderateScale(18),
    fontFamily: FontFamily.PublicSans_Medium,
  },
  headerRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: scale(20),
  },
  headerTitle: {
    color: CommonColors.white,
    fontSize: moderateScale(48),
    fontFamily: FontFamily.PublicSans_Bold,
    fontWeight: 'bold' as const,
  },
  clearButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(6),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  clearButtonFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: CommonColors.white,
  },
  clearButtonIcon: {
    width: 16,
    height: 16,
    marginRight: scale(8),
  },
  clearButtonText: {
    color: CommonColors.white,
    fontSize: moderateScale(14),
    fontFamily: FontFamily.PublicSans_Medium,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row' as const,
    paddingHorizontal: scale(60),
  },
  leftPanel: {
    flex: 0.65,
    marginRight: scale(40),
    marginTop: -verticalScale(80),
  },
  rightPanel: {
    flex: 0.35,
    backgroundColor: 'rgba(1, 1, 1, 0.4)',
    borderRadius: moderateScale(12),
    padding: scale(25),
 
    height: 160,
  },
  historyList: {
    paddingBottom: verticalScale(20),
  },
  historyItem: {
    backgroundColor: 'transparent',
    marginBottom: verticalScale(15),
    borderRadius: moderateScale(8),
    borderWidth: 2,
    borderColor: 'transparent',
    width: '85%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: scale(15),
  },
  historyItemFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  historyItemContent: {
    padding: scale(15),
    flexDirection: 'row',
  },
  historyItemHeader: {
    flex: 0.4,
    marginBottom: verticalScale(8),
  },
  historyItemTitle: {
    color: CommonColors.white,
    fontSize: moderateScale(16),
    fontFamily: FontFamily.PublicSans_Regular,
    marginBottom: verticalScale(4),
    maxWidth: '90%',
  },
  historyItemTimeContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  historyItemTime: {
    color: CommonColors.whiteOpacity50,
    fontSize: moderateScale(14),
    fontFamily: FontFamily.PublicSans_Regular,
    flex: 1,
  },
  recordIcon: {
    width: scale(16),
    height: scale(16),
    marginLeft: scale(8),
  },
  historyItemFooter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    // backgroundColor: 'red',
    flex: 0.6,
  },
  historyItemRecordedTime: {
    color: CommonColors.whiteOpacity50,
    fontSize: moderateScale(12),
    fontFamily: FontFamily.PublicSans_Regular,
  },
  historyItemChannel: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: scale(6),
    flex: 0.7,
    justifyContent: 'space-between' as const,
  },
  historyItemChannelText: {
    color: CommonColors.white,
    fontSize: moderateScale(12),
    fontFamily: FontFamily.PublicSans_Regular,
  },
  deleteIcon: {
    width: 12,
    height: 12,
  },
  deleteButton: {
    padding: scale(20),
    borderRadius: moderateScale(20),
    // borderWidth: 2,
    borderColor: 'transparent',
  },
  deleteButtonFocused: {
    backgroundColor: CommonColors.white,
    borderColor: CommonColors.white,
  },
  dateHeader: {
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(15),
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: verticalScale(10),
  },
  dateHeaderText: {
    color: CommonColors.whiteOpacity50,
    fontSize: moderateScale(18),
    fontFamily: FontFamily.PublicSans_Bold,
    fontWeight: 'bold' as const,
  },
  selectedItemDetails: {
    flex: 1,
  },
  selectedItemTitle: {
    color: CommonColors.white,
    fontSize: moderateScale(24),
    fontFamily: FontFamily.PublicSans_Bold,
    marginBottom: verticalScale(20),
  },
  selectedItemTimeContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: verticalScale(25),
  },
  selectedItemTime: {
    color: CommonColors.whiteOpacity50,
    fontSize: moderateScale(16),
    fontFamily: FontFamily.PublicSans_Regular,
    flex: 1,
  },
  selectedRecordIcon: {
    width: scale(20),
    height: scale(20),
    marginLeft: scale(8),
  },
  selectedItemDescription: {
    color: CommonColors.whiteOpacity50,
    fontSize: moderateScale(16),
    fontFamily: FontFamily.PublicSans_Regular,
    lineHeight: moderateScale(24),
  },
  noSelectionContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  noSelectionText: {
    color: CommonColors.textGrey,
    fontSize: moderateScale(16),
    fontFamily: FontFamily.PublicSans_Regular,
  },
  footer: {
    paddingHorizontal: scale(60),
    paddingBottom: verticalScale(40),
    alignItems: 'flex-end' as const,
  },
  footerText: {
    color: CommonColors.white,
    fontSize: moderateScale(14),
    fontFamily: FontFamily.PublicSans_Regular,
  },
};

export default HistoryModal;
