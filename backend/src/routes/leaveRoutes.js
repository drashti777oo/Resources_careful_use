import express from 'express';
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getLeaveById,
  approveLeave,
  rejectLeave,
  cancelLeave,
  deleteLeave,
} from '../controllers/leaveController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

router.use(protect);

router.post('/', asyncHandler(applyLeave));
router.get('/me', asyncHandler(getMyLeaves));
router.get('/', authorize('Admin', 'HR'), asyncHandler(getAllLeaves));
router.get('/:id', asyncHandler(getLeaveById));
router.put('/:id/approve', authorize('Admin', 'HR'), asyncHandler(approveLeave));
router.put('/:id/reject', authorize('Admin', 'HR'), asyncHandler(rejectLeave));
router.put('/:id/cancel', asyncHandler(cancelLeave));
router.delete('/:id', authorize('Admin', 'HR'), asyncHandler(deleteLeave));

export default router;
