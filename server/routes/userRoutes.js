import express from 'express';
import { clerkwebhook } from '../controllers/userController';

const userRouter = express.Router();

userRouter.post('/webhooks', clerkwebhook);

export default userRouter;
