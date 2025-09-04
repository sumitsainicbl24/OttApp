/**
 * Example demonstrating the timeline functionality for EPG display
 */

import {EPGProgram} from '../utils/epgUtils';
import {createTimelineConfig, createTimelineSlots, calculateProgramPositions} from '../utils/timelineUtils';

// Example EPG data with different program durations
const exampleEPGData: EPGProgram[] = [
  {
    "id": "131637090",
    "epg_id": "12",
    "title": "VGVzdCBQcm9ncmFtIDE=", // Base64: "Test Program 1"
    "lang": "en",
    "start": "2025-01-15 18:00:00",
    "end": "2025-01-15 18:30:00", // 30 minutes
    "description": "A 30-minute test program",
    "channel_id": "test.channel",
    "start_timestamp": "1737043200", // 18:00
    "stop_timestamp": "1737045000", // 18:30
    "now_playing": 1,
    "has_archive": 0
  },
  {
    "id": "131637091",
    "epg_id": "13",
    "title": "VGVzdCBQcm9ncmFtIDI=", // Base64: "Test Program 2"
    "lang": "en",
    "start": "2025-01-15 18:30:00",
    "end": "2025-01-15 19:15:00", // 45 minutes
    "description": "A 45-minute test program",
    "channel_id": "test.channel",
    "start_timestamp": "1737045000", // 18:30
    "stop_timestamp": "1737047700", // 19:15
    "now_playing": 0,
    "has_archive": 0
  },
  {
    "id": "131637092",
    "epg_id": "14",
    "title": "VGVzdCBQcm9ncmFtIDM=", // Base64: "Test Program 3"
    "lang": "en",
    "start": "2025-01-15 19:15:00",
    "end": "2025-01-15 20:00:00", // 45 minutes
    "description": "Another 45-minute test program",
    "channel_id": "test.channel",
    "start_timestamp": "1737047700", // 19:15
    "stop_timestamp": "1737050400", // 20:00
    "now_playing": 0,
    "has_archive": 0
  },
  {
    "id": "131637093",
    "epg_id": "15",
    "title": "VGVzdCBQcm9ncmFtIDQ=", // Base64: "Test Program 4"
    "lang": "en",
    "start": "2025-01-15 20:00:00",
    "end": "2025-01-15 21:30:00", // 90 minutes (1.5 hours)
    "description": "A long 90-minute test program",
    "channel_id": "test.channel",
    "start_timestamp": "1737050400", // 20:00
    "stop_timestamp": "1737055800", // 21:30
    "now_playing": 0,
    "has_archive": 0
  }
];

// Example usage of timeline functionality
export const demonstrateTimeline = () => {
  console.log('🎬 Timeline Demo Starting...');
  
  // Create timeline configuration
  const config = createTimelineConfig(30, 8, 200); // 30-min slots, 8 slots, 200px width each
  console.log('📅 Timeline Config:', config);
  
  // Create timeline slots
  const slots = createTimelineSlots(config);
  console.log('⏰ Timeline Slots:', slots.map(slot => ({
    time: slot.displayTime,
    start: new Date(slot.startTime).toLocaleTimeString(),
    end: new Date(slot.endTime).toLocaleTimeString(),
    width: slot.width
  })));
  
  // Calculate program positions
  const positions = calculateProgramPositions(exampleEPGData, slots, config.slotWidth);
  console.log('📺 Program Positions:', positions.map(pos => ({
    title: pos.title,
    duration: `${Math.round(pos.duration / 60000)} minutes`,
    left: `${pos.left.toFixed(1)}px`,
    width: `${pos.width.toFixed(1)}px`,
    startTime: new Date(pos.startTime).toLocaleTimeString(),
    endTime: new Date(pos.endTime).toLocaleTimeString()
  })));
  
  console.log('✅ Timeline Demo Complete!');
  
  return {
    config,
    slots,
    positions
  };
};

// Example of how the timeline looks visually with proper positioning:
/*
Timeline (30-minute slots, 200px each):
18:00 PM | 18:30 PM | 19:00 PM | 19:30 PM | 20:00 PM | 20:30 PM | 21:00 PM | 21:30 PM
|--------|--------|--------|--------|--------|--------|--------|--------|
|        |        |        |        |        |        |        |        |
| Test   | Test Program 2 (45 min) |        | Test Program 4 (90 min)    |
| Prog 1 |        |        |        |        |        |        |        |
| (30min)|        | Test Program 3 (45 min) |        |        |        |        |
|        |        |        |        |        |        |        |        |
|--------|--------|--------|--------|--------|--------|--------|--------|

Program positioning features:
- Width based on actual duration using precise timestamps (30min = 200px, 45min = 300px, 90min = 600px)
- No overlapping - overlapping programs are filtered out (only first program in each time slot shown)
- Proper spacing with 1px margins between programs
- Minimum width based on duration (20px for very short, up to 120px for long programs)
- Clean single-row layout - no vertical stacking
- Smart text handling: titles only shown for programs 20+ minutes long
- Very short programs (< 20 min) show as colored blocks without text
- Precise positioning using start_timestamp and stop_timestamp directly (no conversion errors)
- Overlapping programs are hidden to maintain clean timeline appearance
*/

export {exampleEPGData};
