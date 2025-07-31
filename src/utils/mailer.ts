// src/utils/mailer.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT!),
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendAdminEmail = async (name: string, email: string, message: string) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL,
    subject: 'New Message from Contact Form',
    text: `New message from ${name} (${email}):\n\n${message}`,
  };
  await transporter.sendMail(mailOptions);
};

export const sendAutoReply = async (to: string) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject: 'Thank you for contacting LYSEONGH',
    text: 'Thank you for contacting LYSEONGH. We have received your message and will get back to you shortly.',
  };
  await transporter.sendMail(mailOptions);
};