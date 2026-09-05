import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { Bell, CheckCheck } from 'lucide-react';

const Notifications = () => {
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
  } = useNotifications();

  const handleNotificationClick = async (notif) => {
    try {
      // Mark notification as read
      if (!notif.isRead) {
        await markAsRead(notif._id);
      }

      // Get notification link
      const link = notif?.link;

      console.log('Notification link:', link);

      // No link
      if (!link) {
        return;
      }

      // Internal React route
      if (link.startsWith('/')) {
        navigate(link);
        return;
      }

      // External URL
      window.location.href = link;
    } catch (error) {
      console.error(
        'Failed to handle notification click:',
        error
      );
    }
  };

  return (
    <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">

          <h1 className="flex items-center gap-2 text-3xl font-bold text-slate-800 dark:text-white">
            <Bell className="w-8 h-8" />

            Notifications

            {unreadCount > 0 && (
              <span className="text-sm bg-rose-500 text-white px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </h1>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 px-4 py-2 text-sm text-indigo-600 transition border border-indigo-200 dark:text-indigo-400 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            >
              <CheckCheck className="w-4 h-4" />

              Mark all read
            </button>
          )}
        </div>

        {/* EMPTY STATE */}
        {notifications.length === 0 ? (
          <div className="p-12 text-center bg-white border shadow-xl dark:bg-slate-800 rounded-2xl border-slate-200/50 dark:border-slate-700/50">

            <Bell className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600" />

            <p className="mt-4 text-slate-500 dark:text-slate-400">
              No notifications yet.
            </p>

          </div>
        ) : (

          /* NOTIFICATIONS */
          <div className="space-y-2">

            {notifications.map((notif) => (

              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`cursor-pointer bg-white dark:bg-slate-800 rounded-xl shadow p-4 border transition hover:shadow-md ${
                  !notif.isRead
                    ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-900/10'
                    : 'border-slate-200/50 dark:border-slate-700/50'
                }`}
              >

                <div className="flex items-start justify-between">

                  <div>

                    <h3 className="font-semibold text-slate-800 dark:text-white">
                      {notif.title}
                    </h3>

                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                      {notif.message}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>

                  </div>

                  {!notif.isRead && (
                    <span className="w-2 h-2 mt-1 bg-indigo-600 rounded-full shrink-0" />
                  )}

                </div>

              </div>

            ))}

          </div>
        )}

      </div>
    </div>
  );
};

export default Notifications;