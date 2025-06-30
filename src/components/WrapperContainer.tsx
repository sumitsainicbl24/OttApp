import React, { ReactNode } from 'react'
import { View, ViewStyle, StyleSheet } from 'react-native'
import { CommonColors } from '../styles/Colors'

interface WrapperContainerProps {
  children: ReactNode
  containerStyle?: ViewStyle
}

const WrapperContainer: React.FC<WrapperContainerProps> = ({
  children,
  containerStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
        {children}
    </View>
  )
}

export default WrapperContainer

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CommonColors.themeMain,
    justifyContent: 'center',
    alignItems: 'center',
  },
}) 