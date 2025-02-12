import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, } from "recharts";
import { useNotifications } from "../contexts/NotificationContext";
import axiosInstance from "../utils/axios";

const UserDashboardHome = () => {
  const [goalStatusData, setGoalStatusData] = useState([]);
  const [skillProgressData, setSkillProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notifications, markAsRead, deleteNotification,deleteAllNotifications } = useNotifications();
  const [showAllNotifications, setShowAllNotifications] = useState(false); // Controls modal visibility
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Colors for pie chart
  const COLORS = ["#FF6384", "#36A2EB", "#4CAF50"];

  // Fetch data for charts
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/overview");
        const data = response.data;

        if (!data) throw new Error("No data received");

        // Transform goal data for pie chart
        const goalData = [
          { name: "Pending", value: data.goalCounts.pending },
          { name: "In Progress", value: data.goalCounts.inProgress },
          { name: "Completed", value: data.goalCounts.completed },
        ];

        // Transform skill data for bar chart
        const skillData = data.skillProgress.map((skill) => ({
          name: skill.name,
          progress: skill.progress,
        }));

        setGoalStatusData(goalData);
        setSkillProgressData(skillData);
      } catch (err) {
        toast.error("Failed to load overview data.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setShowDeleteConfirm(null);
      toast.success("Notification deleted successfully");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleClearAll = async () => {
    try {
      await deleteAllNotifications();
      toast.success("All notifications cleared!");
    } catch (error) {
      console.log(error);
      toast.error("Failed to clear all notifications.");
    }
  };
  
  const NotificationCard = ({ notification, showDelete = true }) => (
    <div
      key={notification._id}
      className={`p-3 rounded-lg ${
        !notification.read ? "bg-blue-50" : "bg-gray-50"
      } relative group`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm pr-8">{notification.message}</p>
          <span className="text-xs text-gray-500">
            {new Date(notification.createdAt).toLocaleDateString()}
          </span>
        </div>
        {showDelete && (
          <button
            onClick={() => setShowDeleteConfirm(notification._id)}
            className="opacity-0 group-hover:opacity-100 absolute top-3 right-3 p-1 text-gray-500 hover:text-red-500 transition-opacity"
            aria-label="Delete notification"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm === notification._id && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
          <div className="text-center p-4">
            <p className="text-sm mb-3">Delete this notification?</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => handleDelete(notification._id)}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 dark:bg-gray-900 p-4">
      {/* Notifications Section */}
      <Card className="shadow-md dark:bg-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="dark:text-white">Recent Notifications</CardTitle>
          {notifications.length > 3 && (
            <button onClick={() => setShowAllNotifications(true)} className="text-sm text-blue-500 hover:text-blue-700">
              View All
            </button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.slice(0, 3).map((notification) => <NotificationCard key={notification._id} notification={notification} />)
            ) : (
              <p className="text-sm text-gray-500">No recent notifications</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Notifications Modal */}
      {showAllNotifications && (
        <Dialog open={showAllNotifications} onOpenChange={setShowAllNotifications}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>All Notifications</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationCard key={notification._id} notification={notification} />
                ))
              ) : (
                <p className="text-sm text-gray-500">No notifications available</p>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="text-center mt-4">
                <button
                  onClick={ () => handleClearAll()}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Clear All
                </button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Overview Section */}
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Goal Status */}
        <Card className="shadow-md dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Goal Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={goalStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {goalStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Skill Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="progress"
                    fill="#36A2EB"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboardHome;
