
import { Product, User, UserRole, Invoice } from '../types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Rajesh Kumar', username: 'admin', password: 'admin123', role: UserRole.ADMIN, tier: 'TIER-2' },
  { id: '2', name: 'Suresh Patel', username: 'billing', password: 'billing123', role: UserRole.OPERATOR, tier: 'TIER-1' },
  { id: '3', name: 'Amit Sharma', username: 'viewer', password: 'viewer123', role: UserRole.VIEWER, tier: 'TIER-1' }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Aspirin 75mg',
    hsnCode: '3004',
    gstRate: 12,
    category: 'Pharmaceuticals',
    basePrice: 120,
    unit: 'Strip',
    totalStock: 50,
    lowStockThreshold: 10,
    batches: [
      { id: 'b1', batchNo: 'ASP-001', expiryDate: '2025-12-31', stock: 50, mrp: 150, sellingPrice: 135 }
    ]
  },
  {
    id: 'p2',
    name: 'Hand Sanitizer 500ml',
    hsnCode: '3808',
    gstRate: 18,
    category: 'Hygiene',
    basePrice: 250,
    unit: 'Bottle',
    totalStock: 5,
    lowStockThreshold: 10
  }
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv1',
    invoiceNo: 'INV/2024/001',
    date: new Date().toISOString(),
    customerName: 'Apollo Pharmacy',
    customerGstin: '27AAAAA0000A1Z5',
    customerState: 'Maharashtra',
    items: [
      {
        productId: 'p1',
        productName: 'Aspirin 75mg',
        hsnCode: '3004',
        qty: 2,
        rate: 135,
        gstRate: 12,
        cgst: 16.2,
        sgst: 16.2,
        igst: 0,
        total: 302.4
      }
    ],
    subTotal: 270,
    totalTax: 32.4,
    grandTotal: 302.4,
    createdBy: 'Rajesh Kumar'
  }
];
