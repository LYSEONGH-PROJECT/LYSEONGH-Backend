// src/utils/mailer.ts
import nodemailer, { Transporter } from "nodemailer";
import fs from "fs";

export const buildTransport = (): Transporter => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: false, // TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// --- Contact Form Emails (Module 2) ---
export const sendAdminEmail = async (name: string, email: string, message: string) => {
  const transporter = buildTransport();
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL,
    subject: "New Message from Contact Form",
    text: `New message from ${name} (${email}):\n\n${message}`,
  };
  await transporter.sendMail(mailOptions);
};

export const sendAutoReply = async (to: string) => {
  const transporter = buildTransport();
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject: "Thank you for contacting LYSEONGH",
    text: "Thank you for contacting LYSEONGH. We have received your message and will get back to you shortly.",
  };
  await transporter.sendMail(mailOptions);
};

// --- Invoice Emails (Module 3) ---
export const sendInvoiceEmail = async (
  transporter: Transporter,
  {
    toClient,
    toAdmin,
    invoiceNumber,
    totalAmount,
    pdfPath,
  }: {
    toClient: string;
    toAdmin: string;
    invoiceNumber: string;
    totalAmount: number;
    pdfPath: string;
  }
): Promise<boolean> => {
  try {
    if (!fs.existsSync(pdfPath)) {
      console.error("PDF not found at path:", pdfPath);
      return false;
    }

    // Send to client
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: toClient,
      subject: `Your Invoice #${invoiceNumber}`,
      text: `Dear client,\n\nPlease find attached your invoice #${invoiceNumber} with total amount $${totalAmount}.\n\nBest regards,\nLYSEONGH`,
      attachments: [{ filename: `${invoiceNumber}.pdf`, path: pdfPath }],
    });

    // Send copy to admin
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: toAdmin,
      subject: `New Invoice Created #${invoiceNumber}`,
      text: `Invoice #${invoiceNumber} was created for client ${toClient}, total: $${totalAmount}.`,
      attachments: [{ filename: `${invoiceNumber}.pdf`, path: pdfPath }],
    });

    return true;
  } catch (error) {
    console.error("Error sending invoice email:", error);
    return false;
  }
};
