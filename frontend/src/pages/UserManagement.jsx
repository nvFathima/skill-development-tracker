import React, { useState, useEffect } from "react";
import { Bell, Eye, Search, X, AlertTriangle, Settings } from "lucide-react";
import axiosInstance from "../utils/axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentAdminId, setCurrentAdminId] = useState(null);

  useEffect(() => {
    fetchUsers();
    setCurrentAdminId(sessionStorage.getItem("userId"));
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/users-admin");
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentAdminId) {
      toast.error("You cannot delete your own admin account.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      setLoading(true);
      await axiosInstance.delete(`/users-admin/${userId}`);
      setUsers(users.filter((user) => user._id !== userId));
      toast.success("User deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete user.");
    } finally {
      setLoading(false);
    }
  };

  const needsActivityAlert = (lastActiveTime, thresholdDays) => {
    if (!lastActiveTime) return false;
    const daysSinceActive = Math.floor((new Date() - new Date(lastActiveTime)) / (1000 * 60 * 60 * 24));
    return daysSinceActive >= thresholdDays;
  };

  const sendActivityAlert = async (userId, message) => {
    try {
      const user = users.find(u => u._id === userId);
      if (!user) {
        toast.error("User not found");
        return;
      }

      // Check if alert is needed before sending
      if (!needsActivityAlert(user.lastActiveTime, user.activityAlertThreshold)) {
        toast.error(`Cannot send alert - user has been active within ${user.activityAlertThreshold} days`);
        return;
      }

      await axiosInstance.post(`/users-admin/${userId}/activity-alert`, { message });
      toast.success("Activity alert sent successfully");
      
      // Refresh users list to get updated activity alert timestamp
      fetchUsers();
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || "Cannot send activity alert at this time");
      } else {
        toast.error("Failed to send activity alert");
      }
      console.error(error);
    }
  };

  const formatLastActive = (date) => {
    const lastActive = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
    return `${diffDays} days ago`;
  };

  const UserDetailsModal = ({ user }) => {
    if (!user) return null;

    const inactivityDays = Math.floor(
      (new Date() - new Date(user.lastActiveTime)) / (1000 * 60 * 60 * 24)
    );

    const canSendAlert = needsActivityAlert(user.lastActiveTime, user.activityAlertThreshold);

    const handleSendAlert = () => {
      if (canSendAlert) {
        sendActivityAlert(
          user._id,
          `We noticed you haven't been active for ${inactivityDays} days. We miss you! Please check in and let us know how you're doing.`
        );
      }
    };

    return (
      <Card className="w-full max-w-2xl">
  <CardHeader>
    <CardTitle>{user.fullName}</CardTitle>
    <CardDescription>User Details</CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Basic Information Section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg border-b pb-2">Basic Information</h3>
        <div className="space-y-2">
          <p><span className="font-medium">Email:</span> {user.email}</p>
          <p><span className="font-medium">Phone:</span> {user.phone}</p>
          <p><span className="font-medium">Age:</span> {user.age}</p>
          <p><span className="font-medium">Role:</span> {user.userRole}</p>
          <p><span className="font-medium">Last Active:</span> {formatLastActive(user.lastActiveTime)}</p>
          <p><span className="font-medium">Activity Alert Threshold:</span> {user.activityAlertThreshold} days</p>
        </div>
      </div>

      {/* Employment Details Section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg border-b pb-2">Employment Details</h3>
        <div className="space-y-2">
          <p><span className="font-medium">Status:</span> {user.employmentDetails.status}</p>
          {user.employmentDetails.currentJob.company && (
            <p><span className="font-medium">Company:</span> {user.employmentDetails.currentJob.company}</p>
          )}
        </div>
      </div>
    </div>

    {/* Activity Management Section */}
    <div className="mt-6">
      <h3 className="font-semibold text-lg mb-4">Activity Management</h3>
      {inactivityDays > user.activityAlertThreshold ? (
        <div className="bg-yellow-50 p-4 rounded-md mb-4">
          <p className="text-yellow-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            User has been inactive for {inactivityDays} days!
          </p>
        </div>
      ) : (
        <div className="bg-green-50 p-4 rounded-md mb-4">
          <p className="text-green-700">
            User is within active threshold ({inactivityDays} of {user.activityAlertThreshold} days)
          </p>
        </div>
      )}
      <Button
        onClick={handleSendAlert}
        className="flex items-center gap-2"
        disabled={!canSendAlert}
      >
        <Bell className="w-4 h-4" />
        Send Activity Alert
        {!canSendAlert && " (Not Needed)"}
      </Button>
    </div>
  </CardContent>
</Card>
    );
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === "all" || user.userRole === filterRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>

        <Select value={filterRole} onValueChange={setFilterRole}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent style={{ backgroundColor: 'white' }}>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
      </div>

      <div className="overflow-auto bg-white rounded-lg shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => {
              const inactivityDays = Math.floor(
                (new Date() - new Date(user.lastActiveTime)) / (1000 * 60 * 60 * 24)
              );
              const isInactive = inactivityDays > user.activityAlertThreshold;

              return (
                <TableRow 
                  key={user._id}
                  className={`${user._id === currentAdminId ? "bg-blue-50" : ""} ${
                    isInactive ? "bg-yellow-50" : ""
                  }`}
                >
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.userRole}</TableCell>
                  <TableCell>{formatLastActive(user.lastActiveTime)}</TableCell>
                  <TableCell>
                    {isInactive ? (
                      <span className="text-yellow-600 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Inactive
                      </span>
                    ) : (
                      <span className="text-green-600">Active</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <UserDetailsModal user={selectedUser} />
                        </DialogContent>
                      </Dialog>
                      {user._id !== currentAdminId && (
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-lg font-medium text-gray-700">No users found</p>
          <p className="text-sm text-gray-500">
            Try searching with a different keyword or filter.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserManagement;