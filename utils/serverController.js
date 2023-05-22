//Implement Session, with secret stored in the .env file and stored on MongoDB
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
dotenv.config();

const sessionMiddleware= session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    rolling: true,
    cookie: {
        httpOnly: true,
        // secure: process.env.NODE_ENV === 'production',
        // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
});

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

export {sessionMiddleware, wrap};