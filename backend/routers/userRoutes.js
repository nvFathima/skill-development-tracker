const express = require('express');
const { createUser, getUsers, getUserById } = require('../controllers/userController');
const router = express.Router();

router.post('/register', createUser); // Register a new user
router.get('/', getUsers);           // Get all users
router.get('/:id', getUserById);     // Get a user by ID

module.exports = router;
