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

const router = express.Router();

router.use(protect);

router.post('/', authorize('Admin', 'HR'), generatePayroll);
router.get('/me', getMyPayroll);
router.get('/', authorize('Admin', 'HR'), getAllPayroll);
router.get('/:id', getPayrollById);
router.put('/:id', authorize('Admin', 'HR'), updatePayroll);
router.put('/:id/pay', authorize('Admin', 'HR'), markPayrollPaid);
router.delete('/:id', authorize('Admin', 'HR'), deletePayroll);

export default router;
