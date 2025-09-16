import { Webhook } from "svix"
import userModel from "../models/userModel.js";
import razorpay from "razorpay";
import TransactionModel from "../models/transactionModel.js";


const clerkwebhook = async (req, res) => {

    try {
        const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        await webhook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        });
        const { data, type } = req.body;
        switch (type) {
            case "user.created": {
                const userData = {
                    clerkId: data.id,
                    email: data.email_addresses?.[0]?.email_address,
                    firstName: data.first_name,
                    lastName: data.last_name,
                    photo: data.image_url
                };
                await userModel.create(userData);
                res.json({ message: "User created successfully" });
                break;
            }

            case "user.updated": {
                const userUpdated = {
                    email: data.email_addresses[0].email_address,
                    firstName: data.first_name,
                    lastName: data.last_name,
                    photo: data.image_url
                };
                await userModel.findOneAndUpdate({ clerkId: data.id }, userUpdated);
                res.json({ message: "User updated successfully" });
                break;
            }

            case "user.deleted": {
                await userModel.findOneAndDelete({ clerkId: data.id });
                res.json({ message: "User deleted successfully" });
                break;
            }
            default:
                console.log("Unhandled webhook type:", type);
                res.json({ message: "Webhook received but not handled" });
                break;
        }
    }
    catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
        return;
    }
}

const userCredits = async (req, res) => {
    try {
        // Use clerkId from req.user (set by auth middleware)
        const clerkId = req.user?.clerkId;
        if (!clerkId) {
            return res.status(401).json({ success: false, message: "Unauthorized: clerkId missing" });
        }
        const userdata = await userModel.findOne({ clerkId });
        if (!userdata) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, credits: userdata.creditBalance });
    } catch (error) {
        console.error("Error fetching user credits:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const paymentRazorpay = async (req, res) => {
    try {
        const { clerkId, planId } = req.body;
        const userData = await userModel.findOne({ clerkId });

        if (!userData || !planId) {
            return res.status(404).json({ success: false, message: "Invalid credentials" });
        }
        let credits, plan, amount, date
        switch (planId) {
            case "Basic":
                plan = "Basic Plan";
                credits = 100;
                amount = 10;
                break;

            case "Advanced":
                plan = "Advanced Plan";
                credits = 500;
                amount = 50;
                break;

            case "Business":
                plan = "Business Plan";
                credits = 5000;
                amount = 250;
                break;

            default:
                return res.status(400).json({ success: false, message: "Invalid plan" });
        }
        date = new Date();

        const transactionData = { clerkId, plan, credits, amount, date };

        const newTransaction = await TransactionModel.create(transactionData);

        const options = {
            amount: amount * 100,
            currency: process.env.CURRENCY || "INR",
            receipt: String(newTransaction._id)
        };

        await razorpayInstance.orders.create(options)
            .then((order) => {
                res.json({ success: true, order });
            })
            .catch((error) => {
                console.error("Error creating Razorpay order:", error);
                res.status(500).json({ success: false, message: "Internal Server Error" });
            });

    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

const verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body;

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

        if (orderInfo.status === "paid") {
            const transactionData = await TransactionModel.findById({ receipt: String(orderInfo.receipt) });
            if (transactionData.payment) {
                return res.json({ success: false, message: "Payment Failed" });
            }

            const userData = await userModel.findOne({ clerkId: transactionData.clerkId });
            const creditBalance = userData.creditBalance + transactionData.credits;
            await userModel.findByIdAndUpdate(userData._id, { creditBalance });

            //make the payment successful
            await TransactionModel.findByIdAndUpdate(transactionData._id, { payment: true });
            return res.json({ success: true, message: "Credits Added" });
        }
    } catch (error) {
        console.error("Error fetching Razorpay order:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export { clerkwebhook, userCredits, paymentRazorpay, verifyRazorpayPayment };