import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);

    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is missing from backend/.env');
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
    return true;
  } catch (err) {
    console.error("DB connection failed:", err.message);
    return false;
  }
};

export default connectDB;
