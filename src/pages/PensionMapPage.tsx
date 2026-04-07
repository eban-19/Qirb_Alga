import React, { useState, useEffect } from 'react';
import SimpleMapContainer from '../components/SimpleMapContainer';
import { MapPension, NearbyPension } from '../types/location';
import locationService from '../services/locationService';

const PensionMapPage: React.FC = () => {
  const [pensions, setPensions] = useState<MapPension[]>([]);
  const [selectedPension, setSelectedPension] = useState<MapPension | null>(null);
  const [nearbyPensions, setNearbyPensions] = useState<NearbyPension[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  // Load pensions for map
  useEffect(() => {
    const loadPensions = async () => {
      try {
        const response = await locationService.getMapPensions();
        if (response.success) {
          setPensions(response.data as MapPension[]);
        } else {
          setError('Failed to load pensions');
        }
      } catch (err) {
        setError('Error loading pensions');
        console.error('Pensions error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPensions();
  }, []);

  // Handle pension selection
  const handlePensionClick = (pension: MapPension) => {
    setSelectedPension(pension);
    setShowSidebar(true);
  };

  // Close sidebar
  const handleCloseSidebar = () => {
    setShowSidebar(false);
    setSelectedPension(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading pensions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Pension Map</h1>
              <span className="ml-4 text-sm text-gray-500">
                {pensions.length} pensions available
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                {showSidebar ? 'Hide' : 'Show'} List
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        <div className="flex h-screen pt-16">
          {/* Sidebar */}
          {showSidebar && (
            <div className="w-80 bg-white shadow-lg overflow-y-auto">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Pensions</h2>
                <p className="text-sm text-gray-500">
                  {nearbyPensions.length > 0 
                    ? `${nearbyPensions.length} nearby` 
                    : `${pensions.length} total`
                  }
                </p>
              </div>

              <div className="p-4 space-y-4">
                {(nearbyPensions.length > 0 ? nearbyPensions : pensions).map((pension) => (
                  <div
                    key={pension.pension_id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handlePensionClick(pension)}
                  >
                    <h3 className="font-semibold text-gray-900">{pension.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{pension.address}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {pension.city}, {pension.region}
                    </p>
                    
                    {pension.price_range && (
                      <p className="text-sm font-semibold text-green-600 mt-2">
                        {pension.price_range}
                      </p>
                    )}

                    {'distance_km' in pension && (
                      <p className="text-sm text-blue-600 mt-1">
                        {(pension as NearbyPension).distance_km.toFixed(1)} km away
                      </p>
                    )}

                    {pension.image_url && (
                      <img 
                        src={pension.image_url} 
                        alt={pension.name}
                        className="w-full h-32 object-cover rounded mt-2"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          <div className="flex-1">
            <SimpleMapContainer
              pensions={nearbyPensions.length > 0 ? nearbyPensions : pensions}
              onPensionClick={handlePensionClick}
              showUserLocation={true}
              height="100%"
            />
          </div>
        </div>
      </main>

      {/* Pension Details Sidebar */}
      {showSidebar && selectedPension && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black opacity-50" onClick={handleCloseSidebar}></div>
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{selectedPension.name}</h2>
                <button
                  onClick={handleCloseSidebar}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {selectedPension.image_url && (
                <img 
                  src={selectedPension.image_url} 
                  alt={selectedPension.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Address</h3>
                  <p className="text-gray-600">{selectedPension.address}</p>
                  <p className="text-sm text-gray-500">
                    {selectedPension.city}, {selectedPension.region}
                  </p>
                </div>

                {selectedPension.price_range && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Price Range</h3>
                    <p className="text-green-600 font-semibold">{selectedPension.price_range}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-900">Rating</h3>
                  <div className="flex items-center">
                    <span className="text-yellow-500">★★★★☆</span>
                    <span className="ml-2 text-gray-600">4.0 (12 reviews)</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <button
                    onClick={() => {
                      // Navigate to pension details page
                      window.location.href = `/pensions/${selectedPension.pension_id}`;
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View Details
                  </button>
                  
                  <button
                    onClick={() => {
                      // Navigate to booking page
                      window.location.href = `/booking/${selectedPension.pension_id}`;
                    }}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PensionMapPage;
