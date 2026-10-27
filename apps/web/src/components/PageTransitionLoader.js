import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
export function PageTransitionLoader() {
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        setLoading(true);
        setProgress(20);
        const timer1 = setTimeout(() => setProgress(70), 100);
        const timer2 = setTimeout(() => setProgress(100), 250);
        const timer3 = setTimeout(() => {
            setLoading(false);
            setProgress(0);
        }, 450);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [location.pathname]);
    if (!loading && progress === 0)
        return null;
    return (_jsx("div", { className: "fixed top-0 left-0 right-0 z-50 h-1 bg-stone-200/40 pointer-events-none", children: _jsx("div", { className: "h-full bg-gradient-to-r from-[#5B6147] via-[#8A8F6E] to-emerald-500 transition-all duration-200 ease-out shadow-xs", style: { width: `${progress}%` } }) }));
}
