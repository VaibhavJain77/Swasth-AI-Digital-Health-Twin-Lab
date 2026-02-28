import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('swasth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [scanResults, setScanResults] = useState(() => {
    const saved = localStorage.getItem('swasth_scan_results');
    return saved ? JSON.parse(saved) : null;
  });

  const saveUser = (userData) => {
    setUser(userData);
    localStorage.setItem('swasth_user', JSON.stringify(userData));
  };

  const saveScanResults = (results) => {
    setScanResults(results);
    localStorage.setItem('swasth_scan_results', JSON.stringify(results));
  };

  const logout = () => {
    setUser(null);
    setScanResults(null);
    localStorage.removeItem('swasth_user');
    localStorage.removeItem('swasth_scan_results');
  };

  return (
    <UserContext.Provider value={{ user, saveUser, scanResults, saveScanResults, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
