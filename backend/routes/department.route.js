import express from 'express';
import { deptLogin, getComplaintsForDept, updateComplaintStatus } from '../controllers/departmentController.js';
import { departmentAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post("/login", deptLogin);
router.get("/complaints", departmentAuth, getComplaintsForDept);
router.put("/complaints/:complaintNumber", departmentAuth, updateComplaintStatus);

export default router;
