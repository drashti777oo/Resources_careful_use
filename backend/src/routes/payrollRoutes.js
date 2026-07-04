import express from 'express';
import {
  generatePayroll,
  getMyPayroll,
  getAllPayroll,
  getPayrollById,
  updatePayroll,
  markPayrollPaid,
  deletePayroll,
} from '../controllers/payrollController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('Admin', 'HR'), asyncHandler(generatePayroll));
router.get('/me', asyncHandler(getMyPayroll));
router.get('/', authorize('Admin', 'HR'), asyncHandler(getAllPayroll));
router.get('/:id', asyncHandler(getPayrollById));
router.put('/:id', authorize('Admin', 'HR'), asyncHandler(updatePayroll));
router.put('/:id/pay', authorize('Admin', 'HR'), asyncHandler(markPayrollPaid));
router.delete('/:id', authorize('Admin', 'HR'), asyncHandler(deletePayroll));

export default router;
