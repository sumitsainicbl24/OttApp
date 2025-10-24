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
 * Creates timeline slots with fixed 30-minute intervals
 * Timeline is anchored to the nearest 30-minute mark and adjusts based on scroll offset
 */
export const createTimelineSlots = (config: TimelineConfig): TimelineSlot[] => {
  const { slotDurationMinutes, totalSlots, slotWidth, currentTime, scrollOffset = 0 } = config;
  
  const slots: TimelineSlot[] = [];
  const slotDurationSeconds = slotDurationMinutes * 60;
  
  // Always start from the nearest 30-minute mark (e.g., 2:20 becomes 2:00, 2:45 becomes 2:30)
  const currentTimeSeconds = Math.floor(currentTime / 1000);
  const baseStartTime = Math.floor(currentTimeSeconds / slotDurationSeconds) * slotDurationSeconds;
  
  // Apply scroll offset (in minutes) to adjust the timeline
  const scrollOffsetSeconds = scrollOffset * 60;
  
  // Create timeline slots with scroll offset applied
  for (let i = 0; i < totalSlots; i++) {
    const slotStartTime = baseStartTime + (i * slotDurationSeconds) + scrollOffsetSeconds;
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
    
    // Use actual calculated width based on program duration for accurate timeline sync
    const finalWidth = width+2;
    
    // Don't add margin here as it will be handled by applyProgramSpacing
    positions.push({
      program,
      startTime,
      endTime,
      duration: endTime - startTime,
      left: Math.max(0, left),
      width: Math.max(finalWidth, 1), // Only ensure minimum 1px width for visibility
      title: decodeEPGTitle(program.title)
    });
  }
  
  // Sort positions by start time to ensure proper ordering
  const sortedPositions = positions.sort((a, b) => a.startTime - b.startTime);
  
  // Apply spacing adjustments to prevent overlaps
  const spacedPositions = applyProgramSpacing(sortedPositions, totalTimelineWidth);
  
  // Fill gaps with "No Information" blocks
  return fillTimelineGaps(spacedPositions, timelineSlots, slotWidth);
};

/**
 * Applies consistent spacing between programs to prevent overlaps
 * Uses different spacing for "No Information" cards vs normal EPG programs
 */
const applyProgramSpacing = (
  positions: ProgramPosition[],
  totalTimelineWidth: number
): ProgramPosition[] => {
  if (positions.length <= 1) return positions;
  
  const MIN_SPACING_NORMAL = 1; // Minimum 1px spacing between normal programs
  const MIN_SPACING_NO_INFO = 0; // No spacing between "No Information" cards
  const adjustedPositions: ProgramPosition[] = [];
  
  for (let i = 0; i < positions.length; i++) {
    const currentProgram = { ...positions[i] };
    
    if (i === 0) {
      // First program - no adjustment needed
      adjustedPositions.push(currentProgram);
    } else {
      const previousProgram = adjustedPositions[i - 1];
      const previousEnd = previousProgram.left + previousProgram.width;
      const currentStart = currentProgram.left;
      
      // Calculate the gap between previous program end and current program start
      const gap = currentStart - previousEnd;
      
      // Determine spacing based on program types
      let minSpacing = MIN_SPACING_NORMAL;
      const isCurrentNoInfo = currentProgram.title === 'No Information';
      const isPreviousNoInfo = previousProgram.title === 'No Information';
      
      // Use smaller spacing for "No Information" cards
      if (isCurrentNoInfo || isPreviousNoInfo) {
        minSpacing = MIN_SPACING_NO_INFO;
      }
      
      if (gap < minSpacing) {
        // If gap is too small, adjust current program position
        currentProgram.left = previousEnd + minSpacing;
        
        // Ensure the program doesn't exceed timeline width
        const maxLeft = totalTimelineWidth - currentProgram.width;
        if (currentProgram.left > maxLeft) {
          currentProgram.left = maxLeft;
          // Adjust width if necessary to fit
          if (currentProgram.left + currentProgram.width > totalTimelineWidth) {
            currentProgram.width = Math.max(20, totalTimelineWidth - currentProgram.left); // Ensure minimum width
          }
        }
      }
      
      // Final check to ensure program is within bounds
      if (currentProgram.left < 0) {
        currentProgram.left = 0;
      }
      if (currentProgram.left + currentProgram.width > totalTimelineWidth) {
        currentProgram.width = Math.max(20, totalTimelineWidth - currentProgram.left);
      }
      
      adjustedPositions.push(currentProgram);
    }
  }
  
  return adjustedPositions;
};

/**
 * Generates "No Information" blocks for the entire timeline when no EPG data is available
 * Creates blocks that match the 30-minute timeline slots
 */
const generateNoInformationBlocks = (
  timelineSlots: TimelineSlot[],
  slotWidth: number
): ProgramPosition[] => {
  const positions: ProgramPosition[] = [];
  
  // Create individual "No Information" blocks for each 30-minute slot
  timelineSlots.forEach((slot, index) => {
    const noInfoSpacing = 0; // No spacing between "No Information" cards
    const leftPosition = (index * slotWidth) + (index * noInfoSpacing);
    const adjustedWidth = slotWidth - noInfoSpacing;
    
    positions.push({
      program: {
        id: `no-info-slot-${index}`,
        epg_id: `no-info-slot-${index}`,
        title: 'No Information',
        lang: 'en',
        start: new Date(slot.startTime * 1000).toISOString(),
        end: new Date(slot.endTime * 1000).toISOString(),
        description: 'No program information available',
        channel_id: 'unknown',
        start_timestamp: slot.startTime.toString(),
        stop_timestamp: slot.endTime.toString(),
        now_playing: 0,
        has_archive: 0
      },
      startTime: slot.startTime,
      endTime: slot.endTime,
      duration: slot.endTime - slot.startTime,
      left: leftPosition,
      width: adjustedWidth, // Slightly smaller width to account for spacing
      title: 'No Information'
    });
  });
  
  return positions;
};

/**
 * Fills gaps in the timeline with "No Information" blocks of standard 30-minute width
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
  
  // Create "No Information" blocks for gaps, but limit their width to 30-minute slots
  const createNoInfoBlocks = (gapStart: number, gapEnd: number, baseId: string) => {
    const blocks: ProgramPosition[] = [];
    const slotDuration = 30 * 60; // 30 minutes in seconds
    
    let currentTime = gapStart;
    let blockIndex = 0;
    
    while (currentTime < gapEnd) {
      const blockEnd = Math.min(currentTime + slotDuration, gapEnd);
      const gapStartPercentage = (currentTime - timelineStart) / (timelineEnd - timelineStart);
      const gapEndPercentage = (blockEnd - timelineStart) / (timelineEnd - timelineStart);
      const gapLeft = gapStartPercentage * totalTimelineWidth;
      const gapWidth = (gapEndPercentage - gapStartPercentage) * totalTimelineWidth;
      
      // Use actual gap width for accurate timeline sync
      const finalWidth = Math.max(gapWidth, 1); // Only ensure minimum 1px width for visibility
      
      // Add small spacing for "No Information" cards
      const noInfoSpacing = 0; // No spacing between consecutive "No Information" cards
      
      blocks.push({
        program: {
          id: `${baseId}-${blockIndex}`,
          epg_id: `${baseId}-${blockIndex}`,
          title: 'No Information',
          lang: 'en',
          start: new Date(currentTime * 1000).toISOString(),
          end: new Date(blockEnd * 1000).toISOString(),
          description: 'No program information available',
          channel_id: 'unknown',
          start_timestamp: currentTime.toString(),
          stop_timestamp: blockEnd.toString(),
          now_playing: 0,
          has_archive: 0
        },
        startTime: currentTime,
        endTime: blockEnd,
        duration: blockEnd - currentTime,
        left: gapLeft + (blockIndex * noInfoSpacing), // Add minimal spacing between consecutive "No Information" cards
        width: finalWidth - noInfoSpacing, // Adjust width to account for spacing
        title: 'No Information'
      });
      
      currentTime = blockEnd;
      blockIndex++;
    }
    
    return blocks;
  };
  
  // Add gap before first program if needed
  if (positions[0].startTime > timelineStart) {
    const gapBlocks = createNoInfoBlocks(timelineStart, positions[0].startTime, 'no-info-start');
    filledPositions.push(...gapBlocks);
  }
  
  // Add all existing programs
  filledPositions.push(...positions);
  
  // Add gaps between programs
  for (let i = 0; i < positions.length - 1; i++) {
    const currentEnd = positions[i].endTime;
    const nextStart = positions[i + 1].startTime;
    
    if (nextStart > currentEnd) {
      // There's a gap between programs
      const gapBlocks = createNoInfoBlocks(currentEnd, nextStart, `no-info-gap-${i}`);
      filledPositions.push(...gapBlocks);
    }
  }
  
  // Add gap after last program if needed
  const lastProgram = positions[positions.length - 1];
  if (lastProgram.endTime < timelineEnd) {
    const gapBlocks = createNoInfoBlocks(lastProgram.endTime, timelineEnd, 'no-info-end');
    filledPositions.push(...gapBlocks);
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
