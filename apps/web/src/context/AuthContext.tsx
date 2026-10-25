import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  businessName?: string;
  district?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (phone: string, pin: string, requestedRole?: UserRole) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  loginAsDemo: (role: UserRole) => UserRole;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<UserRole, UserProfile> = {
  seller: {
    id: 'usr-seller-01',
    name: 'Nilambur Wood Mart',
    businessName: 'Nilambur Wood Mart & Timber Depot',
    phone: '9847120001',
    role: 'seller',
    district: 'Malappuram (മലപ്പുറം)',
  },
  buyer: {
    id: 'usr-buyer-01',
    name: 'Suresh Kumar',
    phone: '9847987654',
    role: 'buyer',
    district: 'Kottayam (കോട്ടയം)',
  },
  admin: {
    id: 'usr-admin-01',
    name: 'Chief Moderator',
    businessName: 'Kerala Forest & Timber Regulatory Cell',
    phone: '9847000000',
    role: 'admin',
    district: 'Thiruvananthapuram (തിരുവനന്തപുരം)',
  },
};

const STORAGE_KEY = 'timora_auth_user';
const TOKEN_KEY = 'timora_auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const loginAsDemo = (role: UserRole): UserRole => {
    const demoUser = DEMO_USERS[role];
    setUser(demoUser);
    setToken(`demo-token-${role}-${Date.now()}`);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
    localStorage.setItem(TOKEN_KEY, `demo-token-${role}`);
    return role;
  };

  const login = async (phone: string, pin: string, requestedRole?: UserRole): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    // If the phone matches demo user phone numbers or fallback by requested role
    const cleanPhone = phone.replace(/\D/g, '');
    let matchedRole: UserRole = requestedRole || 'buyer';

    if (cleanPhone === '9847120001' || cleanPhone.endsWith('0001')) {
      matchedRole = 'seller';
    } else if (cleanPhone === '9847000000' || cleanPhone.endsWith('0000')) {
      matchedRole = 'admin';
    } else if (requestedRole) {
      matchedRole = requestedRole;
    }

    const demoUser = DEMO_USERS[matchedRole];
    const loggedUser: UserProfile = {
      ...demoUser,
      phone: cleanPhone || demoUser.phone,
    };

    setUser(loggedUser);
    const mockJwt = `jwt-token-${matchedRole}-${Date.now()}`;
    setToken(mockJwt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser));
    localStorage.setItem(TOKEN_KEY, mockJwt);

    return { success: true, role: matchedRole };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
