import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const registerUser = async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, 'Invalid registration data', parsed.error.issues);
    }

    const { name, email, password, role } = parsed.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, 'User already exists');
    }

    const user = new User({ name, email, password, role });
    await user.save();

    return successResponse(res, 201, 'User registered successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const loginUser = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return errorResponse(res, 400, 'Invalid login data', parsed.error.issues);
    }

    const { email, password } = parsed.data;
    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse(res, 400, 'Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 400, 'Invalid credentials');
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return successResponse(res, 200, 'Login successful', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email role profilePicture isVerified');
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(res, 200, 'User fetched successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};
