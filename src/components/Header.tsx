import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, Volume2, MapPin, BarChart3, FileText } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
        <NavLink to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl md:text-2xl">
          <Volume2 className="h-6 w-6 md:h-7 md:w-7" />
          <span>NoiseTrack India</span>
        </NavLink>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `flex items-center gap-1 py-2 ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`
            }
            end
          >
            <MapPin className="h-5 w-5" />
            <span>Map</span>
          </NavLink>
          <NavLink 
            to="/measure" 
            className={({ isActive }) => 
              `flex items-center gap-1 py-2 ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`
            }
          >
            <Volume2 className="h-5 w-5" />
            <span>Measure</span>
          </NavLink>
          <NavLink 
            to="/analytics" 
            className={({ isActive }) => 
              `flex items-center gap-1 py-2 ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`
            }
          >
            <BarChart3 className="h-5 w-5" />
            <span>Analytics</span>
          </NavLink>
          <NavLink 
            to="/reports" 
            className={({ isActive }) => 
              `flex items-center gap-1 py-2 ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'}`
            }
          >
            <FileText className="h-5 w-5" />
            <span>Reports</span>
          </NavLink>
        </nav>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-fadeIn">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex flex-col">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `flex items-center gap-2 px-4 py-3 ${isActive ? 'text-blue-600 font-medium bg-blue-50 rounded-md' : 'text-gray-600'}`
                }
                onClick={() => setIsMenuOpen(false)}
                end
              >
                <MapPin className="h-5 w-5" />
                <span>Map</span>
              </NavLink>
              <NavLink 
                to="/measure" 
                className={({ isActive }) => 
                  `flex items-center gap-2 px-4 py-3 ${isActive ? 'text-blue-600 font-medium bg-blue-50 rounded-md' : 'text-gray-600'}`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                <Volume2 className="h-5 w-5" />
                <span>Measure</span>
              </NavLink>
              <NavLink 
                to="/analytics" 
                className={({ isActive }) => 
                  `flex items-center gap-2 px-4 py-3 ${isActive ? 'text-blue-600 font-medium bg-blue-50 rounded-md' : 'text-gray-600'}`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Analytics</span>
              </NavLink>
              <NavLink 
                to="/reports" 
                className={({ isActive }) => 
                  `flex items-center gap-2 px-4 py-3 ${isActive ? 'text-blue-600 font-medium bg-blue-50 rounded-md' : 'text-gray-600'}`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                <FileText className="h-5 w-5" />
                <span>Reports</span>
              </NavLink>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;