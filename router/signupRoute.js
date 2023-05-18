import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../database/models/users.js"; // Replace with path to your User model

const router = Router();

router.post("/new-user", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide all required credentials' });
    }

    const user = await User.findOne({ email: email });
    if (user) {
        return res.status(400).json({ message: `User with the email '${email}' already exists` });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ email: email, password: hashedPassword });
    await newUser.save();

    return res.status(200).json({
        message: `User created successfully`
    });
});

export default router;
