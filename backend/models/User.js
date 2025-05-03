import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  passwordHash: String,
  languagePreference: String,
}, { timestamps: true });

export default mongoose.model("User", userSchema);
