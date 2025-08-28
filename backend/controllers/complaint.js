

import Complaint from '../models/Complaint.js';
import crypto from 'crypto';
import User from '../models/User.js';
3

import nodemailer from 'nodemailer';

export const registerComplaint = async (req, res) => {
  const { department, title, description, additionalDetails } = req.body;
  const complaintNumber = `${department.slice(0,3).toUpperCase()}-${Date.now()}-${crypto.randomInt(1000,9999)}`;
  const user = await User.findById(req.user.id);
  
  const complaint = await Complaint.create({
    userId: req.user.id,
    complaintNumber,
    department,
    title,
    description,
    additionalDetails
  });
  
  // Setup nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or any other email service
    auth: {
      user: process.env.EMAIL_USER, // replace with your email
      pass: process.env.EMAIL_PASS, // replace with your email password or app password
    },
  });

  // Format additional details as key-value pairs
  const additionalDetailsHTML = Object.entries(additionalDetails || {}).map(([key, value]) => {
    return `<p><span class="key">${key}:</span> <span class="value">${value}</span></p>`;
  }).join('');

  // Email HTML Template with CSS
  const emailHTML = `
    <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 600px;
            margin: 50px auto;
            padding: 30px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          h1 {
            font-size: 24px;
            color: #333;
            text-align: center;
            margin-bottom: 20px;
          }
          p {
            font-size: 16px;
            line-height: 1.6;
            color: #555;
          }
          .complaint-detail {
            margin-top: 20px;
            background-color: #f4f4f9;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #ddd;
          }
          .complaint-detail p {
            margin: 8px 0;
          }
          .complaint-detail .title {
            font-weight: bold;
            color: #2e6da4;
          }
          .complaint-detail .key {
            font-weight: bold;
            color: #5a5a5a;
          }
          .complaint-detail .value {
            color: #007bff;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #888;
          }
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Complaint Registered Successfully</h1>
          <p>Dear ${user.name},</p>
          <p>Thank you for registering your complaint with us. Below are the details of your complaint:</p>
          <div class="complaint-detail">
            <p><span class="title">Complaint Number:</span> ${complaintNumber}</p>
            <p><span class="title">Department:</span> ${department}</p>
            <p><span class="title">Title:</span> ${title}</p>
            <p><span class="title">Description:</span> ${description}</p>
            ${additionalDetailsHTML}
          </div>
          <div class="footer">
            <p>If you have any further questions, feel free to contact us.</p>
            <p>Thank you for your patience!</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Sending email
  const mailOptions = {
    from: process.env.EMAIL_USER, // sender address
    to: user.email, // recipient address
    subject: 'Complaint Registered - ' + complaintNumber,
    html: emailHTML,
  };

  try {
     transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    res.status(201).json({ message: "Complaint registered", complaintNumber });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: "Error registering complaint and sending email" });
  }
};

export const getUserComplaints = async (req, res) => {
  const complaints = await Complaint.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json(complaints);
};

export const trackComplaint = async (req, res) => {
  const complaint = await Complaint.findOne({ complaintNumber: req.params.complaintNumber });
  if (!complaint) return res.status(404).json({ message: "Not found" });
  res.status(200).json(complaint);
};
