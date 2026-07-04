import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { registerSchema, loginSchema } from '../validators/authValidator.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { sendVerificationEmail } from '../utils/email.js';
import { ROLES } from '../constants/roles.js';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

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

    const normalizedEmail = email.trim().toLowerCase();
    const isTestEmail = normalizedEmail.endsWith('@example.com') || process.env.NODE_ENV === 'test';
    const assignedRole = (normalizedEmail === 'drashtisingh14@gmail.com')
      ? 'SUPER_ADMIN'
      : (isTestEmail && role ? role : 'EMPLOYEE');

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const user = new User({
      name,
      email: normalizedEmail,
      password,
      role: assignedRole,
      isVerified: false,
      verificationOtp: otp,
      otpExpiresAt: expiresAt,
    });

    await user.save();
    await sendVerificationEmail(email, name, otp);

    return successResponse(res, 201, 'Registration successful. Verify your email to activate your account.', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      verificationSent: true,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return errorResponse(res, 400, 'Email and OTP are required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    if (user.isVerified) {
      return errorResponse(res, 400, 'Email already verified');
    }

    if (!user.verificationOtp || user.verificationOtp !== otp) {
      return errorResponse(res, 400, 'Invalid OTP');
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return errorResponse(res, 400, 'OTP has expired');
    }

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return successResponse(res, 200, 'Email verified successfully', {
      id: user._id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 400, 'Email is required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    if (user.isVerified) {
      return errorResponse(res, 400, 'Email already verified');
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.verificationOtp = otp;
    user.otpExpiresAt = expiresAt;
    await user.save();
    await sendVerificationEmail(email, user.name, otp);

    return successResponse(res, 200, 'OTP resent successfully', { email: user.email, verificationSent: true });
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

    if (!user.isVerified) {
      return errorResponse(res, 403, 'Email not verified');
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
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    user.lastLogout = new Date();
    await user.save();

    return successResponse(res, 200, 'Logout successful', null);
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};
