import { ScrollView, StyleSheet } from 'react-native';
import React, { useState, useCallback } from 'react';
import { FlashList } from '@shopify/flash-list';
import ChannelRow from './ChannelRow';

const ChannelEpgCarousal = ({
  ChannelsWithEpg,
  onFocus,
}: {
  ChannelsWithEpg: any[];
  onFocus: () => void;
}) => {
  const [focusedId, setFocusedId] = useState(ChannelsWithEpg?.[0]?.stream_id);

  const handleChannelFocus = useCallback((streamId: string) => {
    onFocus?.();
    setFocusedId(streamId);
  }, [onFocus]);

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const isFocused = focusedId === item.stream_id;
      return (
        <ChannelRow
          item={item}
          index={index}
          isFocused={isFocused}
          onFocus={handleChannelFocus}
        />
      );
    },
    [focusedId, handleChannelFocus],
  );

  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      contentContainerStyle={styles.contentContainerStyle}
    >
      <FlashList
        data={ChannelsWithEpg}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.ListContentContainerStyle}
      />
    </ScrollView>
  );
};

export default ChannelEpgCarousal;

const styles = StyleSheet.create({
  contentContainerStyle: {
    width: 4800,
  },
  ListContentContainerStyle: {
    backgroundColor: 'black',
    borderWidth: 2,
  },
});
