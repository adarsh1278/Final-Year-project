import express from 'express';
import { signup, login, profile, logout, updateProfile, updatePassword, sendVerification, verifyContact } from '../controllers/authContoller.js';
import { userAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", userAuth, profile);
router.put("/profile", userAuth, updateProfile);
router.patch("/update-password", userAuth, updatePassword);
router.post('/send-verification', userAuth, sendVerification);
router.post('/verify', userAuth, verifyContact);

export default router;
