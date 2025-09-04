/**
 * Example showing how to use EPG data with the TV components
 * This file demonstrates the expected data structure and usage patterns
 */

import {EPGProgram, exampleChannelWithEPG} from '../utils/epgUtils';

// Example of EPG data structure that should come from your API
const exampleEPGData: EPGProgram[] = [
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
  },
  {
    "id": "131637091",
    "epg_id": "13",
    "title": "VGVzdCBQcm9ncmFt", // Base64 encoded: "Test Program"
    "lang": "en", 
    "start": "2025-09-01 01:35:00",
    "end": "2025-09-01 03:00:00",
    "description": "VGVzdCBQcm9ncmFtIGRlc2NyaXB0aW9u", // Base64 encoded description
    "channel_id": "npo1.nl",
    "start_timestamp": "1756683300", 
    "stop_timestamp": "1756690800",
    "now_playing": 1, // This indicates it's currently playing
    "has_archive": 0
  }
];

// Example of how channel data should be structured with EPG
const channelWithEPG = {
  group: "NL | KIDS [LIVE]",
  title: "Nick Music", 
  logo: "https://example.com/nickmusic-logo.png",
  url: "https://example.com/stream.m3u8",
  epg: exampleEPGData // Include the EPG array
};

// Example of how to process API response to include EPG data
export const processChannelDataWithEPG = (apiResponse: any) => {
  const channels = apiResponse?.data?.data?.data?.channels;
  
  if (!channels || !Array.isArray(channels)) {
    return [];
  }

  return channels.map((channel: any) => {
    // If the channel has EPG data, include it
    if (channel.epg && Array.isArray(channel.epg)) {
      return {
        ...channel,
        epg: channel.epg // EPG data is already in the correct format
      };
    }
    
    // If no EPG data, return channel without epg property
    return channel;
  });
};

// Example usage in a component:
/*
const TvScreen = () => {
  const [channelsData, setChannelsData] = useState([]);

  const fetchChannelsWithEPG = async () => {
    try {
      const response = await getCategoryData('live', categoryId);
      const processedChannels = processChannelDataWithEPG(response);
      setChannelsData(processedChannels);
    } catch (error) {
      console.error('Error fetching channels with EPG:', error);
    }
  };

  return (
    <ShowChannelCatCarousel
      title="Live Channels"
      data={channelsData} // This will include EPG data for each channel
      type="channels"
      setChannelUrl={handleChannelUrl}
    />
  );
};
*/

export {exampleEPGData, channelWithEPG};
