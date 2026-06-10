import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect middleware – verifies JWT from httpOnly cookie
 * Attaches the user object to req.user
 */
const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized – no token' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user (without password) to request
    req.user = await User.findById(decoded.id).select('-Password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized – invalid token' });
  }
};

export default protect;
