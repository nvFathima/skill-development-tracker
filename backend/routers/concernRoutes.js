const express = require('express');
const { 
  createConcern, 
  getUserConcerns, 
  getAllConcerns, 
  updateConcernStatus 
} = require('../controllers/concernControllers');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/authAdmin');

const router = express.Router();

// User routes
router.post('/', authenticate, createConcern);
router.get('/my-concerns', authenticate, getUserConcerns);

// Admin routes
router.get('/', authenticate, checkRole, getAllConcerns);
router.patch('/:concernId', authenticate, checkRole, updateConcernStatus);

module.exports = router;