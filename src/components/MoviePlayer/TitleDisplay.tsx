import React from 'react';
import {Text, StyleSheet} from 'react-native';
import {moderateScale} from '../../styles/scaling';
import FontFamily from '../../constants/FontFamily';
import {CommonColors} from '../../styles/Colors';

interface TitleDisplayProps {
  title: string;
}

const TitleDisplay: React.FC<TitleDisplayProps> = ({title}) => {
  return <Text numberOfLines={1} style={styles.title}>{title}</Text>;
};

const styles = StyleSheet.create({
  title: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(34),
    color: '#E4E4E4',
    lineHeight: moderateScale(34),
    flex: 1,
  },
});

export default TitleDisplay;
