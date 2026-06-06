const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Helper to generate access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'supersecretjwtkeyforaccess123!',
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

// Helper to generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'supersecretjwtkeyforrefresh456!',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

const register = async (req, res, next) => {
  try {
    const { name, username, email, password, confirmPassword, role, phone, address } = req.body;

    // Validate required fields
    if (!name || !username || !email || !password || !confirmPassword || !phone || !address) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    // Create user - public registration must only create CUSTOMER accounts
    const newUser = await User.create({
      name,
      username: username || null,
      email,
      password, // hashed automatically by model hooks
      role: 'CUSTOMER',
      phone,
      address,
      isActive: true,
      createdByAdmin: false
    });

    // Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Save refresh token
    newUser.refreshToken = refreshToken;
    await newUser.save();

    res.status(201).json({
      message: 'Registration successful.',
      accessToken,
      refreshToken,
      user: newUser.toPublicJSON()
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Enforce that only the Admin account with the username adminR and password admin123 can access the Admin role/dashboard.
    if (user.role === 'ADMIN') {
      if (email !== 'adminR' || password !== 'admin123') {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
    }

    // Enforce that only supplier accounts created by the Admin can log in/access the supplier portal.
    if (user.role === 'SUPPLIER') {
      if (!user.createdByAdmin) {
        return res.status(401).json({ error: 'Access denied. Supplier account not authorized or not created by Admin.' });
      }
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      message: 'Login successful.',
      accessToken,
      refreshToken,
      user: user.toPublicJSON()
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // req.user is populated by authenticateJWT middleware
    const user = req.user;
    user.refreshToken = null;
    await user.save();

    res.status(200).json({ message: 'Logout successful. Refresh token revoked.' });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'supersecretjwtkeyforrefresh456!');
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired refresh token. Please login again.' });
    }

    // Find user and check token match
    const user = await User.findByPk(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    res.status(200).json({
      accessToken: newAccessToken
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refresh
};
