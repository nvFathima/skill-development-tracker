import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { ArrowUp, ArrowDown, Users, Target, MessageSquare, AlertTriangle } from "lucide-react";
import axiosInstance from "../utils/axios";
import UserActivityChart from "../components/UserActivityChart";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await axiosInstance.get("/stats/admin/reports");
        setReportData(response.data);
      } catch (err) {
        setError("Failed to load reports");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const generatePdf = (reportData) => {
    if (!reportData) {
      alert("Report data is not available. Please try again later.");
      return;
    }

    const doc = new jsPDF();

    // Add a title
    doc.setFontSize(18);
    doc.text("Admin Report", 10, 10);

    // Add user statistics
    doc.setFontSize(12);
    doc.text("User Statistics", 10, 20);
    doc.autoTable({
      startY: 25,
      head: [['Metric', 'Value']],
      body: [
        ['Total Users', reportData.users.totalUsers],
        ['Active Users', reportData.users.activeUsers],
        ['New Users', reportData.users.newUsers],
      ],
    });

    // Add skills and goals statistics
    doc.text("Skills and Goals Statistics", 10, doc.autoTable.previous.finalY + 10);
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 15,
      head: [['Metric', 'Value']],
      body: [
        ['Total Skills', reportData.skillsGoals.totalSkills],
        ['Total Goals', reportData.skillsGoals.totalGoals],
        ['Goal Completion Rate', `${reportData.skillsGoals.goalCompletionRate}%`],
      ],
    });

    // Add forum statistics
    doc.text("Forum Statistics", 10, doc.autoTable.previous.finalY + 10);
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 15,
      head: [['Metric', 'Value']],
      body: [
        ['Total Posts', reportData.forum.totalPosts],
        ['Flagged Posts', reportData.forum.flaggedPosts],
        ['Most Popular Post', reportData.forum.mostPopularPost?.title || "N/A"],
      ],
    });

    // Save the PDF
    doc.save("admin_report.pdf");
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-6 bg-red-50 rounded-lg">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, change, changeType }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className="flex items-center space-x-2">
                {changeType === 'increase' ? (
                  <ArrowUp className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                  {change}% from last month
                </span>
              </div>
            )}
          </div>
          <div className="p-4 bg-blue-50 rounded-full">
            <Icon className="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Mock data for the line chart - in real app, this would come from API
  const userTrendData = [
    { name: 'Week 1', users: 400 },
    { name: 'Week 2', users: 500 },
    { name: 'Week 3', users: 450 },
    { name: 'Week 4', users: 700 },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Reports</h1>
        <div className="flex items-center space-x-4">
          <p className="text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
          <Button onClick={() => generatePdf(reportData)}>
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Users"
          value={reportData.users.totalUsers.toLocaleString()}
          icon={Users}
        />
        <StatCard 
          title="Active Users"
          value={reportData.users.activeUsers.toLocaleString()}
          icon={Users}
        />
        <StatCard 
          title="Goal Completion Rate"
          value={`${parseFloat(reportData.skillsGoals.goalCompletionRate).toFixed(1)}%`}
          icon={Target}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent>
              <UserActivityChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goal Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: "Goals Set", value: reportData.skillsGoals.totalGoals },
                { name: "Skills Added", value: reportData.skillsGoals.totalSkills }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#36A2EB" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Forum Activity</CardTitle>
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-500">
                {reportData.forum.totalPosts} total posts
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Most Popular Post</p>
                <p className="text-gray-500">{reportData.forum.mostPopularPost?.title || "N/A"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Engagement</p>
                <p className="font-medium">High</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium">Flagged Posts</p>
                <p className="text-gray-500">Requires moderation</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-500">{reportData.forum.flaggedPosts}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;