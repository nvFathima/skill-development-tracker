import React, { useState, useEffect } from 'react';
import { X, Plus, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import axiosInstance from '../utils/axios';
import { toast } from 'sonner';

const GoalLinkModal = ({ resource, onClose }) => {
  const [matchingGoals, setMatchingGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  
  // New goal form state
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    targetCompletionDate: '',
    associatedSkills: []
  });

  useEffect(() => {
    const fetchMatchingGoals = async () => {
      try {
        setLoading(true);
        console.log(resource.id);
        const response = await axiosInstance.get(
          `/goals/matching-resource/${resource.id}?title=${encodeURIComponent(resource.title)}`
        );
        setMatchingGoals(response.data);
      } catch (error) {
        console.error('Error fetching matching goals:', error);
        setError('Failed to load matching goals');
      } finally {
        setLoading(false);
      }
    };

    fetchMatchingGoals();
  }, [resource.id, resource.title]);

  const handleLinkToExistingGoal = async (goalId) => {
    try {
        await axiosInstance.post(`/goals/${goalId}/link-resource`, {
            resourceData: {
                title: resource.title,
                platform: resource.platform,
                link: resource.link,
                thumbnail: resource.thumbnail,
                duration: resource.duration
            }
        });
        toast.success('Resource linked to goal successfully');
        onClose();
    } catch (error) {
        console.error('Error linking resource to goal:', error);
        if (error.response && error.response.status === 400) {
            toast.error(error.response.data.message); // Display the backend error message
        } else {
            toast.error('Failed to link resource to goal');
        }
    }
  };

  const handleCreateNewGoal = async (e) => {
    e.preventDefault();
    try {
      // First, get matching skills based on the resource title
      const keywords = resource.title.toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(keyword => keyword.length > 0);
  
      const skillResponse = await axiosInstance.get(
        `/skills/matching?keywords=${encodeURIComponent(keywords.join(','))}`
      );
  
      const matchingSkillIds = skillResponse.data.map(skill => skill._id);
      
      // Create the new goal with the matching skills
      const response = await axiosInstance.post('/goals', {
        ...newGoal,
        associatedSkills: matchingSkillIds, // Add the matching skills
        resources: [{  // Add the resource as an array element
          title: resource.title,
          platform: resource.platform,
          link: resource.link,
          thumbnail: resource.thumbnail,
          duration: resource.duration
        }]
      });
      
      toast.success('New goal created and resource linked successfully');
      onClose();
    } catch (error) {
      console.error('Error creating new goal:', error);
      toast.error('Failed to create new goal');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fadeIn">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Link Resource to Goal</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-4">{error}</div>
          ) : (
            <div className="space-y-4">
              {!showNewGoalForm && (
                <>
                  {matchingGoals.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Matching Goals</h3>
                      {matchingGoals.map(goal => (
                        <Card key={goal._id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{goal.title}</h4>
                                <p className="text-sm text-gray-600">{goal.description}</p>
                                <div className="mt-2 text-sm">
                                  <span className="font-medium">Status:</span> {goal.status}
                                </div>
                              </div>
                              <button
                                onClick={() => handleLinkToExistingGoal(goal._id)}
                                className="flex items-center text-blue-600 dark:text-blue-400 
                                          hover:text-blue-800 dark:hover:text-blue-300 
                                          transition-all duration-200"
                              >
                                <LinkIcon className="w-4 h-4 mr-1" />
                                Link
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">
                      No matching goals found for this resource.
                    </p>
                  )}

                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => setShowNewGoalForm(true)}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Create New Goal
                    </button>
                  </div>
                </>
              )}

              {showNewGoalForm && (
                <form onSubmit={handleCreateNewGoal} className="space-y-4">
                  <h3 className="text-lg font-semibold">Create New Goal</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      required
                      className="w-full p-2 border rounded-lg"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal(prev => ({...prev, title: e.target.value}))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      className="w-full p-2 border rounded-lg"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal(prev => ({...prev, description: e.target.value}))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Date</label>
                      <input
                        type="date"
                        required
                        className="w-full p-2 border rounded-lg"
                        value={newGoal.startDate}
                        onChange={(e) => setNewGoal(prev => ({...prev, startDate: e.target.value}))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Target Completion Date</label>
                      <input
                        type="date"
                        required
                        className="w-full p-2 border rounded-lg"
                        value={newGoal.targetCompletionDate}
                        onChange={(e) => setNewGoal(prev => ({...prev, targetCompletionDate: e.target.value}))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowNewGoalForm(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Create & Link
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalLinkModal;