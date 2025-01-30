const express = require('express');
const jwt = require('jsonwebtoken');
const { getUsers, registerUser, loginUser,logoutUser, 
getProfile,updateProfile , getProfileStats,
uploadProfilePhoto, removeProfilePhoto, getOverview} = require('../controllers/userController');
const upload = require('../middleware/upload');
const authenticate = require('../middleware/auth');
const updateActiveTimeMiddleware = require('../middleware/updateActiveTime');

const router = express.Router();

router.post('/register', registerUser); // Register a new user
router.get('/', getUsers);           // Get all users
router.post('/login', loginUser);     // Get a user by ID
router.post('/logout', logoutUser);

// Profile Management Routes
router.get('/profile', authenticate, getProfile); // Fetch profile
router.put('/profile', authenticate, updateProfile); // Update profile
router.get('/profile/stats', authenticate, getProfileStats); // Fetch stats
router.use(authenticate, updateActiveTimeMiddleware);
router.post('/profile/photo', authenticate, upload.single('photo'),uploadProfilePhoto);
router.delete('/profile/photo', authenticate, removeProfilePhoto);
router.get('/overview', authenticate, getOverview);

module.exports = router;