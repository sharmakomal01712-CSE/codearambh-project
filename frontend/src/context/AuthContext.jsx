import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('sehatkosh_token');
    const savedUser = localStorage.getItem('sehatkosh_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('sehatkosh_token');
        localStorage.removeItem('sehatkosh_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('sehatkosh_user', JSON.stringify(userData));
    localStorage.setItem('sehatkosh_token', jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sehatkosh_user');
    localStorage.removeItem('sehatkosh_token');
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem('sehatkosh_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
