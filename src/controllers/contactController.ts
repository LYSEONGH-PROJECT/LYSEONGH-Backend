// src/controllers/contactController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyRecaptcha } from '../utils/recaptcha';
import { sendAdminEmail, sendAutoReply } from '../utils/mailer';
import { z, ZodError } from 'zod'; // Explicitly import ZodError
import sanitizeHtml from 'sanitize-html';
import winston from 'winston';

const prisma = new PrismaClient();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: 'contact.log' })],
});

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  recaptchaToken: z.string().min(1, 'reCAPTCHA token is required'),
});

export const submitContact = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message, recaptchaToken } = contactSchema.parse(req.body);

    // Sanitize input
    const sanitizedMessage = sanitizeHtml(message, {
      allowedTags: [],
      allowedAttributes: {},
    });

    // Verify reCAPTCHA
    const isValidCaptcha = await verifyRecaptcha(recaptchaToken);
    if (!isValidCaptcha) {
      return res.status(400).json({ message: 'reCAPTCHA verification failed' });
    }

    // Save to database
    const contactMessage = await prisma.contactMessage.create({
      data: { name, email, phone, message: sanitizedMessage },
    });

    // Log the event
    logger.info('Contact submitted', { name, email, id: contactMessage.id });

    // Send email to admin
    await sendAdminEmail(name, email, sanitizedMessage);

    // Send auto-reply to user
    await sendAutoReply(email);

    return res.status(201).json({ message: 'Contact message submitted successfully', id: contactMessage.id });
  } catch (error: unknown) { // Changed from 'any' to 'unknown' for better type safety
    if (error instanceof ZodError) {
      return res.status(400).json({ message: error.issues[0].message });
    }
    console.error('Contact submission error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getContacts = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10, // Pagination limit
      skip: (parseInt(req.query.page as string) - 1 || 0) * 10,
    });
    return res.status(200).json({ messages });
  } catch (error) {
    console.error('Get contacts error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};