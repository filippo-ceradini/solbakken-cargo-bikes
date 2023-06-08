import { sendBasicEmail } from '../utils/mailSender.js';
import {v4 as uuidv4} from 'uuid';
import User from "../database/models/Users.js";
import UserVerification from "../database/models/UserVerification.js";
import bcrypt from "bcrypt";

const mailSocketHandlers = (socket) => {
    // Contact Email
    socket.on("contact-email", async (data) => {
        console.log(`Contact Email Request`);
        const {name, email, message} = data;
        if (!name || !email || !message) {
            socket.emit("contact-response", {
                message: "Email or Name or Message missing",
            });
            return;
        }
        const subject = `${name} has a message for you`
        const emailMessage = `
        Name: ${name}
        Email: ${email}
        Message: ${message}
    `;

        try {
            await sendBasicEmail(process.env.ADMIN_EMAIL, subject, emailMessage);
            socket.emit("contact-response", {
                status: 200,
                message: `${name}, your message has been sent successfully`
            });
        } catch (error) {
            socket.emit("contact-response", {
                status: 500,
                message: `Server error: ${error} `,
            });
        }
    });

    // Subscribe Email
    let newUser;
    socket.on("subscribe-email", async (data) => {
        const {username, email, password} = data;
        if (!username || !password || !email) {
            socket.emit("subscribe-messages", {
                message: "Username, Email or Password missing",
            });
            return;
        }
        //Check if user exists
        try {
            // Check if user exists
            const userExists = await User.findOne({email});
            if (userExists) {
                socket.emit("subscribe-messages", {
                    message: "User already exists",
                });
            } else {
                // Create a new user
                newUser = new User({
                    username,
                    email,
                    password: await bcrypt.hash(password, 10),
                    isVerified: false,
                });
                await newUser.save();
                socket.emit("subscribe-messages", {
                    message: "User created successfully, sending email verification",
                });
            }
        } catch (error) {
            socket.emit("subscribe-messages", {
                message: `Server error: ${error} `,
            });
            return;
        }

        /*
        Send verification email
        */
        try {
            const newUserIdObj = await User.findOne({email}).select("_id");
            const newUserId = newUserIdObj._id;
            //Create uniqueString and hash it
            const uniqueString = uuidv4() + newUserId.toString();
            const hashedUniqueString = await bcrypt.hash(uniqueString, 10);
            //URL for verification
            const verificationURL = `${process.env.CLIENT_URL}/verify/${newUserId}/${uniqueString}`;
            //save the hashed unique string to the database
            const newUserVerification = new UserVerification({
                userId: newUserId,
                uniqueString: hashedUniqueString,
                expiresAt: new Date(Date.now() + 21600000), //6 hours
            });

            await newUserVerification.save();

            const subject = "Welcome to Solbakken Cargo Bikes"
            const emailMessage = "<p> Please click the link below to verify your email address </p> <br> <a href='" + verificationURL + "'>Verify Email</a>" +
                "<br><br><p> This link will <b>expire in 6 hours</b> </p>" +
                "<br><br><p> If you did not request this email, please ignore it. </p>"
            await sendBasicEmail(email, subject, emailMessage);
            socket.emit("subscribe-messages", {
                message: "Mail sent successfully, awaiting verification",
                user: newUser,
            });
        } catch (error) {
            socket.emit("subscribe-messages", {
                message: `Server error: ${error} `,
            });
        }
    });

    // Verify Email
    socket.on('reset-password', async ({ userId, uniqueString, password }) => {
        // Find the user verification details
        const UserVerificationDetails = await UserVerification.findOne({ userId });
        // Check if uniqueString is valid
        const isUniqueStringValid = await bcrypt.compare(uniqueString, UserVerificationDetails.uniqueString);
        // Check if the uniqueString has expired
        const isExpired = UserVerificationDetails.expiresAt < Date.now();
        if (isUniqueStringValid && !isExpired) {
            // Hash new password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Update the user's password
            const user = await User.findOneAndUpdate(
                { _id: userId },
                { password: hashedPassword },
                { new: true }
            );

            // Delete the user verification details from the database
            const UserVerificationResult = await UserVerification.findOneAndDelete({userId});

            if (user && UserVerificationResult) {
                socket.emit('reset-password-message', {
                    success: true,
                    message: "Password updated successfully",
                    user,
                });
            } else {
                socket.emit('reset-password-message', {
                    success: false,
                    message: "User not found or verification details not found during reset password",
                });
            }
        } else {
            socket.emit('reset-password-message', {
                success: false,
                message: "Invalid or expired reset link",
            });
        }
    });

    // Forgot password Email
    socket.on("forgot-password", async (data) => {
        try {
            const {email} = data;
            // Check if user exists
            const userExists = await User.findOne({email});
            if (!userExists) {
                socket.emit("forgot-password-response", {
                    success: false,
                    message: "No user with this email found",
                });
                return;
            }

            // Create uniqueString and hash it
            const uniqueString = uuidv4() + userExists._id.toString();
            const hashedUniqueString = await bcrypt.hash(uniqueString, 10);

            // URL for reset
            const resetURL = `${process.env.CLIENT_URL}/reset-password/${userExists._id}/${uniqueString}`;

            // Save the hashed unique string to the database
            const newUserVerification = new UserVerification({
                userId: userExists._id,
                uniqueString: hashedUniqueString,
                expiresAt: new Date(Date.now() + 21600000), //6 hours
            });

            await newUserVerification.save();

            const subject = "Solbakken Cargo Bikes Password Reset"
            const emailMessage = "<p> Please click the link below to reset your password </p> <br> <a href='" + resetURL + "'>Reset Password</a>" +
                "<br><br><p> This link will <b>expire in 6 hours</b> </p>" +
                "<br><br><p> If you did not request this email, please ignore it. </p>"
            // Send the email
            await sendBasicEmail(email, subject, emailMessage);
            socket.emit("forgot-password-response", {
                success: true,
                message: "Reset link sent to your email",
            });
        } catch (error) {
            socket.emit("subscribe-messages", {
                success: false,
                message: `Server error: ${error} `,
            });
        }
    });
};

export default mailSocketHandlers;
