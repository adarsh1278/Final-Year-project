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
