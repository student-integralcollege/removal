import { Webhook } from "svix"
import userModel from "../models/userModel.js";
import razorpay from "razorpay";
import TransactionModel from "../models/transactionModel.js";
import crypto from "crypto";

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

// userCredits
const userCredits = async (req, res) => {
  try {
    const clerkId = req.user?.clerkId;   // ✅ fix: use req.user?.clerkId
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

// paymentRazorpay
const paymentRazorpay = async (req, res) => {
  try {
    const { planId } = req.body;
    const clerkId = req.user?.clerkId;   // ✅ fix

    if (!clerkId || !planId) {
      return res.status(400).json({ success: false, message: "Missing clerkId or planId" });
    }

    const userData = await userModel.findOne({ clerkId });
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let credits, plan, amount;
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

    const newTransaction = await TransactionModel.create({
      clerkId,
      plan,
      credits,
      amount,
      date: new Date(),
    });

    const options = {
      amount: amount * 100,   // ✅ Razorpay expects paise
      currency: process.env.CURRENCY || "INR",
      receipt: String(newTransaction._id),
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body.response; 
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // 2. Fetch order info from Razorpay
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    // 3. Find transaction from receipt
    const transactionData = await TransactionModel.findById(orderInfo.receipt);
    if (!transactionData) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // 4. Prevent double processing
    if (transactionData.payment) {
      return res.status(400).json({ success: false, message: "Payment already processed" });
    }

    // 5. Update user credits safely
    const userData = await userModel.findOne({ clerkId: transactionData.clerkId });
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    userData.creditBalance = (userData.creditBalance || 0) + transactionData.credits;
    await userData.save();
    transactionData.payment = true;
    transactionData.razorpay_payment_id = razorpay_payment_id;
    await transactionData.save();
    return res.json({ success: true, message: "Credits added successfully" });
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { clerkwebhook, userCredits, paymentRazorpay, verifyRazorpayPayment };