
import { Product, Invoice, AuditLog, User, DashboardStats } from '../types';
import { MOCK_PRODUCTS, MOCK_INVOICES, MOCK_USERS } from './mockData';

const getStorage = <T,>(key: string, initial: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : initial;
};

const setStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const api = {
  // Products
  getProducts: async (): Promise<Product[]> => {
    return getStorage('products', MOCK_PRODUCTS);
  },
  saveProduct: async (product: Product): Promise<Product> => {
    const products = getStorage('products', MOCK_PRODUCTS);
    const existingIdx = products.findIndex(p => p.id === product.id);
    let updatedProduct = { ...product };
    
    if (existingIdx > -1) {
      products[existingIdx] = updatedProduct;
    } else {
      updatedProduct.id = Math.random().toString(36).substr(2, 9);
      products.push(updatedProduct);
    }
    setStorage('products', products);
    
    api.logAudit({
      id: Math.random().toString(),
      userId: 'system',
      userName: 'Admin',
      action: existingIdx > -1 ? 'PRODUCT_UPDATED' : 'PRODUCT_CREATED',
      details: `${updatedProduct.name} (Stock: ${updatedProduct.totalStock})`,
      timestamp: new Date().toISOString()
    });
    
    return updatedProduct;
  },
  deleteProduct: async (id: string): Promise<void> => {
    const products = getStorage<Product[]>('products', MOCK_PRODUCTS);
    const target = products.find(p => p.id === id);
    const filtered = products.filter(p => p.id !== id);
    setStorage('products', filtered);
    api.logAudit({
      id: Math.random().toString(),
      userId: 'system',
      userName: 'Admin',
      action: 'PRODUCT_DELETED',
      details: target ? `${target.name} (HSN: ${target.hsnCode})` : `id=${id}`,
      timestamp: new Date().toISOString()
    });
  },

  // Invoices
  getInvoices: async (): Promise<Invoice[]> => {
    return getStorage('invoices', MOCK_INVOICES);
  },
  createInvoice: async (invoice: Invoice): Promise<Invoice> => {
    const invoices = getStorage('invoices', MOCK_INVOICES);
    const products = getStorage('products', MOCK_PRODUCTS);

    // Deduct stock
    invoice.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) {
        prod.totalStock -= item.qty;
      }
    });

    invoices.unshift(invoice);
    setStorage('invoices', invoices);
    setStorage('products', products);
    
    api.logAudit({
      id: Math.random().toString(),
      userId: 'system',
      userName: invoice.createdBy,
      action: 'INVOICE_CREATED',
      details: `Invoice ${invoice.invoiceNo} for ${invoice.customerName} - Total: ₹${invoice.grandTotal}`,
      timestamp: new Date().toISOString()
    });

    return invoice;
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLog[]> => {
    return getStorage('audit_logs', []);
  },
  logAudit: async (log: AuditLog): Promise<void> => {
    const logs = getStorage('audit_logs', []);
    logs.unshift(log);
    setStorage('audit_logs', logs);
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    return getStorage('users_db', MOCK_USERS);
  },
  saveUser: async (user: User): Promise<User> => {
    const users = getStorage('users_db', MOCK_USERS);
    const existingIdx = users.findIndex(u => u.id === user.id);
    let updatedUser = { ...user };
    
    if (existingIdx > -1) {
      users[existingIdx] = updatedUser;
    } else {
      updatedUser.id = Math.random().toString(36).substr(2, 9);
      users.push(updatedUser);
    }
    setStorage('users_db', users);
    
    api.logAudit({
      id: Math.random().toString(),
      userId: 'system',
      userName: 'Admin',
      action: existingIdx > -1 ? 'USER_UPDATED' : 'USER_CREATED',
      details: `User ${updatedUser.name} (${updatedUser.role})`,
      timestamp: new Date().toISOString()
    });
    
    return updatedUser;
  },
  deleteUser: async (id: string): Promise<void> => {
    const users = getStorage('users_db', MOCK_USERS);
    const filtered = users.filter(u => u.id !== id);
    setStorage('users_db', filtered);
  },

  // Dashboard Stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    const invoices = await api.getInvoices();
    const products = await api.getProducts();
    
    const today = new Date().toISOString().split('T')[0];
    const todaySales = invoices
      .filter(inv => inv.date.startsWith(today))
      .reduce((acc, inv) => acc + inv.grandTotal, 0);

    const monthlySales = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
    const lowStockItems = products.filter(p => p.totalStock <= p.lowStockThreshold).length;

    return {
      todaySales,
      monthlySales,
      lowStockItems,
      activeInvoices: invoices.length
    };
  }
};
