import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoute.js';
import complaintRoutes from './routes/complain.route.js';
import departmentRoutes from './routes/department.route.js';
import { initializeDepartments } from './controllers/departmentController.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// ✅ Enable CORS with credentials and origin
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());

// Make io accessible to routes
app.set('io', io);

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/departments", departmentRoutes);

// ✅ Health check route
app.get("/", (req, res) => res.send("Grievance Portal API Running"));

// Socket.IO for real-time chat
const activeRooms = new Map(); // Store active chat rooms
const userSockets = new Map(); // Store user socket connections

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join complaint room
  socket.on('join-complaint-room', async (data) => {
    const { complaintNumber, userType, userId, departmentName } = data;
    const roomName = `complaint-${complaintNumber}`;
    
    socket.join(roomName);
    socket.complaintNumber = complaintNumber;
    socket.userType = userType; // 'user' or 'department'
    socket.userId = userId;
    socket.departmentName = departmentName;
    
    // Store socket mapping
    userSockets.set(socket.id, {
      complaintNumber,
      userType,
      userId,
      departmentName
    });

    // Update active rooms
    if (!activeRooms.has(roomName)) {
      activeRooms.set(roomName, {
        complaintNumber,
        users: new Set(),
        departments: new Set(),
        messages: []
      });
    }
    
    const room = activeRooms.get(roomName);
    if (userType === 'user') {
      room.users.add(userId);
    } else {
      room.departments.add(departmentName);
    }

    console.log(`${userType} joined room: ${roomName}`);
    
    // Notify others in the room
    socket.to(roomName).emit('user-joined', {
      userType,
      userId: userType === 'user' ? userId : departmentName,
      message: `${userType === 'user' ? 'User' : departmentName + ' Department'} joined the chat`
    });

    // Send existing messages to the newly joined user
    try {
      // Get existing messages from database
      const complaintResponse = await fetch(`http://localhost:${process.env.PORT || 5000}/api/complaints/number/${complaintNumber}`, {
        headers: {
          'Cookie': socket.handshake.headers.cookie || ''
        }
      });

      let existingMessages = [];
      if (complaintResponse.ok) {
        const complaint = await complaintResponse.json();
        existingMessages = (complaint.chatMessages || []).map(msg => ({
          id: msg._id || Date.now(),
          message: msg.message,
          userType: msg.senderType,
          senderName: msg.senderName,
          timestamp: msg.timestamp,
          type: msg.messageType || 'message',
          accepted: msg.accepted
        }));
      }
      
      console.log(`Sending ${existingMessages.length} existing messages to user`);
      socket.emit('existing-messages', existingMessages);
    } catch (error) {
      console.error('Error fetching complaint messages:', error);
      const existingMessages = room.messages || [];
      socket.emit('existing-messages', existingMessages);
    }
  });

  // Handle chat messages
  socket.on('send-message', async (messageData) => {
    const { complaintNumber, message, userType, userId, departmentName } = messageData;
    const roomName = `complaint-${complaintNumber}`;
    
    try {
      // Save message to database
      if (userType === 'department') {
        await fetch(`http://localhost:${process.env.PORT || 5000}/api/departments/complaints/${complaintNumber}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': socket.handshake.headers.cookie || ''
          },
          body: JSON.stringify({ message })
        });
      } else {
        await fetch(`http://localhost:${process.env.PORT || 5000}/api/complaints/${complaintNumber}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': socket.handshake.headers.cookie || ''
          },
          body: JSON.stringify({ message })
        });
      }

      const chatMessage = {
        id: Date.now(),
        complaintNumber,
        message,
        userType,
        senderId: userType === 'user' ? userId : departmentName,
        senderName: userType === 'user' ? 'User' : `${departmentName} Department`,
        timestamp: new Date(),
        type: 'message'
      };

      // Store message in room
      if (activeRooms.has(roomName)) {
        activeRooms.get(roomName).messages.push(chatMessage);
      }

      // Broadcast to all users in the room
      io.to(roomName).emit('new-message', chatMessage);
      
      console.log(`Message saved and broadcasted in room ${roomName}`);
    } catch (error) {
      console.error('Error saving message to database:', error);
      
      // Still broadcast the message even if database save fails
      const chatMessage = {
        id: Date.now(),
        complaintNumber,
        message,
        userType,
        senderId: userType === 'user' ? userId : departmentName,
        senderName: userType === 'user' ? 'User' : `${departmentName} Department`,
        timestamp: new Date(),
        type: 'message'
      };

      if (activeRooms.has(roomName)) {
        activeRooms.get(roomName).messages.push(chatMessage);
      }

      io.to(roomName).emit('new-message', chatMessage);
    }
  });

  // Handle close request from department
  socket.on('request-close-complaint', (data) => {
    const { complaintNumber, reason, departmentName } = data;
    const roomName = `complaint-${complaintNumber}`;
    
    const closeRequest = {
      id: Date.now(),
      complaintNumber,
      type: 'close_request',
      reason,
      departmentName,
      timestamp: new Date(),
      status: 'pending'
    };

    // Store in room messages
    if (activeRooms.has(roomName)) {
      activeRooms.get(roomName).messages.push(closeRequest);
    }

    // Send to all users in the room
    io.to(roomName).emit('close-request', closeRequest);
    
    console.log(`Close request for complaint ${complaintNumber}`);
  });

  // Handle user response to close request
  socket.on('respond-close-request', (data) => {
    const { complaintNumber, accepted, response } = data;
    const roomName = `complaint-${complaintNumber}`;
    
    const closeResponse = {
      id: Date.now(),
      complaintNumber,
      type: 'close_response',
      accepted,
      response,
      timestamp: new Date()
    };

    // Store in room messages
    if (activeRooms.has(roomName)) {
      activeRooms.get(roomName).messages.push(closeResponse);
    }

    // Broadcast to room
    io.to(roomName).emit('close-response', closeResponse);
    
    // If accepted, mark complaint as closed
    if (accepted) {
      io.to(roomName).emit('complaint-closed', {
        complaintNumber,
        message: 'Complaint has been closed with user consent',
        timestamp: new Date()
      });
    }
    
    console.log(`Close response for complaint ${complaintNumber}:`, accepted);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { complaintNumber, userType, isTyping } = data;
    const roomName = `complaint-${complaintNumber}`;
    
    socket.to(roomName).emit('user-typing', {
      userType,
      isTyping,
      userId: socket.userId || socket.departmentName
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (userSockets.has(socket.id)) {
      const userData = userSockets.get(socket.id);
      const roomName = `complaint-${userData.complaintNumber}`;
      
      // Remove from active rooms
      if (activeRooms.has(roomName)) {
        const room = activeRooms.get(roomName);
        if (userData.userType === 'user') {
          room.users.delete(userData.userId);
        } else {
          room.departments.delete(userData.departmentName);
        }
        
        // Clean up empty rooms
        if (room.users.size === 0 && room.departments.size === 0) {
          activeRooms.delete(roomName);
        }
      }
      
      // Notify others in the room
      socket.to(roomName).emit('user-left', {
        userType: userData.userType,
        userId: userData.userType === 'user' ? userData.userId : userData.departmentName,
        message: `${userData.userType === 'user' ? 'User' : userData.departmentName + ' Department'} left the chat`
      });
      
      userSockets.delete(socket.id);
    }
  });
});

// ✅ DB + server startup
await connectDB();

// Create departments on startup (run only once)
try {
  await initializeDepartments();
} catch (error) {
  console.log("Department initialization skipped (already exist or error):", error.message);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} with Socket.IO`));
