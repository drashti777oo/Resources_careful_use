import express from 'express';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.post('/', authorize('Admin', 'HR'), createEmployee);
router.put('/:id', authorize('Admin', 'HR'), updateEmployee);
router.delete('/:id', authorize('Admin', 'HR'), deleteEmployee);

export default router;
