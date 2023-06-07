import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./database/database.js";

// Express app setup
const app = express();
app.use(express.json());
app.use(express.static("public"));
import { sessionMiddleware} from "./utils/sessionMiddleware.js";
app.use(sessionMiddleware);
import cors from "cors";
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

// Socket.io setup
import http from "http";
const server = http.createServer(app);

import {Server} from "socket.io";
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
        methods: ["*"]
    }
});

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));

//Routes setup
import router from "./routes.js";
app.use(router);

// Configure Socket.IO event handlers
import configureSocketIO from "./socket.js";
configureSocketIO(io);


const PORT = process.env.PORT || 8080;
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
});

