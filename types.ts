
export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  VIEWER = 'VIEWER'
}

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: UserRole;
  tier: 'TIER-1' | 'TIER-2';
}

export interface ProductBatch {
  id: string;
  batchNo: string;
  expiryDate: string;
  stock: number;
  mrp: number;
  sellingPrice: number;
}

export interface Product {
  id: string;
  name: string;
  barcode?: string; // New field
  hsnCode: string;
  gstRate: number; // e.g., 5, 12, 18, 28
  category: string;
  basePrice: number;
  unit: string;
  totalStock: number;
  batches?: ProductBatch[]; // Tier-2 only
  lowStockThreshold: number;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  hsnCode: string;
  qty: number;
  rate: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  customerName: string;
  customerGstin: string;
  customerState: string;
  items: InvoiceItem[];
  subTotal: number;
  totalTax: number;
  grandTotal: number;
  createdBy: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface DashboardStats {
  todaySales: number;
  monthlySales: number;
  lowStockItems: number;
  activeInvoices: number;
}
