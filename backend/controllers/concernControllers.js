const Concern = require('../models/Concerns');
const mongoose = require('mongoose');

// Create a new concern
const createConcern = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const userId = req.user.id;

    const newConcern = new Concern({
      userId,
      subject,
      message
    });

    await newConcern.save();

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
        resolvedAt: status === 'Resolved' ? new Date() : null 
      },
      { new: true }
    );

    if (!concern) {
      return res.status(404).json({ message: 'Concern not found' });
    }

    res.status(200).json(concern);
  } catch (error) {
    console.error('Error updating concern:', error);
    res.status(500).json({ message: 'Failed to update concern' });
  }
};

module.exports = {
  createConcern,
  getUserConcerns,
  getAllConcerns,
  updateConcernStatus
};