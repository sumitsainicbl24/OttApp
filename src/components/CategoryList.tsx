import React, {useState, useRef, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {samepleCategoryData} from '../screens/main/Movies/DummyData';
import FontFamily from '../constants/FontFamily';
import {moderateScale, scale, verticalScale} from '../styles/scaling';
import {CommonActions} from '@react-navigation/native';
import {CommonColors} from '../styles/Colors';
import SimpleMarquee from './MarqueeText';

interface CategoryListProps {
  categories?: string[];
  selectedCategory?: string;
  onFocus?: (category: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategory,
  onFocus,
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [containerHeight, setContainerHeight] = useState(400);
  const flashListRef = useRef<FlashList<string>>(null);

  // Use provided categories or fallback to sample data
  const categoryData =
    categories && categories.length > 0 ? categories : samepleCategoryData;

  console.log(
    categoryData,
    'categoryDatacategoryDatacategoryDatacategoryData',
    categories,
  );

  // Create a modified data array with padding items to center the selected item
  const getModifiedData = () => {
    if (!selectedCategory || categoryData.length === 0) return categoryData;

    const selectedIndex = categoryData.findIndex(
      item => item === selectedCategory,
    );
    if (selectedIndex === -1) return categoryData;

    const itemHeight = moderateScale(50);
    const halfContainerHeight = containerHeight / 2;

    // Calculate how many placeholder items we need to center the selected item
    const itemsAbove = Math.floor(halfContainerHeight / itemHeight);
    const itemsBelow = Math.floor(halfContainerHeight / itemHeight);

    // Create padding arrays
    const paddingAbove = Array(itemsAbove)
      .fill('')
      .map((_, index) => `padding_above_${index}`);
    const paddingBelow = Array(itemsBelow)
      .fill('', Math.max(0, itemsBelow - (categoryData.length - selectedIndex)))
      .map((_, index) => `padding_below_${index}`);

    console.log('Modified data calculation:', {
      selectedIndex,
      selectedCategory,
      itemsAbove,
      itemsBelow,
      paddingAbove: paddingAbove.length,
      paddingBelow: paddingBelow.length,
      originalLength: categoryData.length,
      containerHeight,
      itemHeight,
      halfContainerHeight,
    });

    const result = [...paddingAbove, ...categoryData, ...paddingBelow];
    console.log('Final modified data length:', result.length);
    return result;
  };

  const modifiedData = getModifiedData();

  // Log when modified data changes

  // Auto-scroll to selected category when it changes
  useEffect(() => {
    if (selectedCategory && flashListRef.current) {
      const selectedIndex = categoryData.findIndex(
        item => item === selectedCategory,
      );
      if (selectedIndex !== -1) {
        // Calculate the index in the modified data
        const itemHeight = moderateScale(50);
        const itemsAbove = Math.floor(containerHeight / 2 / itemHeight);
        const modifiedIndex = itemsAbove + selectedIndex;

        console.log('Scrolling to modified index:', {
          selectedIndex,
          modifiedIndex,
          itemsAbove,
          containerHeight,
        });

        // Use setTimeout to ensure the list has rendered
        setTimeout(() => {
          try {
            flashListRef.current?.scrollToIndex({
              index: modifiedIndex,
              animated: true,
              viewPosition: 0.6, // Center the item
            });
          } catch (error) {
            // Fallback to scrollToOffset if scrollToIndex fails
            const offset =
              modifiedIndex * itemHeight - containerHeight / 2 + itemHeight / 2;
            flashListRef.current?.scrollToOffset({
              offset: Math.max(0, offset),
              animated: true,
            });
          }
        }, 100);
      }
    }
  }, [selectedCategory, categoryData, containerHeight]);

  const handleFocus = (index: number, category: string) => {
    setFocusedIndex(index);
    onFocus?.(category);

    // Center the focused item
    if (flashListRef.current) {
      // Calculate the index in the modified data
      const itemHeight = moderateScale(50);
      const itemsAbove = Math.floor(containerHeight / 2 / itemHeight);
      const modifiedIndex = itemsAbove + index;

      try {
        flashListRef.current.scrollToIndex({
          index: modifiedIndex,
          animated: true,
          viewPosition: 0.6, // Center the item
        });
      } catch (error) {
        // Fallback to scrollToOffset if scrollToIndex fails
        const offset =
          modifiedIndex * itemHeight - containerHeight / 2 + itemHeight / 2;
        flashListRef.current.scrollToOffset({
          offset: Math.max(0, offset),
          animated: true,
        });
      }
    }
  };

  const gettingIndexForSelectedCategory = () => {
    const index = categoryData.findIndex(item => item === selectedCategory);
    console.log('index', index);
    return index;
  };

  return (
    <View
      style={styles.container}
      onLayout={event => {
        const {height} = event.nativeEvent.layout;
        console.log('Container layout changed:', {height, containerHeight});
        setContainerHeight(height);
      }}>
      <FlashList
        ref={flashListRef}
        data={modifiedData}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={moderateScale(50)}
        getItemType={() => 'category'}
        contentContainerStyle={{
          padding: 0,
          paddingTop: moderateScale(10), // Added paddingTop here as it's not handled by modifiedData
          paddingBottom: moderateScale(10), // Added paddingBottom here as it's not handled by modifiedData
        }}
        extraData={focusedIndex}
        // style={{ width: '100%' }}
        renderItem={({item, index}) => {
          // Skip rendering padding items
          if (item.startsWith('padding_')) {
            return (
              <View
                key={index}
                style={{
                  height: moderateScale(50),
                  width: '100%',
                }}
              />
            );
          }

          // Find the actual index in the original data
          const actualIndex = categoryData.findIndex(cat => cat === item);
          const isSelected = selectedCategory === item;
          const isFocused = focusedIndex === actualIndex;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryItem,
                (isFocused || isSelected) && styles.categoryItemFocused,
              ]}
              onFocus={() => {
                console.log('indexindexindex', actualIndex, item);
                handleFocus(actualIndex, item);
              }}
              onBlur={() => setFocusedIndex(null)}
              activeOpacity={1}>
              <SimpleMarquee
                text={item}
                textStyle={[
                  styles.categoryText,
                  (isFocused || isSelected) && styles.categoryTextFocused,
                ]}
                shouldStart={isFocused || isSelected}
              />
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item, index) => item}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: moderateScale(25),
    width: scale(450),
  },
  categoryItem: {
    paddingVertical: moderateScale(15),
    marginVertical: verticalScale(5),
    paddingHorizontal: moderateScale(10),
    backgroundColor: 'transparent',
    alignItems: 'flex-start',
  },
  categoryItemFocused: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  categoryText: {
    fontFamily: FontFamily.PublicSans_SemiBold,
    fontSize: scale(28),
    color: CommonColors.textWhite,
    textAlign: 'left',
  },
  categoryTextFocused: {
    color: CommonColors.themeMain,
  },
});

export default React.memo(CategoryList);
