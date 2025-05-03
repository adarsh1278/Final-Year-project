import express from 'express';
import { registerComplaint, getUserComplaints, trackComplaint } from '../controllers/complaint.js';
import { userAuth } from '../middlewares/authMiddleware.js'

const router = express.Router();
router.post("/register", userAuth, registerComplaint);
router.get("/history", userAuth, getUserComplaints);
router.get("/track/:complaintNumber", trackComplaint);

export default router;
