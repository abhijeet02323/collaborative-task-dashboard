const User = require('../models/User');

class AuthController {
  static async register(req, res) {
    try {
      const { firstName, lastName, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered',
        });
      }

      // Create new user
      const user = await User.create(firstName, lastName, email, password, 'user');

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user,
      });
    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({
        success: false,
        message: 'Registration failed',
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const { token, user } = await User.authenticateUser(email, password);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: user,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile',
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      const { firstName, lastName } = req.body;
      const updates = {};

      if (firstName) updates.first_name = firstName;
      if (lastName) updates.last_name = lastName;

      const user = await User.updateUser(req.userId, updates);

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile',
      });
    }
  }
}

module.exports = AuthController;
