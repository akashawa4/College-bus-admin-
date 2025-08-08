import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { customToast } from '../lib/notifications';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  createDemoAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      customToast.success('Login successful!');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        customToast.error('Invalid email or password. Please check your credentials.');
      } else if (error.code === 'auth/too-many-requests') {
        customToast.error('Too many failed attempts. Please try again later.');
      } else {
        customToast.error(error.message || 'Login failed');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      customToast.success('Logged out successfully');
    } catch (error: any) {
      customToast.error(error.message || 'Logout failed');
    }
  };

  const createDemoAccount = async () => {
    try {
      const demoEmail = 'demo@admin.com';
      const demoPassword = 'demo123456';
      
      await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
      customToast.success('Demo account created successfully! You can now login with demo@admin.com / demo123456');
    } catch (error: any) {
      // If user already exists, just show the credentials
      if (error.code === 'auth/email-already-in-use') {
        customToast.success('Demo account already exists! Use: demo@admin.com / demo123456');
      } else {
        console.error('Demo account creation error:', error);
        customToast.error(`Failed to create demo account: ${error.message}`);
        throw error;
      }
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    createDemoAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};