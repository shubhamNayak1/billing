
import { Product, Invoice, AuditLog, User, DashboardStats } from '../types';
import { http } from './http';

export type CreateInvoicePayload = {
  customerName: string;
  customerGstin?: string;
  customerState?: string;
  items: { productId: string; qty: number; rate: number }[];
};

export const api = {
  // Products
  getProducts: (filter?: 'low-stock'): Promise<Product[]> =>
    http.get<Product[]>(filter ? `/products?filter=${filter}` : '/products'),

  saveProduct: (product: Product): Promise<Product> => {
    const { id, ...payload } = product;
    return id
      ? http.put<Product>(`/products/${id}`, product)
      : http.post<Product>('/products', payload);
  },

  deleteProduct: (id: string): Promise<void> =>
    http.delete<void>(`/products/${id}`),

  // Invoices
  getInvoices: (): Promise<Invoice[]> => http.get<Invoice[]>('/invoices'),

  getInvoice: (id: string): Promise<Invoice> => http.get<Invoice>(`/invoices/${id}`),

  createInvoice: (payload: CreateInvoicePayload): Promise<Invoice> =>
    http.post<Invoice>('/invoices', payload),

  // Audit Logs
  getAuditLogs: (): Promise<AuditLog[]> => http.get<AuditLog[]>('/audit-logs'),

  // Users
  getUsers: (): Promise<User[]> => http.get<User[]>('/users'),

  saveUser: (user: User & { password?: string }): Promise<User> => {
    const { id, ...rest } = user;
    return id
      ? http.put<User>(`/users/${id}`, rest)
      : http.post<User>('/users', rest);
  },

  deleteUser: (id: string): Promise<void> =>
    http.delete<void>(`/users/${id}`),

  // Dashboard / Reports
  getDashboardStats: (): Promise<DashboardStats> =>
    http.get<DashboardStats>('/reports/dashboard'),
};
