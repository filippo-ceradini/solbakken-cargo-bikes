import nodemailer from 'nodemailer';

async function sendEmail( sendTo, subject, message) {
    // Configure your email transport using Mailtrap
    if (!message){
        //handle undefined message
    }
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.ADMIN_EMAIL,
            pass: process.env.MAILSENDER_PASSWORD
        }
    });

    const mailOptions = {
        to: sendTo,
        subject: subject,
        html: message,
    };


    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false };
    }
}

export default sendEmail;
