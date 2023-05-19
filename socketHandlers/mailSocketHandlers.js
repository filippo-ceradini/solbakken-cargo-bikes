import sendEmail from '../utils/mailSender.js';

const mailSocketHandlers = (socket) => {
    // Contact Email
    socket.on("contact-email", async (data) => {
        const { name, email, message } = data;
        if (!name || !email) {
            socket.emit("email-response", {
                status: 500,
                message: "Email or Name missing",
            });
            return;
        }
        const subject = `${name} has a message for you`
        const Message = `
        Name: ${name}
        Email: ${email}
        Message: ${message}
    `;

        try {
            const result = await sendEmail( process.env.ADMIN_EMAIL, Message, name, subject);
            // Rest of the code...
        } catch (error) {
            // Error handling code...
        }
    });

    // Post Photo
    socket.on("post-photo", async (data) => {
        const { name, email, message } = data;
        if (!name || !email) {
            socket.emit("email-response", {
                status: 500,
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
            const result = await sendEmail( email, message, name, subject);
            // Rest of the code...
        } catch (error) {
            // Error handling code...
        }
    });


    // Subscribe Email
    socket.on("subscribe-email", async (data) => {
        const { name, email } = data;
        if (!name || !email) {
            socket.emit("email-response", {
                status: 500,
                message: "Email or Name missing",
            });
            return;
        }
        const subject = "Welcome to Solbakken Cargo Bikes"
        const Message = `
        This is your link to subscribe <b>Link<b>
    `;

        try {
            const result = await sendEmail( email, Message, name, subject);
            // Rest of the code...
        } catch (error) {
            // Error handling code...
        }
    });

    // TODO Password Lost Email

};

export default mailSocketHandlers;
