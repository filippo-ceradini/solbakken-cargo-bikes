import {Router} from "express";
import UserVerification from "./database/models/UserVerification.js";
import bcrypt from "bcrypt";
import User from "./database/models/Users.js";
import {sendEmailWithPhoto} from "./utils/mailSender.js";
import multer from "multer";
import fs from "fs";
const upload = multer({ dest: 'uploads/' });

const router = Router();

// Test Hope Page
router.get("/", (req, res) => {
    res.sendFile("index.html");
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
                    //TODO: redirect to login page
                    message: "User verified and verification details deleted successfully",
                    user,
                });
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
router.get("/photo-send", (req, res) => {
    res.sendFile("photoContact.html");
});

router.post('/upload', upload.single('photo'), async (req, res) => {
    const photoFile = req.file;
    const userEmail = req.session.user.email;
    const photoName = `${Date.now()}-${userEmail}.png`;
    const subject = `New Photo Submission from ${userEmail}`;
    const message = `<h1>New Photo Received</h1><p>Received a new photo from ${userEmail}. The photo is attached with this email.</p>`;

    // Convert the file to base64
    const fileData = fs.readFileSync(photoFile.path);
    const photoBase64 = fileData.toString('base64');

    try {
        await sendEmailWithPhoto(process.env.ADMIN_EMAIL, subject, message, photoName, photoBase64);
        // Delete the file after sending the email
        fs.unlink(photoFile.path, function(err) {
            if (err) {
                console.error(`Failed to delete file: ${err}`);
            } else {
                console.log(`File ${photoFile.path} deleted.`);
            }
        });
        res.status(200).send({ message: `Photo sent successfully` });
    } catch (error) {
        res.status(500).send({ message: `Server error: ${error}` });
    }
});



export default router;