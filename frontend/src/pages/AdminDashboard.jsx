import React, { useState,useEffect } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Users, BarChart3, ClipboardList, MessageSquare, Bell, LogOut, Settings, Home, Search, Menu, X } from 'lucide-react';
import UserManagement from './UserManagement';
import SGManageAdmin from './SGManageAdmin';
import ForumManagement from './ForumManagement';
import ConcernsManagement from './ConcernsManagement';
import { useNotifications } from '../contexts/NotificationContext';
import UserActivityChart from '../components/UserActivityChart';
import GoalStatusChart from '../components/GoalStatusChart';
import Reports from './Reports';

const AdminDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use the notification context
  const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("role");
      navigate("/log-in");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const toggleNotificationDropdown = () => {
    setNotificationDropdownOpen(!notificationDropdownOpen);
  };

  const navItems = [
    { path: "/admin-dashboard", label: "Dashboard Home", icon: <Home className="w-5 h-5" /> },
    { path: "/admin-dashboard/users", label: "User Management", icon: <Users className="w-5 h-5" /> },
    { path: "/admin-dashboard/skills-goals", label: "Skills & Goals", icon: <ClipboardList className="w-5 h-5" /> },
    { path: "/admin-dashboard/forum", label: "Forum", icon: <MessageSquare className="w-5 h-5" /> },
    { path: "/admin-dashboard/notifications", label: "User Concerns", icon: <Bell className="w-5 h-5" /> },
    { path: "/admin-dashboard/reports", label: "Reports", icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-20 
          ${drawerOpen && !isMobile ? 'w-64' : 'w-20'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {drawerOpen && <img src="/Skillify_logo.png" alt="Skillify Logo" className={`sidebar-logo`} />}
              <button
                onClick={() => setDrawerOpen(!drawerOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label={drawerOpen ? "Close sidebar" : "Open sidebar"}
              >
                {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-3 rounded-lg transition-colors
                    ${location.pathname === item.path 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <span className="flex items-center justify-center">{item.icon}</span>
                  {drawerOpen && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {drawerOpen && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div
        className={`flex-1 transition-all duration-300 ${drawerOpen ? 'ml-64' : 'ml-20'}`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 bg-white border-b border-gray-200 z-10" style={{ height: "4.26rem" }}>
          <div className="flex items-center justify-between px-6 h-full">
            <div className="flex items-center flex-1">
              <div className="relative w-64">
                <form onSubmit={handleSearch}>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </form>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={toggleNotificationDropdown}
                  className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                {/* Notification Dropdown */}
                {notificationDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                      {notifications.length === 0 ? (
                        <p className="text-sm text-gray-500">No new notifications</p>
                      ) : (
                        <ul className="mt-2 space-y-2">
                          {notifications.map((notification) => (
                            <li
                              key={notification._id}
                              className={`p-3 rounded-lg ${
                                notification.read ? 'bg-gray-50' : 'bg-blue-50'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-800">{notification.message}</p>
                                <div className="flex space-x-2">
                                  {!notification.read && (
                                    <button
                                      onClick={() => markAsRead(notification._id)}
                                      className="text-sm text-blue-600 hover:underline"
                                    >
                                      Mark as Read
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteNotification(notification._id)}
                                    className="text-sm text-red-600 hover:underline"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Routes>
            <Route
              index
              element={
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-gray-800">Welcome Admin!</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {navItems.slice(1, 5).map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            {item.icon}
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-gray-800">{item.label}</h2>
                            <p className="text-sm text-gray-500">Manage {item.label.toLowerCase()}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <UserActivityChart />
                  <GoalStatusChart />
                </div>
              }
            />
            <Route path="users" element={<UserManagement/>} />
            <Route path="skills-goals" element={<SGManageAdmin/>} />
            <Route path="forum" element={<ForumManagement/>} />
            <Route path="notifications" element={<ConcernsManagement />} />
            <Route path="reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;