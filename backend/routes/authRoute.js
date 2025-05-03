import express from 'express';
import { signup, login, profile ,logout} from '../controllers/authContoller.js';
import { userAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", userAuth, profile);

export default router;
