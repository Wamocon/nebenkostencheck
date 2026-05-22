'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { Notification } from '@/types';

export function NotificationBell() {
  const locale = useLocale();
  const t = useTranslations('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.gelesen).length;

  const fetchNotifications = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsAuthenticated(false);
      return;
    }
    setIsAuthenticated(true);

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('erstellt_am', { ascending: false })
      .limit(20);

    if (data) setNotifications(data as Notification[]);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const markAsRead = async (id: string) => {
    const supabase = createClient();
    await supabase.from('notifications').update({ gelesen: true }).eq('id', id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, gelesen: true } : n))
    );
  };

  const markAllRead = async () => {
    const supabase = createClient();
    const unreadIds = notifications.filter((n) => !n.gelesen).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('notifications').update({ gelesen: true }).in('id', unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, gelesen: true })));
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return t('ago_minutes', { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('ago_hours', { count: hours });
    const days = Math.floor(hours / 24);
    return t('ago_days', { count: days });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] hover:bg-[var(--surface-container-high)]/50 transition-colors"
        aria-label={t('title')}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--error)] text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--outline-variant)]">
            <h3 className="text-sm font-semibold text-[var(--on-surface)]">{t('title')}</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-[var(--primary)] hover:underline"
              >
                {t('mark_all_read')}
              </button>
            )}
          </div>

          {/* Items */}
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <svg className="w-8 h-8 mx-auto text-[var(--on-surface-variant)] opacity-40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <p className="text-sm text-[var(--on-surface-variant)]">{t('empty')}</p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--outline-variant)]">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`px-4 py-3 hover:bg-[var(--surface-container-high)]/50 transition-colors cursor-pointer ${
                    !notification.gelesen ? 'bg-[var(--primary)]/5' : ''
                  }`}
                  onClick={() => !notification.gelesen && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <NotificationIcon typ={notification.typ} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.gelesen ? 'font-medium text-[var(--on-surface)]' : 'text-[var(--on-surface-variant)]'}`}>
                        {locale === 'de' ? notification.titel_de : notification.titel_en}
                      </p>
                      {(locale === 'de' ? notification.nachricht_de : notification.nachricht_en) && (
                        <p className="text-xs text-[var(--on-surface-variant)] mt-0.5 line-clamp-2">
                          {locale === 'de' ? notification.nachricht_de : notification.nachricht_en}
                        </p>
                      )}
                      <p className="text-xs text-[var(--on-surface-variant)] opacity-60 mt-1">
                        {formatTimeAgo(notification.erstellt_am)}
                      </p>
                    </div>
                    {!notification.gelesen && (
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-[var(--primary)] flex-shrink-0" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationIcon({ typ }: { typ: string }) {
  if (typ.startsWith('frist')) {
    return (
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--tertiary)]/15 flex items-center justify-center">
        <svg className="w-4 h-4 text-[var(--tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--secondary-container)]/50 flex items-center justify-center">
      <svg className="w-4 h-4 text-[var(--secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );
}
