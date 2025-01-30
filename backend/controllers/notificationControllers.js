const User = require("../models/User");

const getNotifications = async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      res.json(user.notifications.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      res.status(500).json({ message: 'Error fetching notifications' });
    }
  };
  
  const markNotificationAsRead = async (req, res) => {
    try {
      const userId = req.user.id;
      const notificationId = req.params.id;
      
      await User.updateOne(
        { 
          _id: userId, 
          'notifications._id': notificationId 
        },
        { 
          $set: { 'notifications.$.read': true } 
        }
      );
      
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      res.status(500).json({ message: 'Error marking notification as read' });
    }
  };
  
  // Function to create a new notification
  const createNotification = async (userId, message) => {
    try {
      await User.findByIdAndUpdate(userId, {
        $push: {
          notifications: {
            message,
            createdAt: new Date(),
            read: false
          }
        }
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };
  
  const deleteNotification = async (req, res) => {
    try {
      const userId = req.user.id;
      const notificationId = req.params.id;
      
      const user = await User.findById(userId);
      user.notifications = user.notifications.filter(
        notification => notification._id.toString() !== notificationId
      );
      await user.save();
      
      res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting notification' });
    }
  };

  module.exports = {getNotifications,markNotificationAsRead,createNotification, deleteNotification };
  