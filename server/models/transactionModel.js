import mongoose from "mongoose";

export const transactionSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true
    },
    plan: {
        type: String,
        required: true
    },
    credits: {
        type: Number,
        required: true
    },
    payment: {
        type: Boolean,
        default: false
    },
    date: {
        type: Number,
        default: Date.now   
    },
});

const TransactionModel = mongoose.model("Transaction", transactionSchema);
export default TransactionModel;
