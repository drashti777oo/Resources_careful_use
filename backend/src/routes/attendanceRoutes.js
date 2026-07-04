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

const router = express.Router();

router.use(protect);

router.post('/checkin', checkIn);
router.post('/checkout', checkOut);
router.get('/me', getMyAttendance);
router.get('/', authorize('Admin', 'HR'), getAllAttendance);
router.get('/employee/:id', authorize('Admin', 'HR'), getEmployeeAttendance);
router.post('/mark', authorize('Admin', 'HR'), markAttendance);
router.put('/:id', authorize('Admin', 'HR'), updateAttendance);
router.delete('/:id', authorize('Admin', 'HR'), deleteAttendance);

export default router;
