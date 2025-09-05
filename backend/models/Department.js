import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { 
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
  username: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  role: { type: String, default: 'department_admin' },
  permissions: [{
    type: String,
    enum: ['view_complaints', 'update_status', 'send_feedback', 'generate_reports']
  }]
}, { timestamps: true });

export default mongoose.model("Department", departmentSchema);
