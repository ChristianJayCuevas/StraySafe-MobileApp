import React, { createContext, useState, useContext } from 'react';

// Create the User Context
const UserContext = createContext();

// Custom hook to use the User Context
export const useUserContext = () => {
  return useContext(UserContext);
};

// Provider component to wrap the app
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
