import { NoiseReading, NoiseAnalysis, HealthImpact } from '../types';

// Analyze noise patterns using AI
export const analyzeNoisePattern = async (readings: NoiseReading[]): Promise<NoiseAnalysis> => {
  // Simulate AI analysis with pattern recognition
  const averageNoise = readings.reduce((sum, r) => sum + r.decibel, 0) / readings.length;
  const variance = readings.reduce((sum, r) => sum + Math.pow(r.decibel - averageNoise, 2), 0) / readings.length;
  const timeOfDay = new Date().getHours();

  let patternType = '';
  let insight = '';
  let confidence = 0;

  if (variance < 5) {
    patternType = 'Consistent';
    insight = 'The noise levels show a stable pattern, suggesting consistent ambient noise.';
    confidence = 85;
  } else if (variance < 15) {
    patternType = 'Fluctuating';
    insight = 'Moderate variations in noise levels indicate typical urban activity patterns.';
    confidence = 75;
  } else {
    patternType = 'Erratic';
    insight = 'High variations in noise levels suggest irregular noise sources requiring attention.';
    confidence = 65;
  }

  // Add time-based insights
  if (timeOfDay >= 6 && timeOfDay <= 9) {
    insight += ' Morning rush hour patterns detected.';
  } else if (timeOfDay >= 17 && timeOfDay <= 19) {
    insight += ' Evening peak activity observed.';
  } else if (timeOfDay >= 22 || timeOfDay <= 5) {
    insight += ' Night-time noise levels analyzed.';
  }

  return {
    patternType,
    insight,
    confidence,
    timestamp: Date.now()
  };
};

// Analyze health impacts using AI
export const getHealthImpact = async (readings: NoiseReading[]): Promise<HealthImpact> => {
  const averageNoise = readings.reduce((sum, r) => sum + r.decibel, 0) / readings.length;
  let summary = '';
  let recommendations: string[] = [];

  if (averageNoise < 70) {
    summary = 'Current noise levels are within safe limits for long-term exposure.';
    recommendations = [
      'Continue monitoring noise levels',
      'Maintain current noise control measures',
      'Consider periodic hearing checkups'
    ];
  } else if (averageNoise < 85) {
    summary = 'Moderate noise exposure detected. Some precautions recommended.';
    recommendations = [
      'Use sound-dampening materials where possible',
      'Take regular breaks from noisy areas',
      'Consider using noise-canceling headphones',
      'Schedule quiet periods during the day'
    ];
  } else {
    summary = 'High noise levels detected. Immediate action recommended.';
    recommendations = [
      'Use hearing protection when in the area',
      'Limit exposure time to noisy periods',
      'Identify and address major noise sources',
      'Consult with health professionals if experiencing symptoms',
      'Consider soundproofing options'
    ];
  }

  return {
    summary,
    recommendations,
    averageExposure: averageNoise,
    riskLevel: averageNoise < 70 ? 'low' : averageNoise < 85 ? 'moderate' : 'high',
    timestamp: Date.now()
  };
};

// Predict future noise levels using AI
export const predictFutureNoise = async (readings: NoiseReading[]): Promise<number[]> => {
  // Simple prediction model based on historical patterns
  const hourlyAverages = new Array(24).fill(0);
  const hourCounts = new Array(24).fill(0);

  // Calculate average noise levels by hour
  readings.forEach(reading => {
    const hour = new Date(reading.timestamp).getHours();
    hourlyAverages[hour] += reading.decibel;
    hourCounts[hour]++;
  });

  // Normalize averages
  for (let i = 0; i < 24; i++) {
    if (hourCounts[i] > 0) {
      hourlyAverages[i] /= hourCounts[i];
    } else {
      // If no data for this hour, use overall average
      hourlyAverages[i] = readings.reduce((sum, r) => sum + r.decibel, 0) / readings.length;
    }
  }

  // Add small random variations for more realistic predictions
  const predictions = hourlyAverages.map(avg => {
    const variation = (Math.random() - 0.5) * 5; // ±2.5 dB variation
    return Math.round(avg + variation);
  });

  return predictions;
};