const updateLastActiveTime = require('../utils/activeTime');

const updateActiveTimeMiddleware = async (req, res, next) => {
    try {
        if (req.user && req.user.id) {
            await updateLastActiveTime(req.user.id);
        }
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = updateActiveTimeMiddleware;