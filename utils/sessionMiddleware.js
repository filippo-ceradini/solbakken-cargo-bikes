//Implement Session, with secret stored in the .env file and stored on MongoDB
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
dotenv.config();

const mongoStore = MongoStore.create({ mongoUrl: process.env.MONGO_URI });
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    store: mongoStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
        cookie: { secure: false },
        httpOnly: false,
        expires: 1000 * 60 * 60 * 24 * 7, // 1 week
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
});

export { sessionMiddleware };
