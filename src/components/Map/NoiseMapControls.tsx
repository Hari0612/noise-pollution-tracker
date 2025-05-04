import React from 'react';
import { useMap } from 'react-leaflet';
import { Plus, Minus, Calendar } from 'lucide-react';

interface NoiseMapControlsProps {
  onLocateMe: () => void;
  timeRange: 'day' | 'week' | 'month' | 'year' | 'all';
  onTimeRangeChange: (range: 'day' | 'week' | 'month' | 'year' | 'all') => void;
}

const NoiseMapControls: React.FC<NoiseMapControlsProps> = ({ 
  timeRange, 
  onTimeRangeChange 
}) => {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return (
    <div className="absolute right-4 top-4 z-[1000]">
      <div className="flex flex-col gap-2">
        <div className="bg-white rounded-md shadow-md">
          <button
            className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 transition-colors rounded-t-md border-b border-gray-200"
            onClick={handleZoomIn}
            aria-label="Zoom in"
          >
            <Plus className="h-5 w-5 text-gray-700" />
          </button>
          <button
            className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 transition-colors rounded-b-md"
            onClick={handleZoomOut}
            aria-label="Zoom out"
          >
            <Minus className="h-5 w-5 text-gray-700" />
          </button>
        </div>
        
        <div className="bg-white rounded-md shadow-md p-2 relative group">
          <button className="flex items-center justify-center w-6 h-6 mx-auto">
            <Calendar className="h-5 w-5 text-gray-700" />
          </button>
          
          <div className="hidden group-hover:block absolute top-full right-0 mt-2 bg-white rounded-md shadow-md p-2 w-32">
            <div className="space-y-1 text-sm">
              <button
                className={`w-full text-left px-2 py-1 rounded ${timeRange === 'day' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                onClick={() => onTimeRangeChange('day')}
              >
                Today
              </button>
              <button
                className={`w-full text-left px-2 py-1 rounded ${timeRange === 'week' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                onClick={() => onTimeRangeChange('week')}
              >
                This Week
              </button>
              <button
                className={`w-full text-left px-2 py-1 rounded ${timeRange === 'month' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                onClick={() => onTimeRangeChange('month')}
              >
                This Month
              </button>
              <button
                className={`w-full text-left px-2 py-1 rounded ${timeRange === 'year' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                onClick={() => onTimeRangeChange('year')}
              >
                This Year
              </button>
              <button
                className={`w-full text-left px-2 py-1 rounded ${timeRange === 'all' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                onClick={() => onTimeRangeChange('all')}
              >
                All Time
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoiseMapControls;