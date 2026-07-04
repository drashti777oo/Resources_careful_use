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

const router = express.Router();

router.use(protect);

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', authorize('Admin', 'HR'), createDepartment);
router.put('/:id', authorize('Admin', 'HR'), updateDepartment);
router.delete('/:id', authorize('Admin', 'HR'), deleteDepartment);

export default router;
