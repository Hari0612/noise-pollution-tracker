import React, { useState, useEffect } from 'react';
import { Volume, Volume1, Volume2, VolumeX, ThumbsUp, Info } from 'lucide-react';
import { getCurrentLocation } from '../../utils/location';
import { addNoiseReading } from '../../utils/noise';
import { NoiseReading, UserLocation } from '../../types';

const NoiseMeter: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentDecibel, setCurrentDecibel] = useState<number | null>(null);
  const [maxDecibel, setMaxDecibel] = useState<number | null>(null);
  const [averageDecibel, setAverageDecibel] = useState<number | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [readings, setReadings] = useState<number[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // Simulate microphone access and recording
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        // In a real app, this would get actual microphone input
        // For this demo, we'll simulate noise readings
        const baseNoise = 60; // base ambient noise level
        const randomVariance = Math.random() * 20 - 10; // -10 to 10
        const timeVariance = Math.sin(Date.now() / 1000) * 5; // Sine wave variation
        const newDecibel = Math.round(baseNoise + randomVariance + timeVariance);
        
        setCurrentDecibel(newDecibel);
        setReadings(prev => [...prev, newDecibel]);
        
        if (!maxDecibel || newDecibel > maxDecibel) {
          setMaxDecibel(newDecibel);
        }

        // Calculate average
        const avg = readings.length > 0 
          ? readings.reduce((sum, val) => sum + val, 0) / readings.length 
          : newDecibel;
        setAverageDecibel(Math.round(avg));
        
        setRecordingTime(prev => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRecording, readings, maxDecibel]);

  // Get user location when starting recording
  useEffect(() => {
    if (isRecording && !userLocation) {
      getCurrentLocation()
        .then(location => setUserLocation(location))
        .catch(err => console.error('Error getting location:', err));
    }
  }, [isRecording, userLocation]);

  const handleToggleRecording = () => {
    if (!isRecording) {
      // Start new recording
      setCurrentDecibel(null);
      setMaxDecibel(null);
      setAverageDecibel(null);
      setRecordingTime(0);
      setReadings([]);
      setSubmissionStatus('idle');
    }
    setIsRecording(!isRecording);
  };

  const handleSubmitReading = () => {
    if (!averageDecibel || !userLocation) return;

    setSubmissionStatus('submitting');

    // Create the noise reading object
    const newReading: Omit<NoiseReading, 'id'> = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      decibel: averageDecibel,
      timestamp: Date.now(),
      deviceType: 'mobile', // In a real app, detect the device type
    };

    // Add the reading to our data
    try {
      addNoiseReading(newReading);
      setSubmissionStatus('success');
      
      // Reset after a few seconds
      setTimeout(() => {
        setSubmissionStatus('idle');
        setIsRecording(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting reading:', error);
      setSubmissionStatus('error');
    }
  };

  const getNoiseLevelIcon = () => {
    if (!currentDecibel) return <VolumeX className="h-6 w-6" />;
    if (currentDecibel < 65) return <Volume className="h-6 w-6" />;
    if (currentDecibel < 85) return <Volume1 className="h-6 w-6" />;
    return <Volume2 className="h-6 w-6" />;
  };

  const getNoiseLevelText = () => {
    if (!currentDecibel) return 'Not recording';
    if (currentDecibel < 65) return 'Quiet';
    if (currentDecibel < 75) return 'Moderate';
    if (currentDecibel < 85) return 'Loud';
    if (currentDecibel < 95) return 'Very Loud';
    return 'Extremely Loud';
  };

  const getDecibelColor = () => {
    if (!currentDecibel) return 'text-gray-500';
    if (currentDecibel < 65) return 'text-green-500';
    if (currentDecibel < 75) return 'text-green-600';
    if (currentDecibel < 85) return 'text-yellow-500';
    if (currentDecibel < 95) return 'text-orange-500';
    return 'text-red-600';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-6">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <Volume2 className="h-6 w-6" />
            Noise Level Meter
          </h2>
          <p className="text-blue-100 text-sm">
            Measure and submit noise levels from your location to help map noise pollution across India.
          </p>
        </div>

        <div className="p-6">
          {/* Meter Display */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-48 h-48 rounded-full border-8 border-gray-100 flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className={`text-5xl font-bold transition-colors ${getDecibelColor()}`}>
                    {currentDecibel !== null ? currentDecibel : '--'}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">dB</div>
                </div>
              </div>
              
              {/* Animated pulse when recording */}
              {isRecording && (
                <div className="absolute inset-0 -m-1">
                  <div className="absolute inset-0 rounded-full border-8 border-blue-500 opacity-30 animate-ping"></div>
                </div>
              )}
              
              {/* Status Indicator */}
              <div className="absolute -top-2 -right-2 bg-white rounded-full shadow p-1">
                <div className={`w-4 h-4 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-2 font-medium">
              {getNoiseLevelIcon()}
              <span className={getDecibelColor()}>{getNoiseLevelText()}</span>
            </div>
            
            <div className="text-sm text-gray-500 mt-1">
              {isRecording && <span>Recording: {formatTime(recordingTime)}</span>}
            </div>
          </div>

          {/* Stats */}
          {(isRecording || averageDecibel !== null) && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-500">Average</div>
                <div className="text-xl font-semibold">{averageDecibel !== null ? `${averageDecibel} dB` : '--'}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-500">Maximum</div>
                <div className="text-xl font-semibold">{maxDecibel !== null ? `${maxDecibel} dB` : '--'}</div>
              </div>
            </div>
          )}

          {/* Location */}
          {userLocation && (
            <div className="bg-blue-50 rounded-lg p-3 mb-6">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-blue-700">Location detected</div>
                  <div className="text-xs text-blue-800 mt-1">
                    Latitude: {userLocation.latitude.toFixed(4)}<br />
                    Longitude: {userLocation.longitude.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 focus:outline-none transition-colors ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              onClick={handleToggleRecording}
              disabled={submissionStatus === 'submitting'}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            
            {!isRecording && averageDecibel !== null && submissionStatus === 'idle' && (
              <button
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 focus:outline-none transition-colors"
                onClick={handleSubmitReading}
              >
                Submit Reading
              </button>
            )}
          </div>
          
          {/* Submission status */}
          {submissionStatus === 'submitting' && (
            <div className="mt-4 text-center text-blue-600">
              <div className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full mr-2"></div>
              Submitting your reading...
            </div>
          )}
          
          {submissionStatus === 'success' && (
            <div className="mt-4 bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2">
              <ThumbsUp className="h-5 w-5" />
              <span>Thank you! Your data has been successfully added to our noise map.</span>
            </div>
          )}
          
          {submissionStatus === 'error' && (
            <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg">
              There was an error submitting your reading. Please try again.
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">About Noise Measurement</h3>
        <div className="space-y-4 text-gray-700">
          <p>
            Your device's microphone is used to measure ambient noise levels in decibels (dB).
            For accurate readings:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Keep your device in a stable position</li>
            <li>Avoid covering the microphone</li>
            <li>Record for at least 30 seconds to get a meaningful average</li>
            <li>Avoid extremely noisy environments that might distort readings</li>
          </ul>
          <p className="text-sm text-gray-500 italic">
            Note: Measurements are approximations and may vary based on device capabilities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoiseMeter;