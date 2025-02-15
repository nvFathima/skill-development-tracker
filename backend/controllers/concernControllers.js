const Concern = require('../models/Concerns');
const User = require('../models/User'); 
const {createNotification } = require('../controllers/notificationControllers');
const mongoose = require('mongoose');

// Create a new concern
const createConcern = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const userId = req.user.id;

    // Create the concern
    const newConcern = new Concern({ userId, subject, message });
    await newConcern.save();

    // Fetch the user who submitted the concern
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch all admin users
    const admins = await User.find({ userRole: 'admin' });

    // Create a notification for each admin
    const notificationMessage = `New concern submitted by ${user.fullName}: ${subject}`;
    for (const admin of admins) {
      admin.notifications.push({
        message: notificationMessage,
        createdAt: new Date(),
        read: false,
      });
      await admin.save();
    }

    res.status(201).json({ 
      message: 'Concern submitted successfully', 
      concern: newConcern 
    });
  } catch (error) {
    console.error('Error creating concern:', error);
    res.status(500).json({ message: 'Failed to submit concern' });
  }
};

// Get user's concerns
const getUserConcerns = async (req, res) => {
  try {
    const userId = req.user.id;
    const concerns = await Concern.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json(concerns);
  } catch (error) {
    console.error('Error fetching concerns:', error);
    res.status(500).json({ message: 'Failed to fetch concerns' });
  }
};

// Delete a concern (user only)
const deleteConcern = async (req, res) => {
  try {
    const { concernId } = req.params;
    const userId = req.user.id; // Get the authenticated user's ID

    // Find the concern and ensure it belongs to the user
    const concern = await Concern.findOne({ _id: concernId, userId });
    if (!concern) {
      return res.status(404).json({ message: 'Concern not found or unauthorized' });
    }

    // Delete the concern
    await Concern.findByIdAndDelete(concernId);

    res.status(200).json({ message: 'Concern deleted successfully' });
  } catch (error) {
    console.error('Error deleting concern:', error);
    res.status(500).json({ message: 'Failed to delete concern' });
  }
};

// Get all concerns (admin only)
const getAllConcerns = async (req, res) => {
  try {
    const concerns = await Concern.find()
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json(concerns);
  } catch (error) {
    console.error('Error fetching all concerns:', error);
    res.status(500).json({ message: 'Failed to fetch concerns' });
  }
};

// Update concern status (admin only)
const updateConcernStatus = async (req, res) => {
  try {
    const { concernId } = req.params;
    const { status } = req.body;

    const concern = await Concern.findByIdAndUpdate(
      concernId,
      {
        status,
        resolvedAt: status === 'Resolved' ? new Date() : null,
      },
      { new: true }
    ).populate('userId', 'fullName email');

    if (!concern) {
      return res.status(404).json({ message: 'Concern not found' });
    }

    // Create a notification for the user
    const notificationMessage = `Your concern "${concern.subject}" has been updated to "${status}".`;
    await createNotification(concern.userId._id, notificationMessage);

    res.status(200).json(concern);
  } catch (error) {
    console.error('Error updating concern:', error);
    res.status(500).json({ message: 'Failed to update concern' });
  }
};

const replyToConcern = async (req, res) => {
  try {
    const { concernId } = req.params;
    const { message } = req.body;
    const repliedBy = req.user.id; // Admin who is replying

    const concern = await Concern.findByIdAndUpdate(
      concernId,
      {
        $push: {
          replies: {
            message,
            repliedBy,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    ).populate('userId', 'fullName email');

    if (!concern) {
      return res.status(404).json({ message: 'Concern not found' });
    }

    // Create a notification for the user
    const notificationMessage = `You have a new reply on your concern "${concern.subject}": ${message}`;
    await createNotification(concern.userId._id, notificationMessage);

    res.status(200).json(concern);
  } catch (error) {
    console.error('Error replying to concern:', error);
    res.status(500).json({ message: 'Failed to reply to concern' });
  }
};

module.exports = { createConcern, getUserConcerns, getAllConcerns, updateConcernStatus, deleteConcern, replyToConcern};