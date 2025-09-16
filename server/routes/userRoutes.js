import express from 'express';
import { clerkwebhook, userCredits, paymentRazorpay, verifyRazorpayPayment } from '../controllers/userController.js';
import authUser from '../middlewares/auth.js';

const userRouter = express.Router();

userRouter.post('/webhooks', clerkwebhook);
userRouter.get('/credits', authUser, userCredits);
userRouter.post('/pay-razor', authUser, paymentRazorpay);
userRouter.post('/verify-razor', verifyRazorpayPayment);

export default userRouter;
