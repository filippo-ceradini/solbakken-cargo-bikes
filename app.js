import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import crypto from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

mongoose.set("strictQuery", false);
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

app.get('/', (req,res) => {
   res.send({title: 'Books'})
});



const PORT = process.env.PORT || 8080;
connectDB().then(()=>{
   app.listen(PORT, () => {
       console.log(`Listening on port ${PORT}`);
   })
});
