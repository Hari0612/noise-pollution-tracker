import React from 'react';
import { Volume2, Mail, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <Volume2 className="h-6 w-6" />
              <span>NoiseTrack India</span>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering citizens and policymakers with AI-driven noise pollution data to create quieter, healthier communities across India.
            </p>
            <div className="flex items-center gap-2 text-gray-400">
              <Mail className="h-5 w-5" />
              <a href="mailto:contact@noisetrack.in" className="hover:text-blue-400 transition-colors">
                contact@noisetrack.in
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1">
                  Noise Pollution Guidelines
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1">
                  Health Impact Studies
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1">
                  Policy Recommendations
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1">
                  Research Papers
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Get Involved</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Contribute Data
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Become a Partner
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Educational Programs
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Volunteer Opportunities
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} NoiseTrack India. All rights reserved.</p>
          <p className="mt-1">
            Developed for noise monitoring across India. 
            <a href="#" className="text-gray-400 hover:text-blue-400 ml-1 transition-colors">Privacy Policy</a> | 
            <a href="#" className="text-gray-400 hover:text-blue-400 ml-1 transition-colors">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;