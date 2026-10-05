import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

const createToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

const publicUser = (user) => ({
  id: user._id,
  username: user.username,
  role: user.role,
});

// This route is useful for creating the first administrator or staff account.
// In a production app, restrict it to administrators or remove it after setup.
router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username?.trim() || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const exists = await User.exists({ username: normalizedUsername });
    if (exists) return res.status(409).json({ message: 'That username is already in use.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      username: normalizedUsername,
      password: hashedPassword,
      role: 'staff',
    });

    return res.status(201).json({
      message: 'Account created successfully.',
      token: createToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username?.trim() || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = await User.findOne({ username: username.trim().toLowerCase() }).select('+password');
    const passwordMatches = user && (await bcrypt.compare(password, user.password));
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    return res.json({
      message: 'Login successful.',
      token: createToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
