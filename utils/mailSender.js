import nodemailer from 'nodemailer';

async function sendEmail( from, to, message, name, subject) {
    // Configure your email transport using Mailtrap
    if (!message){
        //handle undefined message
    }
    console.log(to, message, subject)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.ADMIN_EMAIL,
            pass: process.env.MAILSENDER_PASSWORD
        }
    });

    const mailOptions = {
        to: to,
        subject: subject,
        text: message,
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
