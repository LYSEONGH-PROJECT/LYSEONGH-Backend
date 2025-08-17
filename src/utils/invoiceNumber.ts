import { PrismaClient } from "@prisma/client";

function pad(n: number, width = 4) {
  return n.toString().padStart(width, "0");
}

export async function generateInvoiceNumber(prisma: PrismaClient): Promise<string> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const counter = await tx.invoiceCounter.upsert({
        where: { id: 1 },
        update: { lastNumber: { increment: 1 } },
        create: { id: 1, lastNumber: 1 },
      });
      const invoiceNumber = `INV-${pad(counter.lastNumber)}`;
      const exists = await tx.invoice.findUnique({ where: { invoiceNumber } });
      if (exists) {
        throw new Error("Generated invoice number already exists");
      }
      return invoiceNumber;
    });
    return result;
  } catch (error) {
    console.error("Failed to generate invoice number:", error);
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${pad(count + 1)}`;
    const exists = await prisma.invoice.findUnique({ where: { invoiceNumber } });
    if (exists) {
      throw new Error("Fallback invoice number already exists");
    }
    return invoiceNumber;
  }
}