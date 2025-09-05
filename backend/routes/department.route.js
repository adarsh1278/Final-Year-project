import express from 'express';
import { 
  deptLogin,
  deptLogout,
  createDepartments,
  getComplaintsForDept,
  getComplaintById,
  updateComplaintStatus,
  addFeedback,
  getDepartmentStats,
  bulkUpdateComplaints,
  getDepartmentProfile,
  updateDepartmentProfile,
  changeDepartmentPassword,
  requestCloseComplaint,
  handleCloseResponse,
  getChatMessages,
  saveChatMessage
} from '../controllers/departmentController.js';
import { departmentAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Authentication routes
router.post("/login", deptLogin);
router.post("/logout", departmentAuth, deptLogout);

// Setup route (for initial department creation)
router.post("/setup", createDepartments);

// Complaint management routes
router.get("/complaints", departmentAuth, getComplaintsForDept);
router.get("/complaints/:complaintId", departmentAuth, getComplaintById);
router.put("/complaints/:complaintNumber/status", departmentAuth, updateComplaintStatus);
router.post("/complaints/:complaintNumber/feedback", departmentAuth, addFeedback);
router.put("/complaints/bulk-update", departmentAuth, bulkUpdateComplaints);

// Chat and close request routes
router.get("/complaints/:complaintNumber/chat", departmentAuth, getChatMessages);
router.post("/complaints/:complaintNumber/chat", departmentAuth, saveChatMessage);
router.post("/complaints/:complaintNumber/request-close", departmentAuth, requestCloseComplaint);
router.post("/complaints/:complaintNumber/close-response", departmentAuth, handleCloseResponse);

// Dashboard and statistics
router.get("/dashboard/stats", departmentAuth, getDepartmentStats);

// Profile management
router.get("/profile", departmentAuth, getDepartmentProfile);
router.put("/profile", departmentAuth, updateDepartmentProfile);
router.put("/profile/password", departmentAuth, changeDepartmentPassword);

export default router;
