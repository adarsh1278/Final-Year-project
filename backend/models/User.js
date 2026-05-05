import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: String,
  passwordHash: { type: String, required: true },
  languagePreference: { type: String, default: 'en' },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  dob: String,
  occupation: String,
  address: String,
  district: String,
  state: { type: String, default: '' },
  pincode: String,
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true }
  },
  emailVerifyToken: String,
  emailVerifyExpires: Date,
  phoneVerifyToken: String,
  phoneVerifyExpires: Date,
  idType: { type: String, enum: ['Aadhaar', 'PAN', 'Voter ID', 'Driving License', ''], default: '' },
  idNumber: String,
  lastLogin: Date,
  resetToken: String,
  resetTokenExpires: Date,
}, { timestamps: true });

export default mongoose.model("User", userSchema);
