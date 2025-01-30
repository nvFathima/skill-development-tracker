import React, { useState } from 'react';
import { Bell, Calendar, Book, X, Check } from 'lucide-react';

const Notifications = () => {
  // Sample notifications data - in a real app, this would come from an API
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'deadline',
      title: 'Goal Deadline Approaching',
      message: 'Complete "Learn React Basics" goal due in 2 days',
      date: '2025-01-08',
      isRead: false
    },
    {
      id: 2,
      type: 'resource',
      title: 'New Resource Available',
      message: 'New tutorial added: "Advanced React Patterns"',
      date: '2025-01-06',
      isRead: false
    },
    {
      id: 3,
      type: 'deadline',
      title: 'Goal Deadline Tomorrow',
      message: 'JavaScript Assessment due tomorrow',
      date: '2025-01-07',
      isRead: false
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'deadline':
        return <Calendar className="h-5 w-5 text-yellow-500" />;
      case 'resource':
        return <Book className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Notifications
        </h2>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No new notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  notification.isRead ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="flex-shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-gray-600">{notification.message}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(notification.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Mark as read"
                    >
                      <Check className="h-5 w-5 text-green-500" />
                    </button>
                  )}
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Remove notification"
                  >
                    <X className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;