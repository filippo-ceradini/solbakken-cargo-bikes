import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import { connectDB } from './database/database.js';


const app = express();
app.use(express.json());

dotenv.config()
import crypto from 'crypto';
app.use(session({
    secret: crypto.randomBytes(20).toString('hex'), // generate a random secret
    resave: false,
    saveUninitialized: true,
    secure: process.env.NODE_ENV === 'production' //'secure : true' expect us to use https
}));

//Implementing Rate Limiter
import rateLimit from "express-rate-limit"
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(apiLimiter)

import cors from "cors";
app.use(cors({
    credentials: true
    //Not in use now since we are in development
    //origin: ['http://localhost:8080','http://10.0.1.3:8080']
}));

import router from './router/router.js'
app.use(router)

const PORT = process.env.PORT || 8080;
connectDB().then(()=>{
   app.listen(PORT, () => {
       console.log(`Listening on port ${PORT}`);
   })
});
