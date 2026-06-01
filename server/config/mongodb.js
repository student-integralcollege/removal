import mongoose from "mongoose";

let connectionPromise;

const mongodb = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is missing from environment variables");
    }

    if (!connectionPromise) {
        mongoose.connection.once("connected", () => {
            console.log("MongoDB connected");
        });

        connectionPromise = mongoose.connect(process.env.MONGODB_URI).catch((error) => {
            connectionPromise = null;
            throw error;
        });
    }

    await connectionPromise;
    return mongoose.connection;
}

export default mongodb;
