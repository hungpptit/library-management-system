import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  getCurrentUser, 
  updateUser 
} from '../services/localService';

interface AuthContextType {
  user: UserProfile | null;
  isAuthReady: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        setIsAuthReady(true);
      }
    };
    initAuth();
  }, []);

  const login = async (data: any) => {
    const loggedInUser = await loginUser(data);
    setUser(loggedInUser);
  };

  const register = async (data: any) => {
    const newUser = await registerUser(data);
    setUser(newUser);
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };
  
  const updateProfile = async (data: Partial<UserProfile>) => {
      if (!user) throw new Error("No user logged in");
      const updated = await updateUser(user.uid, data);
      setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthReady, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
