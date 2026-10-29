import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
const AuthContext = createContext(undefined);
export const DEMO_PROFILES = {
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
    const loginAsDemo = (role, subtype) => {
        setIsSessionTimedOut(false);
        let key = role;
        if (role === 'seller') {
            key = subtype === 'mill_owner' ? 'seller_mill' : 'seller_individual';
        }
        const demoProfile = DEMO_PROFILES[key] ?? DEMO_PROFILES.buyer;
        setUser(demoProfile);
        const mockToken = `demo-token-${key}-${Date.now()}`;
        setToken(mockToken);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoProfile));
        localStorage.setItem(TOKEN_KEY, mockToken);
        localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
        return demoProfile.role;
    };
    const login = async (phone, pin, requestedRole, requestedSubtype) => {
        setIsSessionTimedOut(false);
        const cleanPhone = phone.replace(/\D/g, '');
        // Check against pre-seeded demo phone numbers first
        let matchedProfile = null;
        if (cleanPhone === '9847120002')
            matchedProfile = DEMO_PROFILES.seller_mill ?? null;
        else if (cleanPhone === '9847120001')
            matchedProfile = DEMO_PROFILES.seller_individual ?? null;
        else if (cleanPhone === '9847330001')
            matchedProfile = DEMO_PROFILES.carpenter ?? null;
        else if (cleanPhone === '9847440001')
            matchedProfile = DEMO_PROFILES.transport ?? null;
        else if (cleanPhone === '9847000000')
            matchedProfile = DEMO_PROFILES.admin ?? null;
        else if (cleanPhone === '9847987654')
            matchedProfile = DEMO_PROFILES.buyer ?? null;
        // Check self-registered accounts in localStorage
        if (!matchedProfile) {
            try {
                const storedCustomUsers = JSON.parse(localStorage.getItem('timora_registered_users') || '[]');
                const found = storedCustomUsers.find((u) => u.phone.replace(/\D/g, '') === cleanPhone);
                if (found) {
                    matchedProfile = found;
                }
            }
            catch {
                // ignore
            }
        }
        // Fallback based on requested role
        if (!matchedProfile) {
            const targetRole = requestedRole || 'buyer';
            matchedProfile = {
                id: `usr-${Date.now()}`,
                name: 'Timora Member',
                phone: cleanPhone,
                role: targetRole,
                sellerSubtype: targetRole === 'seller' ? (requestedSubtype || 'individual') : undefined,
                district: 'Kerala (കേരളം)',
                approvalStatus: targetRole === 'buyer' ? 'APPROVED' : 'PENDING_APPROVAL',
            };
        }
        setUser(matchedProfile);
        const mockJwt = `jwt-token-${matchedProfile.role}-${Date.now()}`;
        setToken(mockJwt);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(matchedProfile));
        localStorage.setItem(TOKEN_KEY, mockJwt);
        localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
        return {
            success: true,
            role: matchedProfile.role,
            subtype: matchedProfile.sellerSubtype,
        };
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
            setUser,
        }, children: children }));
};
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
