export type InvoiceItem = {
  name: string;
  quantity: number;
  price: number;
};

export function calculateTotals(items: InvoiceItem[]): { subtotal: number; total: number } {
  if (!items || items.length === 0) {
    throw new Error('Items array cannot be empty');
  }

  for (const item of items) {
    if (typeof item.quantity !== 'number' || item.quantity <= 0 || isNaN(item.quantity)) {
      throw new Error(`Invalid quantity for item "${item.name}": must be a positive number`);
    }
    if (typeof item.price !== 'number' || item.price <= 0 || isNaN(item.price)) {
      throw new Error(`Invalid price for item "${item.name}": must be a positive number`);
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const total = roundedSubtotal;

  return { subtotal: roundedSubtotal, total };
}