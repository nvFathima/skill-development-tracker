const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getRecommendedResources, getResourceDetail } = require('../controllers/resourceControllers');
const router = express.Router();

// Route to fetch YouTube resources
router.get('/recommended', authMiddleware, getRecommendedResources);

// Route to fetch single resource details
router.get('/:resourceId', authMiddleware, getResourceDetail);

module.exports = router;
