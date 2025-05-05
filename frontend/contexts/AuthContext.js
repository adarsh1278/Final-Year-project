'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/services/axiosInstance';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const router = useRouter();
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await axiosInstance.get('/api/auth/profile');
        setUser(response.data);
      } catch (error) {
        // Not logged in as user, try department
        try {
          const deptResponse = await axiosInstance.get('/api/departments/profile');
          setDepartment(deptResponse.data);
        } catch (deptError) {
          // Neither user nor department is logged in
          console.log('Not authenticated');
        }
      } finally {
        setLoading(false);
      }
    };

    // Check for saved language preference
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
    setLanguage(savedLanguage);

    initAuth();
  }, []);

  // Save language preference when it changes
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  // User login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/auth/login', {
        email,
        password
      });
      
      const userData = await axiosInstance.get('/api/auth/profile');
      setUser(userData.data);
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
        variant: "success",
      });
      
      router.push('/profile');
      return true;
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // User signup
  const signup = async (userData) => {
    setLoading(true);
    try {
      await axiosInstance.post('/api/auth/signup', userData);
      
      toast({
        title: "Signup successful",
        description: "Please login with your new account",
        variant: "success",
      });
      
      router.push('/login');
      return true;
    } catch (error) {
      toast({
        title: "Signup failed",
        description: error.response?.data?.message || "Registration error",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Department login
  const departmentLogin = async (username, password) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/departments/login', {
        username,
        password
      });
      
      const deptData = await axiosInstance.get('/api/departments/profile');
      setDepartment(deptData.data);
      
      toast({
        title: "Department login successful",
        description: "Welcome to department dashboard",
        variant: "success",
      });
      
      router.push('/department/dashboard');
      return true;
    } catch (error) {
      toast({
        title: "Department login failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      if (user) {
        await axiosInstance.post('/api/auth/logout');
        setUser(null);
      } else if (department) {
        await axiosInstance.post('/api/departments/logout');
        setDepartment(null);
      }
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Change language
  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  const value = {
    user,
    department,
    loading,
    language,
    login,
    signup,
    departmentLogin,
    logout,
    changeLanguage,
    isAuthenticated: !!user || !!department,
    isDepartment: !!department,
    isUser: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};