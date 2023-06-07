import express, {Router} from "express";
import UserVerification from "./database/models/UserVerification.js";
import bcrypt from "bcrypt";
import User from "./database/models/Users.js";
import {sendBasicEmail, sendEmailWithPhoto} from "./utils/mailSender.js";
import Busboy from "busboy";
const router = Router();
import Booking from "./database/models/bookings.js";

import path from 'path';
import { fileURLToPath } from 'url';

function hasAuthentication(req, res, next) {
    if (req?.session?.user?.isVerified) {
        next();
    } else {
        res.status(401).send('You are not authenticated.');
        console.log('You are not authenticated.')
    }
}

// Get directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Test Hope Page
router.get("/", (req, res) => {
    res.sendFile("index.html");
});

// Login Page
router.post('/login',async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json({message: 'Please provide all required credentials.'});
    }

    const user = await User.findOne({email});

    if (!user) {
        return res.status(404).json({message: 'User not found.'});
    }

    const isSamePassword = await bcrypt.compare(password, user.password);

    if (!isSamePassword) {
        return res.status(400).json({message: 'Incorrect password.'});
    }

    // Save user info in session
    req.session.user = {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
    };
    return res.status(200).json({message: 'Logged in successfully:', username: user.username});
});

// test session
router.get('/user', (req, res) => {
    const session = req.session;
    res.json(session);
});

//get authenticated user
router.get('/api/user',hasAuthentication, async (req, res) => {
    const session = req.session;
    res.json(session);
});

router.post("/api/weekly-bookings", async (req, res) => {
    try {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);
        const bikeId = req.body.bikeId;
        endDate.setDate(endDate.getDate() + 1);

        const bookings = await Booking.find({
            startTime: { $gte: startDate, $lt: endDate },
            itemID: bikeId
        }).populate("userID", "email");

        res.json({
            status: 200,
            message: "Retrieved bookings for the specified week successfully",
            bookings,
        });
    } catch (error) {
        res.json({
            status: 500,
            message: "Server error",
        });
    }
});

router.post("/api/getBooking", async (req, res) => {
    const { bookingID } = req.body;
    try {
        const booking = await Booking.findById(bookingID)
        res.json({
            status: 200,
            message: "The booking Belongs to Another User",

        });
    } catch (error) {
        res.json({
            status: 500,
            message: "Server error",
        });
    }
});

router.post("/api/bookings/cancel", async (req, res) => {
    const { bookingID } = req.body;
    try {
        const booking = await Booking.findByIdAndRemove(bookingID);
        res.json({
            status: 200,
            message: "Deleted Booking successfully",
        });
    } catch (error) {
        res.json({
            status: 500,
            message: "Server error",
        });
    }
});

router.post('/api/create-booking', async (req, res) => {
    const { startTime, endTime, itemID, userEmail } = req.body;
    console.log("session",req.session.user)
    if (!startTime || !endTime || !itemID) {
        res.status(400).json({ message: "Please provide all required booking details" });
        return;
    }
    if (!userEmail) {
        res.status(400).json({ message: "User is not authenticated" });
        return;
    }
    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        console.log(itemID)
        const existingBookings = await Booking.find({
            itemID: itemID,
            $or: [
                { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
                { endTime: { $gt: new Date(startTime), $lte: new Date(endTime) } }
            ]
        }).sort({ startTime: 1 });

        let actualEndTime = new Date(endTime);
        let message = "Booking created successfully";
        if (existingBookings.length > 0) {
            // Adjust the end time to prevent overlapping
            actualEndTime = existingBookings[0].startTime;
            message = "Booking created successfully, but the end time was adjusted due to overlap with an existing booking";
        }

        const newBooking = new Booking({
            startTime,
            endTime: actualEndTime,
            itemID: itemID,
            userID: user._id,
        });
        await newBooking.save();
        res.status(200).json({ message: message, booking: newBooking });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Logout
router.post('/logout', (req, res) => {

    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ message: 'Internal server error.' });
            } else {
                return res.status(200).json({ message: 'Logged out successfully.' });
            }
        });
    } else {
        return res.status(400).json({ message: 'No active session to log out from.' });
    }
});

// User Verification
router.get("/verify/:userId/:uniqueString", async (req, res) => {
    const { userId, uniqueString } = req.params;
    try {
        //find the user verification details
        const UserVerificationDetails = await UserVerification.findOne({ userId });

        //check if uniqueString is valid
        const isUniqueStringValid = await bcrypt.compare(
            uniqueString,
            UserVerificationDetails.uniqueString
        );

        //check if the uniqueString has expired
        const isExpired = UserVerificationDetails.expiresAt < Date.now();
        if (isUniqueStringValid && !isExpired) {
            //update the user's isVerified property to true
            const user = await User.findOneAndUpdate(
                { _id: userId },
                { isVerified: true },
                { new: true }
            );

            //delete the user verification details from the database
            const UserVerificationResult = await UserVerification.findOneAndDelete({userId});

            if (user && UserVerificationResult) {
                res.status(200).json({
                    //redirect to login page
                    message: "User verified!",
                    loginPageUrl: "/",
                });
                console.log("User verified and verification details deleted successfully")
            } else {
                res.status(404).json({
                    message: "User not found or verification details not found during verification",
                });
            }
        }  else {
            res.status(400).json({
                message: "Invalid or expired verification link",
            });
        }
    } catch (error) {
        res.status(500).json({
            message: `Server error: ${error}`,
        });
    }
});

// User resets the password
router.get("/reset-password/:userId/:uniqueString", async (req, res) => {
    const { userId, uniqueString } = req.params;

    // Find the user verification details
    const UserVerificationDetails = await UserVerification.findOne({ userId });

    // Check if uniqueString is valid
    const isUniqueStringValid = await bcrypt.compare(uniqueString, UserVerificationDetails.uniqueString);

    // Check if the uniqueString has expired
    const isExpired = UserVerificationDetails.expiresAt < Date.now();

    if (isUniqueStringValid && !isExpired) {
        //TODO: redirect to reset password page on svelte
        res.sendFile('passwordReset.html');
    } else {
        res.status(400).json({
            message: "Invalid or expired reset link",
        });
    }
});

// User sends a photo
router.post('/upload', async (req, res) => {
    const userEmail = req.body.email;
    const subject = `New Photo Submission from ${userEmail}`;
    const message = `
            <h1>New Photo Received</h1>
            <br>
            <p>Message: ${req.body.message}</p>
            <br>
            <p>Received a new photo from ${userEmail}. The photo is attached with this email.</p>`;

    const busboy = Busboy({ headers: req.headers });

    busboy.on('file', async (fieldname, file) => {
        if (fieldname !== 'photo') { // Check that the fieldname matches your expected file field name
            return res.status(400).send({ message: 'Invalid field name for the file.' });
        }

        const photoName = `${Date.now()}-${userEmail}.png`;

        // Convert the file to base64
        const fileBuffers = [];
        for await (const data of file) {
            fileBuffers.push(data);
        }
        const photoBase64 = Buffer.concat(fileBuffers).toString('base64');

        try {
            await sendEmailWithPhoto(process.env.ADMIN_EMAIL, subject, message, photoName, photoBase64);
            return res.status(200).send({ message: 'Logged out successfully.' });
        } catch (error) {
            return res.status(500).send({ message: `Server error: ${error}` });
        }
    });
    res.
    req.pipe(busboy);
});

router.post('/api/booking-message', async (req, res) => {
    const bookingId = req.body.bookingId;
    const userEmail = req.body.email;
    const subject = `Solbakken Cargo Bikes - Message from ${userEmail}`;


    try {
        const booking = await Booking.findOne({ _id: bookingId }).populate('userID');
        if (!booking) {
            return res.status(404).send({message: 'Booking not found.'});
        }
        const emailOfUserThatBooked = booking.userID.email
        const bookingDate = booking.startTime.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const bookingTime = booking.startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const message =
            `<h4>Message from Solbakken User</h4>
        <p>I am writing because I really need the bike that you booked on: </p>
        <p>${bookingDate} ${bookingTime}</p>
        <p>If your use is more flexible, it would be amazing if you could cancel the booking.</p>
        <p>Otherwise you could write me at ${userEmail}</p>
        <br>`
        const response = await sendBasicEmail(emailOfUserThatBooked, subject, message);
        if (response.success) {
            return res.status(200).json({message: 'Email sent successfully.'});
        } else {
            return res.status(500).json({message: 'Error sending email.'});
        }
    } catch (error) {
        return res.status(500).send({message: `Server error: ${error}`});
    }
});


export default router;