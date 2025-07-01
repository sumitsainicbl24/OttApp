import React, { useState, useRef, useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { samepleCategoryData } from '../screens/main/Movies/DummyData'
import FontFamily from '../constants/FontFamily'
import { moderateScale, scale, verticalScale } from '../styles/scaling'
import { CommonActions } from '@react-navigation/native'
import { CommonColors } from '../styles/Colors'

interface CategoryListProps {
  categories?: string[]
  selectedCategory?: string
  onCategoryPress?: (category: string) => void
  onFocus?: (category: string) => void
}

const CategoryList: React.FC<CategoryListProps> = ({ 
  categories, 
  selectedCategory, 
  onCategoryPress, 
  onFocus 
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const flashListRef = useRef<FlashList<string>>(null)
  
  
  // Use provided categories or fallback to sample data
  const categoryData = categories && categories.length > 0 ? categories : samepleCategoryData

  const handleCategoryPress = (category: string, index: number) => {
    setFocusedIndex(index)
    onCategoryPress?.(category)
    
    // Center the pressed item
    if (flashListRef.current) {
      flashListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5, // 0.5 centers the item
      })
    }
  }

  const handleFocus = (index: number, category: string) => {
    setFocusedIndex(index)
    onFocus?.(category)
    
    // Center the focused item
    if (flashListRef.current) {
      flashListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5, // 0.5 centers the item
      })
    }
  }

  return (

    <View style={styles.container}>

<FlashList
      ref={flashListRef}
      data={categoryData}
      showsVerticalScrollIndicator={false}
      estimatedItemSize={moderateScale(50)}
      getItemType={() => 'category'}
      contentContainerStyle={{ padding: 0 }}
      extraData={focusedIndex}
      // style={{ width: '100%' }}
      renderItem={({ item, index }) => 
      {
        const isSelected = selectedCategory === item
        const isFocused = focusedIndex === index
        return (
          <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryItem,
                    (isFocused || isSelected) && styles.categoryItemFocused
                  ]}
                  onPress={() => handleCategoryPress(item, index)}
                  onFocus={() =>{ 
                    handleFocus(index, item)
                    handleCategoryPress(item, index)
                  }}
                  onBlur={() => setFocusedIndex(null)}
                  activeOpacity={1}
                >
                  <Text
                  numberOfLines={1}
                  ellipsizeMode='tail'
                  style={[
                    styles.categoryText,
                    (isFocused || isSelected) && styles.categoryTextFocused
                  ]}>
                    {item}
                  </Text>
          </TouchableOpacity>
        )
      }
      }
      keyExtractor={(item, index) => item}
    />

    </View>
  )
}

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
})

export default CategoryList 