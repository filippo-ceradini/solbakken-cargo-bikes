import express from "express";
import {Server} from "socket.io";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import { sessionMiddleware, wrap} from "./utils/sessionMiddleware.js";
dotenv.config();
import router from "./routes.js";
import { connectDB } from "./database/database.js";

// Express app setup
const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(sessionMiddleware);
app.use(router);
//Implementing socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        credentials: true
    }
});

io.use(wrap(sessionMiddleware));

// Configure Socket.IO event handlers
import configureSocketIO from "./socket.js";
configureSocketIO(io);






const PORT = process.env.PORT || 8080;
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
});

