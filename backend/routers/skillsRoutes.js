const express = require('express');
const { getAllSkills, addSkill, updateSkill, deleteSkill, getMatchingSkills } = require('../controllers/skillsController');
const { getAllGoals, addGoal, updateGoal, deleteGoal, getMatchingGoals,
    linkResourceToGoal,
    unlinkResourceFromGoal } = require('../controllers/goalsController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Skill Routes
router.get('/skills', authMiddleware, getAllSkills);
router.post('/skills', authMiddleware, addSkill);
router.put('/skills/:id', authMiddleware, updateSkill);
router.delete('/skills/:id', deleteSkill);
router.get('/skills/matching', authMiddleware, getMatchingSkills);

// Goal Routes
router.get('/goals', authMiddleware, getAllGoals);
router.post('/goals', authMiddleware, addGoal);
router.put('/goals/:id', authMiddleware, updateGoal);
router.delete('/goals/:id', authMiddleware, deleteGoal);
router.get('/goals/matching-resource/:resourceId', authMiddleware, getMatchingGoals);
router.post('/goals/:goalId/link-resource', authMiddleware, linkResourceToGoal);
router.delete('/goals/:goalId/unlink-resource/:resourceLink', authMiddleware, unlinkResourceFromGoal);

module.exports = router;
