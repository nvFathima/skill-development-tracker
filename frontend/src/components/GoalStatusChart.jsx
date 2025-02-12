import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axiosInstance from '../utils/axios';

const GoalStatusChart = () => {
  const [goalStatusData, setGoalStatusData] = useState([]);

  useEffect(() => {
    fetchGoalStatusData();
  }, []);

  const fetchGoalStatusData = async () => {
    try {
      const response = await axiosInstance.get('/stats/goals', {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });
      const data = processGoalStatusData(response.data);
      setGoalStatusData(data);
    } catch (error) {
      console.error('Error fetching goal status data:', error);
    }
  };

  const processGoalStatusData = (goals) => {
    // Count goals by status
    const statusCounts = {
      Pending: 0,
      'In Progress': 0,
      Completed: 0,
    };

    goals.forEach((goal) => {
      if (goal.status === 'Pending') {
        statusCounts.Pending++;
      } else if (goal.status === 'In Progress') {
        statusCounts['In Progress']++;
      } else if (goal.status === 'Completed') {
        statusCounts.Completed++;
      }
    });

    // Convert to an array of objects for Recharts
    return Object.keys(statusCounts).map((status) => ({
      name: status,
      value: statusCounts[status],
    }));
  };

  // Colors for the pie chart segments
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Goal Status Distribution</h2>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={goalStatusData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {goalStatusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GoalStatusChart;