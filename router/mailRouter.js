import express, { Router } from "express";
import sendEmail from '../utils/mailSender.js'
const router = Router();
router.use(express.json())

router.post('/contact-email', async (req, res) => {
    const { name, email, message } = req.body;
    if(!name || !email){
        res.status(500).send('Email or Name missing')
    }
    const subject = `
      Name: ${name}
      Email: ${email}
      Message: ${message}
    `
    console.log(email, process.env.ADMIN_EMAIL, message, name, subject)
    try {
        const result = await sendEmail( email, message, subject);
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

router.post('/post-photo', async (req, res) => {
    const { name, email, message } = req.body;
    if(!name || !email){
        res.status(500).send('Email or Name missing')
    }
    const subject = `
      Name: ${name}
      Email: ${email}
      Message: ${message}
    `
    console.log(email, process.env.ADMIN_EMAIL, message, name, subject)
    try {
        const result = await sendEmail( email, message, subject);
        if (result.success) {
            res.status(200).send('Email  with photo sent successfully');
        } else {
            res.status(500).send('Error sending email');
        }
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Error sending email');
    }
});

export default router;