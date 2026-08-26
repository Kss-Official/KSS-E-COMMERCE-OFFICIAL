import React, { useState, useEffect } from 'react';
import { Bell, Package, Truck, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { fetchDeliveryNotificationsApi } from '../../src/services/api';

// Maps the notification types the backend derives from live task state.
const STYLE = {
  assignment: { icon: Package, color: 'bg-emerald-100 text-emerald-800' },
  in_transit: { icon: Truck, color: 'bg-blue-100 text-blue-800' },
  delivered: { icon: CheckCircle, color: 'bg-purple-100 text-purple-800' },
  failed: { icon: AlertTriangle, color: 'bg-amber-100 text-amber-800' }
};

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    setIsLoading(true);
    const data = await fetchDeliveryNotificationsApi();
    setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
    setUnread(Number(data?.unread_count || 0));
    setIsLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Notifications</h2>
          <p className="text-sm text-gray-500 font-medium">Real-time alerts, package assignments, and delivery updates.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {unread > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black">
              <Bell className="w-3.5 h-3.5" />
              {unread} needs action
            </span>
          )}
          <button
            onClick={loadNotifications}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs divide-y divide-gray-100">
        {isLoading && notifications.length === 0 &&
          [1, 2, 3].map((n) => (
            <div key={n} className="p-5 flex items-start space-x-4 animate-pulse">
              <div className="w-11 h-11 rounded-xl bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/3 bg-gray-100 rounded" />
                <div className="h-3 w-2/3 bg-gray-100 rounded" />
              </div>
            </div>
          ))}

        {!isLoading && notifications.length === 0 && (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="font-bold text-gray-900">No notifications yet</h4>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Assignments, delivery updates and COD reminders appear here automatically.
            </p>
          </div>
        )}

        {notifications.map((item) => {
          const style = STYLE[item.type] || STYLE.assignment;
          const Icon = style.icon;
          return (
            <div
              key={item.id}
              className={`p-5 flex items-start space-x-4 hover:bg-emerald-50/20 transition-colors ${
                item.is_read ? '' : 'bg-emerald-50/30'
              }`}
            >
              <div className={`p-3 rounded-xl ${style.color} shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-3">
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    {item.title}
                    {!item.is_read && <span className="w-2 h-2 rounded-full bg-[#ff5100] shrink-0" />}
                  </h4>
                  <span className="text-xs text-gray-400 font-medium shrink-0">{item.formatted_date}</span>
                </div>
                <p className="text-xs text-gray-600 font-medium mt-1">{item.message}</p>
                <p className="text-[11px] text-gray-400 font-semibold mt-1.5">
                  <span className="font-mono">{item.task_id}</span> &middot; {item.order_number}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
