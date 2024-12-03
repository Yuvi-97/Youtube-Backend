import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"

const connectDB=async() => { 
    try {
        const con = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        console.log(`MongoDB connected !! DB HOST: ${con.connection.host}`);
    } catch (error) {
        console.log("Mongo db connection failed",error);
        process.exit(1)
    }
}

export default connectDB;