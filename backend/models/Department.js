import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { type: String, enum: ["Electricity", "Water"], required: true },
  username: { type: String, unique: true },
  passwordHash: String
}, { timestamps: true });

export default mongoose.model("Department", departmentSchema);
