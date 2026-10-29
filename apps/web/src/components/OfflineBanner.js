import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
export function OfflineBanner({ lang = 'en' }) {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    if (!isOffline)
        return null;
    return (_jsxs("div", { className: "bg-[#4A3626] text-[#E7E1D6] px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 border-b border-[#5B6147] animate-fadeIn z-50", children: [_jsx(WifiOff, { className: "w-3.5 h-3.5 text-amber-400 flex-shrink-0" }), _jsx("span", { children: lang === 'en'
                    ? 'You are currently offline. Displaying cached Kerala timber listings.'
                    : 'താങ്കൾ ഇപ്പോൾ ഓഫ്‌ലൈനിലാണ്. കാഷെ ചെയ്ത തടി വിവരങ്ങൾ കാണിക്കുന്നു.' })] }));
}
