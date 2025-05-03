import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  complaintNumber: { type: String, unique: true },
  department: { type: String, enum: ["Electricity", "Water"], required: true },
  title: String,
  description: String,
  status: { type: String, default: "open" },
  additionalDetails: Object,
  responseFromDept: String,
}, { timestamps: true });

export default mongoose.model("Complaint", complaintSchema);
