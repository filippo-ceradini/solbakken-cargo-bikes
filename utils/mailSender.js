import nodemailer from 'nodemailer';
import { Buffer } from 'buffer';

// Create the nodemailer transport
function createTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.ADMIN_EMAIL,
            pass: process.env.MAILSENDER_PASSWORD
        }
    });
}

// Generic email sending function
async function sendEmail(mailOptions) {
    const transporter = createTransporter();
    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false };
    }
}

// Function to send email without photo
async function sendBasicEmail(sendTo, subject, message) {
    const mailOptions = {
        to: sendTo,
        subject: subject,
        html: message,
    };
    return sendEmail(mailOptions);
}

// Function to send email with photo
async function sendEmailWithPhoto(sendTo, subject, message, photoName, photoBase64) {
    // Convert base64 image to buffer
    const photoBuffer = Buffer.from(photoBase64.replace(/^data:image\/\w+;base64,/, ""),'base64');
    const mailOptions = {
        to: process.env.ADMIN_EMAIL,
        subject: subject,
        html: message,
        attachments: [{
            filename: photoName,
            content: photoBuffer
        }]
    };

    return sendEmail(mailOptions);
}

export { sendBasicEmail, sendEmailWithPhoto };
