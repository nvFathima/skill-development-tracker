const User = require('../models/User');
const Skill = require('../models/Skills');
const Goal = require('../models/Goals');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const _ = require("lodash");
const jwt = require('jsonwebtoken');

// User Registration
const registerUser = async (req, res) => {
    try {
        const { fullName, email, password, age, phone, employmentDetails, employmentStatus } = req.body;

        // Handle both new and old format
        const status = employmentDetails?.status || employmentStatus;

        if (!status) {
            return res.status(400).json({ message: "Employment status is required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with employment details
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            age,
            phone,
            employmentDetails: {
                status: status.toLowerCase()
            }
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// Get user by ID
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });

        // Update last active time
        user.lastActiveTime = new Date();
        await user.save();

        // Generate token
        const token = jwt.sign(
            { id: user._id, email: user.email, role:user.userRole },
            process.env.JWT_SECRET, // Ensure you set JWT_SECRET in your environment variables
            { expiresIn: '1h' }
        );

        res.status(200).json({ token, role: user.userRole, name: user.fullName, _id: user._id,
          lastActiveTime: user.lastActiveTime, profilePhoto:user.profilePhoto ,message: "Login successful!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//logout functionality 
const logoutUser = async(req,res)=>{
    // res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
}

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id; // User ID from auth middleware
        const user = await User.findById(userId)
            .select('-password -__v') // Exclude sensitive fields
            .lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; // User ID from auth middleware
        const updateData = { ...req.body };

        // Whitelist editable fields to avoid unwanted updates
        const editableFields = [
            'fullName',
            'age',
            'phone',
            'alternateEmail',
            'employmentDetails',
            'education',
        ];
        Object.keys(updateData).forEach((key) => {
            if (!editableFields.includes(key)) delete updateData[key];
        });

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password -__v'); // Exclude sensitive fields

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getProfileStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const [skillsCount, goalsCount] = await Promise.all([
            Skill.countDocuments({ userId }),
            Goal.countDocuments({ userId }),
        ]);

        res.status(200).json({ skillsCount, goalsCount });
    } catch (error) {
        console.error('Error fetching profile stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/profile-photos')  // Make sure this directory exists
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname))
    }
  });
  const upload = multer({ 
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    }
  });
  
  // Upload photo endpoint
const uploadProfilePhoto = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
  
      const userId = req.user.id;
      const photoUrl = `/uploads/profile-photos/${req.file.filename}`;
  
      // Update user's profile with new photo URL
      await User.findByIdAndUpdate(userId, { profilePhoto: photoUrl });
  
      res.status(200).json({ 
        message: 'Profile photo uploaded successfully',
        photoUrl 
      });
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      res.status(500).json({ message: 'Error uploading profile photo' });
    }
  };

  // Remove photo endpoint
const removeProfilePhoto = async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
  
      if (user.profilePhoto) {
        // Optional: Delete the file from storage
        const fs = require('fs');
        const filePath = path.join(__dirname, '..', user.profilePhoto);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
  
        // Update user profile
        user.profilePhoto = '';
        await user.save();
      }
  
      res.status(200).json({ message: 'Profile photo removed successfully' });
    } catch (error) {
      console.error('Error removing profile photo:', error);
      res.status(500).json({ message: 'Error removing profile photo' });
    }
  };

const getOverview = async (req, res) => {
  try {
    const { userId } = req.user; // Assuming authentication middleware provides `req.user`
    console.log({ userId });

    // Fetch all goals for the user
    const goals = await Goal.find({ userId: req.user.id });

    // Count goals based on their statuses
    const goalCounts = {
      pending: goals.filter((goal) => goal.status === "Pending").length,
      inProgress: goals.filter((goal) => goal.status === "In Progress").length,
      completed: goals.filter((goal) => goal.status === "Completed").length,
    };

    // Fetch all skills for the user
    const skills = await Skill.find({ userId: req.user.id });

    // Calculate progress for each skill
    const skillProgress = skills.map((skill) => {
      const skillGoals = goals.filter((goal) =>
        goal.associatedSkills.some(
          (id) => id.toString() === skill._id.toString()
        )
      );

      // Calculate weighted progress
      const totalWeight = skillGoals.length * 100; // 100% weight per goal
      const weightedProgress = skillGoals.reduce((acc, goal) => {
        if (goal.status === "Pending") return acc + 0;
        if (goal.status === "In Progress") return acc + 50; // 50% for "In Progress"
        if (goal.status === "Completed") return acc + 100; // 100% for "Completed"
      }, 0);

      // Calculate progress as a percentage
      const progress =
        totalWeight > 0 ? (weightedProgress / totalWeight) * 100 : 0;

      return { name: skill.name, progress: Math.round(progress) };
    });

    // Sort skills by number of goals and limit to top 5
    const sortedSkills = skillProgress
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);

    res.status(200).json({ goalCounts, skillProgress: sortedSkills });
  } catch (error) {
    console.error("Error fetching overview:", error);
    res.status(500).json({ message: "Failed to fetch overview data" });
  }
};  

module.exports = { 
    registerUser, getUsers, loginUser,
    logoutUser,getProfile, updateProfile, getProfileStats, 
    uploadProfilePhoto, removeProfilePhoto, getOverview};