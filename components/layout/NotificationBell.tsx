'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import styles from './NotificationBell.module.css';

interface Notification {
  id: string;
  message: string;
  type: string;
  booking_id: string;
  read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [user]);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    if (!user) return;
    const { data } = await supabase.rpc('get_notifications', {
      p_user_id: user.id,
      p_limit: 10,
    });
    if (data) setNotifications(data);
  };

  const loadUnreadCount = async () => {
    if (!user) return;
    const { data } = await supabase.rpc('get_unread_count', {
      p_user_id: user.id,
    });
    setUnreadCount(data || 0);
  };

  const handleBellClick = () => {
    setOpen(!open);
    if (!open) {
      loadNotifications();
      loadUnreadCount();
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // mark as read
    await supabase.rpc('mark_notification_read', {
      p_notification_id: notification.id,
    });
    
    setOpen(false);
    loadUnreadCount();
    
    // go to orders
    router.push('/orders');
  };

  const getTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order': return '🆕';
      case 'accepted': return '✅';
      case 'rejected': return '❌';
      case 'dispatched': return '🚛';
      case 'delivered': return '📦';
      case 'completed': return '🎉';
      case 'cancelled': return '⚠️';
      default: return '📌';
    }
  };

  if (!user) return null;

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button onClick={handleBellClick} className={styles.bellBtn}>
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {open && (
        <>
          <div className={styles.overlay} onClick={() => setOpen(false)}></div>
          <div className={styles.dropdown}>
            <div className={styles.header}>
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <button
                  className={styles.markAllBtn}
                  onClick={async () => {
                    if (user) {
                      await supabase.rpc('mark_all_read', { p_user_id: user.id });
                      loadNotifications();
                      setUnreadCount(0);
                    }
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className={styles.empty}>No notifications yet</div>
            ) : (
              <div className={styles.list}>
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <span className={styles.notifIcon}>
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className={styles.notifContent}>
                      <p className={styles.notifMessage}>{notification.message}</p>
                      <span className={styles.notifTime}>{getTimeAgo(notification.created_at)}</span>
                    </div>
                    {!notification.read && <span className={styles.unreadDot}></span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}