import express from "express";
import {Server} from "socket.io";
import dotenv from "dotenv";
import http from "http";
import {sessionMiddleware, wrap} from "./utils/serverController.js";
dotenv.config();

// Express app setup
const app = express();
app.use(express.json());
app.use(sessionMiddleware);

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

import router from "./routes.js";
import { connectDB } from "./database/database.js";
app.use(express.static("public"));
app.use(router);


const PORT = process.env.PORT || 8080;
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });
});

