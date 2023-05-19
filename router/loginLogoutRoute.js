import { Router } from "express";
import bcrypt from "bcrypt";
import hasAuthentication from '../utils/authentication.js';
import User from "../database/models/users.js"; // Replace with path to your User model

const router = Router();

//Login Route
router.post("/login", async (req, res) => {
    const { email, password, } = req.body;

    // Validate the required fields
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide all required credentials' });
    }

    //Check if user exists
    const userFound = await User.findOne({ email: email });

    if (userFound) {
        //Check if password is the same
        const isSamePassword = await bcrypt.compare(password, userFound.password);

        if (isSamePassword) {
            //save the user info in the session
            req.session.user = {
                id: userFound._id,
                email: userFound.email
            };
            return res.status(200).json({ message: "Logged in " + userFound.email });

        } else {
            return res.status(400).json({ message: "Wrong password. Try again" });
        }
    } else {
        return res.status(404).json({ message: "User Not found" });
    }
})

// Logout Route
router.delete('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.clearCookie('session-id'); // clear the session cookie
            res.send({ message: 'Logged out successfully' });
        }
    });
});


//Needed for Production?
router.get("/user", hasAuthentication, (req, res) => {
    const { email } = req.session.user;
    res.json({ email });
});


//Not needed for Production
router.get("/", hasAuthentication, (req, res) => {
    res.send({ message: `Hi ${req.session.user.email}, Welcome to the home page` });
})

//Not needed for Production
router.get('/test-session', (req, res) => {
    res.json({ session: req.session });
});


export default router;
