const express = require('express');
const { 
  createConcern, getUserConcerns, getAllConcerns, updateConcernStatus, deleteConcern, replyToConcern
} = require('../controllers/concernControllers');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/authAdmin');

const router = express.Router();

// User routes
router.post('/', authenticate, createConcern);
router.get('/my-concerns', authenticate, getUserConcerns);
router.delete('/:concernId', authenticate, deleteConcern);
router.patch('/:concernId', authenticate, checkRole, updateConcernStatus);

// Admin routes
router.get('/', authenticate, checkRole, getAllConcerns);
router.post('/:concernId/reply', authenticate, checkRole, replyToConcern);

module.exports = router;