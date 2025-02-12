const express = require('express');
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationControllers');
const router = express.Router();

router.get('/', auth, notificationController.getNotifications);
router.patch('/:id/read', auth, notificationController.markNotificationAsRead);
router.delete('/:id', auth, notificationController.deleteNotification);
router.delete('/', auth, notificationController.deleteAllNotifications);
module.exports = router;