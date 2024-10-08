import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const dbConnect= async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI!, {
            ssl: true,
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

export const dbDisconnect= async()=>{
    try {
        await mongoose.disconnect();
        console.log(`MongoDB disconnected`);
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}