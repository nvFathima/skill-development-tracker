import React, { useState, useEffect } from 'react';
import { Check, X, MessageCircle, Clock, CheckCircle, AlertCircle, User, Search } from 'lucide-react';
import axiosInstance from '../utils/axios';
import { Input } from '@/components/ui/input'; // Assuming you're using the same UI library

const ConcernsManagement = () => {
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedConcernId, setSelectedConcernId] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

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
      setError('Failed to fetch concerns. Please try again later.');
      setLoading(false);
    }
  };

  const updateConcernStatus = async (concernId, status) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axiosInstance.patch(
        `/concerns/${concernId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setConcerns(concerns.map(concern =>
        concern._id === concernId ? response.data : concern
      ));
    } catch (err) {
      console.error('Failed to update concern status:', err.response ? err.response.data : err.message);
      setError('Failed to update concern status. Please try again.');
    }
  };

  const handleReplySubmit = async (concernId) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axiosInstance.post(
        `/concerns/${concernId}/reply`,
        { message: replyMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setConcerns(concerns.map(concern =>
        concern._id === concernId ? response.data : concern
      ));
      setReplyMessage('');
      setSelectedConcernId(null);
    } catch (err) {
      console.error('Failed to submit reply:', err.response ? err.response.data : err.message);
      setError('Failed to submit reply. Please try again.');
    }
  };

  // Handle search input change
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter concerns based on search query
  const filteredConcerns = concerns.filter((concern) => {
    const matchesUser = concern.userId.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = concern.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesUser || matchesSubject;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-600 flex items-center space-x-2">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">User Concerns</h2>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          type="text"
          placeholder="Search by user name or subject..."
          value={searchQuery}
          onChange={handleSearch}
          className="pl-10"
        />
      </div>

      {filteredConcerns.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-gray-600 text-center">
          <p>No concerns found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredConcerns.map((concern) => (
            <div
              key={concern._id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {concern.userId.fullName} ({concern.userId.email})
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{concern.subject}</h3>
                  <p className="text-sm text-gray-600">{concern.message}</p>
                  <div className="flex items-center space-x-3">
                    <span className={`
                      px-3 py-1 rounded-full text-sm font-medium
                      ${concern.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        concern.status === 'In Review' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'}
                    `}>
                      {concern.status}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(concern.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                  {concern.replies && concern.replies.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {concern.replies.map((reply, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">{reply.message}</p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>Replied by {reply.repliedBy.fullName} on {new Date(reply.createdAt).toLocaleDateString()}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {concern.status !== 'Resolved' && (
                  <div className="flex space-x-2">
                    {concern.status === 'Pending' && (
                      <button
                        onClick={() => updateConcernStatus(concern._id, 'In Review')}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-2"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Review</span>
                      </button>
                    )}
                    <button
                      onClick={() => updateConcernStatus(concern._id, 'Resolved')}
                      className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Resolve</span>
                    </button>
                    <button
                      onClick={() => setSelectedConcernId(concern._id)}
                      className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Reply</span>
                    </button>
                  </div>
                )}
              </div>
              {selectedConcernId === concern._id && (
                <div className="mt-4">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Type your reply here..."
                    rows="3"
                    maxLength="500"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">{replyMessage.length}/500 characters</span>
                    <button
                      onClick={() => handleReplySubmit(concern._id)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Send Reply</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConcernsManagement;