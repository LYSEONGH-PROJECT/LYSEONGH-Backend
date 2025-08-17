import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
// Update the import path to the correct location of InvoiceItem
import { InvoiceItem } from "../utils/calculateTotals";

export type PdfData = {
  invoiceNumber: string;
  dateIssued: Date;
  clientName: string;
  clientEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  // totalAmount: number; // Uncomment if you want to use totalAmount
  adminSignature: string;
  company: {
    name: string;
    address: string;
    email?: string;
    logoPath?: string;
  };
};

// Generate invoice PDF
export async function generateInvoicePdf(
  data: PdfData,
  outputDir = "invoices"
): Promise<string> {
  if (!data.invoiceNumber || !data.clientName || !data.clientEmail || !data.adminSignature) {
    throw new Error("Missing required invoice fields");
  }
  if (!data.items || data.items.length === 0) {
    throw new Error("Items array cannot be empty");
  }

  const fullOutputDir = path.join(__dirname, "../../", outputDir);
  if (!fs.existsSync(fullOutputDir)) fs.mkdirSync(fullOutputDir, { recursive: true });

  const filename = `${data.invoiceNumber}.pdf`;
  const filePath = path.join(fullOutputDir, filename);
  const pdfUrl = `/${outputDir}/${filename}`; // what the controller saves in db

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // --- Company Header ---
  if (data.company.logoPath && fs.existsSync(path.join(__dirname, "../../", data.company.logoPath))) {
    doc.image(path.join(__dirname, "../../", data.company.logoPath), 50, 45, { width: 80 });
  }
  doc.fontSize(20).text(data.company.name, 140, 50);
  doc.fontSize(10).text(data.company.address, 140, 75);
  if (data.company.email) doc.text(data.company.email, 140, 90);
  doc.fontSize(20).text("INVOICE", 400, 50, { align: "right" });

  doc.moveDown();
  doc.fontSize(12).text(`Invoice Number: ${data.invoiceNumber}`, 50, 120);
  doc.text(`Date Issued: ${data.dateIssued.toDateString()}`, 50, 135);

  // --- Bill To ---
  doc.moveDown();
  doc.fontSize(12).text("Bill To:", 50, 170);
  doc.text(data.clientName, 50, 185);
  doc.text(data.clientEmail, 50, 200);

  // --- Items Table ---
  const tableTop = 240;
  const itemX = 50;
  const qtyX = 300;
  const priceX = 360;
  const subtotalX = 450;

  doc.rect(itemX, tableTop, 500, 20).stroke();
  doc.text("Item", itemX + 10, tableTop + 5);
  doc.text("Qty", qtyX + 10, tableTop + 5);
  doc.text("Price (GHS)", priceX + 10, tableTop + 5);
  doc.text("Subtotal (GHS)", subtotalX + 10, tableTop + 5);

  let y = tableTop + 20;
  data.items.forEach((it) => {
    doc.rect(itemX, y, 500, 20).stroke();
    doc.text(it.name, itemX + 10, y + 5);
    doc.text(String(it.quantity), qtyX + 10, y + 5);
    doc.text(`GHS ${it.price.toFixed(2)}`, priceX + 10, y + 5);
    doc.text(`GHS ${(it.quantity * it.price).toFixed(2)}`, subtotalX + 10, y + 5);
    y += 20;
  });

  // --- Totals ---
  y += 20;
  doc.text(`Subtotal: GHS ${data.subtotal.toFixed(2)}`, 400, y, { align: "right" });
  y += 20;
  doc.fontSize(13).text(`Total: GHS ${data.total.toFixed(2)}`, 400, y, { align: "right" });

  // --- Signature ---
  y += 50;
  doc.rect(50, y, 200, 0).stroke();
  doc.text("Authorized Signature", 50, y + 5);
  doc.text(data.adminSignature, 50, y + 25);

  doc.fontSize(12).text("Thank you for doing business with LYSEONGH.", 50, y + 70);

  doc.end();

  await new Promise<void>((resolve, reject) => {
    stream.on("finish", () => resolve());
    stream.on("error", (e) => reject(e));
  });

  return pdfUrl;
}
