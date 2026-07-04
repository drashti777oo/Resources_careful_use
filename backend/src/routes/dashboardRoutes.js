import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/stats', authorize('Admin', 'HR', 'Manager'), getDashboardStats);

export default router;
