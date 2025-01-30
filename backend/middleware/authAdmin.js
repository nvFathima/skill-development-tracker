const jwt = require('jsonwebtoken');

const authAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Expecting `Bearer TOKEN`
  if (!token) return res.status(401).json({ message: 'Unauthorized access' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: Admins only' });
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authAdmin;
