import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Clock, ShieldAlert, ShieldCheck, Package, MessageSquare, FileCheck, X, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
export function NotificationBell({ lang = 'en' }) {
    const { user, isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const fetchNotifications = async () => {
        if (!isAuthenticated || !user)
            return;
        try {
            setLoading(true);
            const res = await api.get('/support/notifications');
            if (res.data?.success && Array.isArray(res.data?.data)) {
                setNotifications(res.data.data);
            }
        }
        catch {
            // Gracefully fall back if offline or unauthenticated
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchNotifications();
        // Poll for notifications every 30 seconds while active
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [isAuthenticated, user?.id]);
    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);
    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape')
                setIsOpen(false);
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);
    const markAsRead = async (id, actionUrl) => {
        try {
            await api.patch(`/support/notifications/${id}/read`);
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
        }
        catch {
            // Mark as read locally even if network fails
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
        }
        if (actionUrl) {
            setIsOpen(false);
            navigate(actionUrl);
        }
    };
    if (!isAuthenticated || !user)
        return null;
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'verification':
                return _jsx(ShieldCheck, { className: "w-4 h-4 text-emerald-600" });
            case 'listing':
                return _jsx(FileCheck, { className: "w-4 h-4 text-[#5B6147]" });
            case 'order':
                return _jsx(Package, { className: "w-4 h-4 text-amber-600" });
            case 'enquiry':
            case 'enquiry_reply':
                return _jsx(MessageSquare, { className: "w-4 h-4 text-sky-600" });
            case 'security':
                return _jsx(ShieldAlert, { className: "w-4 h-4 text-rose-600" });
            default:
                return _jsx(Bell, { className: "w-4 h-4 text-stone-600" });
        }
    };
    const formatDate = (dateString) => {
        try {
            const d = new Date(dateString);
            return d.toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        }
        catch {
            return dateString;
        }
    };
    return (_jsxs("div", { className: "relative", ref: dropdownRef, children: [_jsxs("button", { type: "button", onClick: () => {
                    setIsOpen(!isOpen);
                    if (!isOpen)
                        fetchNotifications();
                }, "aria-label": lang === 'en' ? 'In-Dashboard Notifications' : 'അറിയിപ്പുകൾ', className: "relative p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition shadow-xs flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#5B6147]", children: [_jsx(Bell, { className: "w-4 h-4 text-[#4A3626]" }), unreadCount > 0 && (_jsx("span", { className: "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs animate-pulse", children: unreadCount > 9 ? '9+' : unreadCount }))] }), isOpen && (_jsxs("div", { className: "absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 overflow-hidden animate-fadeIn text-left", children: [_jsxs("div", { className: "p-3.5 bg-[#FAF8F5] border-b border-stone-200 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-serif font-bold text-sm text-[#4A3626]", children: lang === 'en' ? 'Notifications' : 'അറിയിപ്പുകൾ' }), unreadCount > 0 && (_jsxs("span", { className: "px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]", children: [unreadCount, " ", lang === 'en' ? 'new' : 'പുതിയത്'] }))] }), _jsx("button", { onClick: () => setIsOpen(false), className: "p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "max-h-[380px] overflow-y-auto divide-y divide-stone-100", children: notifications.length === 0 ? (_jsxs("div", { className: "p-6 text-center text-stone-400 space-y-1", children: [_jsx(Bell, { className: "w-8 h-8 mx-auto text-stone-300 stroke-[1.5]" }), _jsx("p", { className: "text-xs font-medium", children: lang === 'en' ? 'No notifications yet' : 'പുതിയ അറിയിപ്പുകൾ ഒന്നുമില്ല' }), _jsx("p", { className: "text-[10px] text-stone-400", children: lang === 'en'
                                        ? 'Account approvals and timber updates will appear here.'
                                        : 'അക്കൗണ്ട് അപ്രൂവലുകളും തടി വിവരങ്ങളും ഇവിടെ കാണാം.' })] })) : (notifications.map((n) => {
                            const title = lang === 'ml' && n.title_ml ? n.title_ml : n.title_en;
                            const body = lang === 'ml' && n.body_ml ? n.body_ml : (n.body_en || '');
                            return (_jsxs("div", { onClick: () => markAsRead(n.id, n.action_url), className: `p-3.5 transition cursor-pointer flex items-start gap-3 hover:bg-stone-50 ${!n.is_read ? 'bg-[#FAF8F5]/80 font-medium' : 'bg-white text-stone-600'}`, children: [_jsx("div", { className: "p-2 rounded-xl bg-stone-100 flex-shrink-0 mt-0.5 border border-stone-200/60", children: getCategoryIcon(n.category) }), _jsxs("div", { className: "flex-1 min-w-0 space-y-0.5", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("span", { className: `text-xs ${!n.is_read ? 'font-bold text-[#4A3626]' : 'text-stone-700 font-semibold'}`, children: title }), !n.is_read && (_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0" }))] }), body && (_jsx("p", { className: "text-[11px] text-stone-600 line-clamp-2 leading-relaxed", children: body })), _jsxs("div", { className: "flex items-center justify-between pt-1 text-[10px] text-stone-400", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "w-3 h-3" }), _jsx("span", { children: formatDate(n.created_at) })] }), n.action_url && (_jsxs("span", { className: "flex items-center gap-0.5 text-[#5B6147] font-bold", children: [_jsx("span", { children: lang === 'en' ? 'View' : 'കാണുക' }), _jsx(ExternalLink, { className: "w-2.5 h-2.5" })] }))] })] })] }, n.id));
                        })) })] }))] }));
}
