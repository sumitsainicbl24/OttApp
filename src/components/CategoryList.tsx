import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TVFocusGuideView,
} from 'react-native';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { samepleCategoryData } from '../screens/main/Movies/DummyData';
import FontFamily from '../constants/FontFamily';
import { moderateScale, scale, verticalScale } from '../styles/scaling';
import { CommonColors } from '../styles/Colors';
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
  selectedCategory?: string;
  onFocus?: (category: number, categoryName: string, categoryItem: any) => void;
  onBlur?: () => void;
  style?: StyleProp<ViewStyle>;
}

type NormalizedCategory = {
  id: string;
  name: string;
  raw: CategoryInput;
};

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategory,
  onFocus,
  onBlur,
  style,
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const flashListRef = useRef<FlashListRef<any>>(null);

  console.log('selectedCategory-->>>>>>>', selectedCategory);

  // Memoize category data processing
  const categoryData: CategoryInput[] = useMemo(() => {
    return categories && categories.length > 0
      ? categories
      : (samepleCategoryData as unknown as CategoryInput[]);
  }, [categories]);

  // Memoize selected category ID

  const handleFocus = useCallback(
    (
      index: number,
      categoryId: string,
      categoryName: string,
      categoryItem: any,
    ) => {
      setFocusedIndex(index);
      onFocus?.(Number(categoryId), categoryName, categoryItem?.channels || []);
    },
    [onFocus],
  );

  // Memoize blur handler
  const handleBlur = useCallback(() => {
    setFocusedIndex(null);
    onBlur?.();
  }, []);

  // Memoize layout handler

  // Memoize render item function
  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const categoryItem: any = item;
      const isSelected = categoryItem.category_id === selectedCategory;
      const isFocused = focusedIndex === index;

      return (
        <TouchableOpacity
          style={[
            styles.categoryItem,
            (isFocused || isSelected) && styles.categoryItemFocused,
          ]}
          onFocus={() =>
            handleFocus(
              index,
              categoryItem.category_id,
              categoryItem?.category_name,
              categoryItem,
            )
          }
          onBlur={handleBlur}
          activeOpacity={1}
        >
          <SimpleMarquee
            text={categoryItem.category_name}
            textStyle={[
              styles.categoryText,
              (isFocused || isSelected) && styles.categoryTextFocused,
            ]}
            shouldStart={Boolean(isFocused || isSelected)}
          />
        </TouchableOpacity>
      );
    },
    [focusedIndex, handleFocus, handleBlur],
  );

  return (
    <TVFocusGuideView autoFocus style={[styles.container, style]}>
      <FlashList
        ref={flashListRef}
        data={categoryData}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainerStyle}
        renderItem={renderItem}
        removeClippedSubviews={false}
      />
    </TVFocusGuideView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: moderateScale(25),
    width: scale(450),
    borderRightWidth: 1.5,
    borderRightColor: CommonColors.whiteOpacity20,
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
  contentContainerStyle: {
    paddingVertical: moderateScale(10),
  },
});

export default React.memo(CategoryList);
