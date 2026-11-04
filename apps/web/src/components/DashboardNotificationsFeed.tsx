import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ShieldCheck,
  Package,
  MessageSquare,
  FileCheck,
  ShieldAlert,
  X,
  ExternalLink,
  Check,
  Clock
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export interface InDashboardNotification {
  id: string;
  user_id: string;
  category: string;
  title_en: string;
  title_ml?: string;
  body_en?: string;
  body_ml?: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

interface DashboardNotificationsFeedProps {
  lang?: 'en' | 'ml';
  maxItems?: number;
}

export function DashboardNotificationsFeed({
  lang = 'en',
  maxItems = 3,
}: DashboardNotificationsFeedProps) {
  const { user, refreshUser } = useAuth();
  const [notifications, setNotifications] = useState<InDashboardNotification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/support/notifications');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        const items: InDashboardNotification[] = res.data.data;
        setNotifications(items);

        // If there is an unread verification notification and user is not yet approved, refresh user profile
        const hasUnreadVerification = items.some(
          (n) => !n.is_read && n.category === 'verification'
        );
        if (hasUnreadVerification && refreshUser && user?.approvalStatus !== 'APPROVED') {
          refreshUser();
        }
      }
    } catch {
      // Offline or network unavailable
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Only poll when the tab is actively visible to eliminate background pings
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      fetchNotifications();
    }, 45000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleMarkAsRead = async (id: string, actionUrl?: string) => {
    try {
      await api.patch(`/support/notifications/${id}/read`);
    } catch {}

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    window.dispatchEvent(new CustomEvent('timora_notifications_updated'));

    if (actionUrl) {
      navigate(actionUrl);
    }
  };

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
    handleMarkAsRead(id);
  };

  // Only show unread or latest relevant items that haven't been dismissed in this session
  const visibleNotifications = notifications
    .filter((n) => !dismissedIds.includes(n.id))
    .slice(0, maxItems);

  if (visibleNotifications.length === 0) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'verification':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'listing':
        return <FileCheck className="w-5 h-5 text-[#5B6147]" />;
      case 'order':
        return <Package className="w-5 h-5 text-amber-600" />;
      case 'enquiry':
      case 'enquiry_reply':
        return <MessageSquare className="w-5 h-5 text-sky-600" />;
      case 'security':
        return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      default:
        return <Bell className="w-5 h-5 text-stone-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(lang === 'ml' ? 'ml-IN' : 'en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-3">
      {visibleNotifications.map((n) => {
        const title = lang === 'ml' && n.title_ml ? n.title_ml : n.title_en;
        const body = lang === 'ml' && n.body_ml ? n.body_ml : (n.body_en || '');

        return (
          <div
            key={n.id}
            className={`p-4 sm:p-5 rounded-2xl border transition shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn ${
              !n.is_read
                ? 'bg-[#FAF8F5] border-[#8E7F6B]/40 ring-1 ring-[#5B6147]/20'
                : 'bg-white border-stone-200'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-2xs flex-shrink-0 mt-0.5">
                {getCategoryIcon(n.category)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-[#4A3626]">
                    {title}
                  </span>
                  {!n.is_read && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider">
                      {lang === 'en' ? 'New Notice' : 'പുതിയത്'}
                    </span>
                  )}
                  <span className="text-[11px] text-stone-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {formatDate(n.created_at)}
                  </span>
                </div>
                {body && (
                  <p className="text-xs text-stone-700 leading-relaxed max-w-3xl">
                    {body}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
              {n.action_url && (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(n.id, n.action_url)}
                  className="px-3 py-1.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs transition flex items-center gap-1 shadow-2xs"
                >
                  <span>{lang === 'en' ? 'View Details' : 'വിശദാംശങ്ങൾ'}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDismiss(n.id)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition"
                title={lang === 'en' ? 'Dismiss' : 'ഒഴിവാക്കുക'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
