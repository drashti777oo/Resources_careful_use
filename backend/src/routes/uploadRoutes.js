import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';
import { uploadProfilePicture, uploadDocument } from '../controllers/uploadController.js';

const router = express.Router();

router.use(protect);
router.post('/profile', uploadSingle('file'), uploadProfilePicture);
router.post('/document', uploadSingle('file'), uploadDocument);

export default router;
