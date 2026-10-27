import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
const AuthContext = createContext(undefined);
const DEMO_USERS = {
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
const LAST_ACTIVE_KEY = 'timora_last_active';
const SESSION_TIMEOUT_MS = 25 * 60 * 1000; // 25 minutes inactivity
export const AuthProvider = ({ children }) => {
    const [isSessionTimedOut, setIsSessionTimedOut] = useState(false);
    const [user, setUser] = useState(() => {
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
        }
        catch {
            return null;
        }
    });
    const [token, setToken] = useState(() => {
        try {
            return localStorage.getItem(TOKEN_KEY);
        }
        catch {
            return null;
        }
    });
    const sessionTimerRef = useRef(null);
    const doLogout = useCallback((timedOut = false) => {
        setUser(null);
        setToken(null);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(LAST_ACTIVE_KEY);
        if (timedOut) {
            setIsSessionTimedOut(true);
        }
    }, []);
    const resetSessionTimer = useCallback(() => {
        localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
        if (sessionTimerRef.current)
            clearTimeout(sessionTimerRef.current);
        sessionTimerRef.current = setTimeout(() => {
            doLogout(true);
        }, SESSION_TIMEOUT_MS);
    }, [doLogout]);
    const dismissTimeoutModal = useCallback(() => {
        setIsSessionTimedOut(false);
    }, []);
    // Monitor user activity and reset inactivity timer
    useEffect(() => {
        if (user) {
            resetSessionTimer();
            const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
            const handler = () => resetSessionTimer();
            events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
            return () => {
                events.forEach((e) => window.removeEventListener(e, handler));
                if (sessionTimerRef.current)
                    clearTimeout(sessionTimerRef.current);
            };
        }
    }, [user, resetSessionTimer]);
    const loginAsDemo = (role) => {
        setIsSessionTimedOut(false);
        const demoUser = DEMO_USERS[role];
        setUser(demoUser);
        setToken(`demo-token-${role}-${Date.now()}`);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
        localStorage.setItem(TOKEN_KEY, `demo-token-${role}`);
        localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
        return role;
    };
    const login = async (phone, pin, requestedRole) => {
        setIsSessionTimedOut(false);
        const cleanPhone = phone.replace(/\D/g, '');
        let matchedRole = requestedRole || 'buyer';
        if (cleanPhone === '9847120001' || cleanPhone.endsWith('0001')) {
            matchedRole = 'seller';
        }
        else if (cleanPhone === '9847000000' || cleanPhone.endsWith('0000')) {
            matchedRole = 'admin';
        }
        else if (requestedRole) {
            matchedRole = requestedRole;
        }
        const demoUser = DEMO_USERS[matchedRole];
        const loggedUser = {
            ...demoUser,
            phone: cleanPhone || demoUser.phone,
        };
        setUser(loggedUser);
        const mockJwt = `jwt-token-${matchedRole}-${Date.now()}`;
        setToken(mockJwt);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser));
        localStorage.setItem(TOKEN_KEY, mockJwt);
        localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
        return { success: true, role: matchedRole };
    };
    const logout = () => {
        doLogout(false);
    };
    return (_jsx(AuthContext.Provider, { value: {
            user,
            token,
            isAuthenticated: !!user,
            isSessionTimedOut,
            dismissTimeoutModal,
            login,
            loginAsDemo,
            logout,
            resetSessionTimer,
        }, children: children }));
};
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
