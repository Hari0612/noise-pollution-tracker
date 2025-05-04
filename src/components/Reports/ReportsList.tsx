import React, { useState, useEffect } from 'react';
import { FileText, Phone, Mail, Globe, MapPin, Building2, Loader2 } from 'lucide-react';
import { getCurrentLocation, getLocationName } from '../../utils/location';
import { UserLocation } from '../../types';

const ReportsList: React.FC = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [organizations, setOrganizations] = useState<any[]>([]);

  useEffect(() => {
    const loadLocationData = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
        const name = await getLocationName(location.latitude, location.longitude);
        setLocationName(name);

        // Get state from location name
        const locationParts = name.split(', ');
        const state = locationParts.find(part => 
          ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana']
            .includes(part)
        ) || 'Delhi';

        // Get state-specific organizations
        const stateOrgs = getStateOrganizations(state);
        setOrganizations(stateOrgs);
      } catch (error) {
        console.error('Error getting location:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocationData();
  }, []);

  const getStateOrganizations = (state: string) => {
    const orgsByState: { [key: string]: any[] } = {
      'Delhi': [
        {
          id: 1,
          name: 'Delhi Pollution Control Committee',
          description: 'State-level authority for monitoring and controlling environmental pollution in Delhi.',
          address: '4th Floor, ISBT Building, Kashmere Gate, Delhi-110006',
          phone: '011-43102256',
          email: 'dpcc@nic.in',
          website: 'https://dpcc.delhigovt.nic.in',
          type: 'Government',
        },
        {
          id: 2,
          name: 'Central Pollution Control Board',
          description: 'National level organization for monitoring and controlling environmental pollution.',
          address: 'Parivesh Bhawan, East Arjun Nagar, Delhi-110032',
          phone: '011-43102030',
          email: 'cpcb@nic.in',
          website: 'https://cpcb.nic.in',
          type: 'Government',
        }
      ],
      'Maharashtra': [
        {
          id: 3,
          name: 'Maharashtra Pollution Control Board',
          description: 'State-level environmental protection agency for Maharashtra.',
          address: 'Kalpataru Point, Sion, Mumbai-400022',
          phone: '022-24020781',
          email: 'mpcb@mpcb.gov.in',
          website: 'https://mpcb.gov.in',
          type: 'Government',
        }
      ],
      'Karnataka': [
        {
          id: 4,
          name: 'Karnataka State Pollution Control Board',
          description: 'Environmental protection authority for Karnataka state.',
          address: 'Church Street, Bengaluru-560001',
          phone: '080-25589112',
          email: 'kspcb@kspcb.gov.in',
          website: 'https://kspcb.gov.in',
          type: 'Government',
        }
      ],
      'Tamil Nadu': [
        {
          id: 5,
          name: 'Tamil Nadu Pollution Control Board',
          description: 'State pollution monitoring and control authority for Tamil Nadu.',
          address: '76, Mount Salai, Guindy, Chennai-600032',
          phone: '044-22353134',
          email: 'tnpcb@tn.nic.in',
          website: 'https://tnpcb.gov.in',
          type: 'Government',
        }
      ],
      'West Bengal': [
        {
          id: 6,
          name: 'West Bengal Pollution Control Board',
          description: 'State environmental regulatory authority for West Bengal.',
          address: 'Paribesh Bhawan, 10A Block, LA, Sector III, Kolkata-700098',
          phone: '033-23355073',
          email: 'wbpcb@wbpcb.gov.in',
          website: 'https://wbpcb.gov.in',
          type: 'Government',
        }
      ],
      'Telangana': [
        {
          id: 7,
          name: 'Telangana State Pollution Control Board',
          description: 'Environmental protection and monitoring body for Telangana.',
          address: 'Paryavarana Bhavan, A-3, IE, Sanathnagar, Hyderabad-500018',
          phone: '040-23887500',
          email: 'tspcb@telangana.gov.in',
          website: 'https://tspcb.cgg.gov.in',
          type: 'Government',
        }
      ]
    };

    return [
      ...(orgsByState[state] || []),
      {
        id: 8,
        name: 'National Green Tribunal',
        description: 'Dedicated environmental court handling cases related to environmental protection.',
        address: 'Copernicus Marg, New Delhi-110001',
        phone: '011-23043501',
        email: 'filing.ngt@nic.in',
        website: 'https://greentribunal.gov.in',
        type: 'Legal',
      }
    ];
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
        <div className="bg-blue-600 text-white p-6">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Report Noise Pollution
          </h2>
          <p className="text-blue-100 text-sm">
            Contact these organizations to report noise pollution in your area.
          </p>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-600">Loading location data...</span>
            </div>
          ) : (
            <>
              {userLocation && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-medium text-blue-900">Your Location</h3>
                      <p className="text-sm text-blue-700">{locationName}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                {organizations.map((org) => (
                  <div 
                    key={org.id} 
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {org.type}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{org.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex items-start gap-2 text-gray-600">
                            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                            <span>{org.address}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-5 w-5 text-gray-400" />
                            <a href={`tel:${org.phone}`} className="hover:text-blue-600">
                              {org.phone}
                            </a>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <a href={`mailto:${org.email}`} className="hover:text-blue-600">
                              {org.email}
                            </a>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-600">
                            <Globe className="h-5 w-5 text-gray-400" />
                            <a 
                              href={org.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-blue-600"
                            >
                              {org.website.replace('https://', '')}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">How to Report Noise Pollution</h3>
            <div className="space-y-4 text-gray-700">
              <p>
                When reporting noise pollution, please include the following information:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Exact location of the noise source</li>
                <li>Type of noise (construction, traffic, commercial activity, etc.)</li>
                <li>Time and duration of the noise</li>
                <li>Frequency of occurrence (daily, weekly, etc.)</li>
                <li>Any evidence (recordings, measurements from our app)</li>
                <li>Impact on your daily life</li>
              </ul>
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> For emergencies or severe violations, contact your local police station immediately. 
                  The organizations listed above handle formal complaints and long-term solutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsList;