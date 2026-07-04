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
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

router.use(protect);

router.get('/', asyncHandler(getEmployees));
router.get('/:id', asyncHandler(getEmployeeById));
router.post('/', authorize('Admin', 'HR'), asyncHandler(createEmployee));
router.put('/:id', authorize('Admin', 'HR'), asyncHandler(updateEmployee));
router.delete('/:id', authorize('Admin', 'HR'), asyncHandler(deleteEmployee));

export default router;
