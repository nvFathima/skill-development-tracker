const User = require('../models/User');
const cron = require('node-cron');
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

// Utility function to check if user needs an activity alert
const needsActivityAlert = (lastActiveTime, thresholdDays) => {
  if (!lastActiveTime) return false;
  const daysSinceActive = Math.floor((Date.now() - lastActiveTime) / (1000 * 60 * 60 * 24));
  return daysSinceActive >= thresholdDays;
};

// Enhanced activity alert controller
const sendActivityAlert = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Check if alert is actually needed based on threshold
    if (!needsActivityAlert(user.lastActiveTime, user.activityAlertThreshold)) {
      return res.status(400).json({ 
        message: 'Activity alert not needed - user is still within active threshold'
      });
    }

    // Create notification
    await createNotification(id, message || `We noticed you haven't been active for ${user.activityAlertThreshold} days. We'd love to see you back!`);
    
    // Update last alert sent time
    user.lastActivityAlert = Date.now();
    await user.save();
    
    res.status(200).json({ 
      message: 'Activity alert sent successfully',
      daysSinceActive: Math.floor((Date.now() - user.lastActiveTime) / (1000 * 60 * 60 * 24))
    });
  } catch (error) {
    console.error('Error sending activity alert:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Automated check for inactive users
const checkInactiveUsers = async () => {
  try {
    const users = await User.find({});
    
    for (const user of users) {
      if (needsActivityAlert(user.lastActiveTime, user.activityAlertThreshold)) {
        await createNotification(
          user._id,
          `We noticed you haven't been active for ${user.activityAlertThreshold} days. We'd love to see you back!`
        );
      }
    }
  } catch (error) {
    console.error('Error checking inactive users:', error);
  }
};

cron.schedule('0 0 * * *', checkInactiveUsers); // Runs daily at midnight

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser, makeAdmin, sendActivityAlert,
  checkInactiveUsers, needsActivityAlert };
