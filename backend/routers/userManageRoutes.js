const express = require('express');
const { getAllUsers, getUserById, createUser, updateUser, deleteUser,makeAdmin, sendActivityAlert} = require('../controllers/userManageControllers');
const authAdmin = require('../middleware/authAdmin'); // Assuming this checks for admin privileges

const router = express.Router();

// Routes for user management
router.get('/users-admin', authAdmin, getAllUsers);
router.get('/users-admin/:id', authAdmin, getUserById);
router.post('/users-admin', authAdmin, createUser); // Only admin should be able to create users
router.put('/users-admin/:id', authAdmin, updateUser);
router.delete('/users-admin/:id', authAdmin, deleteUser);
router.patch('/users-admin/:id',makeAdmin);
router.post('/users-admin/:id/activity-alert', authAdmin, sendActivityAlert);
module.exports = router;
