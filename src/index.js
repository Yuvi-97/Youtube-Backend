import dotenv from "dotenv";
import connectDB from "./db/index.js"
import { app } from "./app.js";

dotenv.config({
    path: "./env"
})
connectDB()
.then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is runnig at port : ${process.env.PORT}`)
    })
    app.on("error",(error)=>{
        console.log(error);
        throw error;
    })
})
.catch((error) =>{
    console.log("MongoDB connection failed")
})



/*

import express from "express";
const app=express()
( async ()=>{
    try {
        mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("Error:",error);
            throw error
        })

        app.listen(process.env.PORT, () =>{
            console.log(`Server is running on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log(error);
        throw error
    }
})()

*/