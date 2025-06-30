import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import Video from 'react-native-video';

const LiveVideoComp = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef(null);
  
  const streamUrl = 'http:\/\/line.cloud-ott.net:80\/GKBELS\/JT93E4\/894968';

  const onLoad = (data) => {
    console.log('Stream loaded:', data);
    setLoading(false);
    setError(null);
  };

  const onError = (error) => {
    console.log('Stream error:', error);
    setError('Failed to load stream');
    setLoading(false);
  };

  const retryStream = () => {
    setLoading(true);
    setError(null);
    // Force reload by updating the key or re-rendering
    videoRef.current?.seek(0);
  };

  const onProgress = (data) => {
    console.log('Progress:', data.currentTime);
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ 
          uri: streamUrl,
          headers: {
            'User-Agent': 'VLC/3.0.0 LibVLC/3.0.0'
          }
        }}
        style={styles.video}
        resizeMode="contain"
        controls={false} // Custom controls
        paused={paused}
        onLoad={onLoad}
        onError={onError}
        onProgress={onProgress}
        onBuffer={({ isBuffering }) => {
          console.log('Buffering:', isBuffering);
        }}
        repeat={false}
        playInBackground={false}
        playWhenInactive={false}
        ignoreSilentSwitch="ignore"
        bufferConfig={{
          minBufferMs: 15000,
          maxBufferMs: 50000,
          bufferForPlaybackMs: 2500,
          bufferForPlaybackAfterRebufferMs: 5000
        }}
      />

      {/* Custom Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setPaused(!paused)}
        >
          <Text style={styles.buttonText}>
            {paused ? '▶️' : '⏸️'}
          </Text>
        </TouchableOpacity>

        {error && (
          <TouchableOpacity 
            style={[styles.button, styles.retryButton]}
            onPress={retryStream}
          >
            <Text style={styles.buttonText}>🔄 Retry</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Loading...</Text>
        </View>
      )}

      {error && (
        <View style={styles.overlay}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  video: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 5,
  },
  retryButton: {
    backgroundColor: 'rgba(255,0,0,0.7)',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  overlayText: {
    color: 'white',
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LiveVideoComp;