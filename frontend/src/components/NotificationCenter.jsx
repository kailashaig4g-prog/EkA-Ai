import { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, Zap, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import useNotificationStore from '../store/notificationStore';

const NotificationIcon = ({ type }) => {
  switch (type) {
    case 'ai_response':
      return <MessageSquare className="w-4 h-4 text-teal-400" />;
    case 'station_alert':
      return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    case 'ticket_escalation':
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    default:
      return <Zap className="w-4 h-4 text-blue-400" />;
  }
};

const NotificationItem = ({ notification, onMarkRead }) => {
  const timeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div
      className={`p-3 border-b border-white/5 last:border-0 cursor-pointer transition-colors ${
        notification.read ? 'opacity-60' : 'hover:bg-white/5'
      }`}
      onClick={() => !notification.read && onMarkRead(notification.id)}
      data-testid={`notification-${notification.id}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <NotificationIcon type={notification.type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-white truncate">{notification.title}</p>
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-[#FF6B35] shrink-0" />
            )}
          </div>
          <p className="text-xs text-white/60 mt-0.5 line-clamp-2">{notification.message}</p>
          <p className="text-xs text-white/40 mt-1">{timeAgo(notification.timestamp)}</p>
        </div>
      </div>
    </div>
  );
};

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="notification-bell"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs font-medium bg-[#FF6B35] text-white rounded-full px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-80 max-h-[480px] overflow-hidden z-50 bg-[#121212] border-white/10" data-testid="notification-panel">
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-medium text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={markAllAsRead}
                  data-testid="mark-all-read"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="max-h-[400px]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markAsRead}
                />
              ))
            )}
          </ScrollArea>

          {notifications.length > 0 && (
            <div className="p-2 border-t border-white/10 text-center">
              <Badge variant="default" className="text-xs">
                {notifications.length} total notifications
              </Badge>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
