import sendEmail from '../utils/mailSender.js';
import {v4 as uuidv4} from 'uuid';
import User from "../database/models/Users.js";
import UserVerification from "../database/models/UserVerification.js";
import bcrypt from "bcrypt";
import {Router} from "express";

const mailSocketHandlers = (socket) => {
    // Contact Email
    socket.on("contact-email", async (data) => {
        const {name, email, message} = data;
        if (!name || !email) {
            socket.emit("contact-response", {
                message: "Email or Name missing",
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
            await sendEmail(process.env.ADMIN_EMAIL, subject, emailMessage);
            socket.emit("contact-response", {
                message: `${name}, your message has been sent successfully`
            });
        } catch (error) {
            socket.emit("contact-response", {
                message: `Server error: ${error} `,
            });
        }
    });

    // TODO: finish post Photo
    socket.on("post-photo", async (data) => {
        const {name, email, message} = data;
        if (!name || !email) {
            socket.emit("email-response", {
                message: "Email or Name missing",
            });
            return;
        }

        const subject = `
        Name: ${name}
        Email: ${email}
        Message: ${message}
    `;

        try {
            await sendEmail(email, subject, message);
            socket.emit("post-photo-messages", {
                message: `Photo sent successfully`
            });
        } catch (error) {
            socket.emit("post-photo-messages", {
                message: `Server error: ${error} `,
            });
        }
    });

    // Subscribe Email
    let newUser;
    socket.on("subscribe-email", async (data) => {
        const {email, password} = data;
        console.log(email, password)
        if (!password || !email) {
            socket.emit("subscribe-messages", {
                message: "Email or Password missing",
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
            //get the New User generated Id from the User Model by using the email property
            const newUserIdObj = await User.findOne({email}).select("_id");
            const newUserId = newUserIdObj._id;
            //Create uniqueString and hash it
            const uniqueString = uuidv4() + newUserId.toString();
            const hashedUniqueString = await bcrypt.hash(uniqueString, 10);
            //URL for verification
            const verificationURL = `${process.env.SERVER_URL}/verify/${newUserId}/${uniqueString}`;
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
            await sendEmail(email, subject, emailMessage);
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



    // TODO Password Lost Email
    socket.on("password-lost-email", async (data) => {
        const {name, email} = data;
        if (!name || !email) {
            socket.emit("email-response", {
                status: 500,
                message: "Email or Name missing",
            });
            return;
        }
        const subject = "Welcome to Solbakken Cargo Bikes"
        const message = `
        This is your link to subscribe <b>Link<b>
    `;

        try {
            await sendEmail(email, subject, message);
        // Rest of the code...
        } catch (error) {
            socket.emit("subscribe-messages", {
                message: `Server error: ${error} `,
            });
        }
    });
};

const router = Router();
router.get("/verify/:userId/:uniqueString", async (req, res) => {
    const { userId, uniqueString } = req.params;
    try {
        //find the user verification details
        const UserVerificationDetails = await UserVerification.findOne({ userId });
        console.log('UserVerificationDetails:', UserVerificationDetails);

        //check if uniqueString is valid
        const isUniqueStringValid = await bcrypt.compare(
            uniqueString,
            UserVerificationDetails.uniqueString
        );
        console.log('isUniqueStringValid:', isUniqueStringValid);

        //check if the uniqueString has expired
        const isExpired1 = UserVerificationDetails.expiresAt < Date.now();
        console.log('isExpired:', isExpired1);

        //check if the uniqueString has expired
        const isExpired = UserVerificationDetails.expiresAt < Date.now();
        if (isUniqueStringValid && !isExpired) {
            //update the user's isVerified property to true
            const user = await User.findOneAndUpdate(
                { _id: userId },
                { isVerified: true },
                { new: true }
            );
            if (user) {
                res.status(200).json({
                    message: "User verified state updated successfully",
                    user,
                });
            } else {
                res.status(404).json({
                    message: "User not found during verification",
                });
            }
            //delete the user verification details from the database
            try {
                const UserVerificationResult = await UserVerification.findOneAndDelete({userId});

                if (UserVerificationResult) {
                    res.status(200).json({
                        message: "User verification deleted successfully",
                        user,
                    });
                } else {
                    res.status(404).json({
                        message: "User Verification not found",
                    });
                }
            } catch (error) {
                res.status(500).json({
                    message: `Server error: ${error}`,
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

export { router, mailSocketHandlers };
