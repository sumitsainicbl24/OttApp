import React, {useState, useRef, useMemo, useEffect, useCallback} from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {samepleCategoryData} from '../screens/main/Movies/DummyData';
import FontFamily from '../constants/FontFamily';
import {moderateScale, scale, verticalScale} from '../styles/scaling';
import {CommonColors} from '../styles/Colors';
import SimpleMarquee from './MarqueeText';

type ObjectCategory = {
  category_id: string | number;
  category_name: string;
  parent_id?: string | number;
  [key: string]: any;
};

type CategoryInput = string | ObjectCategory;

interface CategoryListProps {
  categories?: CategoryInput[];
  selectedCategory?: CategoryInput;
  onFocus?: (category: number) => void;
}

type NormalizedCategory = {
  id: string;
  name: string;
  raw: CategoryInput;
};

type ListItem =
  | {type: 'padding'; key: string; height: number}
  | {type: 'category'; data: NormalizedCategory};

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategory,
  onFocus,
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [containerHeight, setContainerHeight] = useState(400);
  const flashListRef = useRef<FlashList<any>>(null);

  // Memoize utility functions
  const isObjectCategory = useCallback(
    (item: CategoryInput): item is ObjectCategory => {
      return (
        typeof item === 'object' &&
        item !== null &&
        'category_name' in (item as any)
      );
    },
    [],
  );

  const getCategoryName = useCallback(
    (item: CategoryInput): string => {
      return isObjectCategory(item) ? item.category_name : (item as string);
    },
    [isObjectCategory],
  );

  const getCategoryId = useCallback(
    (item: CategoryInput): string => {
      return isObjectCategory(item)
        ? String(item.category_id)
        : getCategoryName(item);
    },
    [isObjectCategory, getCategoryName],
  );

  // Memoize category data processing
  const categoryData: CategoryInput[] = useMemo(() => {
    return categories && categories.length > 0
      ? categories
      : (samepleCategoryData as unknown as CategoryInput[]);
  }, [categories]);

  const normalizedData: NormalizedCategory[] = useMemo(() => {
    return (categoryData || []).map(item => ({
      id: getCategoryId(item),
      name: getCategoryName(item),
      raw: item,
    }));
  }, [categoryData, getCategoryId, getCategoryName]);

  // Create data with padding items for better focus management

  // Memoize constants to avoid recalculation
  const ITEM_HEIGHT = moderateScale(50);
  const PADDING_ITEMS = 7;

  const listData: ListItem[] = useMemo(() => {
    if (!normalizedData || normalizedData.length === 0) return [];
    const topPadding: ListItem[] = Array(PADDING_ITEMS)
      .fill(null)
      .map((_, index) => ({
        type: 'padding',
        key: `top_padding_${index}`,
        height: ITEM_HEIGHT,
      }));

    // Create padding items for bottom
    const bottomPadding: ListItem[] = Array(PADDING_ITEMS)
      .fill(null)
      .map((_, index) => ({
        type: 'padding',
        key: `bottom_padding_${index}`,
        height: ITEM_HEIGHT,
      }));

    // Create category items
    const categoryItems: ListItem[] = normalizedData.map(cat => ({
      type: 'category',
      data: cat,
    }));

    return [...topPadding, ...categoryItems, ...bottomPadding];
  }, [normalizedData]);

  // Memoize selected category ID
  const selectedCategoryId = useMemo(() => {
    if (!selectedCategory) return undefined;
    return isObjectCategory(selectedCategory)
      ? String(selectedCategory.category_id)
      : String(selectedCategory);
  }, [selectedCategory, isObjectCategory]);

  // Memoize selected index in the original data
  const selectedIndex = useMemo(() => {
    if (!selectedCategoryId) return -1;
    return normalizedData.findIndex(cat => cat.id === selectedCategoryId);
  }, [selectedCategoryId, normalizedData]);

  // Calculate the actual index in the list with padding
  const selectedIndexWithPadding = useMemo(() => {
    if (selectedIndex === -1) return -1;
    return selectedIndex + PADDING_ITEMS; // PADDING_ITEMS on top
  }, [selectedIndex]);

  // Memoize scroll handler
  const scrollToIndex = useCallback(
    (index: number) => {
      if (!flashListRef.current) return;

      try {
        flashListRef.current.scrollToIndex({
          index: index,
          animated: true,
          viewPosition: 0.6,
        });
      } catch (error) {
        // Fallback to scrollToOffset if scrollToIndex fails
        const offset =
          index * ITEM_HEIGHT - containerHeight / 2 + ITEM_HEIGHT / 2;
        flashListRef.current.scrollToOffset({
          offset: Math.max(0, offset),
          animated: true,
        });
      }
    },
    [containerHeight],
  );

  // Auto-scroll to selected category when it changes
  useEffect(() => {
    if (selectedIndexWithPadding !== -1) {
      const timeoutId = setTimeout(() => {
        scrollToIndex(selectedIndexWithPadding);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedIndexWithPadding, scrollToIndex]);

  // Memoize focus handler
  const handleFocus = useCallback(
    (index: number, categoryId: string) => {
      // Convert the index from the padded list back to the original index
      const originalIndex = index - PADDING_ITEMS; // Remove the top padding offset
      setFocusedIndex(originalIndex);
      onFocus?.(Number(categoryId));
      scrollToIndex(index);
    },
    [onFocus, scrollToIndex],
  );

  // Memoize blur handler
  const handleBlur = useCallback(() => {
    setFocusedIndex(null);
  }, []);

  // Memoize layout handler
  const handleLayout = useCallback((event: any) => {
    const {height} = event.nativeEvent.layout;
    setContainerHeight(height);
  }, []);

  // Memoize render item function
  const renderItem = useCallback(
    ({item, index}: {item: ListItem; index: number}) => {
      if (item.type === 'padding') {
        return (
          <View
            style={{
              height: item.height,
              width: '100%',
            }}
          />
        );
      }

      const categoryItem = item.data;
      const isSelected = categoryItem.id === selectedCategoryId;
      const isFocused = focusedIndex === index - PADDING_ITEMS; // Adjust for padding offset

      return (
        <TouchableOpacity
          style={[
            styles.categoryItem,
            (isFocused || isSelected) && styles.categoryItemFocused,
          ]}
          onFocus={() => handleFocus(index, categoryItem.id)}
          onBlur={handleBlur}
          activeOpacity={1}>
          <SimpleMarquee
            text={categoryItem.name}
            textStyle={[
              styles.categoryText,
              (isFocused || isSelected) && styles.categoryTextFocused,
            ]}
            shouldStart={Boolean(isFocused || isSelected)}
          />
        </TouchableOpacity>
      );
    },
    [selectedCategoryId, focusedIndex, handleFocus, handleBlur],
  );

  // Memoize key extractor
  const keyExtractor = useCallback((item: ListItem) => {
    if (item.type === 'padding') {
      return item.key;
    }
    return `cat_${item.data.id}`;
  }, []);

  // Memoize content container style
  const contentContainerStyle = useMemo(
    () => ({
      paddingVertical: moderateScale(10),
    }),
    [],
  );

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <FlashList
        ref={flashListRef}
        data={listData}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={ITEM_HEIGHT}
        contentContainerStyle={contentContainerStyle}
        extraData={focusedIndex}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        removeClippedSubviews={true}
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
