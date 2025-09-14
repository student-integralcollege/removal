import express from 'express';
import { clerkwebhook, userCredits } from '../controllers/userController.js';
import authUser from '../middlewares/auth.js';

const userRouter = express.Router();

userRouter.post('/webhooks', clerkwebhook);
userRouter.get('/credits', authUser, userCredits);

export default userRouter;
