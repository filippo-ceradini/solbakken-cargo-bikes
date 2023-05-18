import { Router } from "express";
import sendEmail from '../utils/mailSender.js'
const router = Router();

router.post('/send-email', async (req, res) => {
    const { name, email, message } = req.body;

    try {
        const result = await sendEmail({ name, email, message });
        if (result.success) {
            res.status(200).send('Email sent successfully');
        } else {
            res.status(500).send('Error sending email');
        }
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Error sending email');
    }
});


export default router;