import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Department from '../models/Department.js';
import Complaint from '../models/Complaint.js';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// Department Login
export const deptLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const dept = await Department.findOne({ username, isActive: true });
    if (!dept) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, dept.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    dept.lastLogin = new Date();
    await dept.save();

    const token = generateToken(dept._id);
    
    res.cookie("dept_token", token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(200).json({ 
      message: "Department login successful",
      department: {
        id: dept._id,
        name: dept.name,
        username: dept.username,
        email: dept.email,
        permissions: dept.permissions,
        lastLogin: dept.lastLogin
      }
    });
  } catch (error) {
    console.error("Department login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create Multiple Departments with Default Password
export const createDepartments = async (req, res) => {
  try {
    const departments = [
      { name: "Electricity", username: "electricity_admin", email: "electricity@gov.in" },
      { name: "Water", username: "water_admin", email: "water@gov.in" },
      { name: "Roads", username: "roads_admin", email: "roads@gov.in" },
      { name: "Sanitation", username: "sanitation_admin", email: "sanitation@gov.in" },
      { name: "Parks", username: "parks_admin", email: "parks@gov.in" },
      { name: "Health", username: "health_admin", email: "health@gov.in" },
      { name: "Education", username: "education_admin", email: "education@gov.in" },
      { name: "Transportation", username: "transport_admin", email: "transport@gov.in" },
      { name: "Building", username: "building_admin", email: "building@gov.in" },
      { name: "Environment", username: "environment_admin", email: "environment@gov.in" },
      { name: "Other", username: "other_admin", email: "other@gov.in" }
    ];

    const defaultPassword = "admin123";
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    const createdDepartments = [];

    for (const dept of departments) {
      // Check if department already exists
      const existing = await Department.findOne({ username: dept.username });
      if (!existing) {
        const newDepartment = new Department({
          name: dept.name,
          username: dept.username,
          email: dept.email,
          passwordHash,
          permissions: ['view_complaints', 'update_status', 'send_feedback', 'generate_reports']
        });

        await newDepartment.save();
        createdDepartments.push({
          name: dept.name,
          username: dept.username,
          email: dept.email
        });
      }
    }

    const result = { 
      message: "Departments created successfully",
      created: createdDepartments,
      defaultPassword: defaultPassword
    };

    // If called from API route
    if (res) {
      res.status(201).json(result);
    } else {
      // If called from server startup
      console.log("✅ Departments setup complete:", result);
      return result;
    }
  } catch (error) {
    console.error("Error creating departments:", error);
    if (res) {
      res.status(500).json({ message: "Internal server error" });
    } else {
      throw error;
    }
  }
};

// Separate function for server startup
export const initializeDepartments = async () => {
  return await createDepartments();
};

// Get All Complaints for Department
export const getComplaintsForDept = async (req, res) => {
  try {
    const dept = await Department.findById(req.department.id);
    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    const { status, priority, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    let query = { department: dept.name };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const complaints = await Complaint.find(query)
      .populate('userId', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(query);

    const summary = await Complaint.aggregate([
      { $match: { department: dept.name } },
      { 
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      complaints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      summary
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Single Complaint Details
export const getComplaintById = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const dept = await Department.findById(req.department.id);

    const complaint = await Complaint.findOne({
      _id: complaintId,
      department: dept.name
    }).populate('userId', 'name email phone');

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json(complaint);
  } catch (error) {
    console.error("Error fetching complaint:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Complaint Status
export const updateComplaintStatus = async (req, res) => {
  try {
    const { complaintNumber } = req.params;
    const { status, responseFromDept, priority, expectedResolutionDate } = req.body;
    
    console.log('Update request received:', { complaintNumber, status, responseFromDept });
    
    const dept = await Department.findById(req.department.id);
    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    const complaint = await Complaint.findOne({ 
      complaintNumber,
      department: dept.name 
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Initialize arrays if they don't exist
    if (!complaint.feedback) {
      complaint.feedback = [];
    }
    if (!complaint.chatMessages) {
      complaint.chatMessages = [];
    }

    // Update fields
    if (status && status !== complaint.status) {
      const oldStatus = complaint.status;
      complaint.status = status;
      
      if (status === 'resolved' || status === 'closed') {
        complaint.actualResolutionDate = new Date();
      }

      // Add status change to chat messages
      complaint.chatMessages.push({
        message: `Status updated from "${oldStatus}" to "${status}"${responseFromDept ? ': ' + responseFromDept : ''}`,
        senderType: 'department',
        senderId: dept.name,
        senderName: `${dept.name} Department`,
        messageType: 'message'
      });
    }
    
    if (responseFromDept) {
      complaint.responseFromDept = responseFromDept;
      
      // Add to feedback
      complaint.feedback.push({
        message: responseFromDept,
        author: dept.name,
        type: 'department',
        timestamp: new Date()
      });

      // Also add to chat messages if no status change
      if (!status || status === complaint.status) {
        complaint.chatMessages.push({
          message: responseFromDept,
          senderType: 'department',
          senderId: dept.name,
          senderName: `${dept.name} Department`,
          messageType: 'message'
        });
      }
    }
    
    if (priority) complaint.priority = priority;
    if (expectedResolutionDate) complaint.expectedResolutionDate = new Date(expectedResolutionDate);

    await complaint.save();

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io && responseFromDept) {
      io.to(`complaint-${complaintNumber}`).emit('new-message', {
        id: Date.now(),
        complaintNumber,
        message: responseFromDept,
        senderType: 'department',
        senderId: dept.name,
        senderName: `${dept.name} Department`,
        timestamp: new Date(),
        type: 'message'
      });
    }

    console.log('Complaint updated successfully:', complaint.status);

    res.status(200).json({ 
      message: "Complaint updated successfully",
      complaint: {
        _id: complaint._id,
        complaintNumber: complaint.complaintNumber,
        status: complaint.status,
        responseFromDept: complaint.responseFromDept,
        priority: complaint.priority,
        expectedResolutionDate: complaint.expectedResolutionDate,
        actualResolutionDate: complaint.actualResolutionDate
      }
    });
  } catch (error) {
    console.error("Error updating complaint:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add Feedback to Complaint
export const addFeedback = async (req, res) => {
  try {
    const { complaintNumber } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: "Feedback message is required" });
    }

    const dept = await Department.findById(req.department.id);
    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    const complaint = await Complaint.findOne({ 
      complaintNumber,
      department: dept.name 
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.feedback.push({
      message,
      author: dept.name,
      type: 'department'
    });

    await complaint.save();

    res.status(200).json({ 
      message: "Feedback added successfully",
      feedback: complaint.feedback
    });
  } catch (error) {
    console.error("Error adding feedback:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Department Dashboard Statistics
export const getDepartmentStats = async (req, res) => {
  try {
    const dept = await Department.findById(req.department.id);
    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    const totalComplaints = await Complaint.countDocuments({ department: dept.name });
    
    const statusStats = await Complaint.aggregate([
      { $match: { department: dept.name } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const priorityStats = await Complaint.aggregate([
      { $match: { department: dept.name } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const monthlyStats = await Complaint.aggregate([
      { $match: { department: dept.name } },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const recentComplaints = await Complaint.find({ department: dept.name })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const avgResolutionTime = await Complaint.aggregate([
      { 
        $match: { 
          department: dept.name,
          status: { $in: ['resolved', 'closed'] },
          actualResolutionDate: { $exists: true }
        }
      },
      {
        $project: {
          resolutionTime: {
            $divide: [
              { $subtract: ['$actualResolutionDate', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgResolutionDays: { $avg: '$resolutionTime' }
        }
      }
    ]);

    res.status(200).json({
      department: dept.name,
      totalComplaints,
      statusStats,
      priorityStats,
      monthlyStats,
      recentComplaints,
      avgResolutionDays: avgResolutionTime.length > 0 ? avgResolutionTime[0].avgResolutionDays : 0
    });
  } catch (error) {
    console.error("Error fetching department stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Bulk Update Complaints
export const bulkUpdateComplaints = async (req, res) => {
  try {
    const { complaintIds, status, priority, responseFromDept } = req.body;
    
    if (!complaintIds || !Array.isArray(complaintIds) || complaintIds.length === 0) {
      return res.status(400).json({ message: "Valid complaint IDs array is required" });
    }

    const dept = await Department.findById(req.department.id);
    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (priority) updateFields.priority = priority;
    if (responseFromDept) updateFields.responseFromDept = responseFromDept;

    const result = await Complaint.updateMany(
      {
        _id: { $in: complaintIds },
        department: dept.name
      },
      { $set: updateFields }
    );

    res.status(200).json({
      message: `${result.modifiedCount} complaints updated successfully`,
      updated: result.modifiedCount
    });
  } catch (error) {
    console.error("Error bulk updating complaints:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Department Profile
export const getDepartmentProfile = async (req, res) => {
  try {
    const dept = await Department.findById(req.department.id).select('-passwordHash');
    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.status(200).json(dept);
  } catch (error) {
    console.error("Error fetching department profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Department Profile
export const updateDepartmentProfile = async (req, res) => {
  try {
    const { email, phone } = req.body;
    
    const dept = await Department.findById(req.department.id);
    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    if (email) dept.email = email;
    if (phone) dept.phone = phone;

    await dept.save();

    res.status(200).json({
      message: "Profile updated successfully",
      department: {
        id: dept._id,
        name: dept.name,
        username: dept.username,
        email: dept.email,
        phone: dept.phone
      }
    });
  } catch (error) {
    console.error("Error updating department profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Change Department Password
export const changeDepartmentPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const dept = await Department.findById(req.department.id);
    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, dept.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    dept.passwordHash = await bcrypt.hash(newPassword, salt);

    await dept.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Request to close complaint (requires user consent)
export const requestCloseComplaint = async (req, res) => {
  try {
    const { complaintNumber } = req.params;
    const { reason } = req.body;
    
    const dept = await Department.findById(req.department.id);
    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    const complaint = await Complaint.findOne({ 
      complaintNumber,
      department: dept.name 
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Initialize chatMessages array if it doesn't exist
    if (!complaint.chatMessages) {
      complaint.chatMessages = [];
    }

    // Update close request in complaint
    complaint.closeRequest = {
      requested: true,
      requestedBy: dept.name,
      requestedAt: new Date(),
      reason: reason || 'Complaint resolved, requesting closure',
      userResponse: 'pending'
    };

    // Add to chat messages
    complaint.chatMessages.push({
      message: `Department has requested to close this complaint. Reason: ${reason || 'Complaint resolved'}`,
      senderType: 'department',
      senderId: dept.name,
      senderName: `${dept.name} Department`,
      messageType: 'close_request'
    });

    await complaint.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`complaint-${complaintNumber}`).emit('close-request', {
        id: Date.now(),
        complaintNumber,
        type: 'close_request',
        reason: reason || 'Complaint resolved, requesting closure',
        departmentName: dept.name,
        timestamp: new Date(),
        status: 'pending'
      });
    }

    res.status(200).json({ 
      message: "Close request sent to user",
      closeRequest: complaint.closeRequest
    });
  } catch (error) {
    console.error("Error requesting complaint closure:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Handle user response to close request
export const handleCloseResponse = async (req, res) => {
  try {
    const { complaintNumber } = req.params;
    const { accepted, responseMessage } = req.body;
    
    const complaint = await Complaint.findOne({ complaintNumber });
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (!complaint.closeRequest || !complaint.closeRequest.requested) {
      return res.status(400).json({ message: "No close request found for this complaint" });
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
        `User has accepted the closure request. ${responseMessage || ''}` : 
        `User has rejected the closure request. ${responseMessage || ''}`,
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
      message: accepted ? "Complaint closed successfully" : "Close request rejected",
      complaint: {
        status: complaint.status,
        closeRequest: complaint.closeRequest
      }
    });
  } catch (error) {
    console.error("Error handling close response:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get chat messages for a complaint
export const getChatMessages = async (req, res) => {
  try {
    const { complaintNumber } = req.params;
    
    const dept = await Department.findById(req.department.id);
    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    const complaint = await Complaint.findOne({ 
      complaintNumber,
      department: dept.name 
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
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Save chat message to database
export const saveChatMessage = async (req, res) => {
  try {
    const { complaintNumber } = req.params;
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const dept = await Department.findById(req.department.id);
    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    const complaint = await Complaint.findOne({ 
      complaintNumber,
      department: dept.name 
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
      senderType: 'department',
      senderId: dept.name,
      senderName: `${dept.name} Department`,
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
    console.error("Error saving chat message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Department Logout
export const deptLogout = async (req, res) => {
  try {
    res.clearCookie('dept_token');
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
