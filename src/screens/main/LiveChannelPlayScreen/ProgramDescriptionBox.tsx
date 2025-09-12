import React, {memo} from 'react';
import {Text, View} from 'react-native';
import {styles} from './LeftChannelViewStyles';

export interface Epg {
  id: string;
  epg_id: string;
  title: string;
  lang: string;
  start: string;
  end: string;
  description: string;
  channel_id: string;
  start_timestamp: string;
  stop_timestamp: string;
  now_playing: number;
  has_archive: number;
}

interface ProgramDescriptionBoxProps {
  program: Epg | null;
  channelName: string;
  channelLogo?: string;
  visible: boolean;
}

// Helper function to format time
const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Helper function to calculate duration
const calculateDuration = (start: string, end: string): string => {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationMinutes = Math.round(durationMs / (1000 * 60));
  
  if (durationMinutes < 60) {
    return `${durationMinutes} min`;
  } else {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
};

// Helper function to decode base64 text
const decodeText = (encodedText: string): string => {
  try {
    if (encodedText && /^[A-Za-z0-9+/=]+$/.test(encodedText)) {
      return atob(encodedText);
    }
    return encodedText;
  } catch (error) {
    return encodedText;
  }
};

const ProgramDescriptionBox = memo<ProgramDescriptionBoxProps>(
  ({program, channelName, channelLogo, visible}) => {
    if (!visible || !program) {
      return null;
    }

    const startTime = formatTime(program.start);
    const endTime = formatTime(program.end);
    const duration = calculateDuration(program.start, program.end);
    const decodedTitle = decodeText(program.title);
    const decodedDescription = decodeText(program.description);
    const decodedChannelName = decodeText(channelName);

    return (
      <View style={styles.programDescriptionBox}>
        <View style={styles.programDescriptionHeader}>
          <Text style={styles.programDescriptionTitle} numberOfLines={2}>
            {decodedTitle}
          </Text>

        </View>
        
        <View style={styles.programDescriptionTimeContainer}>
          <Text style={styles.programDescriptionTime}>
            {startTime} - {endTime}
          </Text>
          <Text style={styles.programDescriptionDuration}>
            {duration}
          </Text>
        </View>
        
        <Text style={styles.programDescriptionText} numberOfLines={4}>
          {decodedDescription || 'No description available'}
        </Text>
      </View>
    );
  },
);

ProgramDescriptionBox.displayName = 'ProgramDescriptionBox';

export default ProgramDescriptionBox;
