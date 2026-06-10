import { Router } from "express";
import {
  getSalaries,
  getSalary,
  createSalary,
  updateSalary,
  deleteSalary,
  getPayrollReport,
} from "../controllers/salary.js";
import protect from "../middleware/auth.js";

const router = Router();

// All salary routes require authentication
router.use(protect);

router.get("/report", getPayrollReport);

router.route("/").get(getSalaries).post(createSalary);

router.route("/:id").get(getSalary).put(updateSalary).delete(deleteSalary);

export default router;
