import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const sendTokenCookie = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res.cookie('token', token, cookieOptions);

  user.Password = undefined;

  res.status(statusCode).json({ success: true, user });
};

export const register = async (req, res) => {
  try {
    const { UserName, Password } = req.body;

    const existing = await User.findOne({ UserName });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    const user = await User.create({ UserName, Password });
    sendTokenCookie(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { UserName, Password } = req.body;

    if (!UserName || !Password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const user = await User.findOne({ UserName }).select('+Password');
    if (!user || !(await user.matchPassword(Password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenCookie(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const logout = (_req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
