import { NoiseReading, HotspotData, FilterOptions, UserLocation } from '../types';
import { calculateDistance } from './location';

// Sample data for major cities
const majorCities = [
  { name: 'Delhi', location: { lat: 28.6139, lng: 77.2090 }, baseNoise: 85 },
  { name: 'Mumbai', location: { lat: 19.0760, lng: 72.8777 }, baseNoise: 82 },
  { name: 'Bangalore', location: { lat: 12.9716, lng: 77.5946 }, baseNoise: 78 },
  { name: 'Chennai', location: { lat: 13.0827, lng: 80.2707 }, baseNoise: 76 },
  { name: 'Kolkata', location: { lat: 22.5726, lng: 88.3639 }, baseNoise: 80 },
  { name: 'Hyderabad', location: { lat: 17.3850, lng: 78.4867 }, baseNoise: 77 }
];

// Generate time-based noise variation
const getTimeBasedNoise = (baseNoise: number, timestamp: number) => {
  const hour = new Date(timestamp).getHours();
  
  // Morning rush hour (7-10 AM)
  if (hour >= 7 && hour <= 10) {
    return baseNoise + Math.random() * 10;
  }
  
  // Evening rush hour (5-8 PM)
  if (hour >= 17 && hour <= 20) {
    return baseNoise + Math.random() * 8;
  }
  
  // Night time (11 PM - 5 AM)
  if (hour >= 23 || hour <= 5) {
    return baseNoise - Math.random() * 15;
  }
  
  // Regular hours
  return baseNoise + (Math.random() * 5 - 2.5);
};

// Generate readings for major cities with time-based variations
const generateMajorCityReadings = () => {
  const now = Date.now();
  const readings: NoiseReading[] = [];
  
  // Generate 24 hours of data for each city
  majorCities.forEach((city, cityIndex) => {
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = now - (hour * 3600000); // Go back hour by hour
      const baseNoise = getTimeBasedNoise(city.baseNoise, timestamp);
      
      readings.push({
        id: `city-${cityIndex}-${hour}`,
        latitude: city.location.lat,
        longitude: city.location.lng,
        decibel: Math.round(baseNoise),
        timestamp,
        deviceType: 'static',
        cityName: city.name
      });
    }
  });

  return readings;
};

// Generate readings for nearby areas with time-based variations
const generateNearbyAreas = (center: { lat: number, lng: number }) => {
  const now = Date.now();
  const readings: NoiseReading[] = [];
  
  const areas = [
    { name: 'Tambaram', offset: { lat: -0.05, lng: 0.02 }, baseNoise: 72 },
    { name: 'Vandalur', offset: { lat: -0.08, lng: 0.03 }, baseNoise: 68 },
    { name: 'Perungalathur', offset: { lat: -0.06, lng: 0.01 }, baseNoise: 70 },
    { name: 'Chromepet', offset: { lat: -0.04, lng: 0.02 }, baseNoise: 75 },
    { name: 'Pallavaram', offset: { lat: -0.03, lng: 0.01 }, baseNoise: 73 },
    { name: 'Guduvanchery', offset: { lat: -0.09, lng: 0.02 }, baseNoise: 65 }
  ];

  // Generate 24 hours of data for each area
  areas.forEach((area, areaIndex) => {
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = now - (hour * 3600000);
      const baseNoise = getTimeBasedNoise(area.baseNoise, timestamp);
      
      readings.push({
        id: `nearby-${areaIndex}-${hour}`,
        latitude: center.lat + area.offset.lat,
        longitude: center.lng + area.offset.lng,
        decibel: Math.round(baseNoise),
        timestamp,
        deviceType: 'static',
        cityName: area.name
      });
    }
  });

  return readings;
};

// Get noise readings with location filtering and time-based data
export const getNoiseReadings = (filters: FilterOptions & { radius?: number; center?: UserLocation }): NoiseReading[] => {
  const cityReadings = generateMajorCityReadings();
  
  if (!filters.center) {
    return cityReadings;
  }

  const nearbyReadings = generateNearbyAreas({
    lat: filters.center.latitude,
    lng: filters.center.longitude
  });

  let allReadings = [...cityReadings, ...nearbyReadings];

  // Filter by radius if specified
  if (filters.radius) {
    allReadings = allReadings.filter(reading => {
      const distance = calculateDistance(
        filters.center!.latitude,
        filters.center!.longitude,
        reading.latitude,
        reading.longitude
      );
      return distance <= filters.radius!;
    });
  }

  // Filter by decibel range
  allReadings = allReadings.filter(
    reading => reading.decibel >= filters.minDecibel && reading.decibel <= filters.maxDecibel
  );

  // Sort by timestamp
  allReadings.sort((a, b) => b.timestamp - a.timestamp);

  return allReadings;
};

// Add a noise reading
export const addNoiseReading = (reading: Omit<NoiseReading, 'id'>): NoiseReading => {
  const newReading = {
    ...reading,
    id: Math.random().toString(36).substring(2, 11),
  };
  return newReading as NoiseReading;
};

// Generate hotspots from noise readings
export const generateHotspots = (readings: NoiseReading[]): HotspotData[] => {
  if (readings.length === 0) return [];

  const hotspots: HotspotData[] = [];
  const processedReadings = new Set<string>();

  readings.forEach(reading => {
    if (processedReadings.has(reading.id)) return;

    const nearby = readings.filter(r => {
      if (r.id === reading.id || processedReadings.has(r.id)) return false;
      const distance = calculateDistance(
        reading.latitude,
        reading.longitude,
        r.latitude,
        r.longitude
      );
      return distance <= 2;
    });

    const allInHotspot = [reading, ...nearby];
    allInHotspot.forEach(r => processedReadings.add(r.id));

    const sumCoords = allInHotspot.reduce(
      (sum, r) => ({
        lat: sum.lat + r.latitude,
        lng: sum.lng + r.longitude,
      }),
      { lat: 0, lng: 0 }
    );

    const avgLat = sumCoords.lat / allInHotspot.length;
    const avgLng = sumCoords.lng / allInHotspot.length;
    const avgDecibel = allInHotspot.reduce((sum, r) => sum + r.decibel, 0) / allInHotspot.length;

    hotspots.push({
      id: `hotspot-${hotspots.length + 1}`,
      latitude: avgLat,
      longitude: avgLng,
      averageDecibel: avgDecibel,
      readingCount: allInHotspot.length,
      radius: Math.max(0.25, 0.5) * 1000,
      cityName: allInHotspot[0].cityName
    });
  });

  return hotspots;
};

// Get severity level from decibel value
export const getSeverityLevel = (decibel: number): 'low' | 'moderate' | 'high' | 'dangerous' => {
  if (decibel < 70) return 'low';
  if (decibel < 85) return 'moderate';
  if (decibel < 100) return 'high';
  return 'dangerous';
};

// Get color for severity level
export const getSeverityColor = (severity: 'low' | 'moderate' | 'high' | 'dangerous'): string => {
  switch (severity) {
    case 'low':
      return '#22c55e';
    case 'moderate':
      return '#f59e0b';
    case 'high':
      return '#ef4444';
    case 'dangerous':
      return '#7f1d1d';
    default:
      return '#22c55e';
  }
};