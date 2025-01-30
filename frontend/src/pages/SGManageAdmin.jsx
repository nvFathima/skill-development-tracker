import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { toast } from "sonner";
import { Bell, RefreshCcw, Search } from "lucide-react";

const SGManageAdmin = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch skills and goals
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/admin/skills-goals");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Notify users with overdue goals
  const notifyOverdueGoals = async () => {
    try {
      setRefreshing(true);
      const response = await axiosInstance.post("/admin/notify-overdue-goals");
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error notifying overdue goals:", error);
      toast.error("Failed to send notifications. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  // Filter data based on search query
  const filteredData = data.goals?.filter((goal) =>
    goal.userId.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Skills & Goals Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <button
            onClick={notifyOverdueGoals}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Bell className="w-5 h-5" />
            <span>Notify Overdue Goals</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 border border-gray-300">User</th>
                  <th className="px-4 py-2 border border-gray-300">Skill</th>
                  <th className="px-4 py-2 border border-gray-300">Goal</th>
                  <th className="px-4 py-2 border border-gray-300">Status</th>
                  <th className="px-4 py-2 border border-gray-300">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredData?.map((goal) => (
                  <tr key={goal._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border border-gray-300">
                      {goal.userId.fullName}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {goal.associatedSkills
                        ?.map((skill) => skill.name)
                        .join(", ")}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {goal.title}
                    </td>
                    <td
                      className={`px-4 py-2 border border-gray-300 ${
                        goal.status === "Completed"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {goal.status}
                    </td>
                    <td className="px-4 py-2 border border-gray-300">
                      {new Date(goal.targetCompletionDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SGManageAdmin;
