const User = require('../models/User');
const {createNotification } = require('../controllers/notificationControllers');

//to make a user admin
const makeAdmin = async (req,res) => {
    try {
        const result = await User.updateOne(
            { _id: req.params.id }, // Find the user by their ID
            { $set: { userRole: "admin" } } // Set the userRole to "admin"
        );
        if(!result) return res.status(404).json({message:"User not found"})
            res.json(result)
    } catch (error) {
        console.error('Error updating user role:', error);
    }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords for security
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a single user by ID
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new user (admin functionality)
const createUser = async (req, res) => {
  try {
    const { fullName, email, password, phone, age, employmentDetails } = req.body;
    const newUser = new User({ fullName, email, password, phone, age, employmentDetails });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update an existing user
const updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const sendActivityAlert = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Create notification using the notification controller
    await createNotification(id, message);
    
    res.status(200).json({ message: 'Activity alert sent successfully' });
  } catch (error) {
    console.error('Error sending activity alert:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser, makeAdmin, sendActivityAlert
};
