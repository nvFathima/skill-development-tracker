const User = require('../models/User');

const updateLastActiveTime = async (userId) => {
    try {
        await User.findByIdAndUpdate(userId, {
            lastActiveTime: new Date()
        });
    } catch (error) {
        console.error('Error updating last active time:', error);
    }
};

module.exports = updateLastActiveTime;