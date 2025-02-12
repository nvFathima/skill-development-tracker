import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Goal, Book, Users, LogOut, Bell, User, Menu, X, MessageCircle, Home } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/DropdownMenu";
import { Card, CardContent } from "@/components/ui/card";
import ThemeToggle from "@/components/ui/ThemeToggle";
import axiosInstance from "../utils/axios";
import "./css/UserDashboard.css";  // Import the new CSS file

const UserDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userName, setUserName] = useState("User");
  const [userProfilePic, setUserProfilePic] = useState("/default-avatar.png");
  const navigate = useNavigate();

  // Fetch Notifications
  const fetchNotifications = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axiosInstance.get('/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n) => !n.read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Fetch user details and notifications on mount
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const name = sessionStorage.getItem("name");
    const profilePhoto = sessionStorage.getItem("profilePhoto");

    if (token) {
      setUserName(name || "User");
      if (profilePhoto) {
        setUserProfilePic(`http://localhost:8800${profilePhoto}`);
      }
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Refresh notifications every minute
      return () => clearInterval(interval);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/log-in");
  };

  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 min-h-screen">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"}`}>
        <div className="flex justify-between items-center mb-6">
          <img src="/Skillify_logo.png" alt="Skillify Logo" className={`sidebar-logo ${isSidebarOpen ? "block" : "hidden"}`} />
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-600 dark:text-white">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/user-dashboard" className="sidebar-nav-link">
            <Home size={20} /> {isSidebarOpen && "Dashboard"}
          </NavLink>
          <NavLink to="/user-dashboard/skillandgoal" className="sidebar-nav-link">
            <Goal size={20} /> {isSidebarOpen && "Skills & Goals"}
          </NavLink>
          <NavLink to="/user-dashboard/resources" className="sidebar-nav-link">
            <Book size={20} /> {isSidebarOpen && "Resources"}
          </NavLink>
          <NavLink to="/user-dashboard/forum" className="sidebar-nav-link">
            <Users size={20} /> {isSidebarOpen && "Forum"}
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${isSidebarOpen ? "main-content-expanded" : "main-content-collapsed"}`}>
        {/* Header */}
        <header className="header">
          <h1 className="header-title">Welcome, {userName}!</h1>
          <div className="header-icons">
            <ThemeToggle />
            
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger className="relative">
                <Bell size={24} className="text-gray-600 dark:text-white hover:text-blue-600 cursor-pointer" />
                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount}
                  </span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto shadow-lg bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notification) => (
                    <DropdownMenuItem key={notification._id} className="notification-item">
                      <div className="flex flex-col gap-1">
                        <span className="notification-text">{notification.message}</span>
                        <span className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleDateString()}</span>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-3 text-sm text-gray-500 dark:text-gray-300">No new notifications</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="profile-dropdown">
                <img src={userProfilePic} alt={userName} className="w-full h-full object-cover" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-lg bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
                <DropdownMenuItem onClick={() => navigate('/user-dashboard/profile')} className="hover:bg-gray-200 dark:hover:bg-gray-700 transition dark:text-white">
                  <User className="w-4 h-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/user-dashboard/contact-admin')} className="hover:bg-gray-200 dark:hover:bg-gray-700 transition dark:text-white">
                  <MessageCircle className="w-4 h-4" /> Share Concerns
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="logout-button" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <div className="pt-15">
          <Card>
            <CardContent className="p-6 dark:bg-gray-900">
              <Outlet />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
