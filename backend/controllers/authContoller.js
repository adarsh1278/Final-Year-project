import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Generate JWT token for authentication
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => jwt.sign(
  { id }, 
  process.env.JWT_SECRET, 
  { expiresIn: process.env.JWT_EXPIRES_IN }
);

/**
 * User registration
 * @route POST /api/auth/signup
 */
export const signup = async (req, res) => {
  try {
    const { name, email, phone, password, languagePreference } = req.body;
    console.log(req.body);
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Please provide name, email and password'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        status: 'error',
        message: 'User with this email already exists'
      });
    }
    
    // Check if phone is already registered
    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(409).json({
          status: 'error',
          message: 'This phone number is already registered'
        });
      }
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = await User.create({ 
      name, 
      email, 
      phone, 
      passwordHash, 
      languagePreference: languagePreference || 'en' // Default to English if not specified
    });
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    // Set cookie and send response
    res.cookie("user_token", token, {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      sameSite: 'lax', // or 'none' if secure is true
      maxAge: 24 * 60 * 60 * 1000,
      domain: 'localhost' // allow access across localhost ports
    });
    
    
    res.status(201).json({ 
      status: 'success',
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(400).json({ 
      status: 'error',
      message: err.message 
    });
  }
};

/**
 * User login
 * @route POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Please provide email and password'
      });
    }
    
    // Find user and include password hash for verification
    const user = await User.findOne({ email });
    
    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ 
        status: 'error',
        message: "Invalid credentials" 
      });
    }
    
    // Update last login timestamp
    user.lastLogin = Date.now();
    await user.save();
    
    // Generate token
    const token = generateToken(user._id);
    
    // Set cookie and send response
    res.cookie("user_token", token, { 
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    
    res.status(200).json({ 
      status: 'success',
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      status: 'error',
      message: "Failed to login. Please try again later" 
    });
  }
};

/**
 * Get user profile
 * @route GET /api/auth/profile
 * @requires Authentication
 */
export const profile = async (req, res) => {
  try {
    // Fetch user without returning the password hash
    const user = await User.findById(req.user.id).select("-passwordHash");
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: user
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch profile'
    });
  }
};

/**
 * Logout user
 * @route GET /api/auth/logout
 */
export const logout = (req, res) => {
  res.cookie('user_token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 1000)
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
};

/**
 * Update user password
 * @route PATCH /api/auth/update-password
 * @requires Authentication
 */
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide current and new password'
      });
    }
    
    // Get user with password hash
    const user = await User.findById(req.user.id);
    
    // Check if current password is correct
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update password'
    });
  }
};

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide an email address'
      });
    }
    
    const user = await User.findOne({ email });
    
    // Don't reveal if user exists for security
    if (!user) {
      return res.status(200).json({
        status: 'success',
        message: 'If a user with this email exists, a reset link will be sent'
      });
    }
    
    // Generate reset token (would normally send email here)
    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_RESET_SECRET,
      { expiresIn: '10m' }
    );
    
    // Store token hash in database
    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    
    // In a real app, send email with reset link
    
    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to email'
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process password reset'
    });
  }
};