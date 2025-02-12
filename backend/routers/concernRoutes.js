const express = require('express');
const { 
  createConcern, getUserConcerns, getAllConcerns, updateConcernStatus, deleteConcern
} = require('../controllers/concernControllers');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/authAdmin');

const router = express.Router();

// User routes
router.post('/', authenticate, createConcern);
router.get('/my-concerns', authenticate, getUserConcerns);
router.delete('/:concernId', authenticate, deleteConcern);

// Admin routes
router.get('/', authenticate, checkRole, getAllConcerns);
router.patch('/:concernId', authenticate, checkRole, updateConcernStatus);

module.exports = router;