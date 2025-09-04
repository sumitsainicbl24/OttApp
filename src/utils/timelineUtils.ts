/**
 * Timeline utilities for EPG program positioning and time calculations
 */

import {EPGProgram} from './epgUtils';

export interface TimelineSlot {
  startTime: number;
  endTime: number;
  displayTime: string;
  width: number;
}

export interface ProgramPosition {
  program: EPGProgram;
  startTime: number;
  endTime: number;
  duration: number;
  left: number;
  width: number;
  title: string;
  row?: number; // For stacking overlapping programs
}

export interface TimelineConfig {
  slotDurationMinutes: number;
  totalSlots: number;
  slotWidth: number;
  currentTime: number;
  scrollOffset?: number; // Offset in minutes from current time
}

/**
 * Creates timeline slots starting from current time
 */
export const createTimelineSlots = (config: TimelineConfig): TimelineSlot[] => {
  const { slotDurationMinutes, totalSlots, slotWidth, currentTime, scrollOffset = 0 } = config;
  
  const slots: TimelineSlot[] = [];
  const slotDurationSeconds = slotDurationMinutes * 60;
  
  // Start from current time, rounded down to nearest slot (convert to seconds)
  const currentTimeSeconds = Math.floor(currentTime / 1000);
  const baseStartTime = Math.floor(currentTimeSeconds / slotDurationSeconds) * slotDurationSeconds;
  
  // Apply scroll offset (in minutes, convert to seconds)
  const scrollOffsetSeconds = scrollOffset * 60;
  const startTime = baseStartTime + scrollOffsetSeconds;
  
  for (let i = 0; i < totalSlots; i++) {
    const slotStartTime = startTime + (i * slotDurationSeconds);
    const slotEndTime = slotStartTime + slotDurationSeconds;
    
    slots.push({
      startTime: slotStartTime,
      endTime: slotEndTime,
      displayTime: formatTime(slotStartTime * 1000), // Convert back to milliseconds for formatting
      width: slotWidth
    });
  }
  
  return slots;
};

/**
 * Calculates program positions within timeline slots with proper spacing
 */
export const calculateProgramPositions = (
  programs: EPGProgram[],
  timelineSlots: TimelineSlot[],
  slotWidth: number
): ProgramPosition[] => {
  if (!programs || programs.length === 0) {
    // Return "No Information" blocks for the entire timeline
    return generateNoInformationBlocks(timelineSlots, slotWidth);
  }
  
  const positions: ProgramPosition[] = [];
  const timelineStart = timelineSlots[0]?.startTime || 0;
  const timelineEnd = timelineSlots[timelineSlots.length - 1]?.endTime || 0;
  const totalTimelineWidth = slotWidth * timelineSlots.length;
  
  // Sort programs by start time
  const sortedPrograms = [...programs].sort((a, b) => 
    parseInt(a.start_timestamp) - parseInt(b.start_timestamp)
  );
  
  for (const program of sortedPrograms) {
    const startTime = parseInt(program.start_timestamp); // Use timestamp directly (seconds)
    const endTime = parseInt(program.stop_timestamp);
    
    // Skip programs that are completely outside the timeline
    if (endTime <= timelineStart || startTime >= timelineEnd) {
      continue;
    }
    
    // Calculate the actual time range within the timeline
    const actualStart = Math.max(startTime, timelineStart);
    const actualEnd = Math.min(endTime, timelineEnd);
    
    // Calculate position as percentage of timeline
    const startPercentage = (actualStart - timelineStart) / (timelineEnd - timelineStart);
    const endPercentage = (actualEnd - timelineStart) / (timelineEnd - timelineStart);
    
    // Convert to pixel positions
    const left = startPercentage * totalTimelineWidth;
    const right = endPercentage * totalTimelineWidth;
    const width = right - left;
    
    // Calculate minimum width based on program duration
    const programDurationMinutes = (endTime - startTime) / 60; // Convert seconds to minutes
    let minWidth = 20; // Base minimum width for very short programs
    
    // Increase minimum width for longer programs to ensure title visibility
    if (programDurationMinutes >= 60) {
      minWidth = 120; // 1+ hour programs need more space
    } else if (programDurationMinutes >= 30) {
      minWidth = 80; // 30+ minute programs
    } else if (programDurationMinutes >= 20) {
      minWidth = 60; // 20+ minute programs (will show title)
    } else if (programDurationMinutes >= 10) {
      minWidth = 40; // 10+ minute programs (no title)
    } else {
      minWidth = 20; // Very short programs (no title, minimal width)
    }
    
    const finalWidth = Math.max(width, minWidth);
    
    // Add small margin to prevent exact overlapping
    const margin = 1;
    
    positions.push({
      program,
      startTime,
      endTime,
      duration: endTime - startTime,
      left: Math.max(0, left + margin),
      width: Math.max(finalWidth - margin * 2, minWidth),
      title: decodeEPGTitle(program.title)
    });
  }
  
  // Sort positions by start time to ensure proper ordering
  const sortedPositions = positions.sort((a, b) => a.startTime - b.startTime);
  
  // Fill gaps with "No Information" blocks
  return fillTimelineGaps(sortedPositions, timelineSlots, slotWidth);
};

/**
 * Generates "No Information" blocks for the entire timeline when no EPG data is available
 */
const generateNoInformationBlocks = (
  timelineSlots: TimelineSlot[],
  slotWidth: number
): ProgramPosition[] => {
  const positions: ProgramPosition[] = [];
  const timelineStart = timelineSlots[0]?.startTime || 0;
  const timelineEnd = timelineSlots[timelineSlots.length - 1]?.endTime || 0;
  const totalTimelineWidth = slotWidth * timelineSlots.length;
  
  // Create a single "No Information" block spanning the entire timeline
  positions.push({
    program: {
      id: 'no-info',
      epg_id: 'no-info',
      title: 'No Information',
      lang: 'en',
      start: new Date(timelineStart * 1000).toISOString(),
      end: new Date(timelineEnd * 1000).toISOString(),
      description: 'No program information available',
      channel_id: 'unknown',
      start_timestamp: timelineStart.toString(),
      stop_timestamp: timelineEnd.toString(),
      now_playing: 0,
      has_archive: 0
    },
    startTime: timelineStart,
    endTime: timelineEnd,
    duration: timelineEnd - timelineStart,
    left: 0,
    width: totalTimelineWidth,
    title: 'No Information'
  });
  
  return positions;
};

/**
 * Fills gaps in the timeline with "No Information" blocks
 */
const fillTimelineGaps = (
  positions: ProgramPosition[],
  timelineSlots: TimelineSlot[],
  slotWidth: number
): ProgramPosition[] => {
  if (positions.length === 0) {
    return generateNoInformationBlocks(timelineSlots, slotWidth);
  }
  
  const timelineStart = timelineSlots[0]?.startTime || 0;
  const timelineEnd = timelineSlots[timelineSlots.length - 1]?.endTime || 0;
  const totalTimelineWidth = slotWidth * timelineSlots.length;
  const filledPositions: ProgramPosition[] = [];
  
  // Add gap before first program if needed
  if (positions[0].startTime > timelineStart) {
    const gapEnd = positions[0].startTime;
    const gapStartPercentage = 0;
    const gapEndPercentage = (gapEnd - timelineStart) / (timelineEnd - timelineStart);
    const gapLeft = gapStartPercentage * totalTimelineWidth;
    const gapWidth = (gapEndPercentage - gapStartPercentage) * totalTimelineWidth;
    
    filledPositions.push({
      program: {
        id: 'no-info-start',
        epg_id: 'no-info-start',
        title: 'No Information',
        lang: 'en',
        start: new Date(timelineStart * 1000).toISOString(),
        end: new Date(gapEnd * 1000).toISOString(),
        description: 'No program information available',
        channel_id: 'unknown',
        start_timestamp: timelineStart.toString(),
        stop_timestamp: gapEnd.toString(),
        now_playing: 0,
        has_archive: 0
      },
      startTime: timelineStart,
      endTime: gapEnd,
      duration: gapEnd - timelineStart,
      left: gapLeft,
      width: gapWidth,
      title: 'No Information'
    });
  }
  
  // Add all existing programs
  filledPositions.push(...positions);
  
  // Add gaps between programs
  for (let i = 0; i < positions.length - 1; i++) {
    const currentEnd = positions[i].endTime;
    const nextStart = positions[i + 1].startTime;
    
    if (nextStart > currentEnd) {
      // There's a gap between programs
      const gapStartPercentage = (currentEnd - timelineStart) / (timelineEnd - timelineStart);
      const gapEndPercentage = (nextStart - timelineStart) / (timelineEnd - timelineStart);
      const gapLeft = gapStartPercentage * totalTimelineWidth;
      const gapWidth = (gapEndPercentage - gapStartPercentage) * totalTimelineWidth;
      
      filledPositions.push({
        program: {
          id: `no-info-gap-${i}`,
          epg_id: `no-info-gap-${i}`,
          title: 'No Information',
          lang: 'en',
          start: new Date(currentEnd * 1000).toISOString(),
          end: new Date(nextStart * 1000).toISOString(),
          description: 'No program information available',
          channel_id: 'unknown',
          start_timestamp: currentEnd.toString(),
          stop_timestamp: nextStart.toString(),
          now_playing: 0,
          has_archive: 0
        },
        startTime: currentEnd,
        endTime: nextStart,
        duration: nextStart - currentEnd,
        left: gapLeft,
        width: gapWidth,
        title: 'No Information'
      });
    }
  }
  
  // Add gap after last program if needed
  const lastProgram = positions[positions.length - 1];
  if (lastProgram.endTime < timelineEnd) {
    const gapStart = lastProgram.endTime;
    const gapStartPercentage = (gapStart - timelineStart) / (timelineEnd - timelineStart);
    const gapEndPercentage = 1;
    const gapLeft = gapStartPercentage * totalTimelineWidth;
    const gapWidth = (gapEndPercentage - gapStartPercentage) * totalTimelineWidth;
    
    filledPositions.push({
      program: {
        id: 'no-info-end',
        epg_id: 'no-info-end',
        title: 'No Information',
        lang: 'en',
        start: new Date(gapStart * 1000).toISOString(),
        end: new Date(timelineEnd * 1000).toISOString(),
        description: 'No program information available',
        channel_id: 'unknown',
        start_timestamp: gapStart.toString(),
        stop_timestamp: timelineEnd.toString(),
        now_playing: 0,
        has_archive: 0
      },
      startTime: gapStart,
      endTime: timelineEnd,
      duration: timelineEnd - gapStart,
      left: gapLeft,
      width: gapWidth,
      title: 'No Information'
    });
  }
  
  return filledPositions.sort((a, b) => a.startTime - b.startTime);
};

/**
 * Filters out overlapping programs - only keeps the first program in each time slot
 */
const filterOverlappingPrograms = (positions: ProgramPosition[]): ProgramPosition[] => {
  const nonOverlappingPrograms: ProgramPosition[] = [];
  
  for (const position of positions) {
    let hasOverlap = false;
    
    // Check if this program overlaps with any already selected program
    for (const existingProgram of nonOverlappingPrograms) {
      // Check for overlap: programs overlap if one starts before the other ends
      if (!(position.endTime <= existingProgram.startTime || position.startTime >= existingProgram.endTime)) {
        hasOverlap = true;
        break;
      }
    }
    
    // Only add the program if it doesn't overlap with any existing program
    if (!hasOverlap) {
      nonOverlappingPrograms.push(position);
    }
  }
  
  // Debug: Log filtered programs
  if (__DEV__) {
    const filteredCount = positions.length - nonOverlappingPrograms.length;
    if (filteredCount > 0) {
      console.log(`🔍 EPG Filter: Removed ${filteredCount} overlapping programs, showing ${nonOverlappingPrograms.length} programs`);
    }
  }
  
  return nonOverlappingPrograms;
};



/**
 * Gets current time position within timeline
 */
export const getCurrentTimePosition = (
  timelineSlots: TimelineSlot[],
  slotWidth: number
): number => {
  const now = Math.floor(Date.now() / 1000); // Convert to seconds
  const timelineStart = timelineSlots[0]?.startTime || 0;
  const timelineEnd = timelineSlots[timelineSlots.length - 1]?.endTime || 0;
  
  if (now < timelineStart || now > timelineEnd) {
    return -1; // Current time is outside timeline
  }
  
  return ((now - timelineStart) / (timelineEnd - timelineStart)) * (slotWidth * timelineSlots.length);
};

/**
 * Formats timestamp to display time
 */
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

/**
 * Decodes base64 encoded EPG title
 */
const decodeEPGTitle = (encodedTitle: string): string => {
  try {
    return atob(encodedTitle);
  } catch (error) {
    return encodedTitle;
  }
};

/**
 * Default timeline configuration
 */
export const DEFAULT_TIMELINE_CONFIG: TimelineConfig = {
  slotDurationMinutes: 30,
  totalSlots: 48, // 24 hours of timeline (48 slots of 30 minutes each)
  slotWidth: 200, // 200px per 30-minute slot
  currentTime: Date.now()
};

/**
 * Creates a timeline configuration for EPG display
 */
export const createTimelineConfig = (
  slotDurationMinutes: number = 30,
  totalSlots: number = 48, // Default to 24 hours (48 slots of 30 minutes each)
  slotWidth: number = 200
): TimelineConfig => {
  return {
    slotDurationMinutes,
    totalSlots,
    slotWidth,
    currentTime: Date.now()
  };
};
