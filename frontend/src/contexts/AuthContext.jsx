import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from "../utils/axios";
import { useAuth } from './useAuth';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user") || "null"),
    company: JSON.parse(localStorage.getItem("company") || "null"),
    isAuthenticated: !!localStorage.getItem("token"),
    isLoading: false,
    error: null
  });

  // This function can be called after successful login/registration
  // The actual navigation should be handled in the component
  const handleAuthSuccess = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    
    if (data.company) {
      localStorage.setItem("company", JSON.stringify(data.company));
    }
    
    setAuthState({
      token: data.token,
      user: data.user,
      company: data.company || null,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
    
    return { success: true };
  };

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const company = JSON.parse(localStorage.getItem("company") || "null");
    
    if (token && user) {
      setAuthState({
        token,
        user,
        company,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    }
  }, []);

  const login = async (credentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data } = await axios.post("/api/auth/login", credentials);
      
      if (!data || !data.token) {
        throw new Error('Invalid response from server');
      }
      
      return handleAuthSuccess(data);
    } catch (error) {
      console.error('Login API error:', error);
      
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.error || 
                     error.response.data?.message || 
                     `Server responded with status ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      }));
      
      return { 
        success: false, 
        error: errorMessage,
        details: error.response?.data?.details
      };
    }
  };

  const register = async (userData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data } = await axios.post("/api/auth/register", userData);
      return handleAuthSuccess(data);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         'Registration failed. Please try again.';
      
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      }));
      
      return { 
        success: false, 
        error: errorMessage,
        details: error.response?.data?.details
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    
    setAuthState({
      token: null,
      user: null,
      company: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
    
    // Instead of navigating here, we'll let the component handle the navigation
    window.location.href = '/auth/login';
  };

  return (
    <AuthContext.Provider 
      value={{
        ...authState,
        login,
        register,
        logout,
        setAuthState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
