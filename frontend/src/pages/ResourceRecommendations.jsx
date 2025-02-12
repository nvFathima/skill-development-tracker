import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ExternalLink, Bookmark, BookmarkCheck, Clock } from 'lucide-react';
import axiosInstance from '../utils/axios';
import { formatDuration, formatViews } from '../utils/index';

const ResourceRecommendations = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasSkillsOrGoals, setHasSkillsOrGoals] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 12;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    skillLevel: 'all',
    platform: 'all'
  });
  
  const [savedResources, setSavedResources] = useState(() => {
    const saved = sessionStorage.getItem('savedResources');
    return saved ? JSON.parse(saved) : [];
  });

  const fetchResources = useCallback(async (page) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        type: filters.type !== 'all' ? filters.type : '',
        skillLevel: filters.skillLevel !== 'all' ? filters.skillLevel : '',
        platform: filters.platform !== 'all' ? filters.platform : ''
      });

      const response = await axiosInstance.get(`/resources/recommended?${params}`);
      const { 
        resources, 
        hasSkillsOrGoals: hasData, 
        message,
        totalItems: total,
        totalPages: pages
      } = response.data;

      setHasSkillsOrGoals(hasData);

      if (!hasData) {
        setResources([]);
        setError("No skills or goals found. Add some to get recommendations!");
        return;
      }

      if (message) {
        setError(message);
        return;
      }

      setResources(resources);
      setTotalItems(total);
      setTotalPages(pages);

    } catch (err) {
      setError('Failed to fetch resources. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchResources(currentPage);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentPage, fetchResources]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const toggleSaveResource = useCallback((resourceId) => {
    setSavedResources(prev => {
      const newSaved = prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId];
      sessionStorage.setItem('savedResources', JSON.stringify(newSaved));
      return newSaved;
    });
  }, []);

  const renderResourceCard = useCallback((resource) => {
    if (!resource) return null;
    
    return (
      <div key={resource.id} className="bg-white dark:bg-gray-900 rounded-lg shadow hover:shadow-lg transition-shadow border dark:border-gray-700">
        {/* Thumbnail */}
        {resource.thumbnail && (
          <div 
            className="relative cursor-pointer"
            onClick={() => navigate(`/user-dashboard/resources/${resource.id}`)}
          >
            <img 
              src={resource.thumbnail}
              alt={resource.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            {resource.duration && (
              <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatDuration(resource.duration)}
              </span>
            )}
          </div>
        )}
        
        {/* Card Content */}
        <div className="p-6">
          {/* Title & Save Button */}
          <div className="flex justify-between items-start mb-4">
            <h3 
              className="text-lg font-semibold line-clamp-2 cursor-pointer 
                        hover:text-blue-600 dark:hover:text-blue-400 
                        dark:text-gray-200"
              onClick={() => navigate(`/user-dashboard/resources/${resource.id}`)}
            >
              {resource.title}
            </h3>
            <button
              onClick={() => toggleSaveResource(resource.id)}
              className="text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400"
            >
              {savedResources.includes(resource.id) ? (
                <BookmarkCheck className="w-5 h-5" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Resource Info */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-sm dark:text-gray-300">
            <div>
              <span className="font-medium">Platform:</span> {resource.platform}
            </div>
            <div>
              <span className="font-medium">Level:</span> {resource.skillLevel}
            </div>
            {resource.duration && (
              <div>
                <span className="font-medium">Duration:</span> {formatDuration(resource.duration)}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => navigate(`/user-dashboard/resources/${resource.id}`)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500"
            >
              View Details
            </button>
            <a
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500"
            >
              View Resource <ExternalLink className="ml-1 w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }, [savedResources, toggleSaveResource, navigate]);

  const renderPagination = useMemo(() => {
    if (totalPages <= 1) return null;
  
    const pageButtons = Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2);
  
    return (
      <div className="flex justify-center items-center space-x-2 mt-6">
        {/* Previous Button */}
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                     bg-white dark:bg-gray-800 
                     text-gray-900 dark:text-gray-300 
                     border-gray-300 dark:border-gray-600 
                     hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Previous
        </button>
        
        {/* Page Numbers */}
        <div className="flex space-x-1">
          {pageButtons.map((page, index, array) => {
            const showEllipsis = index > 0 && page - array[index - 1] > 1;
            return (
              <React.Fragment key={page}>
                {showEllipsis && <span className="px-4 py-2 text-gray-500 dark:text-gray-400">...</span>}
                <button
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 border rounded-lg transition-all
                             text-gray-900 dark:text-gray-300 
                             border-gray-300 dark:border-gray-600 
                             hover:bg-gray-200 dark:hover:bg-gray-700 
                             ${currentPage === page ? 'bg-blue-500 text-white dark:bg-blue-500' : ''}`}
                >
                  {page}
                </button>
              </React.Fragment>
            );
          })}
        </div>
  
        {/* Next Button */}
        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed
                     bg-white dark:bg-gray-800 
                     text-gray-900 dark:text-gray-300 
                     border-gray-300 dark:border-gray-600 
                     hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Next
        </button>
      </div>
    );
  }, [currentPage, totalPages]);  

  return (
    <div className="space-y-10">
      {hasSkillsOrGoals && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="text" placeholder="Search within resources..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg 
                            bg-white dark:bg-gray-800 
                            text-gray-900 dark:text-gray-300 
                            border-gray-300 dark:border-gray-700 
                            focus:ring-2 focus:ring-blue-600"
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: 'type', options: ['all', 'Course', 'Tutorial', 'Learning-Materials'], label: 'All Types' },
                { key: 'skillLevel', options: ['all', 'Beginner', 'Intermediate', 'Advanced'], label: 'All Levels' },
                { key: 'platform', options: ['all', 'YouTube', 'FreeCodeCamp', 'KhanAcademy'], label: 'All Platforms' }
              ].map(({ key, options, label }) => (
                <select
                  key={key}
                  className="px-4 py-2 border rounded-lg 
                            bg-white dark:bg-gray-800 
                            text-gray-900 dark:text-gray-300 
                            border-gray-300 dark:border-gray-700 
                            focus:ring-2 focus:ring-blue-600"
                  value={filters[key]}
                  onChange={(e) => setFilters(prev => ({...prev, [key]: e.target.value}))}
                >
                  {options.map(option => (
                    <option key={option} value={option}>
                      {option === 'all' ? label : option}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map(renderResourceCard)}
      </div>

      {renderPagination}

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      )}

      {error && (
        <div className="text-center py-4 text-red-600">
          {error}
        </div>
      )}

      {!loading && !hasSkillsOrGoals && (
        <div className="text-center py-12">
          <Filter className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">No Resources Found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Add some skills or goals to get personalized resource recommendations.
          </p>
        </div>
      )}

      {!loading && hasSkillsOrGoals && resources.length === 0 && (
        <div className="text-center py-12">
          <Filter className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">No Matching Resources</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria to find more resources.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResourceRecommendations;