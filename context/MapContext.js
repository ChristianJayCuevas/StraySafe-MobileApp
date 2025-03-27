import React, { createContext, useState, useContext } from 'react';

// Create the context
const MapContext = createContext();

// Provider component
export const MapProvider = ({ children }) => {
  const [mapLocation, setMapLocation] = useState({
    latitude: 14.6261,
    longitude: 121.0423,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [address, setAddress] = useState('');

  const updateLocation = (location, formattedAddress = '') => {
    setMapLocation(location);
    if (formattedAddress) {
      setAddress(formattedAddress);
    }
  };

  return (
    <MapContext.Provider value={{ mapLocation, address, updateLocation }}>
      {children}
    </MapContext.Provider>
  );
};

// Hook for easy access to the context
export const useMapContext = () => {
  return useContext(MapContext);
};
