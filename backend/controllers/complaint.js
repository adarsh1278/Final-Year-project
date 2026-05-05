

import Complaint from '../models/Complaint.js';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendComplaintNotifications } from '../utils/notifications.js';

// import nodemailer from 'nodemailer';

export const registerComplaint = async (req, res) => {
  try {
    const { department, title, description, additionalDetails } = req.body;
    const complaintNumber = `${department.slice(0,3).toUpperCase()}-${Date.now()}-${crypto.randomInt(1000,9999)}`;
    const user = await User.findById(req.user.id).select('name email phone');
    
    const complaint = await Complaint.create({
      userId: req.user.id,
      complaintNumber,
      department,
      title,
      description,
      additionalDetails,
      trackingHistory: [{
        status: 'open',
        message: 'Complaint registered successfully',
        updatedBy: 'system',
        updatedByType: 'system',
        department: department,
        timestamp: new Date()
      }]
    });

    // Email sending commented out - not needed for now
    // const user = await User.findById(req.user.id);
    // const transporter = nodemailer.createTransport({ ... });
    // transporter.sendMail(mailOptions);

    // Send notifications in the background; failure must not block complaint creation
    sendComplaintNotifications({
      email: user?.email,
      phone: user?.phone,
      complaintNumber,
      title,
      department,
      statusLabel: 'Complaint Registered',
      message: `Your complaint has been registered successfully.`,
    }).catch((error) => {
      console.error('Complaint registration notification error:', error.message);
    });

    res.status(201).json({ message: "Complaint registered", complaintNumber });
  } catch (error) {
    console.error('Error registering complaint:', error);
    res.status(500).json({ message: "Error registering complaint" });
  }
};

export const getUserComplaints = async (req, res) => {
  const complaints = await Complaint.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json(complaints);
};

export const trackComplaint = async (req, res) => {
  const complaint = await Complaint.findOne({ complaintNumber: req.params.complaintNumber });
  if (!complaint) return res.status(404).json({ message: "Not found" });
  res.status(200).json(complaint);
};

// Get chat messages for user's complaint
export const getUserChatMessages = async (req, res) => {
  try {
    const { complaintNumber } = req.params;
    
    const complaint = await Complaint.findOne({ 
      complaintNumber,
      userId: req.user.id 
    }).select('chatMessages closeRequest');

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Initialize arrays if they don't exist
    const chatMessages = complaint.chatMessages || [];
    const closeRequest = complaint.closeRequest || null;

    res.status(200).json({
      messages: chatMessages,
      closeRequest: closeRequest
    });
  } catch (error) {
    console.error("Error fetching user chat messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Save user chat message to database
export const saveUserChatMessage = async (req, res) => {
  try {
    const { complaintNumber } = req.params;
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const complaint = await Complaint.findOne({ 
      complaintNumber,
      userId: req.user.id 
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Initialize chatMessages array if it doesn't exist
    if (!complaint.chatMessages) {
      complaint.chatMessages = [];
    }

    // Add message to database
    const chatMessage = {
      message: message.trim(),
      senderType: 'user',
      senderId: req.user.id,
      senderName: 'User',
      timestamp: new Date(),
      messageType: 'message'
    };

    complaint.chatMessages.push(chatMessage);
    await complaint.save();

    res.status(200).json({ 
      message: "Message saved successfully",
      chatMessage
    });
  } catch (error) {
    console.error("Error saving user chat message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// User response to department close request
export const respondToCloseRequest = async (req, res) => {
  try {
    const { complaintNumber } = req.params;
    const { accepted, responseMessage } = req.body;
    
    const complaint = await Complaint.findOne({ 
      complaintNumber,
      userId: req.user.id 
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (!complaint.closeRequest || !complaint.closeRequest.requested) {
      return res.status(400).json({ message: "No close request found for this complaint" });
    }

    if (complaint.closeRequest.userResponse !== 'pending') {
      return res.status(400).json({ message: "Close request already responded to" });
    }

    // Initialize chatMessages array if it doesn't exist
    if (!complaint.chatMessages) {
      complaint.chatMessages = [];
    }

    // Update close request response
    complaint.closeRequest.userResponse = accepted ? 'accepted' : 'rejected';
    complaint.closeRequest.userResponseAt = new Date();
    complaint.closeRequest.userResponseMessage = responseMessage;

    // Add to chat messages
    complaint.chatMessages.push({
      message: accepted ? 
        `I accept the closure request. ${responseMessage || ''}` : 
        `I do not accept the closure request. ${responseMessage || ''}`,
      senderType: 'user',
      senderId: complaint.userId.toString(),
      senderName: 'User',
      messageType: 'close_response'
    });

    // If accepted, close the complaint
    if (accepted) {
      complaint.status = 'closed';
      complaint.actualResolutionDate = new Date();
    }

    await complaint.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`complaint-${complaintNumber}`).emit('close-response', {
        id: Date.now(),
        complaintNumber,
        type: 'close_response',
        accepted,
        response: responseMessage,
        timestamp: new Date()
      });

      if (accepted) {
        io.to(`complaint-${complaintNumber}`).emit('complaint-closed', {
          complaintNumber,
          message: 'Complaint has been closed with user consent',
          timestamp: new Date()
        });
      }
    }

    res.status(200).json({ 
      message: accepted ? "Complaint closure accepted" : "Complaint closure rejected",
      complaint: {
        status: complaint.status,
        closeRequest: complaint.closeRequest
      }
    });
  } catch (error) {
    console.error("Error responding to close request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Submit user feedback after complaint is resolved/closed
export const submitUserFeedback = async (req, res) => {
  try {
    const { complaintNumber } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const complaint = await Complaint.findOne({
      complaintNumber,
      userId: req.user.id
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (!['resolved', 'closed'].includes(complaint.status)) {
      return res.status(400).json({ message: "Feedback can only be submitted for resolved or closed complaints" });
    }

    if (complaint.userFeedback && complaint.userFeedback.rating) {
      return res.status(400).json({ message: "Feedback already submitted for this complaint" });
    }

    complaint.userFeedback = {
      rating,
      comment: comment || '',
      submittedAt: new Date()
    };

    // Add to tracking history
    if (!complaint.trackingHistory) complaint.trackingHistory = [];
    complaint.trackingHistory.push({
      status: complaint.status,
      message: `User submitted feedback with rating ${rating}/5`,
      updatedBy: 'user',
      updatedByType: 'user',
      department: complaint.department,
      timestamp: new Date()
    });

    await complaint.save();

    res.status(200).json({
      message: "Feedback submitted successfully",
      userFeedback: complaint.userFeedback
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user complaint statistics
export const getUserComplaintStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const total = await Complaint.countDocuments({ userId });
    const resolved = await Complaint.countDocuments({ userId, status: { $in: ['resolved', 'closed'] } });
    const inProgress = await Complaint.countDocuments({ userId, status: 'in_progress' });
    const pending = await Complaint.countDocuments({ userId, status: 'open' });
    const rejected = await Complaint.countDocuments({ userId, status: 'rejected' });

    res.status(200).json({
      status: 'success',
      data: {
        total,
        resolved,
        inProgress,
        pending,
        rejected
      }
    });
  } catch (error) {
    console.error("Error fetching user complaint stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
