import express from 'express';
import {
  registerUser,
  loginUser,
  verifyEmail,
  resendOtp,
  logoutUser,
} from '../controllers/verificationController.js';
import { getCurrentUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

router.post('/register', asyncHandler(registerUser));
router.post('/verify-email', asyncHandler(verifyEmail));
router.post('/resend-otp', asyncHandler(resendOtp));
router.post('/login', asyncHandler(loginUser));
router.post('/logout', protect, asyncHandler(logoutUser));
router.get('/me', protect, asyncHandler(getCurrentUser));

export default router;
