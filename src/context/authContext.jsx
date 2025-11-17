import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
    const storedUserStr = localStorage.getItem('user');
    if (!storedUserStr) {
      return null;
    }

    try {
      const storedUser = JSON.parse(storedUserStr);
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return null;
      }

      jwtDecode(refreshToken)
      localStorage.setItem('user', JSON.stringify(storedUser));
      return storedUser;
    } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      return null;
    }
  });
 
  const loginContext = (data) => {
    const { accessToken, refreshToken } = data;
    try {
      let decodedUser = jwtDecode(accessToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(decodedUser));      
      setUser( decodedUser );
    } catch (error) {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  };

  const logoutContext = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user'); // <-- CORREGIDO
    setUser(null);
  };

  const getToken = () => {
    return localStorage.getItem('accessToken');
  };

  const value = {
    user,
    loginContext,
    logoutContext,
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};