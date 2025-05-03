import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Department from '../models/Department.js';
import Complaint from '../models/Complaint.js';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

export const deptLogin = async (req, res) => {
  const { username, password } = req.body;
  
  const dept = await Department.findOne({ username });
  if (!dept || !(await bcrypt.compare(password, dept.passwordHash)))
    return res.status(401).json({ message: "Invalid department login" });

  const token = generateToken(dept._id);
  res.cookie("dept_token", token, { httpOnly: true });
  res.status(200).json({ message: "Department login successful" });
};
export const createDepartment = async (req, res) => {
  try {
    const { name, username, password } = {  name:"Electricity", username: "electric",  password:"12345678"};

    // if (!name || !username || !password) {
    //   return res.status(400).json({ message: "All fields are required." });
    // }

    // Check if username already exists
    const existing = await Department.findOne({ username });
    if (existing) {
      // return res.status(400).json({ message: "Username already taken." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newDepartment = new Department({
      name,
      username,
      passwordHash,
    });

    await newDepartment.save();
    console.log("new dpatment created")
    return;

    res.status(201).json({ message: "Department created successfully." });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
export const getComplaintsForDept = async (req, res) => {
  const dept = await Department.findById(req.department.id);
  const complaints = await Complaint.find({ department: dept.name });
  res.status(200).json(complaints);
};

export const updateComplaintStatus = async (req, res) => {
  const { status, responseFromDept } = req.body;
  const complaint = await Complaint.findOne({ complaintNumber: req.params.complaintNumber });
  if (!complaint) return res.status(404).json({ message: "Not found" });

  complaint.status = status || complaint.status;
  complaint.responseFromDept = responseFromDept || complaint.responseFromDept;
  await complaint.save();
  res.status(200).json({ message: "Complaint updated" });
};
