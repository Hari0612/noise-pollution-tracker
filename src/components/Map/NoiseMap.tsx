import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';
import { HotspotData, UserLocation } from '../../types';
import { getCurrentLocation, getLocationName } from '../../utils/location';
import { getNoiseReadings, generateHotspots, getSeverityLevel, getSeverityColor } from '../../utils/noise';
import NoiseMapControls from './NoiseMapControls';

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]; // Center of India
const DEFAULT_ZOOM = 5;
const LOCAL_ZOOM = 12;

const LocationMarker: React.FC<{ location: UserLocation | null }> = ({ location }) => {
  const map = useMap();
  const [locationName, setLocationName] = useState<string>('');
  
  useEffect(() => {
    if (location) {
      map.flyTo([location.latitude, location.longitude], LOCAL_ZOOM, {
        animate: true,
        duration: 1.5,
      });

      // Get location name
      getLocationName(location.latitude, location.longitude)
        .then(name => setLocationName(name));
    }
  }, [location, map]);

  if (!location) return null;

  return (
    <Marker 
      position={[location.latitude, location.longitude]} 
      icon={new Icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })}
    >
      <Popup>
        <div className="text-center">
          <p className="font-medium">{locationName}</p>
          <p className="text-xs text-gray-500 mt-1">
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Accuracy: ±{Math.round(location.accuracy)}m
          </p>
        </div>
      </Popup>
    </Marker>
  );
};

const NoiseMap: React.FC = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [hotspots, setHotspots] = useState<HotspotData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day'>('day');
  const [localStats, setLocalStats] = useState({
    average: 0,
    max: 0,
    readings: 0,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      
      // Get all readings for major cities
      const allReadings = getNoiseReadings({ 
        timeRange,
        minDecibel: 0,
        maxDecibel: 150
      });

      // Get local readings
      const localReadings = getNoiseReadings({
        timeRange,
        minDecibel: 0,
        maxDecibel: 150,
        radius: 5,
        center: location
      });

      const generatedHotspots = generateHotspots([...allReadings, ...localReadings]);
      setHotspots(generatedHotspots);

      // Calculate local stats
      if (localReadings.length > 0) {
        const avg = localReadings.reduce((sum, r) => sum + r.decibel, 0) / localReadings.length;
        const max = Math.max(...localReadings.map(r => r.decibel));
        setLocalStats({
          average: Math.round(avg),
          max,
          readings: localReadings.length
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const handleLocateMe = async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] md:h-[calc(100vh-72px)] relative">
      {isLoading && (
        <div className="absolute z-10 inset-0 bg-white/80 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-700">Loading noise data...</p>
          </div>
        </div>
      )}
      
      <MapContainer 
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && <LocationMarker location={userLocation} />}
        
        {hotspots.map(hotspot => {
          const severity = getSeverityLevel(hotspot.averageDecibel);
          const color = getSeverityColor(severity);
          
          return (
            <Circle
              key={hotspot.id}
              center={[hotspot.latitude, hotspot.longitude]}
              radius={hotspot.radius}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.4,
                weight: 1,
              }}
            >
              <Popup>
                <div className="text-center p-1">
                  <h3 className="font-medium">{hotspot.cityName || 'Local Area'}</h3>
                  <p className="text-sm my-1">Average: {hotspot.averageDecibel.toFixed(1)} dB</p>
                  <p className="text-xs text-gray-600">Based on {hotspot.readingCount} readings</p>
                  <div className={`text-xs mt-2 py-1 px-2 rounded-full ${
                    severity === 'low' ? 'bg-green-100 text-green-800' :
                    severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                    severity === 'high' ? 'bg-red-100 text-red-800' :
                    'bg-red-900 text-white'
                  }`}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)} Noise Level
                  </div>
                </div>
              </Popup>
            </Circle>
          );
        })}
        
        <NoiseMapControls onLocateMe={handleLocateMe} />
      </MapContainer>
      
      <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-lg p-4 z-[1000]">
        <h2 className="font-medium text-gray-800 flex items-center gap-1 mb-4">
          <MapPin className="h-5 w-5 text-blue-600" />
          Noise Analysis
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-sm text-blue-600 font-medium">Local Avg</div>
            <div className="text-2xl font-bold text-blue-700">{localStats.average}dB</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-sm text-red-600 font-medium">Local Max</div>
            <div className="text-2xl font-bold text-red-700">{localStats.max}dB</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-sm text-green-600 font-medium">Readings</div>
            <div className="text-2xl font-bold text-green-700">{localStats.readings}</div>
          </div>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Major Cities Average (dB)</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {hotspots
              .filter(h => h.cityName)
              .sort((a, b) => b.averageDecibel - a.averageDecibel)
              .map(city => (
                <div key={city.id} className="flex justify-between items-center">
                  <span className="text-gray-600">{city.cityName}</span>
                  <span className="font-medium">{Math.round(city.averageDecibel)} dB</span>
                </div>
              ))
            }
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>&lt; 70 dB - Safe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500"></div>
            <span>70-85 dB - Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>85-100 dB - Harmful</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-900"></div>
            <span>&gt; 100 dB - Dangerous</span>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200">
          <button
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center gap-1"
            onClick={handleLocateMe}
          >
            <Navigation className="h-4 w-4" />
            <span>Update My Location</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoiseMap;

