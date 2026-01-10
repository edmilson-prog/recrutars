import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, mockUsers, mockCompanies, mockCandidates } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userType: 'admin' | 'company' | 'candidate') => void;
  logout: () => void;
  currentCompany: typeof mockCompanies[0] | null;
  currentCandidate: typeof mockCandidates[0] | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (userType: 'admin' | 'company' | 'candidate') => {
    const mockUser = mockUsers.find(u => u.type === userType);
    if (mockUser) {
      setUser(mockUser);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const currentCompany = user?.type === 'company' 
    ? mockCompanies.find(c => c.userId === user.id) || null 
    : null;

  const currentCandidate = user?.type === 'candidate'
    ? mockCandidates.find(c => c.userId === user.id) || null
    : null;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      currentCompany,
      currentCandidate,
    }}>
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
