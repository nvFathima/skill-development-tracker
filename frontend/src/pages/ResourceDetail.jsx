import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Bookmark, BookmarkCheck, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import axiosInstance from '../utils/axios';
import { formatDuration, formatViews } from '../utils/index';
import { toast } from 'sonner';
import GoalLinkModal from './GoalLinkModal';

const ResourceDetail = () => {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const [showGoalLinkModal, setShowGoalLinkModal] = useState(false);
  const [resource, setResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedResources, setSavedResources] = useState(() => {
    const saved = localStorage.getItem('savedResources');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await axiosInstance.get(`/resources/${resourceId}`);
        setResource(response.data);
      } catch (error) {
        console.error('Error fetching resource:', error);
        toast.error('Failed to load resource');
        if (error.response?.status === 404) {
          navigate('/user-dashboard/resources');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchResource();
  }, [resourceId, navigate]);

  const toggleSaveResource = () => {
    setSavedResources(prev => {
      const newSaved = prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId];
      localStorage.setItem('savedResources', JSON.stringify(newSaved));
      return newSaved;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Resource not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <button
        onClick={() => navigate('/user-dashboard/resources')}
        className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Resources
      </button>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {resource.thumbnail && (
              <img 
                src={resource.thumbnail}
                alt={resource.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}

            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold">{resource.title}</h1>
              <button
                onClick={toggleSaveResource}
                className="text-gray-400 hover:text-blue-500"
              >
                {savedResources.includes(resourceId) ? (
                  <BookmarkCheck className="w-6 h-6" />
                ) : (
                  <Bookmark className="w-6 h-6" />
                )}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Type:</span> {resource.type || 'Tutorial'}
              </div>
              <div>
                <span className="font-medium">Platform:</span> {resource.platform}
              </div>
              <div>
                <span className="font-medium">Skill Level:</span> {resource.skillLevel}
              </div>
              {resource.duration && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="font-medium">Duration:</span> {formatDuration(resource.duration)}
                </div>
              )}
              {resource.channelTitle && (
                <div>
                  <span className="font-medium">Channel:</span> {resource.channelTitle}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              {resource.viewCount && (
                <span className="text-sm text-gray-600">
                  {formatViews(resource.viewCount)} views
                </span>
              )}
              <a href={resource.link} target="_blank" rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                Open Resource <ExternalLink className="ml-1 w-4 h-4" />
              </a>
            </div>

            <div className="pt-4 border-t">
            <button onClick={() => setShowGoalLinkModal(true)} className="text-blue-600 hover:text-blue-800" >
              Link to Goal
            </button>
            </div>

            {showGoalLinkModal && (
              <GoalLinkModal
                resource={resource}
                onClose={() => setShowGoalLinkModal(false)}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceDetail;