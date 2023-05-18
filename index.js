import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import mongoose from 'mongoose';
import router from './router/router.js'
import crypto from "crypto";

const app = express()

dotenv.config()
app.use(session({
    secret: crypto.randomBytes(20).toString('hex'), // generate a random secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true } //'secure : true' expect us to use https
}));

import cors from "cors";
app.use(cors({
    credentials: true,
    origin: ['http://localhost:8080','http://10.0.1.3:8080']
}));

const index = express();
index.use(express.json());

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

index.use(router)

const PORT = process.env.PORT || 8080;
connectDB().then(()=>{
   index.listen(PORT, () => {
       console.log(`Listening on port ${PORT}`);
   })
});
