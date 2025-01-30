import React, { useState } from "react";
import { useNavigate, NavLink, Outlet } from "react-router-dom";
import { Bell, LogOut, LayoutDashboard, Book, Users, User, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/DropdownMenu";
import { useNotifications } from '../contexts/NotificationContext';

const UserDashboard = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [userName, setUserName] = useState(localStorage.getItem("name") || "User");
  const [userProfilePic] = useState(localStorage.getItem("profilePhoto") 
  ? `http://localhost:8800${localStorage.getItem("profilePhoto")}` 
  : "/default-avatar.png");
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/log-in");
    }
  };

  const navItems = [
    { path: "skillandgoal", label: "Skills & Goals", icon: LayoutDashboard },
    { path: "resources", label: "Resources", icon: Book },
    { path: "forum", label: "Forum", icon: Users }
  ];

  const unreadNotifications = notifications.filter(notif => !notif.read).slice(0, 5);

  const handleNotificationClick = async (notificationId) => {
    await markAsRead(notificationId);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-4 py-4 fixed top-0 left-0 w-full z-10 bg-white shadow-sm">
        <div className="flex items-center gap-4">
          <a href="/user-dashboard" className="flex items-center">
            <img src="/Skillify_logo.png" alt="Skillify Logo" className="h-8 w-auto" />
          </a>
          <h1 className="text-lg font-bold hidden sm:block">Welcome, {userName}!</h1>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={`/user-dashboard/${path}`}
              className={({ isActive }) => `
                flex items-center gap-2 px-3 py-2 rounded-md transition-colors
                ${isActive ? "text-blue-500 bg-blue-50" : "hover:text-blue-500 hover:bg-gray-50"}
              `}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                  {unreadCount}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
              {unreadNotifications.length > 0 ? (
                <>
                  {unreadNotifications.map(notification => (
                    <DropdownMenuItem
                      key={notification._id}
                      className="flex items-start p-3 bg-blue-50"
                      onClick={() => handleNotificationClick(notification._id)}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold">{notification.message}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  {unreadCount > 5 && (
                    <DropdownMenuItem
                      className="text-center text-blue-500 hover:text-blue-700"
                      onClick={() => navigate('/user-dashboard')}
                    >
                      View all notifications ({unreadCount - 5} more)
                    </DropdownMenuItem>
                  )}
                </>
              ) : (
                <div className="p-3 text-sm text-gray-500">No new notifications</div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full overflow-hidden w-8 h-8">
              <img 
                src={userProfilePic} 
                alt={userName} 
                className="w-full h-full object-cover"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem 
                className="flex items-center gap-2"
                onClick={() => navigate('/user-dashboard/profile')}
              >
                <User className="w-4 h-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="flex items-center gap-2"
                onClick={() => navigate('/user-dashboard/contact-admin')}
              >
                <MessageCircle className="w-4 h-4" />
                Share Concerns
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center gap-2 text-red-500" 
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <Outlet />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserDashboard;