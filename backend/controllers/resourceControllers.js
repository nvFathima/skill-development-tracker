const { getCachedResources, getVideoDetails } = require('../utils/youtubeApi');
const Goal = require('../models/Goals');
const Skill = require('../models/Skills');

const getRecommendedResources = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 9, 
      type, 
      skillLevel, 
      platform, 
      search 
    } = req.query;

    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    console.log('Fetching resources for userId:', userId);

    // Fetch user's goals and skills with better error handling
    const [userGoals, userSkills] = await Promise.all([
      Goal.find({ userId }).populate('associatedSkills'),
      Skill.find({ userId })
    ]);
    
    // If no skills or goals, return early
    if (userSkills.length === 0 && userGoals.length === 0) {
      console.log('No skills or goals found for user');
      return res.status(200).json({
        resources: [],
        hasSkillsOrGoals: false,
        message: "No skills or goals found. Add some to get recommendations!",
        totalItems: 0,
        totalPages: 0,
        currentPage: pageNum
      });
    }

    // Extract and log search terms
    const searchTerms = new Set([
      ...userSkills.map(skill => skill.name),
      ...userGoals.flatMap(goal => 
        goal.associatedSkills.map(skill => skill.name)
      )
    ]);

    // Fetch resources with error handling for each term
    const resourcePromises = Array.from(searchTerms).map(async term => {
      try {
        const result = await getCachedResources({
          query: `${term} tutorial`,
          maxResults: 50,
          relevanceLanguage: 'en',
          videoDuration: 'medium'
        });
        return result;
      } catch (error) {
        console.error(`Error fetching resources for term ${term}:`, error);
        return { resources: [] };
      }
    });

    const results = await Promise.all(resourcePromises);
    let allResources = results.flatMap(result => result.resources || []);
    
    console.log(`Total resources before deduplication: ${allResources.length}`);

    // Remove duplicates
    allResources = Array.from(
      new Map(allResources.map(item => [item.id, item])).values()
    );

    console.log(`Total resources after deduplication: ${allResources.length}`);

    // Apply filters if provided
    let filteredResources = [...allResources];

    if (type && type !== 'all') {
      filteredResources = filteredResources.filter(resource => resource.type === type);
      console.log(`After type filter (${type}):`, filteredResources.length);
    }

    if (skillLevel && skillLevel !== 'all') {
      filteredResources = filteredResources.filter(resource => resource.skillLevel === skillLevel);
      console.log(`After skill level filter (${skillLevel}):`, filteredResources.length);
    }

    if (platform && platform !== 'all') {
      filteredResources = filteredResources.filter(resource => resource.platform === platform);
      console.log(`After platform filter (${platform}):`, filteredResources.length);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredResources = filteredResources.filter(resource => 
        resource.title.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower)
      );
      console.log(`After search filter (${search}):`, filteredResources.length);
    }

    // Sort by engagement
    filteredResources.sort((a, b) => {
      const aEngagement = parseInt(a.viewCount) * (parseInt(a.likeCount) || 1);
      const bEngagement = parseInt(b.viewCount) * (parseInt(b.likeCount) || 1);
      return bEngagement - aEngagement;
    });

    // Calculate pagination values
    const totalItems = filteredResources.length;
    const totalPages = Math.ceil(totalItems / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedResources = filteredResources.slice(startIndex, endIndex);

    console.log(`Sending ${paginatedResources.length} resources (page ${pageNum} of ${totalPages})`);

    res.status(200).json({
      resources: paginatedResources,
      hasSkillsOrGoals: true,
      totalItems,
      totalPages,
      currentPage: pageNum,
      itemsPerPage: limitNum
    });
  } catch (error) {
    console.error('Error in getRecommendedResources:', error);
    res.status(500).json({ 
      message: 'Failed to fetch resources. Please try again later.',
      error: error.message 
    });
  }
};

const getResourceDetail = async (req, res) => {
  try {
    const { resourceId } = req.params;
    
    if (!resourceId) {
      return res.status(400).json({ 
        message: 'Resource ID is required' 
      });
    }

    // Fetch detailed video information from YouTube
    const videoDetails = await getVideoDetails(resourceId);
    
    if (!videoDetails) {
      return res.status(404).json({ 
        message: 'Resource not found' 
      });
    }

    // Transform video details into our resource format
    const resource = {
      id: videoDetails.id,
      title: videoDetails.snippet.title,
      description: videoDetails.snippet.description,
      thumbnail: videoDetails.snippet.thumbnails.high?.url || videoDetails.snippet.thumbnails.default?.url,
      link: `https://www.youtube.com/watch?v=${videoDetails.id}`,
      platform: 'YouTube',
      type: 'Video',
      channelTitle: videoDetails.snippet.channelTitle,
      channelId: videoDetails.snippet.channelId,
      publishedAt: videoDetails.snippet.publishedAt,
      duration: videoDetails.contentDetails?.duration,
      viewCount: videoDetails.statistics?.viewCount,
      likeCount: videoDetails.statistics?.likeCount,
      // Determine skill level based on video tags or description
      skillLevel: determineSkillLevel(videoDetails.snippet.tags, videoDetails.snippet.description),
      tags: videoDetails.snippet.tags || []
    };

    res.status(200).json(resource);

  } catch (error) {
    console.error('Error in getResourceDetail:', error);
    res.status(500).json({ 
      message: 'Failed to fetch resource details',
      error: error.message 
    });
  }
};

// Helper function to determine skill level based on video metadata
const determineSkillLevel = (tags = [], description = '') => {
  const content = [...tags, description.toLowerCase()].join(' ').toLowerCase();
  
  const beginnerKeywords = ['beginner', 'basics', 'introduction', 'fundamental', 'start', 'basic'];
  const advancedKeywords = ['advanced', 'expert', 'complex', 'professional', 'deep dive'];
  
  const isBeginnerContent = beginnerKeywords.some(keyword => content.includes(keyword));
  const isAdvancedContent = advancedKeywords.some(keyword => content.includes(keyword));
  
  if (isBeginnerContent) return 'Beginner';
  if (isAdvancedContent) return 'Advanced';
  return 'Intermediate';
};

module.exports = { 
  getRecommendedResources,
  getResourceDetail
};