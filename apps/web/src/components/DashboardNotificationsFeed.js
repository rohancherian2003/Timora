import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ShieldCheck, Package, MessageSquare, FileCheck, ShieldAlert, X, ExternalLink, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
export function DashboardNotificationsFeed({ lang = 'en', maxItems = 3, }) {
    const { user, refreshUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [dismissedIds, setDismissedIds] = useState([]);
    const navigate = useNavigate();
    const fetchNotifications = async () => {
        if (!user)
            return;
        try {
            const res = await api.get('/support/notifications');
            if (res.data?.success && Array.isArray(res.data?.data)) {
                const items = res.data.data;
                setNotifications(items);
                // If there is an unread verification notification, refresh user profile to detect approval
                const hasUnreadVerification = items.some((n) => !n.is_read && n.category === 'verification');
                if (hasUnreadVerification && refreshUser) {
                    refreshUser();
                }
            }
        }
        catch {
            // Offline or network unavailable
        }
    };
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 20000);
        return () => clearInterval(interval);
    }, [user?.id]);
    const handleMarkAsRead = async (id, actionUrl) => {
        try {
            await api.patch(`/support/notifications/${id}/read`);
        }
        catch { }
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
        if (actionUrl) {
            navigate(actionUrl);
        }
    };
    const handleDismiss = (id) => {
        setDismissedIds((prev) => [...prev, id]);
        handleMarkAsRead(id);
    };
    // Only show unread or latest relevant items that haven't been dismissed in this session
    const visibleNotifications = notifications
        .filter((n) => !dismissedIds.includes(n.id))
        .slice(0, maxItems);
    if (visibleNotifications.length === 0)
        return null;
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'verification':
                return _jsx(ShieldCheck, { className: "w-5 h-5 text-emerald-600" });
            case 'listing':
                return _jsx(FileCheck, { className: "w-5 h-5 text-[#5B6147]" });
            case 'order':
                return _jsx(Package, { className: "w-5 h-5 text-amber-600" });
            case 'enquiry':
            case 'enquiry_reply':
                return _jsx(MessageSquare, { className: "w-5 h-5 text-sky-600" });
            case 'security':
                return _jsx(ShieldAlert, { className: "w-5 h-5 text-rose-600" });
            default:
                return _jsx(Bell, { className: "w-5 h-5 text-stone-600" });
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
    return (_jsx("div", { className: "space-y-3", children: visibleNotifications.map((n) => {
            const title = lang === 'ml' && n.title_ml ? n.title_ml : n.title_en;
            const body = lang === 'ml' && n.body_ml ? n.body_ml : (n.body_en || '');
            return (_jsxs("div", { className: `p-4 sm:p-5 rounded-2xl border transition shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn ${!n.is_read
                    ? 'bg-[#FAF8F5] border-[#8E7F6B]/40 ring-1 ring-[#5B6147]/20'
                    : 'bg-white border-stone-200'}`, children: [_jsxs("div", { className: "flex items-start gap-3.5", children: [_jsx("div", { className: "p-2.5 rounded-xl bg-white border border-stone-200 shadow-2xs flex-shrink-0 mt-0.5", children: getCategoryIcon(n.category) }), _jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("span", { className: "font-bold text-sm text-[#4A3626]", children: title }), !n.is_read && (_jsx("span", { className: "px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider", children: lang === 'en' ? 'New Notice' : 'പുതിയത്' })), _jsxs("span", { className: "text-[11px] text-stone-400 flex items-center gap-1 font-mono", children: [_jsx(Clock, { className: "w-3 h-3" }), formatDate(n.created_at)] })] }), body && (_jsx("p", { className: "text-xs text-stone-700 leading-relaxed max-w-3xl", children: body }))] })] }), _jsxs("div", { className: "flex items-center gap-2 self-end sm:self-center flex-shrink-0", children: [n.action_url && (_jsxs("button", { type: "button", onClick: () => handleMarkAsRead(n.id, n.action_url), className: "px-3 py-1.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs transition flex items-center gap-1 shadow-2xs", children: [_jsx("span", { children: lang === 'en' ? 'View Details' : 'വിശദാംശങ്ങൾ' }), _jsx(ExternalLink, { className: "w-3 h-3" })] })), _jsx("button", { type: "button", onClick: () => handleDismiss(n.id), className: "p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition", title: lang === 'en' ? 'Dismiss' : 'ഒഴിവാക്കുക', children: _jsx(X, { className: "w-4 h-4" }) })] })] }, n.id));
        }) }));
}
