import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axiosInstance from '../utils/axios';

const UserActivityChart = () => {
  const [userActivityData, setUserActivityData] = useState([]);

  useEffect(() => {
    fetchUserActivityData();
  }, []);

  const fetchUserActivityData = async () => {
    try {
      const response = await axiosInstance.get('/stats/users/activity', {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });
      const data = processActivityData(response.data);
      setUserActivityData(data);
    } catch (error) {
      console.error('Error fetching user activity data:', error);
    }
  };

  const processActivityData = (activityData) => {
    // Group activity data by day and count active users
    const activityByDay = {};

    activityData.forEach((user) => {
      const lastActiveDate = new Date(user.lastActiveTime).toLocaleDateString();
      if (!activityByDay[lastActiveDate]) {
        activityByDay[lastActiveDate] = 0;
      }
      activityByDay[lastActiveDate]++;
    });

    // Convert to an array of objects for Recharts
    return Object.keys(activityByDay).map((date) => ({
      date,
      activeUsers: activityByDay[date],
    }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">User Activity Over the Last Week</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={userActivityData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="activeUsers"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserActivityChart;