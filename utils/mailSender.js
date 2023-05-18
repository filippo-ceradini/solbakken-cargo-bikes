import nodemailer from 'nodemailer';

async function sendEmail({ name, email, message }) {
    // Configure your email transport using Mailtrap
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "95a7329377984b",
            pass: "63b81bc02f0e39"
        }
    });

    const mailOptions = {
        from: email,
        to: 'jonathanbomber@gmail.com', // Replace with your own recipient email address
        subject: `New contact message from ${name}`,
        text: `
      Name: ${name}
      Email: ${email}
      Message: ${message}
    `,
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
