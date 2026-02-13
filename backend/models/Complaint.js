import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  complaintNumber: { type: String, unique: true },
  department: { 
    type: String, 
    enum: [
      "Electricity", 
      "Water", 
      "Roads", 
      "Sanitation", 
      "Parks", 
      "Health", 
      "Education", 
      "Transportation", 
      "Building", 
      "Environment",
      "Other"
    ], 
    required: true 
  },
  title: String,
  description: String,
  status: { 
    type: String, 
    enum: ["open", "in_progress", "resolved", "closed", "rejected"],
    default: "open" 
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium"
  },
  additionalDetails: Object,
  responseFromDept: String,
  feedback: [{
    message: String,
    timestamp: { type: Date, default: Date.now },
    author: String,
    type: { type: String, enum: ["department", "user"], default: "department" }
  }],

  // Tracking history - every status change and action
  trackingHistory: {
    type: [{
      status: String,
      message: String,
      updatedBy: String, // 'system', department name, or 'user'
      updatedByType: { type: String, enum: ['system', 'department', 'user'], default: 'system' },
      department: String, // which department made the update
      timestamp: { type: Date, default: Date.now }
    }],
    default: []
  },

  // User feedback/rating after complaint resolution
  userFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    submittedAt: Date
  },

  // Chat messages for real-time communication
  chatMessages: {
    type: [{
      message: String,
      senderType: { type: String, enum: ['user', 'department'], required: true },
      senderId: String,
      senderName: String,
      timestamp: { type: Date, default: Date.now },
      messageType: { type: String, enum: ['message', 'close_request', 'close_response'], default: 'message' }
    }],
    default: []
  },

  // Close request tracking
  closeRequest: {
    requested: { type: Boolean, default: false },
    requestedBy: String, // department name
    requestedAt: Date,
    reason: String,
    userResponse: { type: String, enum: ['pending', 'accepted', 'rejected'] },
    userResponseAt: Date,
    userResponseMessage: String
  },

  // Transfer / reassign history
  transferHistory: {
    type: [{
      fromDepartment: String,
      toDepartment: String,
      reason: String,
      transferredBy: String,
      status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'accepted' },
      respondedAt: Date,
      rejectionReason: String,
      timestamp: { type: Date, default: Date.now }
    }],
    default: []
  },

  // Pending transfer request
  pendingTransfer: {
    isPending: { type: Boolean, default: false },
    fromDepartment: String,
    toDepartment: String,
    reason: String,
    requestedBy: String,
    requestedAt: Date
  },

  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  expectedResolutionDate: Date,
  actualResolutionDate: Date,
  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  attachments: [String],
  tags: [String]
}, { timestamps: true });

export default mongoose.model("Complaint", complaintSchema);
