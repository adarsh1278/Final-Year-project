import express from 'express';
import { registerComplaint, getUserComplaints, trackComplaint, getUserChatMessages, respondToCloseRequest, saveUserChatMessage } from '../controllers/complaint.js';
import { userAuth } from '../middlewares/authMiddleware.js'
import Complaint from '../models/Complaint.js';

const router = express.Router();
router.post("/register", userAuth, registerComplaint);
router.get("/history", userAuth, getUserComplaints);
router.get("/track/:complaintNumber", trackComplaint);

// Get complaint by complaint number
router.get('/number/:complaintNumber', async (req, res) => {
  try {
    const { complaintNumber } = req.params;
    const complaint = await Complaint.findOne({ complaintNumber });
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    res.json(complaint);
  } catch (error) {
    console.error('Error fetching complaint by number:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Chat routes
router.get("/:complaintNumber/chat", userAuth, getUserChatMessages);
router.post("/:complaintNumber/chat", userAuth, saveUserChatMessage);
router.post("/:complaintNumber/close-response", userAuth, respondToCloseRequest);

export default router;
