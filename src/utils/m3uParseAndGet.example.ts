// Example usage of M3U Parser and AsyncStorage functions
import {
  parsePlaylist,
  getPlaylistData,
  getChannels,
  getCategories,
  getCategoryData,
  getChannelsByCategory,
  searchChannels,
  clearPlaylistData,
  getPlaylistStats,
} from './m3uParseAndGet';

// Example 1: Parse M3U file and save to AsyncStorage
export const exampleParsePlaylist = async () => {
  try {
    console.log('🔄 Starting M3U playlist parsing...');
    
    // Parse the M3U file (assumes playlist.m3u exists in DocumentDirectory)
    const channels = await parsePlaylist();
    
    console.log(`✅ Successfully parsed ${channels.length} channels`);
    
    // Get playlist statistics
    const stats = await getPlaylistStats();
    if (stats) {
      console.log(`📊 Stats: ${stats.totalChannels} channels across ${stats.totalCategories} categories`);
      console.log(`📅 Last updated: ${stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : 'Unknown'}`);
    }
    
  } catch (error) {
    console.error('❌ Error parsing playlist:', error);
  }
};

// Example 2: Get all categories and display them
export const exampleGetCategories = async () => {
  try {
    const categories = await getCategories();
    
    console.log('📂 Available Categories:');
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category}`);
    });
    
    return categories;
  } catch (error) {
    console.error('❌ Error getting categories:', error);
    return [];
  }
};

// Example 3: Get channels by specific category
export const exampleGetChannelsByCategory = async () => {
  try {
    // Get sports channels
    const sportsChannels = await getChannelsByCategory('┃UCL┃ CHAMPIONS LEAGUE');
    console.log(`🏆 Found ${sportsChannels.length} Champions League channels:`);
    
    sportsChannels.slice(0, 5).forEach((channel, index) => {
      console.log(`${index + 1}. ${channel.name}`);
      console.log(`   Logo: ${channel.tvgLogo}`);
      console.log(`   URL: ${channel.url}`);
      console.log('---');
    });
    
    // Get movie channels (if any)
    const movieChannels = await getChannelsByCategory('Movies');
    console.log(`🎬 Found ${movieChannels.length} movie channels`);
    
    // Get series channels (if any)
    const seriesChannels = await getChannelsByCategory('Series');
    console.log(`📺 Found ${seriesChannels.length} series channels`);
    
    return { sportsChannels, movieChannels, seriesChannels };
  } catch (error) {
    console.error('❌ Error getting channels by category:', error);
    return { sportsChannels: [], movieChannels: [], seriesChannels: [] };
  }
};

// Example 4: Search channels
export const exampleSearchChannels = async () => {
  try {
    // Search for specific terms
    const searches = ['ziggo', 'sport', 'hd', 'nl'];
    
    for (const searchTerm of searches) {
      const results = await searchChannels(searchTerm);
      console.log(`🔍 Search results for "${searchTerm}": ${results.length} channels found`);
      
      // Show first 3 results
      results.slice(0, 3).forEach((channel, index) => {
        console.log(`  ${index + 1}. ${channel.name} (${channel.groupTitle})`);
      });
      console.log('---');
    }
    
  } catch (error) {
    console.error('❌ Error searching channels:', error);
  }
};

// Example 5: Get complete playlist data
export const exampleGetPlaylistData = async () => {
  try {
    const playlistData = await getPlaylistData();
    
    if (!playlistData) {
      console.log('❌ No playlist data found. Please parse M3U file first.');
      return null;
    }
    
    console.log('📋 Playlist Data Overview:');
    console.log(`Total Channels: ${playlistData.totalChannels}`);
    console.log(`Total Categories: ${playlistData.categories.length}`);
    console.log(`Last Updated: ${new Date(playlistData.lastUpdated).toLocaleString()}`);
    
    console.log('\n📂 Categories with channel counts:');
    Object.entries(playlistData.categoryData).forEach(([category, channels]) => {
      console.log(`  ${category}: ${channels.length} channels`);
    });
    
    return playlistData;
  } catch (error) {
    console.error('❌ Error getting playlist data:', error);
    return null;
  }
};

// Example 6: Create a channel recommendation system
export const exampleChannelRecommendations = async () => {
  try {
    const categories = await getCategories();
    const recommendations: { [key: string]: any[] } = {};
    
    // Get top channels from each category
    for (const category of categories.slice(0, 5)) { // Limit to first 5 categories
      const channels = await getChannelsByCategory(category);
      
      // Get channels with HD in the name (assuming they're higher quality)
      const hdChannels = channels.filter(ch => 
        ch.name.toLowerCase().includes('hd') || 
        ch.name.toLowerCase().includes('4k')
      );
      
      recommendations[category] = hdChannels.slice(0, 3); // Top 3 HD channels
    }
    
    console.log('⭐ Channel Recommendations:');
    Object.entries(recommendations).forEach(([category, channels]) => {
      if (channels.length > 0) {
        console.log(`\n${category}:`);
        channels.forEach((channel, index) => {
          console.log(`  ${index + 1}. ${channel.name}`);
        });
      }
    });
    
    return recommendations;
  } catch (error) {
    console.error('❌ Error creating recommendations:', error);
    return {};
  }
};

// Example 7: Channel filtering and sorting
export const exampleChannelFiltering = async () => {
  try {
    const allChannels = await getChannels();
    
    // Filter HD channels
    const hdChannels = allChannels.filter(channel => 
      channel.name.toLowerCase().includes('hd')
    );
    
    // Filter by country (NL in this case)
    const nlChannels = allChannels.filter(channel => 
      channel.name.includes('[NL]') || 
      channel.name.toLowerCase().includes('nl')
    );
    
    // Sort channels by name
    const sortedChannels = [...allChannels].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
    
    console.log('🔧 Filtering Results:');
    console.log(`HD Channels: ${hdChannels.length}`);
    console.log(`NL Channels: ${nlChannels.length}`);
    console.log(`Total Channels: ${allChannels.length}`);
    
    // Show sample of sorted channels
    console.log('\n📝 First 5 channels (alphabetically):');
    sortedChannels.slice(0, 5).forEach((channel, index) => {
      console.log(`${index + 1}. ${channel.name}`);
    });
    
    return {
      hdChannels,
      nlChannels,
      sortedChannels,
    };
  } catch (error) {
    console.error('❌ Error filtering channels:', error);
    return { hdChannels: [], nlChannels: [], sortedChannels: [] };
  }
};

// Example 8: Clear all data
export const exampleClearData = async () => {
  try {
    console.log('🗑️ Clearing all playlist data from AsyncStorage...');
    await clearPlaylistData();
    console.log('✅ All playlist data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
};

// Example 9: Complete workflow demonstration
export const exampleCompleteWorkflow = async () => {
  try {
    console.log('🚀 Starting complete M3U workflow example...\n');
    
    // Step 1: Parse playlist
    console.log('Step 1: Parsing M3U playlist...');
    await exampleParsePlaylist();
    
    // Step 2: Get overview
    console.log('\nStep 2: Getting playlist overview...');
    await exampleGetPlaylistData();
    
    // Step 3: Explore categories
    console.log('\nStep 3: Exploring categories...');
    await exampleGetCategories();
    
    // Step 4: Get channels by category
    console.log('\nStep 4: Getting channels by category...');
    await exampleGetChannelsByCategory();
    
    // Step 5: Search functionality
    console.log('\nStep 5: Testing search functionality...');
    await exampleSearchChannels();
    
    // Step 6: Channel recommendations
    console.log('\nStep 6: Generating recommendations...');
    await exampleChannelRecommendations();
    
    // Step 7: Filtering and sorting
    console.log('\nStep 7: Filtering and sorting...');
    await exampleChannelFiltering();
    
    console.log('\n✅ Complete workflow demonstration finished!');
    
  } catch (error) {
    console.error('❌ Error in complete workflow:', error);
  }
};

// Example 10: Usage in React Native component
export const exampleReactNativeUsage = `
// Example React Native component usage

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { getCategories, getChannelsByCategory } from './utils/m3uParseAndGet';

const PlaylistScreen = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadChannels = async (category) => {
    try {
      const channelList = await getChannelsByCategory(category);
      setChannels(channelList);
      setSelectedCategory(category);
    } catch (error) {
      console.error('Error loading channels:', error);
    }
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity onPress={() => loadChannels(item)}>
      <Text style={{ padding: 10, backgroundColor: '#f0f0f0', margin: 2 }}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderChannel = ({ item }) => (
    <View style={{ padding: 10, borderBottomWidth: 1 }}>
      <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
      <Text style={{ color: 'gray' }}>{item.groupTitle}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {!selectedCategory ? (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item}
        />
      ) : (
        <FlatList
          data={channels}
          renderItem={renderChannel}
          keyExtractor={(item) => item.url}
        />
      )}
    </View>
  );
};
`;

// Export all examples for easy usage
export const M3UExamples = {
  parsePlaylist: exampleParsePlaylist,
  getCategories: exampleGetCategories,
  getChannelsByCategory: exampleGetChannelsByCategory,
  searchChannels: exampleSearchChannels,
  getPlaylistData: exampleGetPlaylistData,
  channelRecommendations: exampleChannelRecommendations,
  channelFiltering: exampleChannelFiltering,
  clearData: exampleClearData,
  completeWorkflow: exampleCompleteWorkflow,
}; 