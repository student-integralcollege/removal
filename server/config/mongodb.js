import mongoose from "mongoose";

const mongodb = async () => {

    mongoose.connection.on("connected", () => {
        console.log("MongoDB connected");
    });

    await mongoose.connect(`${process.env.MONGODB_URL}/bg-removal`);
}

export default mongodb;
