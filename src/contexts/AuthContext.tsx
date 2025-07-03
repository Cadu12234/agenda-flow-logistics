
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call - in real app, this would be an actual API call
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        const userData: User = {
          email: foundUser.email,
          isAdmin: foundUser.email.endsWith('@mmm.com')
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call - in real app, this would be an actual API call
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Check if user already exists
      if (users.find((u: any) => u.email === email)) {
        return false; // User already exists
      }
      
      // Add new user
      users.push({ email, password });
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      
      // Auto login after registration
      const userData: User = {
        email,
        isAdmin: email.endsWith('@mmm.com')
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
