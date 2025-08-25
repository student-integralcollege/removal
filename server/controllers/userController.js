import { Webhook } from "svix"
import userModel from "../models/userModel.js";

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

export { clerkwebhook };