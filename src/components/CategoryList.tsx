import { FlashList, FlashListRef } from '@shopify/flash-list';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  TVFocusGuideView,
  ViewStyle,
} from 'react-native';
import FontFamily from '../constants/FontFamily';
import { samepleCategoryData } from '../screens/main/Movies/DummyData';
import { CommonColors } from '../styles/Colors';
import { moderateScale, scale, verticalScale } from '../styles/scaling';
import SimpleMarquee from './MarqueeText';
import { debounce } from 'lodash';

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
  nextFocusRightRef?: React.RefObject<any>;
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
  nextFocusRightRef,
}) => {
  const flashListRef = useRef<FlashListRef<any>>(null);

  const itemRefs = useRef<{
    [key: number]: React.RefObject<React.ElementRef<
      typeof TouchableOpacity
    > | null>;
  }>({});

  const textRefs = useRef<{
    [key: number]: React.RefObject<React.ElementRef<typeof Text> | null>;
  }>({});

  const debouncedFn = debounce(
    (categoryId: string, categoryName: string, categoryItem: any) => {
      onFocus?.(Number(categoryId), categoryName, categoryItem);
    },
    800,
  );

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
      // Update text color when focused
      itemRefs.current[index]?.current?.setNativeProps({
        style: {
          backgroundColor: CommonColors.white,
          borderRadius: 12,
        },
      });

      textRefs.current[index]?.current?.setNativeProps({
        style: {
          color: CommonColors.black,
        },
      });
      debouncedFn(categoryId, categoryName, categoryItem?.channels || []);
    },
    [onFocus],
  );

  // Memoize blur handler
  const handleBlur = useCallback(
    (index: number) => {
      itemRefs.current[index]?.current?.setNativeProps({
        style: {
          backgroundColor: CommonColors.black,
          borderRadius: 12,
        },
      });

      // Reset color to original when blur
      textRefs.current[index]?.current?.setNativeProps({
        style: {
          color: CommonColors.textWhite,
        },
      });
      onBlur?.();
    },
    [onBlur],
  );

  // Memoize render item function
  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const categoryItem: any = item;
      if (!itemRefs.current[index]) {
        itemRefs.current[index] =
          React.createRef<React.ElementRef<typeof TouchableOpacity>>();
      }
      if (!textRefs.current[index]) {
        textRefs.current[index] =
          React.createRef<React.ElementRef<typeof Text>>();
      }

      return (
        <TouchableOpacity
          ref={itemRefs.current[index]}
          style={styles.categoryItem}
          onFocus={() =>
            handleFocus(
              index,
              categoryItem.category_id,
              categoryItem?.category_name,
              categoryItem,
            )
          }
          onBlur={() => handleBlur(index)}
          activeOpacity={1}
          nextFocusRight={nextFocusRightRef?.current || undefined}
        >
          <Text ref={textRefs.current[index]} style={styles.categoryText}>
            {categoryItem.category_name}
          </Text>
        </TouchableOpacity>
      );
    },
    [],
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
