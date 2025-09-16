/**
 * Utility functions for handling EPG (Electronic Program Guide) data
 */

export interface EPGProgram {
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

// Cache for decoded titles to avoid repeated base64 decoding
const titleDecodeCache = new Map<string, string>();
// Cache for decoded descriptions to avoid repeated base64 decoding
const descriptionDecodeCache = new Map<string, string>();

/**
 * Decodes base64 encoded EPG title with caching for performance
 * @param encodedTitle - Base64 encoded title string
 * @returns Decoded title string
 */
export const decodeEPGTitle = (encodedTitle: string): string => {
  // Check cache first
  if (titleDecodeCache.has(encodedTitle)) {
    return titleDecodeCache.get(encodedTitle)!;
  }

  try {
    const decoded = atob(encodedTitle);
    // Cache the result
    titleDecodeCache.set(encodedTitle, decoded);
    return decoded;
  } catch (error) {
    console.warn('Failed to decode EPG title:', error);
    // Cache the original to avoid repeated failed attempts
    titleDecodeCache.set(encodedTitle, encodedTitle);
    return encodedTitle; // Return original if decoding fails
  }
};

/**
 * Decodes base64 encoded EPG description with caching for performance
 * @param encodedDescription - Base64 encoded description string
 * @returns Decoded description string
 */
export const decodeEPGDescription = (encodedDescription: string): string => {
  // Check cache first
  if (descriptionDecodeCache.has(encodedDescription)) {
    return descriptionDecodeCache.get(encodedDescription)!;
  }

  try {
    const decoded = atob(encodedDescription);
    // Cache the result
    descriptionDecodeCache.set(encodedDescription, decoded);
    return decoded;
  } catch (error) {
    console.warn('Failed to decode EPG description:', error);
    // Cache the original to avoid repeated failed attempts
    descriptionDecodeCache.set(encodedDescription, encodedDescription);
    return encodedDescription; // Return original if decoding fails
  }
};

// Cache for processed EPG data to avoid repeated processing
const epgProcessCache = new Map<string, any[]>();

/**
 * Generates a cache key for EPG data
 */
const generateEPGCacheKey = (epgData: EPGProgram[]): string => {
  if (!epgData || epgData.length === 0) return 'empty';
  
  // Create a simple hash based on program IDs and timestamps
  const keyData = epgData
    .map(p => `${p.id}-${p.start_timestamp}-${p.stop_timestamp}`)
    .sort()
    .join('|');
  
  return keyData;
};

// Default fallback programs for 24-hour timeline - created once to avoid recreation
const DEFAULT_PROGRAMS = [
  {title: 'No information', duration: 'current', color: '#3E4756'},
  {title: 'No information', duration: 'next', color: '#232629'},
  {
    title: 'No information',
    duration: 'later',
    color: 'rgba(255, 255, 255, 0.2)',
  },
  {
    title: 'No information',
    duration: 'evening',
    color: 'rgba(255, 255, 255, 0.2)',
  },
  {
    title: 'No information',
    duration: 'night',
    color: 'rgba(255, 255, 255, 0.2)',
  },
  {
    title: 'No information',
    duration: 'early-morning',
    color: 'rgba(255, 255, 255, 0.2)',
  },
];

/**
 * Optimized EPG data processing with caching and performance improvements
 * @param epgData - Array of EPG program data
 * @returns Processed program schedule with current and upcoming programs
 */
export const processEPGData = (epgData: EPGProgram[]): any[] => {
  // Early return for empty data
  if (!epgData || epgData.length === 0) {
    return DEFAULT_PROGRAMS;
  }

  // Check cache first
  const cacheKey = generateEPGCacheKey(epgData);
  if (epgProcessCache.has(cacheKey)) {
    return epgProcessCache.get(cacheKey)!;
  }

  // Pre-parse timestamps to avoid repeated parseInt calls
  const programsWithTimestamps = epgData.map(program => ({
    ...program,
    startTime: parseInt(program.start_timestamp),
    endTime: parseInt(program.stop_timestamp)
  }));

  // Sort by start time (more efficient than creating new array)
  programsWithTimestamps.sort((a, b) => a.startTime - b.startTime);

  // Get current time once
  const now = Math.floor(Date.now() / 1000);
  
  // Find current program and upcoming programs for 24 hours
  let currentProgram = null;
  let upcomingPrograms = [];
  
  // Calculate 24 hours from now (in seconds)
  const twentyFourHoursFromNow = now + (24 * 60 * 60);
  
  for (const program of programsWithTimestamps) {
    if (program.startTime <= now && program.endTime > now) {
      currentProgram = program;
    } else if (program.startTime > now && program.startTime <= twentyFourHoursFromNow && upcomingPrograms.length < 20) {
      // Collect up to 20 upcoming programs within 24 hours
      upcomingPrograms.push(program);
    }
  }

  // Build result array efficiently
  const result = [];
  
  // Add current program
  if (currentProgram) {
    result.push({
      title: decodeEPGTitle(currentProgram.title),
      duration: 'current',
      color: '#3E4756',
      epgData: currentProgram
    });
  } else {
    result.push({
      title: 'No information',
      duration: 'current',
      color: '#3E4756'
    });
  }

  // Add upcoming programs
  upcomingPrograms.forEach((program, index) => {
    result.push({
      title: decodeEPGTitle(program.title),
      duration: index === 0 ? 'next' : 'later',
      color: index === 0 ? '#232629' : 'rgba(255, 255, 255, 0.2)',
      epgData: program
    });
  });

  // Fill remaining slots efficiently for 24-hour timeline
  const remainingSlots = 6 - result.length; // Updated to match DEFAULT_PROGRAMS length
  for (let i = 0; i < remainingSlots; i++) {
    result.push({
      title: 'No information',
      duration: 'later',
      color: 'rgba(255, 255, 255, 0.2)',
    });
  }

  // Cache the result
  epgProcessCache.set(cacheKey, result);
  
  // Limit cache size to prevent memory leaks
  if (epgProcessCache.size > 100) {
    const firstKey = epgProcessCache.keys().next().value;
    if (firstKey) {
      epgProcessCache.delete(firstKey);
    }
  }

  return result;
};

/**
 * Clears all EPG caches to free memory
 * Call this when switching categories or when memory usage is high
 */
export const clearEPGCaches = (): void => {
  titleDecodeCache.clear();
  descriptionDecodeCache.clear();
  epgProcessCache.clear();
};

/**
 * Gets cache statistics for performance monitoring
 */
export const getEPGCacheStats = () => {
  return {
    titleCacheSize: titleDecodeCache.size,
    descriptionCacheSize: descriptionDecodeCache.size,
    epgCacheSize: epgProcessCache.size,
    totalCacheSize: titleDecodeCache.size + descriptionDecodeCache.size + epgProcessCache.size
  };
};

/**
 * Example of how EPG data should be structured when passed to components
 */
export const exampleEPGData: EPGProgram[] = [
  {
    "id": "131637090",
    "epg_id": "12",
    "title": "TWNEb25hbGQgYW5kIERvZGRz", // Base64 encoded: "Donald and Dodds"
    "lang": "en",
    "start": "2025-09-01 00:00:00",
    "end": "2025-09-01 01:35:00",
    "description": "TWNEb25hbGQgZW4gRG9kZHMgd29yZGVuIGRlIHdlcmVsZCB2YW4gRm9ybXVsZSAxIGluZ2V6b2dlbiBuYWRhdCBlZW4gdGFsZW50dm9sbGUgY291cmV1ciBvdmVybGlqZHQu",
    "channel_id": "npo1.nl",
    "start_timestamp": "1756677600",
    "stop_timestamp": "1756683300",
    "now_playing": 0,
    "has_archive": 0
  }
];

/**
 * Example of how channel data with EPG should be structured
 */
export const exampleChannelWithEPG = {
  group: "NL | KIDS [LIVE]",
  title: "Nick Music",
  logo: "https://example.com/nickmusic-logo.png",
  url: "https://example.com/stream.m3u8",
  epg: exampleEPGData
};
