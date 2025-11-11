import React from 'react';
import {Text, StyleSheet} from 'react-native';
import {moderateScale} from '../../styles/scaling';
import FontFamily from '../../constants/FontFamily';
import {CommonColors} from '../../styles/Colors';

interface TimeDisplayProps {
  dateTime?: string;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({
  dateTime,
}) => {
  const formatDateTime = (): string => {
    if (dateTime) {
      return dateTime;
    }
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${day} ${date} ${month} ${year} ${displayHours}:${displayMinutes} ${ampm}`;
  };

  return <Text style={styles.timeText}>{formatDateTime()}</Text>;
};

const styles = StyleSheet.create({
  timeText: {
    fontFamily: FontFamily.PublicSans_Regular,
    fontSize: moderateScale(24),
    color: '#E4E4E4',
    lineHeight: moderateScale(24),
  },
});

export default TimeDisplay;

