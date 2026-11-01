import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { ApprovalStatus } from '@timora/shared';

export type UserRole = 'buyer' | 'seller' | 'carpenter' | 'transport' | 'admin';
export type SellerSubtype = 'individual' | 'mill_owner';
export type SessionMode = 'unauthenticated' | 'demo' | 'authenticated';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  sellerSubtype?: SellerSubtype;
  businessName?: string;
  millName?: string;
  district?: string;
  approvalStatus?: ApprovalStatus | string;
  approvalNote?: string;
  skills?: string[];
  experience?: number;
  vehicleDetails?: string;
  tonnageCapacity?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  sessionMode: SessionMode;
  isAuthenticated: boolean;
  isSessionTimedOut: boolean;
  dismissTimeoutModal: () => void;
  login: (phone: string, pin: string, requestedRole?: UserRole, requestedSubtype?: SellerSubtype) => Promise<{ success: boolean; error?: string; role?: UserRole; subtype?: SellerSubtype }>;
  loginAsDemo: (role: UserRole, subtype?: SellerSubtype) => UserRole;
  logout: () => void;
  resetSessionTimer: () => void;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  updateProfile: (updatedData: Partial<UserProfile>) => Promise<boolean>;
  refreshUser: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_PROFILES: Record<string, UserProfile> = {
  buyer: {
    id: 'usr-buyer-01',
    name: 'Suresh Kumar',
    phone: '9847987654',
    role: 'buyer',
    district: 'Kottayam (കോട്ടയം)',
    approvalStatus: 'APPROVED',
  },
  seller_individual: {
    id: 'usr-seller-indiv',
    name: 'K. R. Madhavan',
    businessName: 'Madhavan Farmstead Timber',
    phone: '9847120001',
    role: 'seller',
    sellerSubtype: 'individual',
    district: 'Malappuram (മലപ്പുറം)',
    approvalStatus: 'APPROVED',
  },
  seller_mill: {
    id: 'usr-seller-mill',
    name: 'George Varghese',
    businessName: 'Perumbavoor Modern Sawmills',
    millName: 'Perumbavoor Modern Sawmills & Timber Depot',
    phone: '9847120002',
    role: 'seller',
    sellerSubtype: 'mill_owner',
    district: 'Ernakulam (എറണാകുളം)',
    approvalStatus: 'APPROVED',
  },
  carpenter: {
    id: 'usr-carpenter-01',
    name: 'Master Binu Achari',
    businessName: 'Binu Traditional Timber Joinery & Carpentry',
    phone: '9847330001',
    role: 'carpenter',
    district: 'Alappuzha (ആലപ്പുഴ)',
    approvalStatus: 'APPROVED',
  },
  transport: {
    id: 'usr-transport-01',
    name: 'K. Sukumaran',
    businessName: 'Malabar Timber Heavy Transit Haulage',
    phone: '9847440001',
    role: 'transport',
    district: 'Kozhikode (കോഴിക്കോട്)',
    approvalStatus: 'APPROVED',
  },
  admin: {
    id: 'usr-admin-01',
    name: 'Chief Moderator',
    businessName: 'Kerala Forest & Timber Regulatory Cell',
    phone: '9847000000',
    role: 'admin',
    district: 'Thiruvananthapuram (തിരുവനന്തപുരം)',
    approvalStatus: 'APPROVED',
  },
};

const STORAGE_KEY = 'timora_auth_user';
const TOKEN_KEY = 'timora_auth_token';
const LAST_ACTIVE_KEY = 'timora_last_active';
const SESSION_TIMEOUT_MS = 25 * 60 * 1000; // 25 minutes inactivity

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSessionTimedOut, setIsSessionTimedOut] = useState<boolean>(false);

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const lastActive = localStorage.getItem(LAST_ACTIVE_KEY);
      if (lastActive) {
        const elapsed = Date.now() - parseInt(lastActive, 10);
        if (elapsed > SESSION_TIMEOUT_MS) {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(LAST_ACTIVE_KEY);
          return null;
        }
      }
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

  const [sessionMode, setSessionMode] = useState<SessionMode>(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (!savedToken) return 'unauthenticated';
      return savedToken.startsWith('demo-') ? 'demo' : 'authenticated';
    } catch {
      return 'unauthenticated';
    }
  });

  const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastStorageWriteRef = useRef<number>(0);

  const doLogout = useCallback((timedOut: boolean = false) => {
    setUser(null);
    setToken(null);
    setSessionMode('unauthenticated');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('timora_access_token');
    localStorage.removeItem('timora_user');
    localStorage.removeItem(LAST_ACTIVE_KEY);
    try {
      sessionStorage.clear();
    } catch {}
    if (timedOut) {
      setIsSessionTimedOut(true);
    }
  }, []);

  const resetSessionTimer = useCallback(() => {
    const now = Date.now();
    // Throttle localStorage writes to at most once every 10 seconds to avoid flooding storage events
    if (now - lastStorageWriteRef.current > 10000) {
      localStorage.setItem(LAST_ACTIVE_KEY, String(now));
      lastStorageWriteRef.current = now;
    }
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    sessionTimerRef.current = setTimeout(() => {
      // Re-verify against shared localStorage timestamp across tabs
      const lastActive = localStorage.getItem(LAST_ACTIVE_KEY);
      const latestTime = lastActive ? parseInt(lastActive, 10) : now;
      const elapsed = Date.now() - latestTime;
      if (elapsed >= SESSION_TIMEOUT_MS) {
        doLogout(true);
      } else {
        const remaining = SESSION_TIMEOUT_MS - elapsed;
        sessionTimerRef.current = setTimeout(() => {
          doLogout(true);
        }, remaining);
      }
    }, SESSION_TIMEOUT_MS);
  }, [doLogout]);

  const dismissTimeoutModal = useCallback(() => {
    setIsSessionTimedOut(false);
  }, []);

  // Multi-tab synchronization: listen for storage events and unauthorized API events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LAST_ACTIVE_KEY) {
        if (!e.newValue) return;
        const peerLastActive = parseInt(e.newValue, 10);
        if (!isNaN(peerLastActive)) {
          const elapsed = Date.now() - peerLastActive;
          if (elapsed >= SESSION_TIMEOUT_MS) {
            doLogout(true);
          } else {
            // Activity occurred in another tab: reschedule local timer
            if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
            const remaining = SESSION_TIMEOUT_MS - elapsed;
            sessionTimerRef.current = setTimeout(() => {
              doLogout(true);
            }, remaining);
          }
        }
      } else if (e.key === TOKEN_KEY || e.key === STORAGE_KEY) {
        if (!e.newValue) {
          // Logged out in another tab
          setUser(null);
          setToken(null);
          setSessionMode('unauthenticated');
          if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
        } else if (e.key === STORAGE_KEY && e.newValue) {
          // Logged in in another tab
          try {
            const newUser = JSON.parse(e.newValue);
            setUser(newUser);
            const currentToken = localStorage.getItem(TOKEN_KEY);
            setToken(currentToken);
            setSessionMode(currentToken?.startsWith('demo-') ? 'demo' : 'authenticated');
            resetSessionTimer();
          } catch {}
        }
      }
    };

    const handleUnauthorizedEvent = () => {
      doLogout(false);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('timora:auth:unauthorized', handleUnauthorizedEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('timora:auth:unauthorized', handleUnauthorizedEvent);
    };
  }, [doLogout, resetSessionTimer]);

  // Monitor active user interactions to refresh inactivity timer
  useEffect(() => {
    if (user) {
      resetSessionTimer();

      const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
      const handler = () => resetSessionTimer();
      events.forEach((e) => window.addEventListener(e, handler, { passive: true }));

      return () => {
        events.forEach((e) => window.removeEventListener(e, handler));
        if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
      };
    }
  }, [user, resetSessionTimer]);

  const loginAsDemo = (role: UserRole, subtype?: SellerSubtype): UserRole => {
    setIsSessionTimedOut(false);
    let key = role as string;
    if (role === 'seller') {
      key = subtype === 'mill_owner' ? 'seller_mill' : 'seller_individual';
    }

    const demoProfile: UserProfile = DEMO_PROFILES[key] ?? DEMO_PROFILES.buyer!;
    setUser(demoProfile);
    const mockToken = `demo-token-${key}-${Date.now()}`;
    setToken(mockToken);
    setSessionMode('demo');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoProfile));
    localStorage.setItem(TOKEN_KEY, mockToken);
    localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
    lastStorageWriteRef.current = Date.now();
    resetSessionTimer();
    return demoProfile.role;
  };

  const login = async (
    phone: string,
    pin: string,
    requestedRole?: UserRole,
    requestedSubtype?: SellerSubtype
  ): Promise<{ success: boolean; error?: string; role?: UserRole; subtype?: SellerSubtype }> => {
    setIsSessionTimedOut(false);
    const cleanPhone = phone.replace(/\D/g, '');

    // 1. Attempt Real Backend API Authentication
    try {
      const { api } = await import('../lib/api');
      const res = await api.post('/auth/login', { phone: cleanPhone, pin });
      if (res.data?.success && res.data?.data) {
        const { user: apiUser, accessToken } = res.data.data;
        const profile: UserProfile = {
          id: apiUser.id,
          name: apiUser.name || 'Timora Member',
          phone: apiUser.phone,
          role: apiUser.role,
          sellerSubtype: apiUser.seller_subtype || undefined,
          district: apiUser.district || undefined,
          approvalStatus: apiUser.approval_status,
          businessName: apiUser.business_name || apiUser.seller_business,
        };

        setUser(profile);
        setToken(accessToken);
        setSessionMode('authenticated');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
        lastStorageWriteRef.current = Date.now();
        resetSessionTimer();

        return {
          success: true,
          role: profile.role,
          subtype: profile.sellerSubtype,
        };
      }
    } catch (err: any) {
      // If server returned an HTTP error response (e.g. 401 INVALID_CREDENTIALS, 403 SUSPENDED, 400),
      // strictly display the server's error message directly on the form without fallback
      if (err.response) {
        const message =
          err.response.data?.error?.message ||
          err.response.data?.message ||
          'Invalid phone number or PIN.';
        return { success: false, error: message };
      }

      // Only when backend is unreachable (offline demo mode or network failure):
      // Fallback to demo profiles if credentials match a known demo user
      let matchedProfile: UserProfile | null = null;
      if (cleanPhone === '9847120002') matchedProfile = DEMO_PROFILES.seller_mill ?? null;
      else if (cleanPhone === '9847120001') matchedProfile = DEMO_PROFILES.seller_individual ?? null;
      else if (cleanPhone === '9847330001') matchedProfile = DEMO_PROFILES.carpenter ?? null;
      else if (cleanPhone === '9847440001') matchedProfile = DEMO_PROFILES.transport ?? null;
      else if (cleanPhone === '9847000000') matchedProfile = DEMO_PROFILES.admin ?? null;
      else if (cleanPhone === '9847987654') matchedProfile = DEMO_PROFILES.buyer ?? null;

      // Check self-registered accounts in localStorage
      if (!matchedProfile) {
        try {
          const storedCustomUsers = JSON.parse(localStorage.getItem('timora_registered_users') || '[]');
          const found = storedCustomUsers.find((u: UserProfile) => u.phone.replace(/\D/g, '') === cleanPhone);
          if (found) {
            matchedProfile = found;
          }
        } catch {}
      }

      if (matchedProfile) {
        setUser(matchedProfile);
        const mockJwt = `demo-token-${matchedProfile.role}-${Date.now()}`;
        setToken(mockJwt);
        setSessionMode('demo');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(matchedProfile));
        localStorage.setItem(TOKEN_KEY, mockJwt);
        localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
        lastStorageWriteRef.current = Date.now();
        resetSessionTimer();

        return {
          success: true,
          role: matchedProfile.role,
          subtype: matchedProfile.sellerSubtype,
        };
      }

      return {
        success: false,
        error: 'Unable to connect to authentication server. Please check your connection.',
      };
    }

    return {
      success: false,
      error: 'Authentication failed. Please verify credentials.',
    };
  };

  const logout = () => {
    doLogout(false);
  };

  const updateProfile = async (updatedData: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;

    // Security guard: protect role, approvalStatus, id from tampering
    const safeData: Partial<UserProfile> = { ...updatedData };
    delete (safeData as any).role;
    delete (safeData as any).id;
    delete (safeData as any).approvalStatus;

    const mergedUser: UserProfile = {
      ...user,
      ...safeData,
    };

    setUser(mergedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedUser));

    // Also update in registered users cache if applicable
    try {
      const stored = JSON.parse(localStorage.getItem('timora_registered_users') || '[]');
      const idx = stored.findIndex((u: UserProfile) => u.id === mergedUser.id || u.phone === mergedUser.phone);
      if (idx !== -1) {
        stored[idx] = mergedUser;
        localStorage.setItem('timora_registered_users', JSON.stringify(stored));
      }
    } catch {}

    // Attempt backend sync if authenticated
    const currentToken = localStorage.getItem(TOKEN_KEY);
    if (currentToken && !currentToken.startsWith('demo-')) {
      try {
        const { api } = await import('../lib/api');
        await api.patch('/auth/profile', safeData);
      } catch (err: any) {
        const msg = err?.response?.data?.error?.message || err?.message || 'Failed to update profile.';
        throw new Error(msg);
      }
    }

    return true;
  };

  const refreshUser = useCallback(async (): Promise<UserProfile | null> => {
    const currentToken = localStorage.getItem(TOKEN_KEY);
    if (!currentToken || currentToken.startsWith('demo-')) {
      return null;
    }

    try {
      const { api } = await import('../lib/api');
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data?.data?.user) {
        const backendUser = res.data.data.user;
        let nextUser: UserProfile | null = null;
        setUser((prev) => {
          if (!prev) return null;
          nextUser = {
            ...prev,
            approvalStatus: backendUser.approvalStatus || prev.approvalStatus,
            approvalNote: backendUser.approvalNote !== undefined ? backendUser.approvalNote : prev.approvalNote,
            name: backendUser.name || prev.name,
            businessName: backendUser.businessName || prev.businessName,
            millName: backendUser.millName || prev.millName,
            sellerSubtype: backendUser.sellerSubtype || prev.sellerSubtype,
            district: backendUser.district || prev.district,
          };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
          } catch {}
          return nextUser;
        });
        return nextUser;
      }
    } catch {
      // Backend not running or token invalid
    }
    return null;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        sessionMode,
        isAuthenticated: !!user,
        isSessionTimedOut,
        dismissTimeoutModal,
        login,
        loginAsDemo,
        logout,
        resetSessionTimer,
        setUser,
        updateProfile,
        refreshUser,
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
