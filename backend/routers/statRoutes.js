const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Goals = require('../models/Goals');
const { getAdminReports } = require('../controllers/statController');

router.get('/users/activity', async (req, res) => {
    try {
      const users = await User.find({}, 'lastActiveTime');
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user activity data' });
    }
  });

  // Backend route to fetch all goals
router.get('/goals', async (req, res) => {
    try {
      const goals = await Goals.find({}).populate('associatedSkills');
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching goals' });
    }
  });

  router.get("/admin/reports", getAdminReports); 


  module.exports = router;