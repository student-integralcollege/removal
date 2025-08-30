import express from 'express';
import { clerkwebhook } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/webhooks', clerkwebhook);

export default userRouter;
