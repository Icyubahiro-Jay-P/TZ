import { Router } from 'express';
import {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/department.js';
import protect from '../middleware/auth.js';

const router = Router();

// All department routes require authentication
router.use(protect);

router.route('/')
  .get(getDepartments)
  .post(createDepartment);

router.route('/:code')
  .get(getDepartment)
  .put(updateDepartment)
  .delete(deleteDepartment);

export default router;
