import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoute.js';
import complaintRoutes from './routes/complain.route.js';
import departmentRoutes from './routes/department.route.js';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/departments", departmentRoutes);

app.get("/", (req, res) => res.send("Grievance Portal API Running"));

export default app;
