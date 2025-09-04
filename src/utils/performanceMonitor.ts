/**
 * Performance monitoring utilities for EPG data processing
 */

import {getEPGCacheStats} from './epgUtils';

interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  cacheHits: number;
  cacheMisses: number;
  totalOperations: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    startTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    totalOperations: 0
  };

  private isMonitoring = false;

  startMonitoring(): void {
    this.metrics = {
      startTime: performance.now(),
      cacheHits: 0,
      cacheMisses: 0,
      totalOperations: 0
    };
    this.isMonitoring = true;
  }

  stopMonitoring(): PerformanceMetrics {
    if (!this.isMonitoring) {
      throw new Error('Monitoring not started');
    }

    this.metrics.endTime = performance.now();
    this.metrics.duration = this.metrics.endTime - this.metrics.startTime;
    this.isMonitoring = false;

    return { ...this.metrics };
  }

  recordCacheHit(): void {
    if (this.isMonitoring) {
      this.metrics.cacheHits++;
      this.metrics.totalOperations++;
    }
  }

  recordCacheMiss(): void {
    if (this.isMonitoring) {
      this.metrics.cacheMisses++;
      this.metrics.totalOperations++;
    }
  }

  getCurrentStats(): PerformanceMetrics & { cacheStats: any } {
    return {
      ...this.metrics,
      cacheStats: getEPGCacheStats()
    };
  }

  logPerformanceReport(): void {
    const stats = this.getCurrentStats();
    const cacheHitRate = stats.totalOperations > 0 
      ? (stats.cacheHits / stats.totalOperations * 100).toFixed(2)
      : '0.00';

    console.log('🚀 EPG Performance Report:');
    console.log(`⏱️  Total Duration: ${stats.duration?.toFixed(2)}ms`);
    console.log(`📊 Total Operations: ${stats.totalOperations}`);
    console.log(`✅ Cache Hits: ${stats.cacheHits}`);
    console.log(`❌ Cache Misses: ${stats.cacheMisses}`);
    console.log(`📈 Cache Hit Rate: ${cacheHitRate}%`);
    console.log(`💾 Title Cache Size: ${stats.cacheStats.titleCacheSize}`);
    console.log(`💾 EPG Cache Size: ${stats.cacheStats.epgCacheSize}`);
    console.log(`💾 Total Cache Size: ${stats.cacheStats.totalCacheSize}`);
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Helper function to measure EPG processing performance
export const measureEPGPerformance = async <T>(
  operation: () => T,
  operationName: string = 'EPG Operation'
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = operation();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`⚡ ${operationName} completed in ${duration.toFixed(2)}ms`);
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.error(`❌ ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
};

// Development-only performance logging
export const logEPGPerformance = (message: string, data?: any): void => {
  if (__DEV__) {
    console.log(`🔍 EPG Debug: ${message}`, data || '');
  }
};
