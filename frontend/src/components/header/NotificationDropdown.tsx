import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { BookOpen, FileText, Award, Layers, Bell, CheckCircle2, AlertCircle, Calendar, ClipboardList } from "lucide-react";
import apiClient from "../../api/client";

/**
 * NotificationDropdown — Dropdown de notificaciones conectado al API.
 *
 * Carga notificaciones del empleado autenticado desde /api/v1/notifications.
 * Muestra badge con conteo de no leídas. Click marca como leída y navega.
 */

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  course_assigned: BookOpen,
  exam_assigned: FileText,
  exam_graded: CheckCircle2,
  exam_pending_review: ClipboardList,
  level_unlocked: Layers,
  badge_earned: Award,
  assignment_new: AlertCircle,
  general: Bell,
  csw_approved: CheckCircle2,
  csw_rejected: AlertCircle,
  csw_pending: ClipboardList,
  calendar_event: Calendar,
};

const TYPE_COLORS: Record<string, string> = {
  course_assigned: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10',
  exam_assigned: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10',
  exam_graded: 'text-green-500 bg-green-50 dark:bg-green-500/10',
  exam_pending_review: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10',
  level_unlocked: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10',
  badge_earned: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10',
  assignment_new: 'text-red-500 bg-red-50 dark:bg-red-500/10',
  general: 'text-gray-500 bg-gray-50 dark:bg-gray-500/10',
  csw_approved: 'text-green-500 bg-green-50 dark:bg-green-500/10',
  csw_rejected: 'text-red-500 bg-red-50 dark:bg-red-500/10',
  csw_pending: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10',
  calendar_event: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-500/10',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiClient.get<{ success: boolean; data: Notification[]; unreadCount: number }>('/notifications');
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
    } catch { /* silently fail */ }
  }, []);

  // Fetch on mount and every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Refetch when dropdown opens
  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      try {
        await apiClient.put(`/notifications/${notification._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch { /* ignore */ }
    }
    // Navigate if has link
    if (notification.link) {
      navigate(notification.link);
    }
    closeDropdown();
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
        data-test-key="notification-bell"
      >
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z" fill="currentColor" />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notificaciones
          </h5>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-brand-500 hover:text-brand-600"
              >
                Marcar todas leídas
              </button>
            )}
            <button
              onClick={closeDropdown}
              className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg className="fill-current" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar flex-1">
          {notifications.length === 0 ? (
            <li className="flex items-center justify-center py-12 text-gray-400 text-sm">
              <div className="text-center">
                <Bell size={32} className="mx-auto mb-2 opacity-30" />
                <p>No tienes notificaciones</p>
              </div>
            </li>
          ) : (
            notifications.map(notification => {
              const Icon = TYPE_ICONS[notification.type] || Bell;
              const colorClass = TYPE_COLORS[notification.type] || TYPE_COLORS.general;
              return (
                <li key={notification._id}>
                  <DropdownItem
                    onItemClick={() => handleNotificationClick(notification)}
                    className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5 cursor-pointer ${
                      !notification.read ? 'bg-brand-50/30 dark:bg-brand-500/5' : ''
                    }`}
                  >
                    {/* Icon */}
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                      <Icon size={16} />
                    </span>

                    {/* Content */}
                    <span className="block flex-1 min-w-0">
                      <span className="mb-0.5 block text-sm font-medium text-gray-800 dark:text-white/90 line-clamp-1">
                        {notification.title}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {notification.message}
                      </span>
                      <span className="block text-[10px] text-gray-400 mt-1">
                        {timeAgo(notification.createdAt)}
                      </span>
                    </span>

                    {/* Unread dot */}
                    {!notification.read && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-500"></span>
                    )}
                  </DropdownItem>
                </li>
              );
            })
          )}
        </ul>
      </Dropdown>
    </div>
  );
}
