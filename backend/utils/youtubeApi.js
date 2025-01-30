const axios = require('axios');
const NodeCache = require('node-cache');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const fetchYouTubeResources = async ({
  query,
  maxResults = 10,
  pageToken = '',
  relevanceLanguage = 'en',
  videoDuration = 'medium',
  order = 'relevance'
}) => {
  console.log("Fetching YouTube resources with query:", query);
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults,
        pageToken,
        relevanceLanguage,
        videoDuration,
        order,
        key: YOUTUBE_API_KEY,
      },
    });

    // Get video statistics in a single request
    const videoIds = response.data.items.map(item => item.id.videoId).join(',');
    const videoStats = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'statistics,contentDetails',
        id: videoIds,
        key: YOUTUBE_API_KEY,
      },
    });

    // Combine video data with statistics
    const resources = response.data.items.map((item, index) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
      duration: videoStats.data.items[index].contentDetails.duration,
      viewCount: videoStats.data.items[index].statistics.viewCount,
      likeCount: videoStats.data.items[index].statistics.likeCount,
      type: 'Tutorial',
      platform: 'YouTube',
      skillLevel: determineSkillLevel(item.snippet.title, item.snippet.description),
    }));

    return {
      resources,
      nextPageToken: response.data.nextPageToken,
      totalResults: response.data.pageInfo.totalResults,
    };
  } catch (error) {
    console.error('Error fetching YouTube resources:', error.message);
    throw new Error('Failed to fetch resources from YouTube');
  }
};

// Helper function to determine skill level based on video metadata
const determineSkillLevel = (title, description) => {
  const content = (title + ' ' + description).toLowerCase();
  if (content.includes('beginner') || content.includes('basics') || content.includes('introduction')) {
    return 'Beginner';
  } else if (content.includes('advanced') || content.includes('expert')) {
    return 'Advanced';
  }
  return 'Intermediate';
};

// Cache manager for YouTube responses
const cache = new Map();
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

const getCachedResources = async (params) => {
  const cacheKey = JSON.stringify(params);
  const cachedData = cache.get(cacheKey);
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }
  
  const data = await fetchYouTubeResources(params);
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
};

// Cache configuration (30 minutes TTL)
const nodecache = new NodeCache({ stdTTL: 1800 });

const getVideoDetails = async (videoId) => {
  const cacheKey = `video_${videoId}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: videoId,
        key: process.env.YOUTUBE_API_KEY
      }
    });

    if (!response.data.items || response.data.items.length === 0) {
      return null;
    }

    const videoDetails = response.data.items[0];
    nodecache.set(cacheKey, videoDetails);
    
    return videoDetails;

  } catch (error) {
    console.error('Error fetching video details:', error);
    throw new Error('Failed to fetch video details from YouTube API');
  }
};

module.exports = { getCachedResources, getVideoDetails };