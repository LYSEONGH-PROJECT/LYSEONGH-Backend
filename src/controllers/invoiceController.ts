// src/controllers/invoiceController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";
import sanitizeHtml from "sanitize-html";

import { generateInvoicePdf } from "../utils/pdf";
import { sendInvoiceEmail, buildTransport } from "../utils/mailer";
import { calculateTotals } from "../utils/calculateTotals";
import { generateInvoiceNumber } from "../utils/invoiceNumber";

const prisma = new PrismaClient();
const transporter = buildTransport();

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const { clientName, clientEmail, items, adminSignature } = req.body;

    // --- Environment Validation ---
    if (!process.env.ADMIN_EMAIL) {
      return res.status(500).json({ success: false, error: "Server misconfiguration: ADMIN_EMAIL missing" });
    }

    // --- Input Validation ---
    if (!clientName || typeof clientName !== "string") {
      return res.status(400).json({ success: false, error: "Client name is required" });
    }
    if (!clientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      return res.status(400).json({ success: false, error: "Valid client email is required" });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "Items must be a non-empty array" });
    }
    for (const [index, item] of items.entries()) {
      if (!item.name || typeof item.name !== "string") {
        return res.status(400).json({ success: false, error: `Item ${index + 1} is missing a valid name` });
      }
      if (typeof item.quantity !== "number" || item.quantity <= 0) {
        return res.status(400).json({ success: false, error: `Item ${index + 1} has invalid quantity` });
      }
      if (typeof item.price !== "number" || item.price < 0) {
        return res.status(400).json({ success: false, error: `Item ${index + 1} has invalid price` });
      }
    }
    if (!adminSignature || typeof adminSignature !== "string") {
      return res.status(400).json({ success: false, error: "Admin signature is required" });
    }

    // --- Sanitize Inputs ---
    const safeClientName = sanitizeHtml(clientName);
    const safeSignature = sanitizeHtml(adminSignature);
    const safeItems = items.map((i: any) => ({
      name: sanitizeHtml(i.name),
      quantity: i.quantity,
      price: i.price,
    }));

    // --- Generate Invoice Number & Totals ---
    const invoiceNumber = await generateInvoiceNumber(prisma);
    const totals = calculateTotals(safeItems);

    // --- File Path Setup ---
    const pdfDir = path.join(__dirname, "../../invoices");
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
    const pdfPath = path.join(pdfDir, `${invoiceNumber}.pdf`);

    // --- Generate PDF ---
    await generateInvoicePdf({
      invoiceNumber,
      clientName: safeClientName,
      clientEmail,
      items: safeItems,
      totalAmount: totals.total,
      adminSignature: safeSignature,
      pdfPath,
      companyDetails: {
        name: "LYSEONGH",
        address: "Accra, Ghana",
        email: "info@lyseongh.com",
      },
    });

    if (!fs.existsSync(pdfPath)) {
      return res.status(500).json({ success: false, error: "Failed to generate PDF" });
    }

    // --- Save to Database ---
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientName: safeClientName,
        clientEmail,
        items: JSON.stringify(safeItems),
        totalAmount: totals.total,
        subtotal: totals.subtotal, // Add subtotal from calculateTotals
        adminSignature: safeSignature,
        pdfUrl: `/invoices/${invoiceNumber}.pdf`, // Add pdfUrl
      },
    });

    // --- Send Email ---
    const emailSent = await sendInvoiceEmail(transporter, {
      toClient: clientEmail,
      toAdmin: process.env.ADMIN_EMAIL,
      invoiceNumber,
      totalAmount: totals.total,
      pdfPath,
    });

    return res.status(201).json({
      success: true,
      invoiceNumber,
      pdfUrl: `/invoices/${invoiceNumber}.pdf`,
      emailSent,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return res.status(500).json({ success: false, error: "Unexpected server error" });
  }
};
