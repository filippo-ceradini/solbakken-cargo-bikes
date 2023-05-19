import express from "express";
import { connectDB } from './database/database.js';
import session from "express-session";
import MongoStore from 'connect-mongo';
import {Server} from "socket.io";

import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(express.json());

//Implement Session, with secret stored in the .env file and stored on MongoDB
const sessionConfig = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
});
app.use(sessionConfig);

//Implementing ApiLimiter
import rateLimit from "express-rate-limit";
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(apiLimiter);

//Implementing socket.io
import http from "http";
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["*"]
    }
});

//Sharing session with socket.io
io.use((socket, next) => {
    sessionConfig(socket.request, {}, next);
})

// Configure Socket.IO event handlers
import configureSocketIO from "./utils/socket.js";
configureSocketIO(io);

const PORT = process.env.PORT || 8080;
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
});
