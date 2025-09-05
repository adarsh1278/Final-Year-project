

import Complaint from '../models/Complaint.js';
import crypto from 'crypto';
import User from '../models/User.js';
3

import nodemailer from 'nodemailer';

export const registerComplaint = async (req, res) => {
  const { department, title, description, additionalDetails } = req.body;
  const complaintNumber = `${department.slice(0,3).toUpperCase()}-${Date.now()}-${crypto.randomInt(1000,9999)}`;
  const user = await User.findById(req.user.id);
  
  const complaint = await Complaint.create({
    userId: req.user.id,
    complaintNumber,
    department,
    title,
    description,
    additionalDetails
  });
  
  // Setup nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or any other email service
    auth: {
      user: process.env.EMAIL_USER, // replace with your email
      pass: process.env.EMAIL_PASS, // replace with your email password or app password
    },
  });

  // Format additional details as key-value pairs
  const additionalDetailsHTML = Object.entries(additionalDetails || {}).map(([key, value]) => {
    return `<p><span class="key">${key}:</span> <span class="value">${value}</span></p>`;
  }).join('');

  // Email HTML Template with CSS
  const emailHTML = `
    <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 600px;
            margin: 50px auto;
            padding: 30px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          h1 {
            font-size: 24px;
            color: #333;
            text-align: center;
            margin-bottom: 20px;
          }
          p {
            font-size: 16px;
            line-height: 1.6;
            color: #555;
          }
          .complaint-detail {
            margin-top: 20px;
            background-color: #f4f4f9;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #ddd;
          }
          .complaint-detail p {
            margin: 8px 0;
          }
          .complaint-detail .title {
            font-weight: bold;
            color: #2e6da4;
          }
          .complaint-detail .key {
            font-weight: bold;
            color: #5a5a5a;
          }
          .complaint-detail .value {
            color: #007bff;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #888;
          }
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Complaint Registered Successfully</h1>
          <p>Dear ${user.name},</p>
          <p>Thank you for registering your complaint with us. Below are the details of your complaint:</p>
          <div class="complaint-detail">
            <p><span class="title">Complaint Number:</span> ${complaintNumber}</p>
            <p><span class="title">Department:</span> ${department}</p>
            <p><span class="title">Title:</span> ${title}</p>
            <p><span class="title">Description:</span> ${description}</p>
            ${additionalDetailsHTML}
          </div>
          <div class="footer">
            <p>If you have any further questions, feel free to contact us.</p>
            <p>Thank you for your patience!</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Sending email
  const mailOptions = {
    from: process.env.EMAIL_USER, // sender address
    to: user.email, // recipient address
    subject: 'Complaint Registered - ' + complaintNumber,
    html: emailHTML,
  };

  try {
     transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    res.status(201).json({ message: "Complaint registered", complaintNumber });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: "Error registering complaint and sending email" });
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
