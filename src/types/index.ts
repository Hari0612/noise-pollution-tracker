export interface NoiseReading {
  id: string;
  latitude: number;
  longitude: number;
  decibel: number;
  timestamp: number;
  deviceType: string;
  userId?: string;
  cityName?: string;
}

export interface HotspotData {
  id: string;
  latitude: number;
  longitude: number;
  averageDecibel: number;
  readingCount: number;
  radius: number;
  cityName?: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface FilterOptions {
  timeRange: 'day' | 'week' | 'month' | 'year' | 'all';
  minDecibel: number;
  maxDecibel: number;
  region?: string;
}

export interface NoiseAnalysis {
  patternType: string;
  insight: string;
  confidence: number;
  timestamp: number;
}

export interface HealthImpact {
  summary: string;
  recommendations: string[];
  averageExposure: number;
  riskLevel: 'low' | 'moderate' | 'high';
  timestamp: number;
}