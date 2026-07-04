import express from 'express';
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();

router.use(protect);

router.get('/', asyncHandler(getDepartments));
router.get('/:id', asyncHandler(getDepartmentById));
router.post('/', authorize('Admin', 'HR'), asyncHandler(createDepartment));
router.put('/:id', authorize('Admin', 'HR'), asyncHandler(updateDepartment));
router.delete('/:id', authorize('Admin', 'HR'), asyncHandler(deleteDepartment));

export default router;
