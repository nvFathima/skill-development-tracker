import React, { useState } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Users, BarChart3, ClipboardList, MessageSquare, Bell, LogOut, Settings, Home, Search, Menu, X } from 'lucide-react';
import UserManagement from './UserManagement';
import SGManageAdmin from './SGManageAdmin';
import ForumManagement from './ForumManagement';
import ConcernsManagement from './ConcernsManagement';

const AdminDashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/log-in");
  };

  const navItems = [
    { path: "/admin-dashboard", label: "Dashboard Home", icon: <Home className="w-5 h-5" /> },
    { path: "/admin-dashboard/users", label: "User Management", icon: <Users className="w-5 h-5" /> },
    { path: "/admin-dashboard/skills-goals", label: "Skills & Goals", icon: <ClipboardList className="w-5 h-5" /> },
    { path: "/admin-dashboard/forum", label: "Forum", icon: <MessageSquare className="w-5 h-5" /> },
    { path: "/admin-dashboard/notifications", label: "Notifications", icon: <Bell className="w-5 h-5" /> },
    { path: "/admin-dashboard/reports", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
    // { path: "/admin-dashboard/settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-20 
          ${drawerOpen ? 'w-64' : 'w-20'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {drawerOpen && <h1 className="text-xl font-bold text-gray-800">Admin</h1>}
              <button
                onClick={() => setDrawerOpen(!drawerOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
      <div className={`flex-1 ${drawerOpen ? 'pl-0' : 'pl-0'} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="sticky top-0 bg-white border-b border-gray-200 h-16 z-10">
          <div className="flex items-center justify-between px-6 h-full">
            <div className="flex items-center flex-1">
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
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
                  <h1 className="text-2xl font-bold text-gray-800">Welcome to Admin Dashboard</h1>
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
                </div>
              }
            />
            <Route path="users" element={<UserManagement/>} />
            <Route path="skills-goals" element={<SGManageAdmin/>} />
            <Route path="forum" element={<ForumManagement/>} />
            <Route path="notifications" element={<ConcernsManagement />} />
            <Route path="reports" element={<div className="bg-white p-6 rounded-xl shadow-sm">Analytics & Reports</div>} />
            {/* <Route path="settings" element={<div className="bg-white p-6 rounded-xl shadow-sm">Settings</div>} /> */}
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;