import React from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "./pages/Home"; 
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import ResourceRecommendations from "./pages/ResourceRecommendations";
import DiscussionForum from "./pages/DiscussionForum";
import Notifications from "./pages/Notifications";
import SkillGoalManagement from "./pages/SkillGoalManagement";
import UserDashboardHome from "./pages/UserDashboardHome";
import UserManagement from "./pages/UserManagement";
import ForumManagement from "./pages/ForumManagement";
import DiscussionDetail from "./pages/DiscussionDetail";
import { NotificationProvider } from './contexts/NotificationContext';
import ConcernSharing from "./pages/Concerns";
import ConcernsManagement from "./pages/ConcernsManagement";
import ResourceDetail from "./pages/ResourceDetail";
import Terms from "./pages/Terms";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import About from "./pages/About";
import Contact from "./pages/Contact";

// Protected Layout Component
function ProtectedLayout() {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/log-in" state={{ from: location }} replace />;
  }

  // Different layouts for admin and user dashboards
  if (role === "admin") {
    return (
      <div className="w-full h-screen">
        <Outlet />
      </div>
    );
  }

  // User dashboard - no sidebar
  return (
    <div className="w-full h-screen">
      <div className="w-full">
        <div className="p-4 2xl:px-10 dark:bg-gray-800">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

// Role-based route protection
function RoleRoute({ children, allowedRole }) {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  if (!token || role !== allowedRole) {
    return <Navigate to="/log-in" replace />;
  }

  return children;
}

// Public route protection (prevents logged-in users from accessing login/register)
function PublicRoute({ children }) {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  if (token) {
    return <Navigate to={role === "admin" ? "/admin-dashboard" : "/user-dashboard"} replace />;
  }

  return children;
}

function App() {
  const goalsData = {
    pending: 3,
    inProgress: 5,
    completed: 7,
  };

  const skillsData = [
    { name: "JavaScript", progress: 80 },
    { name: "React", progress: 70 },
    { name: "Node.js", progress: 60 },
  ];

  return (
      <main className="w-full min-h-screen bg-[#f3f4f6]">
        <Routes>
          {/* Landing Page as Default Route */}
          <Route path="/" element={<Home />} />

          {/* Public Routes */}
          <Route path="/log-in" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/terms" element={<PublicRoute><Terms /></PublicRoute>} />
          <Route path="/about" element={<PublicRoute><About /></PublicRoute>} />
          <Route path="/contact" element={<PublicRoute><Contact /></PublicRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:userId" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route element={<NotificationProvider><ProtectedLayout /></NotificationProvider>}>
            {/* Redirect Logged-in Users to their Dashboards */}
            <Route path="/dashboard" element={
              <Navigate to={sessionStorage.getItem("role") === "admin" ? "/admin-dashboard" : "/user-dashboard"} replace />
            } />

            {/* Admin Dashboard and Nested Routes */}
            <Route path="/admin-dashboard/*" element={<RoleRoute allowedRole="admin">
              <AdminDashboard />
            </RoleRoute>}>
              <Route index element={<h1 className="text-2xl font-bold">Welcome to Admin Dashboard</h1>} />
              <Route path="users" element={<UserManagement />} />
              <Route path="forum" element={<ForumManagement />} />
              <Route path="notifications" element={<ConcernsManagement />} />
            </Route>

            {/* User Dashboard and Nested Routes */}
            <Route path="/user-dashboard/*" element={<RoleRoute allowedRole="user">
              <UserDashboard />
            </RoleRoute>}>
              <Route index element={<UserDashboardHome goalsData={goalsData} skillsData={skillsData} />} />
              <Route path="skillandgoal" element={<SkillGoalManagement />} />
              <Route path="profile" element={<Profile />} />
              <Route path="resources" element={<ResourceRecommendations />} />
              <Route path="resources/:resourceId" element={<ResourceDetail />} />
              <Route path="forum" element={<DiscussionForum />} />
              <Route path="forum/:postId" element={<DiscussionDetail />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="contact-admin" element={<ConcernSharing />} />
            </Route>
          </Route>
        </Routes>

        <Toaster richColors />
      </main>
  );
}

export default App;
