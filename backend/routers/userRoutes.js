const express = require('express');
const { getUsers, registerUser, loginUser } = require('../controllers/userController');
const router = express.Router();

router.post('/register', registerUser); // Register a new user
router.get('/', getUsers);           // Get all users
router.post('/login', loginUser);     // Get a user by ID

module.exports = router;
