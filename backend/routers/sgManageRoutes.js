const express = require('express');
const {
  getAllUsersSkillsAndGoals,
  notifyOverdueGoals, } = require('../controllers/sgControllers');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Routes for admin skill and goal management
router.get('/admin/skills-goals', authMiddleware, getAllUsersSkillsAndGoals);
router.post('/admin/notify-overdue-goals', authMiddleware, notifyOverdueGoals);

module.exports = router;
