import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    const storedUser = localStorage.getItem('user');
    
    if (storedRole && storedUser) {
      // If role is admin, ensure an admin token exists in localStorage
      if (storedRole === 'admin') {
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
          setRole(storedRole);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
          // stale client-side admin state without JWT — clear it
          localStorage.removeItem('role');
          localStorage.removeItem('user');
          setRole(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // non-admin roles rely on `token` key (if used) or client-only
        setRole(storedRole);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData, userRole, token = null) => {
    setUser(userData);
    setRole(userRole);
    setIsAuthenticated(true);
    localStorage.setItem('role', userRole);
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('adminToken', token);
      localStorage.setItem('token', token);
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
    // clear auth tokens and client-side role/user
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
