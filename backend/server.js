import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoute.js';
import complaintRoutes from './routes/complain.route.js';
import departmentRoutes from './routes/department.route.js';
import { createDepartment } from './controllers/departmentController.js';

dotenv.config();

const app = express();

// ✅ Enable CORS with credentials and origin
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/departments", departmentRoutes);

// ✅ Health check route
app.get("/", (req, res) => res.send("Grievance Portal API Running"));

// ✅ DB + server startup
await connectDB();
// await createDepartment()
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
