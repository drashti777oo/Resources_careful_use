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

const router = express.Router();

router.use(protect);

router.post('/', applyLeave);
router.get('/me', getMyLeaves);
router.get('/', authorize('Admin', 'HR'), getAllLeaves);
router.get('/:id', getLeaveById);
router.put('/:id/approve', authorize('Admin', 'HR'), approveLeave);
router.put('/:id/reject', authorize('Admin', 'HR'), rejectLeave);
router.put('/:id/cancel', cancelLeave);
router.delete('/:id', authorize('Admin', 'HR'), deleteLeave);

export default router;
