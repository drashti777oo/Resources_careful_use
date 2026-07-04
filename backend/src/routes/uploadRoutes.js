import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';
import { uploadProfilePicture, uploadDocument } from '../controllers/uploadController.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

router.use(protect);
router.post('/profile', uploadSingle('file'), asyncHandler(uploadProfilePicture));
router.post('/document', uploadSingle('file'), asyncHandler(uploadDocument));

export default router;
