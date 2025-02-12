import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import axiosInstance from '../utils/axios';

const ConcernsManagement = () => {
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConcerns();
  }, []);

  const fetchConcerns = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axiosInstance.get('/concerns', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConcerns(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch concerns');
      setLoading(false);
    }
  };

  const updateConcernStatus = async (concernId, status) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axiosInstance.patch(`/concerns/${concernId}`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the local state to reflect the change
      setConcerns(concerns.map(concern => 
        concern._id === concernId ? response.data : concern
      ));
    } catch (err) {
      console.error('Failed to update concern status');
    }
  };

  if (loading) return <div>Loading concerns...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">User Concerns</h2>
      {concerns.length === 0 ? (
        <p className="text-gray-500">No concerns reported</p>
      ) : (
        <div className="grid gap-4">
          {concerns.map((concern) => (
            <div 
              key={concern._id} 
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{concern.subject}</h3>
                  <p className="text-sm text-gray-600 mt-1">{concern.message}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${concern.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        concern.status === 'In Review' ? 'bg-blue-100 text-blue-800' : 
                        'bg-green-100 text-green-800'}
                    `}>
                      {concern.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(concern.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {concern.status !== 'Resolved' && (
                  <div className="flex space-x-2">
                    {concern.status === 'Pending' && (
                      <button 
                        onClick={() => updateConcernStatus(concern._id, 'In Review')}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      >
                        Review
                      </button>
                    )}
                    <button 
                      onClick={() => updateConcernStatus(concern._id, 'Resolved')}
                      className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConcernsManagement;