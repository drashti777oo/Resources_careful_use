import express from 'express';
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  getEmployeeAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

router.use(protect);

router.post('/checkin', asyncHandler(checkIn));
router.post('/checkout', asyncHandler(checkOut));
router.get('/me', asyncHandler(getMyAttendance));
router.get('/', authorize('Admin', 'HR'), asyncHandler(getAllAttendance));
router.get('/employee/:id', authorize('Admin', 'HR'), asyncHandler(getEmployeeAttendance));
router.post('/mark', authorize('Admin', 'HR'), asyncHandler(markAttendance));
router.put('/:id', authorize('Admin', 'HR'), asyncHandler(updateAttendance));
router.delete('/:id', authorize('Admin', 'HR'), asyncHandler(deleteAttendance));

export default router;
