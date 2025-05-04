import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { MapPin, Volume2, AlertTriangle, Clock, Brain, Activity, Heart } from 'lucide-react';
import { getNoiseReadings } from '../../utils/noise';
import { getCurrentLocation } from '../../utils/location';
import { analyzeNoisePattern, getHealthImpact, predictFutureNoise } from '../../utils/ai';
import { FilterOptions, UserLocation, NoiseAnalysis, HealthImpact } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TWO_HOURS = 2 * 60 * 60 * 1000;

const AnalyticsDashboard: React.FC = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [localReadings, setLocalReadings] = useState<any[]>([]);
  const [nearbyLocations, setNearbyLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastNearbyUpdate, setLastNearbyUpdate] = useState(Date.now());
  const [nextUpdateTime, setNextUpdateTime] = useState<Date>(new Date(Date.now() + TWO_HOURS));
  const [noiseAnalysis, setNoiseAnalysis] = useState<NoiseAnalysis | null>(null);
  const [healthImpact, setHealthImpact] = useState<HealthImpact | null>(null);
  const [futurePrediction, setFuturePrediction] = useState<number[]>([]);

  // Function to load nearby locations data
  const loadNearbyData = async (location: UserLocation) => {
    const nearby = getNoiseReadings({
      timeRange: 'day',
      minDecibel: 0,
      maxDecibel: 150,
      radius: 20,
      center: location
    });

    setNearbyLocations(nearby);
    setLastNearbyUpdate(Date.now());
    setNextUpdateTime(new Date(Date.now() + TWO_HOURS));
  };

  // Function to load current location data and perform AI analysis
  const loadLocalData = async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);

      // Get readings within 5km radius
      const readings = getNoiseReadings({
        timeRange: 'day',
        minDecibel: 0,
        maxDecibel: 150,
        radius: 5,
        center: location
      });

      setLocalReadings(readings);

      // Perform AI analysis
      const analysis = await analyzeNoisePattern(readings);
      setNoiseAnalysis(analysis);

      const impact = await getHealthImpact(readings);
      setHealthImpact(impact);

      const prediction = await predictFutureNoise(readings);
      setFuturePrediction(prediction);

      // Check if we need to update nearby locations
      const timeSinceLastUpdate = Date.now() - lastNearbyUpdate;
      if (timeSinceLastUpdate >= TWO_HOURS) {
        await loadNearbyData(location);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);

        // Load both local and nearby data initially
        const readings = getNoiseReadings({
          timeRange: 'day',
          minDecibel: 0,
          maxDecibel: 150,
          radius: 5,
          center: location
        });

        setLocalReadings(readings);
        await loadNearbyData(location);

        // Initial AI analysis
        const analysis = await analyzeNoisePattern(readings);
        setNoiseAnalysis(analysis);

        const impact = await getHealthImpact(readings);
        setHealthImpact(impact);

        const prediction = await predictFutureNoise(readings);
        setFuturePrediction(prediction);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    const localInterval = setInterval(loadLocalData, 60000);
    const nearbyInterval = setInterval(() => {
      if (userLocation) {
        loadNearbyData(userLocation);
      }
    }, TWO_HOURS);

    return () => {
      clearInterval(localInterval);
      clearInterval(nearbyInterval);
    };
  }, []);

  // Calculate statistics
  const averageDecibel = localReadings.length > 0
    ? Math.round(localReadings.reduce((sum, r) => sum + r.decibel, 0) / localReadings.length)
    : 0;

  const maxDecibel = localReadings.length > 0
    ? Math.max(...localReadings.map(r => r.decibel))
    : 0;

  const minDecibel = localReadings.length > 0
    ? Math.min(...localReadings.map(r => r.decibel))
    : 0;

  // Prepare time series data with predictions
  const timeSeriesData = {
    labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
    datasets: [
      {
        label: 'Local Noise Level (dB)',
        data: localReadings.slice(-8).map(r => r.decibel),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        tension: 0.4,
      },
      {
        label: 'Predicted Noise Level (dB)',
        data: futurePrediction,
        borderColor: 'rgba(147, 51, 234, 1)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
      }
    ]
  };

  // Prepare nearby locations data
  const nearbyData = {
    labels: nearbyLocations.slice(0, 6).map(l => l.cityName || 'Local Area'),
    datasets: [{
      label: 'Average Noise Level (dB)',
      data: nearbyLocations.slice(0, 6).map(l => l.decibel),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
    }]
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="bg-blue-600 text-white p-6">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI-Powered Noise Analytics
          </h2>
          <p className="text-blue-100 text-sm">
            Smart analysis of noise patterns and health impacts in your area.
          </p>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Location Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-medium text-blue-900">Your Location</h3>
                    <p className="text-sm text-blue-700">
                      Latitude: {userLocation?.latitude.toFixed(4)}, 
                      Longitude: {userLocation?.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              {noiseAnalysis && (
                <div className="bg-purple-50 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <Brain className="h-5 w-5 text-purple-600 mt-1" />
                    <div>
                      <h3 className="font-medium text-purple-900">AI Analysis</h3>
                      <p className="text-sm text-purple-700 mt-1">{noiseAnalysis.insight}</p>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div className="bg-white rounded p-3">
                          <span className="text-sm text-purple-600">Pattern Type</span>
                          <p className="font-medium">{noiseAnalysis.patternType}</p>
                        </div>
                        <div className="bg-white rounded p-3">
                          <span className="text-sm text-purple-600">Confidence</span>
                          <p className="font-medium">{noiseAnalysis.confidence}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Health Impact */}
              {healthImpact && (
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <Heart className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <h3 className="font-medium text-green-900">Health Impact Analysis</h3>
                      <p className="text-sm text-green-700 mt-1">{healthImpact.summary}</p>
                      <div className="mt-2 space-y-2">
                        {healthImpact.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-green-700">
                            <Activity className="h-4 w-4" />
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Update Timer */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-5 w-5" />
                  <span>Next nearby areas update:</span>
                </div>
                <span className="font-medium">
                  {nextUpdateTime.toLocaleTimeString()}
                </span>
              </div>

              {/* Current Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-green-600 font-medium">Average Level</div>
                  <div className="text-2xl font-bold text-green-700">{averageDecibel} dB</div>
                  <div className="text-sm text-green-600 mt-1">Based on {localReadings.length} readings</div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600 font-medium">Minimum Level</div>
                  <div className="text-2xl font-bold text-blue-700">{minDecibel} dB</div>
                  <div className="text-sm text-blue-600 mt-1">Quietest moment today</div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-sm text-red-600 font-medium">Maximum Level</div>
                  <div className="text-2xl font-bold text-red-700">{maxDecibel} dB</div>
                  <div className="text-sm text-red-600 mt-1">Peak noise level</div>
                </div>
              </div>

              {/* Noise Level Warning */}
              {averageDecibel > 70 && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">High Noise Level Alert</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      The average noise level in your area is above recommended limits. 
                      Extended exposure may be harmful to health.
                    </p>
                  </div>
                </div>
              )}

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">24-Hour Noise Pattern with AI Prediction</h3>
                  <Line 
                    data={timeSeriesData} 
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: true },
                      },
                      scales: {
                        y: { min: 40, max: 100 }
                      }
                    }} 
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-4">Nearby Areas Comparison</h3>
                  <Bar 
                    data={nearbyData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                      },
                      scales: {
                        y: { beginAtZero: true }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Noise Level Guide */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-3">Noise Level Guide</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>&lt; 70 dB - Safe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>70-85 dB - Moderate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>85-100 dB - Harmful</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-900"></div>
                    <span>&gt; 100 dB - Dangerous</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;