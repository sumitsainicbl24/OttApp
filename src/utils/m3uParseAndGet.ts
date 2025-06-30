import RNFS from 'react-native-fs';
import { setItemLocalStorage, getItemLocalStorage, deleteItemLocalStorage } from '../localStorage/mmkv';

type M3UEntry = {
    type: 'channel' | 'movie' | 'series';
    groupTitle: string;
    name: string;
    logo: string;
    url: string;
  };
  
  type GroupedM3UData = {
    [category in M3UEntry['type']]: {
      [groupTitle: string]: M3UEntry[];
    };
  };

type ParseStats = {
  channels: number;
  movies: number;
  series: number;
};

type StorageChunk = {
  [groupTitle: string]: M3UEntry[];
};

// Add resume state type
type ResumeState = {
  url: string;
  bytesDownloaded: number;
  totalBytes: number;
  processedBytes: number;
  timestamp: number;
  isActive: boolean;
};

export class M3UStreamParser {
  private buffer: string = '';
  private tempData: GroupedM3UData = {
    channel: {},
    movie: {},
    series: {}
  };
  private stats: ParseStats = {
    channels: 0,
    movies: 0,
    series: 0
  };
  private onStatsUpdate?: (stats: ParseStats) => void;
  private channelFilePath: string;
  private movieFilePath: string;
  private seriesFilePath: string;
  private batchSize = 50; // Reduced batch size for streaming
  private pendingWrites: { [key: string]: string[] } = {
    channel: [],
    movie: [],
    series: []
  };
  private storageChunkSize = 5000; // Increased chunk size for better MMKV performance
  private chunkCounters = {
    channel: 0,
    movie: 0,
    series: 0
  };
  private processedBytes = 0;
  private lastStatsUpdate = 0;
  private lastMMKVStore = 0; // Track last MMKV storage time
  
  // Add resume-related properties
  private resumeKey: string;
  private totalBytesExpected = 0;
  private bytesDownloaded = 0;

  constructor(baseDir: string, onStatsUpdate?: (stats: ParseStats) => void, resumeKey?: string) {
    this.onStatsUpdate = onStatsUpdate;
    this.channelFilePath = `${baseDir}/channels.m3u`;
    this.movieFilePath = `${baseDir}/movies.m3u`;
    this.seriesFilePath = `${baseDir}/series.m3u`;
    this.resumeKey = resumeKey || `m3u_download_${Date.now()}`;
    
    // Initialize empty files and clear existing MMKV data
    this.initializeFiles();
    this.clearExistingMMKVData();
  }

  private async clearExistingMMKVData() {
    try {
      // Clear existing playlist data
      await deleteItemLocalStorage('playlist_channels_meta');
      await deleteItemLocalStorage('playlist_movies_meta');
      await deleteItemLocalStorage('playlist_series_meta');
      
      console.log('Cleared existing MMKV playlist data');
    } catch (error) {
      console.error('Error clearing existing MMKV data:', error);
    }
  }

  private async initializeFiles() {
    try {
      await Promise.all([
        RNFS.writeFile(this.channelFilePath, '#EXTM3U\n', 'utf8'),
        RNFS.writeFile(this.movieFilePath, '#EXTM3U\n', 'utf8'),
        RNFS.writeFile(this.seriesFilePath, '#EXTM3U\n', 'utf8')
      ]);
    } catch (error) {
      console.error('Error initializing files:', error);
    }
  }

  async processChunk(chunk: string) {
    try {
      // Clean chunk before adding to buffer
      const cleanChunk = this.sanitizeContent(chunk);
      this.buffer += cleanChunk;
      this.processedBytes += chunk.length;
      
      // Process buffer less frequently to build larger chunks for MMKV storage
      if (this.buffer.length > 100000) { // 100KB chunks for better MMKV performance
        await this.processBuffer();
      }
      
      // Update stats more frequently during streaming
      const currentTime = Date.now();
      if (currentTime - this.lastStatsUpdate > 500) { // Update every 500ms
        if (this.onStatsUpdate) {
          this.onStatsUpdate({ ...this.stats });
        }
        this.lastStatsUpdate = currentTime;
      }
    } catch (error) {
      console.error('Error processing chunk:', error);
      // Continue processing even if one chunk fails
    }
  }

  private sanitizeContent(content: string): string {
    try {
      // Only remove actual problematic characters, preserve all standard printable ASCII
      return content
        // Remove null bytes and control characters that can cause parsing issues
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
        // Normalize line endings
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Replace problematic Unicode quotes and dashes with ASCII equivalents
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        .replace(/[–—]/g, '-')
        .replace(/[…]/g, '...');
    } catch (error) {
      console.error('Error sanitizing content:', error);
      return content; // Return original if sanitization fails
    }
  }

  private async processBuffer() {
    const lines = this.buffer.split('\n');
    
    // Keep fewer lines in buffer for streaming to reduce memory usage
    const linesToKeep = Math.min(2, lines.length);
    const linesToProcess = lines.slice(0, -linesToKeep);
    this.buffer = lines.slice(-linesToKeep).join('\n');
    
    await this.parseLines(linesToProcess);
    
    // Write batches to files more frequently during streaming
    await this.flushPendingWrites(false);
    
    // Store in MMKV less frequently for better performance - only every 10 seconds or when chunks are really large
    const currentTime = Date.now();
    const shouldStoreMMKV = (currentTime - this.lastMMKVStore > 10000) || // Every 10 seconds
      Object.values(this.tempData).some(typeData => 
        Object.values(typeData).reduce((sum, group) => sum + group.length, 0) >= this.storageChunkSize * 2
      );
    
    if (shouldStoreMMKV) {
      await this.storeDataInMMKV();
      this.lastMMKVStore = currentTime;
    }
  }

  async finalize() {
    // Process any remaining content in buffer
    if (this.buffer.trim()) {
      const lines = this.buffer.split('\n');
      await this.parseLines(lines);
    }
    
    // Flush all remaining writes
    await this.flushPendingWrites(true);
    
    // Store all remaining data in MMKV
    await this.storeDataInMMKV(true);
    
    // Store metadata about the stored chunks
    await this.storeMetadata();
    
    // Clear resume state since download completed successfully
    await this.clearResumeState();
    
    // Delete the generated M3U files after storing to MMKV to save storage space
    await this.deleteGeneratedFiles();
    
    console.log('Final stats:', this.stats);
    console.log('Data stored in MMKV with chunks:', this.chunkCounters);
    console.log('Generated M3U files deleted to save storage space');
    
    // Clear data from memory
    this.tempData = { channel: {}, movie: {}, series: {} };
    this.buffer = '';
    
    return this.stats;
  }

  private async deleteGeneratedFiles() {
    try {
      const filesToDelete = [
        this.channelFilePath,
        this.movieFilePath,
        this.seriesFilePath
      ];

      const deletePromises = filesToDelete.map(async (filePath) => {
        try {
          const exists = await RNFS.exists(filePath);
          if (exists) {
            await RNFS.unlink(filePath);
            console.log(`Deleted file: ${filePath}`);
          }
        } catch (error) {
          console.error(`Error deleting file ${filePath}:`, error);
        }
      });

      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error during file cleanup:', error);
    }
  }

  private async storeDataInMMKV(forceStore: boolean = false) {
    const promises: Promise<void>[] = [];
    
    for (const [type, data] of Object.entries(this.tempData)) {
      const entryCount = Object.values(data).reduce((sum, group) => sum + group.length, 0);
      
      // Store with much larger chunks to reduce MMKV operations
      if (forceStore || entryCount >= this.storageChunkSize) {
        const chunkKey = `playlist_${type}_chunk_${this.chunkCounters[type as keyof typeof this.chunkCounters]}`;
        
        // Create larger chunks by batching multiple groups together
        const chunkData = { ...data };
        
        promises.push(
          setItemLocalStorage(chunkKey, JSON.stringify(chunkData)).then(() => {
            console.log(`Stored ${type} chunk ${this.chunkCounters[type as keyof typeof this.chunkCounters]} with ${entryCount} entries`);
            this.chunkCounters[type as keyof typeof this.chunkCounters]++;
            // Clear the stored data from memory
            this.tempData[type as keyof GroupedM3UData] = {};
          }).catch(error => {
            console.error(`Error storing ${type} chunk:`, error);
          })
        );
      }
    }
    
    // Execute all MMKV operations in parallel for better performance
    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  private async storeMetadata() {
    try {
      const metadata = {
        stats: this.stats,
        chunkCounts: this.chunkCounters,
        timestamp: Date.now()
      };
      
      await Promise.all([
        setItemLocalStorage('playlist_channels_meta', JSON.stringify({
          chunkCount: this.chunkCounters.channel,
          count: this.stats.channels,
          timestamp: metadata.timestamp
        })),
        setItemLocalStorage('playlist_movies_meta', JSON.stringify({
          chunkCount: this.chunkCounters.movie,
          count: this.stats.movies,
          timestamp: metadata.timestamp
        })),
        setItemLocalStorage('playlist_series_meta', JSON.stringify({
          chunkCount: this.chunkCounters.series,
          count: this.stats.series,
          timestamp: metadata.timestamp
        })),
        setItemLocalStorage('playlist_metadata', JSON.stringify(metadata))
      ]);
      
      console.log('Stored metadata:', metadata);
    } catch (error) {
      console.error('Error storing metadata:', error);
    }
  }

  private async parseLines(lines: string[]) {
    for (let i = 0; i < lines.length; i++) {
      try {
        const line = lines[i]?.trim();
        if (!line || !line.startsWith('#EXTINF')) continue;
        
        const nextLine = lines[i + 1]?.trim();
        if (!nextLine || nextLine.startsWith('#')) continue;

        let type: M3UEntry['type'];
        if (nextLine.includes('/movie/')) {
          type = 'movie';
        } else if (nextLine.includes('/series/')) {
          type = 'series';
        } else {
          type = 'channel';
        }

        // Extract metadata with error handling
        const groupTitleMatch = line.match(/group-title="([^"]+)"/);
        const tvgNameMatch = line.match(/tvg-name="([^"]+)"/);
        const tvgLogoMatch = line.match(/tvg-logo="([^"]+)"/);

        const groupTitle = this.sanitizeString(groupTitleMatch?.[1] || 'Unknown');
        const name = this.sanitizeString(tvgNameMatch?.[1] || 'Unknown Channel');
        const logo = this.sanitizeString(tvgLogoMatch?.[1] || '');

        const entry: M3UEntry = {
          type,
          groupTitle,
          name,
          logo,
          url: nextLine
        };

        // Add to temporary data structure
        if (!this.tempData[type][groupTitle]) {
          this.tempData[type][groupTitle] = [];
        }
        this.tempData[type][groupTitle].push(entry);

        // Update stats
        if (type === 'channel') this.stats.channels++;
        else if (type === 'movie') this.stats.movies++;
        else if (type === 'series') this.stats.series++;

        // Add to pending writes batch
        this.pendingWrites[type].push(`${line}\n${nextLine}\n`);

        // Skip the URL line in next iteration
        i++;
      } catch (error) {
        console.error('Error parsing line:', error, 'Line:', lines[i]);
        // Continue processing even if one entry fails
        continue;
      }
    }
  }

  private sanitizeString(str: string): string {
    try {
      // Preserve all printable characters, only clean actual problematic ones
      return str
        // Remove control characters but keep all printable ASCII (including pipe |)
        .replace(/[\x00-\x1F\x7F]/g, '')
        // Replace problematic Unicode with ASCII equivalents
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        .replace(/[–—]/g, '-')
        .replace(/[…]/g, '...')  
        // Only replace double quotes in attribute values to prevent parsing issues
        .replace(/"/g, "'")
        .trim();
    } catch (error) {
      console.error('Error sanitizing string:', error);
      return str;
    }
  }

  private async flushPendingWrites(forceFlush: boolean = false) {
    const promises: Promise<void>[] = [];
    
    for (const [type, entries] of Object.entries(this.pendingWrites)) {
      if (entries.length === 0) continue;
      
      // Flush more frequently during streaming
      if (forceFlush || entries.length >= this.batchSize) {
        const content = entries.join('');
        const filePath = type === 'channel' ? this.channelFilePath :
                        type === 'movie' ? this.movieFilePath : this.seriesFilePath;
        
        promises.push(
          RNFS.appendFile(filePath, content, 'utf8').catch(error => {
            console.error(`Error writing ${type} batch:`, error);
          })
        );
        
        // Clear the batch
        this.pendingWrites[type as keyof typeof this.pendingWrites] = [];
      }
    }
    
    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  getStats(): ParseStats {
    return { ...this.stats };
  }

  // Clean up method
  cleanup() {
    this.buffer = '';
    this.tempData = { channel: {}, movie: {}, series: {} };
    this.pendingWrites = { channel: [], movie: [], series: [] };
  }

  // Add method to save resume state
  async saveResumeState(url: string, bytesDownloaded: number, totalBytes: number) {
    try {
      const resumeState: ResumeState = {
        url,
        bytesDownloaded,
        totalBytes,
        processedBytes: this.processedBytes,
        timestamp: Date.now(),
        isActive: true
      };
      
      await setItemLocalStorage(`resume_${this.resumeKey}`, JSON.stringify(resumeState));
      await setItemLocalStorage(`stats_${this.resumeKey}`, JSON.stringify(this.stats));
      await setItemLocalStorage(`chunks_${this.resumeKey}`, JSON.stringify(this.chunkCounters));
      
      this.bytesDownloaded = bytesDownloaded;
      this.totalBytesExpected = totalBytes;
    } catch (error) {
      console.error('Error saving resume state:', error);
    }
  }

  // Add method to load resume state
  async loadResumeState(): Promise<ResumeState | null> {
    try {
      const resumeStateStr = await getItemLocalStorage(`resume_${this.resumeKey}`);
      if (!resumeStateStr) return null;
      
      const resumeState: ResumeState = JSON.parse(resumeStateStr);
      
      // Load saved stats and counters
      const statsStr = await getItemLocalStorage(`stats_${this.resumeKey}`);
      const chunksStr = await getItemLocalStorage(`chunks_${this.resumeKey}`);
      
      if (statsStr) {
        this.stats = JSON.parse(statsStr);
      }
      
      if (chunksStr) {
        this.chunkCounters = JSON.parse(chunksStr);
      }
      
      this.processedBytes = resumeState.processedBytes;
      this.bytesDownloaded = resumeState.bytesDownloaded;
      this.totalBytesExpected = resumeState.totalBytes;
      
      return resumeState;
    } catch (error) {
      console.error('Error loading resume state:', error);
      return null;
    }
  }

  // Add method to clear resume state
  async clearResumeState() {
    try {
      await deleteItemLocalStorage(`resume_${this.resumeKey}`);
      await deleteItemLocalStorage(`stats_${this.resumeKey}`);
      await deleteItemLocalStorage(`chunks_${this.resumeKey}`);
    } catch (error) {
      console.error('Error clearing resume state:', error);
    }
  }

  // Add method to get resume position
  getResumePosition(): number {
    return this.bytesDownloaded;
  }

  // Add method to update download progress
  updateDownloadProgress(bytesDownloaded: number, totalBytes: number) {
    this.bytesDownloaded = bytesDownloaded;
    this.totalBytesExpected = totalBytes;
  }

  // Add getter for total bytes expected
  getTotalBytesExpected(): number {
    return this.totalBytesExpected;
  }
}

// Helper functions to retrieve data from MMKV
export async function getChannelsFromMMKV(): Promise<GroupedM3UData['channel']> {
  try {
    const meta = await getItemLocalStorage('playlist_channels_meta');
    if (!meta) return {};
    
    const metadata = JSON.parse(meta);
    const allChannels: GroupedM3UData['channel'] = {};
    
    for (let i = 0; i < metadata.chunkCount; i++) {
      const chunkData = await getItemLocalStorage(`playlist_channel_chunk_${i}`);
      if (chunkData) {
        const chunk = JSON.parse(chunkData);
        Object.assign(allChannels, chunk);
      }
    }
    
    return allChannels;
  } catch (error) {
    console.error('Error getting channels from MMKV:', error);
    return {};
  }
}

export async function getMoviesFromMMKV(): Promise<GroupedM3UData['movie']> {
  try {
    const meta = await getItemLocalStorage('playlist_movies_meta');
    if (!meta) return {};
    
    const metadata = JSON.parse(meta);
    const allMovies: GroupedM3UData['movie'] = {};
    
    for (let i = 0; i < metadata.chunkCount; i++) {
      const chunkData = await getItemLocalStorage(`playlist_movie_chunk_${i}`);
      if (chunkData) {
        const chunk = JSON.parse(chunkData);
        Object.assign(allMovies, chunk);
      }
    }
    
    return allMovies;
  } catch (error) {
    console.error('Error getting movies from MMKV:', error);
    return {};
  }
}

export async function getSeriesFromMMKV(): Promise<GroupedM3UData['series']> {
  try {
    const meta = await getItemLocalStorage('playlist_series_meta');
    if (!meta) return {};
    
    const metadata = JSON.parse(meta);
    const allSeries: GroupedM3UData['series'] = {};
    
    for (let i = 0; i < metadata.chunkCount; i++) {
      const chunkData = await getItemLocalStorage(`playlist_series_chunk_${i}`);
      if (chunkData) {
        const chunk = JSON.parse(chunkData);
        Object.assign(allSeries, chunk);
      }
    }
    
    return allSeries;
  } catch (error) {
    console.error('Error getting series from MMKV:', error);
    return {};
  }
}

export async function getPlaylistStatsFromMMKV(): Promise<ParseStats | null> {
  try {
    const meta = await getItemLocalStorage('playlist_metadata');
    if (!meta) return null;
    
    const metadata = JSON.parse(meta);
    return metadata.stats;
  } catch (error) {
    console.error('Error getting playlist stats from MMKV:', error);
    return null;
  }
}

export async function getMovieCategoriesFromMMKV(): Promise<string[]> {
  try {
    const movies = await getMoviesFromMMKV();
    const categories = Object.keys(movies).sort();
    return categories;
  } catch (error) {
    console.error('Error getting movie categories from MMKV:', error);
    return [];
  }
}

export async function getChannelCategoriesFromMMKV(): Promise<string[]> {
  try {
    const channels = await getChannelsFromMMKV();
    const categories = Object.keys(channels).sort();
    return categories;
  } catch (error) {
    console.error('Error getting channel categories from MMKV:', error);
    return [];
  }
}

export async function getSeriesCategoriesFromMMKV(): Promise<string[]> {
  try {
    const series = await getSeriesFromMMKV();
    const categories = Object.keys(series).sort();
    return categories;
  } catch (error) {
    console.error('Error getting series categories from MMKV:', error);
    return [];
  }
}

// Keep the original functions for backward compatibility
export async function parseM3UFile(filePath: string): Promise<void> {
  const content = await RNFS.readFile(filePath, 'utf8');
  const parsedData = parseM3U(content);
  console.log('Parsed data:', parsedData)
  await setItemLocalStorage('playlist', JSON.stringify(parsedData));
}

export function parseM3U(content: string): GroupedM3UData {
  console.log('Parsing M3U file...')

  const lines = content.split('\n').map(line => line.trim());
  const data: GroupedM3UData = {
    channel: {},
    movie: {},
    series: {}
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('#EXTINF')) {
      const nextLine = lines[i + 1] || '';
      const url = nextLine.trim();

      let type: M3UEntry['type'];
      if (url.includes('/movie/')) {
        type = 'movie';
      } else if (url.includes('/series/')) {
        type = 'series';
      } else {
        type = 'channel';
      }

      const groupTitleMatch = line.match(/group-title="([^"]+)"/);
      const tvgNameMatch = line.match(/tvg-name="([^"]+)"/);
      const tvgLogoMatch = line.match(/tvg-logo="([^"]+)"/);

      const groupTitle = groupTitleMatch?.[1] || 'Unknown';
      const name = tvgNameMatch?.[1] || 'Unknown Channel';
      const logo = tvgLogoMatch?.[1] || '';

      const entry: M3UEntry = {
        type,
        groupTitle,
        name,
        logo,
        url
      };

      if (!data[type][groupTitle]) {
        data[type][groupTitle] = [];
      }
      data[type][groupTitle].push(entry);
    }
  }

  return data;
}

// Helper functions for resume functionality
export async function checkResumeAvailable(resumeKey: string): Promise<ResumeState | null> {
  try {
    const resumeStateStr = await getItemLocalStorage(`resume_${resumeKey}`);
    if (!resumeStateStr) return null;
    
    const resumeState: ResumeState = JSON.parse(resumeStateStr);
    
    // Check if resume data is not too old (24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - resumeState.timestamp > maxAge) {
      // Clean up old resume data
      await deleteItemLocalStorage(`resume_${resumeKey}`);
      await deleteItemLocalStorage(`stats_${resumeKey}`);
      await deleteItemLocalStorage(`chunks_${resumeKey}`);
      return null;
    }
    
    return resumeState;
  } catch (error) {
    console.error('Error checking resume availability:', error);
    return null;
  }
}

export async function clearAllResumeData(): Promise<void> {
  try {
    // Get all keys and filter for resume data
    const keys = [];
    let i = 0;
    while (true) {
      try {
        const key = await getItemLocalStorage(`key_${i}`);
        if (!key) break;
        if (key.startsWith('resume_') || key.startsWith('stats_') || key.startsWith('chunks_')) {
          keys.push(key);
        }
        i++;
      } catch {
        break;
      }
    }
    
    // Delete all found resume keys
    const deletePromises = keys.map(key => deleteItemLocalStorage(key));
    await Promise.all(deletePromises);
    
    console.log(`Cleared ${keys.length} resume data entries`);
  } catch (error) {
    console.error('Error clearing all resume data:', error);
  }
}

// Utility function to generate consistent resume keys
export function generateResumeKey(url: string): string {
  try {
    // Create a consistent key based on URL
    return `playlist_${btoa(url).replace(/[+/=]/g, '_').substring(0, 32)}`;
  } catch (error) {
    // Fallback for invalid URLs
    return `playlist_${url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 32)}`;
  }
}

// Check if server supports range requests (resume capability)
export async function checkServerSupportsResume(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('HEAD', url, true);
      xhr.timeout = 10000; // 10 second timeout for header check
      
      xhr.onload = () => {
        const acceptRanges = xhr.getResponseHeader('Accept-Ranges');
        const supportsRanges = acceptRanges === 'bytes';
        console.log(`Server supports resume: ${supportsRanges}`);
        resolve(supportsRanges);
      };
      
      xhr.onerror = xhr.ontimeout = () => {
        console.log('Could not check server resume support, assuming no support');
        resolve(false);
      };
      
      xhr.send();
    } catch (error) {
      console.error('Error checking server resume support:', error);
      resolve(false);
    }
  });
}