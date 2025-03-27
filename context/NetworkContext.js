import React, { createContext, useEffect, useState, useContext } from 'react';
import NetInfo from "@react-native-community/netinfo"; 

const NetworkContext = createContext({
  isConnected: true,
});

export const NetworkProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Set up a single listener for network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log('Network state changed:', state.isConnected);
      setIsConnected(!!state.isConnected); // Convert to boolean to ensure consistent type
    });

    // Initial check
    NetInfo.fetch().then(state => {
      setIsConnected(!!state.isConnected);
    });

    // Clean up listener when component unmounts
    return () => {
      unsubscribe(); 
    };
  }, []);

  // Provide a simple value object that won't cause unnecessary re-renders
  const value = React.useMemo(() => ({ isConnected }), [isConnected]);

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
