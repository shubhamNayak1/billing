
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { User, UserRole, Product, Invoice, AuditLog, InvoiceItem, DashboardStats } from './types';
import { api } from './services/api';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (username: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username: string) => {
    const users = await api.getUsers();
    const found = users.find(u => u.username === username);
    if (found) {
      setUser(found);
      localStorage.setItem('auth_user', JSON.stringify(found));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

// --- Shared Components ---
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 text-2xl font-bold">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

const Icons = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Billing: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  Inventory: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Invoices: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Reports: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Logs: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

// --- Page Views ---

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/', label: 'Dashboard', icon: Icons.Dashboard, roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER] },
    { to: '/billing', label: 'Billing', icon: Icons.Billing, roles: [UserRole.ADMIN, UserRole.OPERATOR] },
    { to: '/invoices', label: 'Invoices', icon: Icons.Invoices, roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER] },
    { to: '/inventory', label: 'Inventory', icon: Icons.Inventory, roles: [UserRole.ADMIN, UserRole.OPERATOR] },
    { to: '/reports', label: 'Reports', icon: Icons.Reports, roles: [UserRole.ADMIN, UserRole.VIEWER] },
    { to: '/gst-reports', label: 'GST Reports', icon: Icons.Reports, roles: [UserRole.ADMIN], tier2: true },
    { to: '/users', label: 'User Management', icon: Icons.Users, roles: [UserRole.ADMIN], tier2: true },
    { to: '/audit-logs', label: 'Audit Logs', icon: Icons.Logs, roles: [UserRole.ADMIN], tier2: true },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen text-slate-300 fixed left-0 top-0 overflow-y-auto z-50">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="bg-blue-600 p-1 rounded">OB</span> OmniBill Pro
        </h1>
        <p className="text-xs mt-1 text-slate-500">{user?.tier} Plan</p>
      </div>
      <nav className="mt-6">
        {links.map((link) => {
          if (!link.roles.includes(user?.role as UserRole)) return null;
          if (link.tier2 && user?.tier !== 'TIER-2') return null;

          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <link.icon />
              <span className="font-medium text-sm">{link.label}</span>
              {link.tier2 && (
                <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">PRO</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 fixed top-0 right-0 left-64 z-40 flex items-center justify-between px-8">
      <div className="text-sm text-slate-500 font-medium flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
          {user?.name.charAt(0)}
        </div>
        <div>
          Welcome, <span className="text-slate-900 font-bold">{user?.name}</span>
          <span className="ml-2 px-1.5 py-0.5 bg-slate-100 rounded text-[10px] border font-bold text-slate-600 uppercase tracking-tighter">{user?.role}</span>
        </div>
      </div>
      <button 
        onClick={logout}
        className="text-sm font-semibold text-slate-500 hover:text-red-600 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        Logout
      </button>
    </header>
  );
};

const Reports: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.getInvoices().then(setInvoices);
    api.getDashboardStats().then(setStats);
  }, []);

  const gstinSummary = useMemo(() => {
    const summary: Record<string, { count: number, total: number, tax: number }> = {};
    invoices.forEach(inv => {
      const gstin = inv.customerGstin || 'B2C (Unregistered)';
      if (!summary[gstin]) summary[gstin] = { count: 0, total: 0, tax: 0 };
      summary[gstin].count++;
      summary[gstin].total += inv.grandTotal;
      summary[gstin].tax += inv.totalTax;
    });
    return summary;
  }, [invoices]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-8">Business Analytics & Reports</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border shadow-sm">
          <h3 className="font-bold mb-6 text-slate-800">Sales Summary by Entity</h3>
          <div className="space-y-4">
            {Object.entries(gstinSummary).map(([gstin, data]: [string, any]) => (
              <div key={gstin} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div>
                  <p className="font-bold text-slate-900">{gstin}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{data.count} Bills Issued</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">₹{data.total.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 font-bold">VAT/GST: ₹{data.tax.toLocaleString()}</p>
                </div>
              </div>
            ))}
            {Object.keys(gstinSummary).length === 0 && <p className="text-center text-slate-400 italic py-8">No invoice data available for reporting.</p>}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="p-6 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
             <p className="text-xs font-bold uppercase text-blue-100 mb-1 tracking-widest">Aggregate Turnover</p>
             <p className="text-3xl font-black font-mono tracking-tighter">₹{stats?.monthlySales.toLocaleString() || '0'}</p>
          </div>
          <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-900/20">
             <p className="text-xs font-bold uppercase text-slate-400 mb-1 tracking-widest">Accrued Tax Liability</p>
             <p className="text-3xl font-black font-mono tracking-tighter text-emerald-400">₹{(invoices.reduce((acc, i) => acc + i.totalTax, 0)).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border rounded-2xl hover:border-blue-500 cursor-pointer transition-all shadow-sm group">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 font-bold group-hover:scale-110 transition-transform">S</div>
          <h3 className="font-bold">Sales Analysis Ledger</h3>
          <p className="text-xs text-slate-400 mt-2">Comprehensive item-wise sales volume and velocity report.</p>
          <button className="mt-4 text-[10px] font-bold text-blue-600 uppercase tracking-widest">Generate Analysis →</button>
        </div>
        <Link to="/gst-reports" className="p-6 bg-white border rounded-2xl hover:border-emerald-500 cursor-pointer transition-all shadow-sm group text-left">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4 font-bold group-hover:scale-110 transition-transform">G</div>
          <h3 className="font-bold">GSTR-1 Filling Tool</h3>
          <p className="text-xs text-slate-400 mt-2">Rate-wise tax breakup for B2B and B2C transactions.</p>
          <span className="mt-4 inline-block text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Open GST Tool →</span>
        </Link>
        <div className="p-6 bg-white border rounded-2xl hover:border-purple-500 cursor-pointer transition-all shadow-sm group">
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 font-bold group-hover:scale-110 transition-transform">P</div>
          <h3 className="font-bold">Valuation Summary</h3>
          <p className="text-xs text-slate-400 mt-2">Closing stock valuation and purchase cost analysis.</p>
          <button className="mt-4 text-[10px] font-bold text-purple-600 uppercase tracking-widest">View Inventory Val →</button>
        </div>
      </div>
    </div>
  );
};

const GstReports: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  useEffect(() => { api.getInvoices().then(setInvoices); }, []);

  const b2bInvoices = useMemo(() => invoices.filter(i => !!i.customerGstin), [invoices]);
  const b2cInvoices = useMemo(() => invoices.filter(i => !i.customerGstin), [invoices]);

  const taxSummary = useMemo(() => {
    return invoices.reduce((acc, inv) => {
      inv.items.forEach(item => {
        const rate = item.gstRate;
        if (!acc[rate]) acc[rate] = { taxable: 0, cgst: 0, sgst: 0, igst: 0 };
        acc[rate].taxable += (item.rate * item.qty);
        acc[rate].cgst += item.cgst;
        acc[rate].sgst += item.sgst;
        acc[rate].igst += item.igst;
      });
      return acc;
    }, {} as Record<number, { taxable: number, cgst: number, sgst: number, igst: number }>);
  }, [invoices]);

  return (
    <div className="p-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">GSTR-1 Tax Assistant</h2>
          <p className="text-slate-500 text-sm font-medium">Auto-aggregated tax slabs for monthly compliance.</p>
        </div>
        <button className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black shadow-xl shadow-emerald-500/20 text-sm flex items-center gap-2 active:scale-95 transition-all">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
           Export Offline JSON
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <h3 className="font-black text-slate-800 mb-6 flex justify-between items-center">
             B2B Invoices (Registered)
             <span className="text-[10px] bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">{b2bInvoices.length} Rows</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b text-slate-400 font-black uppercase tracking-[0.1em]">
                  <tr><th className="p-4 text-left">GSTIN ID</th><th className="p-4 text-right">Taxable Val</th><th className="p-4 text-right">Tax Accrued</th></tr>
              </thead>
              <tbody className="divide-y font-medium text-slate-600">
                  {b2bInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono font-black text-slate-900">{inv.customerGstin}</td>
                      <td className="p-4 text-right">₹{inv.subTotal.toFixed(2)}</td>
                      <td className="p-4 text-right font-black text-blue-600">₹{inv.totalTax.toFixed(2)}</td>
                    </tr>
                  ))}
                  {b2bInvoices.length === 0 && <tr><td colSpan={3} className="p-12 text-center text-slate-300 italic font-bold text-lg uppercase tracking-widest opacity-20">NULL SET</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <h3 className="font-black text-slate-800 mb-6 flex justify-between items-center">
             B2C (Consumer Others)
             <span className="text-[10px] bg-amber-100 text-amber-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">{b2cInvoices.length} Rows</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b text-slate-400 font-black uppercase tracking-[0.1em]">
                  <tr><th className="p-4 text-left">Customer</th><th className="p-4 text-right">Taxable Val</th><th className="p-4 text-right">Tax Accrued</th></tr>
              </thead>
              <tbody className="divide-y font-medium text-slate-600">
                  {b2cInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-black text-slate-900">{inv.customerName}</td>
                      <td className="p-4 text-right">₹{inv.subTotal.toFixed(2)}</td>
                      <td className="p-4 text-right font-black text-emerald-600">₹{inv.totalTax.toFixed(2)}</td>
                    </tr>
                  ))}
                  {b2cInvoices.length === 0 && <tr><td colSpan={3} className="p-12 text-center text-slate-300 italic font-bold text-lg uppercase tracking-widest opacity-20">NULL SET</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl border-8 border-slate-800">
         <h3 className="font-black text-xl mb-8 border-b border-slate-800 pb-6 tracking-tight text-center uppercase tracking-widest">HSN Classification & Rate Ledger</h3>
         <div className="overflow-x-auto">
          <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 font-black uppercase tracking-widest text-[10px] border-b border-slate-800">
                    <th className="p-5 text-left">Tax Slab</th>
                    <th className="p-5 text-right">Total Net Value</th>
                    <th className="p-5 text-right">CGST (50%)</th>
                    <th className="p-5 text-right">SGST (50%)</th>
                    <th className="p-5 text-right">IGST (100%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {/* Fixed type error by explicitly typing mapping arguments */}
                {Object.entries(taxSummary).map(([rate, data]: [string, any]) => (
                  <tr key={rate} className="hover:bg-white/5 transition-colors">
                      <td className="p-5 font-black text-blue-400 text-lg">{rate}%</td>
                      <td className="p-5 text-right font-black">₹{data.taxable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="p-5 text-right text-slate-500">₹{data.cgst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="p-5 text-right text-slate-500">₹{data.sgst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="p-5 text-right text-emerald-400 font-black text-lg">₹{data.igst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                {Object.keys(taxSummary).length === 0 && <tr><td colSpan={5} className="p-20 text-center text-slate-600 italic font-black text-2xl uppercase tracking-widest opacity-20">NO TAX DATA</td></tr>}
              </tbody>
          </table>
         </div>
      </div>
    </div>
  );
};

// --- Missing Modals ---
const UserModal: React.FC<{ isOpen: boolean; onClose: () => void; user?: User; onSave: () => void }> = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    username: '',
    role: UserRole.OPERATOR,
    tier: 'TIER-1'
  });

  useEffect(() => {
    if (user) setFormData(user);
    else setFormData({ name: '', username: '', role: UserRole.OPERATOR, tier: 'TIER-1' });
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.saveUser({ ...formData, id: user?.id } as User);
    onSave();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Edit Staff Member' : 'Enroll Staff Member'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
          <input required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
          <input required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
            <select className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.OPERATOR}>Operator</option>
              <option value={UserRole.VIEWER}>Viewer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tier</label>
            <select className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value as 'TIER-1' | 'TIER-2'})}>
              <option value="TIER-1">Tier 1 (Basic)</option>
              <option value="TIER-2">Tier 2 (Pro)</option>
            </select>
          </div>
        </div>
        <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold mt-4">Save Profile</button>
      </form>
    </Modal>
  );
};

const ProductModal: React.FC<{ isOpen: boolean; onClose: () => void; product?: Product; onSave: () => void }> = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    hsnCode: '',
    gstRate: 12,
    category: '',
    basePrice: 0,
    unit: 'Unit',
    totalStock: 0,
    lowStockThreshold: 5,
    barcode: ''
  });

  useEffect(() => {
    if (product) setFormData(product);
    else setFormData({ name: '', hsnCode: '', gstRate: 12, category: '', basePrice: 0, unit: 'Unit', totalStock: 0, lowStockThreshold: 5, barcode: '' });
  }, [product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.saveProduct({ ...formData, id: product?.id } as Product);
    onSave();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Update Asset' : 'Register New Asset'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Product Name</label>
            <input required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">HSN Code</label>
            <input required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.hsnCode || ''} onChange={e => setFormData({...formData, hsnCode: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">GST Rate (%)</label>
            <select className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.gstRate} onChange={e => setFormData({...formData, gstRate: Number(e.target.value)})}>
              <option value={5}>5%</option>
              <option value={12}>12%</option>
              <option value={18}>18%</option>
              <option value={28}>28%</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Base Price</label>
            <input type="number" required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.basePrice || 0} onChange={e => setFormData({...formData, basePrice: Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unit</label>
            <input required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.unit || ''} onChange={e => setFormData({...formData, unit: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Initial Stock</label>
            <input type="number" required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.totalStock || 0} onChange={e => setFormData({...formData, totalStock: Number(e.target.value)})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Low Stock Alert</label>
            <input type="number" required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.lowStockThreshold || 0} onChange={e => setFormData({...formData, lowStockThreshold: Number(e.target.value)})} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Barcode</label>
            <input className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.barcode || ''} onChange={e => setFormData({...formData, barcode: e.target.value})} />
          </div>
        </div>
        <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold mt-4">Save Asset</button>
      </form>
    </Modal>
  );
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();

  const load = () => api.getUsers().then(setUsers);
  useEffect(() => { load(); }, []);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Irrevocably remove access for this staff member?')) {
      await api.deleteUser(id);
      load();
    }
  };

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            Staff Access Control
            <span className="text-[10px] bg-blue-600 text-white px-3 py-1 rounded-full shadow-lg shadow-blue-500/20 font-black uppercase tracking-widest">ENTERPRISE HUB</span>
          </h2>
          <p className="text-slate-500 font-medium mt-1">Manage institutional roles and operational permissions.</p>
        </div>
        <button 
          onClick={() => { setSelectedUser(undefined); setModalOpen(true); }}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-slate-900/20 text-sm flex items-center gap-2 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Enroll Staff
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.map(u => (
          <div key={u.id} className="bg-white border-2 border-slate-50 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl border-2 border-white shadow-inner">{u.name.charAt(0)}</div>
              <div>
                <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">{u.name}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">@{u.username}</p>
              </div>
            </div>
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                <span>Access Role</span>
                <span className={`px-3 py-1 rounded-full font-black border ${u.role === UserRole.ADMIN ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{u.role}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                <span>Enterprise Tier</span>
                <span className="text-slate-800 font-black">{u.tier}</span>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => handleEdit(u)}
                className="flex-1 bg-slate-900 text-white py-3 rounded-2xl text-xs font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
              >
                Modify Access
              </button>
              <button 
                onClick={() => handleDelete(u.id)}
                className="px-4 bg-red-50 text-red-500 py-3 rounded-2xl text-xs font-black hover:bg-red-100 transition-all border-2 border-red-50 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        ))}
        {users.length === 0 && <div className="col-span-full p-20 text-center text-slate-400 italic font-black text-2xl uppercase tracking-widest opacity-20">NO PROFILES RECORDED</div>}
      </div>

      <UserModal isOpen={modalOpen} onClose={() => setModalOpen(false)} user={selectedUser} onSave={load} />
    </div>
  );
};

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');

  const load = () => api.getProducts().then(setProducts);
  useEffect(() => { load(); }, []);

  const filteredProducts = useMemo(() => {
    if (filter === 'low-stock') {
      return products.filter(p => p.totalStock <= p.lowStockThreshold);
    }
    return products;
  }, [products, filter]);

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Inventory Ledger</h2>
          {filter === 'low-stock' && <p className="text-red-600 font-black text-xs uppercase tracking-widest mt-1">Alert Mode: Critical Stock Level Filtering Active</p>}
        </div>
        <div className="flex gap-4">
          {filter === 'low-stock' && (
            <Link to="/inventory" className="text-xs bg-slate-200 px-5 py-2.5 rounded-xl font-black hover:bg-slate-300 transition-all uppercase tracking-widest">Reset Master View</Link>
          )}
          <button onClick={() => { setSelectedProduct(undefined); setModalOpen(true); }} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black shadow-xl shadow-slate-900/20 text-sm active:scale-95 transition-all">Register Asset</button>
        </div>
      </div>
      <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <tr><th className="p-6 text-left">Asset / Specification</th><th className="p-6 text-left">Barcode ID</th><th className="p-6 text-right">Unit Rate</th><th className="p-6 text-right">Physical Balance</th><th className="p-6 text-center">Operational Status</th><th className="p-6 text-center">Manage</th></tr>
          </thead>
          <tbody className="divide-y text-sm">
            {filteredProducts.map(p => (
              <tr key={p.id} className={`hover:bg-slate-50 transition-colors group ${p.totalStock <= p.lowStockThreshold ? 'bg-red-50/40' : ''}`}>
                <td className="p-6">
                   <p className="font-black text-slate-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">{p.name}</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">HSN: {p.hsnCode} | CAT: {p.category}</p>
                </td>
                <td className="p-6 text-xs font-mono text-slate-500 font-bold tracking-widest">{p.barcode || '---'}</td>
                <td className="p-6 text-right font-black text-slate-900">₹{p.basePrice.toLocaleString()}</td>
                <td className="p-6 text-right">
                  <span className={p.totalStock <= p.lowStockThreshold ? 'text-red-600 font-black text-xl' : 'text-slate-800 font-black text-xl'}>
                    {p.totalStock}
                  </span>
                  <span className="text-[10px] text-slate-400 font-black ml-1 uppercase">{p.unit}</span>
                  <div className="text-[9px] text-slate-400 font-black uppercase mt-1 tracking-tighter">Min Level: {p.lowStockThreshold}</div>
                </td>
                <td className="p-6 text-center">
                   {p.totalStock <= p.lowStockThreshold ? 
                    <span className="px-3 py-1 bg-red-600 text-white text-[9px] rounded-full font-black shadow-lg shadow-red-500/30 animate-pulse">CRITICAL</span> : 
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] rounded-full font-black">HEALTHY</span>}
                </td>
                <td className="p-6 text-center">
                  <button onClick={() => { setSelectedProduct(p); setModalOpen(true); }} className="text-blue-600 font-black text-xs mr-5 hover:underline decoration-2">Modify</button>
                  <button className="text-red-400 font-black text-xs hover:text-red-600 transition-colors">Retire</button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr><td colSpan={6} className="p-32 text-center text-slate-400 italic font-black text-3xl opacity-10 uppercase tracking-[0.5em]">Ledger Clear</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <ProductModal isOpen={modalOpen} onClose={() => setModalOpen(false)} product={selectedProduct} onSave={load} />
    </div>
  );
};

const Billing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<{ productId: string; productName: string; hsnCode: string; qty: number; rate: number; gstRate: number; total: number }[]>([]);
  const [customer, setCustomer] = useState({ name: '', gstin: '', state: 'Maharashtra' });
  const [search, setSearch] = useState('');

  useEffect(() => { api.getProducts().then(setProducts); }, []);

  const availableProducts = useMemo(() => {
    if (!search) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      (p.barcode && p.barcode.includes(search))
    );
  }, [products, search]);

  const addItem = (product: Product) => {
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      setItems(items.map(i => i.productId === product.id ? { 
        ...i, 
        qty: i.qty + 1, 
        total: (i.qty + 1) * i.rate * (1 + i.gstRate / 100) 
      } : i));
    } else {
      setItems([...items, {
        productId: product.id,
        productName: product.name,
        hsnCode: product.hsnCode,
        qty: 1,
        rate: product.basePrice,
        gstRate: product.gstRate,
        total: product.basePrice * (1 + product.gstRate / 100)
      }]);
    }
    setSearch('');
  };

  const handleCreate = async () => {
    if (!customer.name || items.length === 0) {
      alert('Verification Failed: Customer profile or line items are missing.');
      return;
    }
    
    const subTotal = items.reduce((acc, i) => acc + (i.rate * i.qty), 0);
    const totalTax = items.reduce((acc, i) => acc + (i.rate * i.qty * i.gstRate / 100), 0);
    const grandTotal = subTotal + totalTax;

    const invoiceItems: InvoiceItem[] = items.map(item => {
      const tax = item.rate * item.qty * item.gstRate / 100;
      const isInterState = customer.state !== 'Maharashtra';
      return {
        ...item,
        cgst: isInterState ? 0 : tax / 2,
        sgst: isInterState ? 0 : tax / 2,
        igst: isInterState ? tax : 0,
        total: (item.rate * item.qty) + tax
      };
    });

    const invoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      invoiceNo: `INV/${new Date().getFullYear()}/${Math.floor(Math.random()*1000).toString().padStart(3, '0')}`,
      date: new Date().toISOString(),
      customerName: customer.name,
      customerGstin: customer.gstin,
      customerState: customer.state,
      items: invoiceItems,
      subTotal,
      totalTax,
      grandTotal,
      createdBy: user?.name || 'System'
    };

    await api.createInvoice(invoice);
    navigate('/invoices');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Billing Terminal</h2>
          <p className="text-slate-500 font-medium text-sm">Compliant B2B & B2C tax invoicing.</p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => navigate('/invoices')} className="px-5 py-2.5 text-slate-500 font-black hover:bg-slate-100 rounded-2xl transition-all">Cancel Draft</button>
           <button onClick={handleCreate} className="px-8 py-2.5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95">Complete Transaction</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Customer Dossier</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 lg:col-span-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Entity Name</label>
                <input required placeholder="Client / Business Name" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
              </div>
              <div className="col-span-2 lg:col-span-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">GSTIN Identifier</label>
                <input placeholder="Optional for B2C" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase font-mono font-bold" value={customer.gstin} onChange={e => setCustomer({...customer, gstin: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Place of Supply</label>
                <select className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold" value={customer.state} onChange={e => setCustomer({...customer, state: e.target.value})}>
                  <option value="Maharashtra">Maharashtra (Intra-state)</option>
                  <option value="Gujarat">Gujarat (Inter-state)</option>
                  <option value="Delhi">Delhi (Inter-state)</option>
                  <option value="Karnataka">Karnataka (Inter-state)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Catalog Selection</h3>
            <div className="relative">
              <input 
                placeholder="Scan Item or Type Name..." 
                className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-blue-500 pl-16 transition-all font-black text-xl"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <svg className="w-8 h-8 absolute left-6 top-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              
              {search && (
                <div className="absolute top-full left-0 right-0 bg-white border-2 border-slate-100 rounded-[2rem] mt-4 shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {availableProducts.length > 0 ? availableProducts.map(p => (
                    <button 
                      key={p.id} 
                      onClick={() => addItem(p)}
                      className="w-full p-6 text-left hover:bg-blue-50 flex justify-between items-center border-b last:border-0 transition-all"
                    >
                      <div>
                        <p className="font-black text-slate-900 text-xl">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">HSN: {p.hsnCode} | GST: {p.gstRate}%</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-blue-600 text-xl">₹{p.basePrice.toLocaleString()}</p>
                        <p className={`text-[10px] font-black uppercase ${p.totalStock <= p.lowStockThreshold ? 'text-red-500' : 'text-slate-400'}`}>Stock: {p.totalStock}</p>
                      </div>
                    </button>
                  )) : <div className="p-10 text-center text-slate-400 italic font-black text-lg">No assets match criteria.</div>}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
             <table className="w-full text-sm">
               <thead className="bg-slate-50 border-b text-slate-400 font-black uppercase text-[10px] tracking-widest">
                 <tr>
                   <th className="p-6 text-left">Asset</th>
                   <th className="p-6 text-center">Qty</th>
                   <th className="p-6 text-right">Base</th>
                   <th className="p-6 text-right">Tax</th>
                   <th className="p-6 text-right">Gross</th>
                   <th className="p-6"></th>
                 </tr>
               </thead>
               <tbody className="divide-y font-bold">
                 {items.map((item, idx) => (
                   <tr key={idx} className="hover:bg-slate-50 transition-colors">
                     <td className="p-6 font-black text-slate-900 text-base">{item.productName}</td>
                     <td className="p-6 text-center">
                       <div className="flex items-center justify-center gap-3">
                         <button onClick={() => {
                           const n = Math.max(1, item.qty - 1);
                           setItems(items.map((it, i) => i === idx ? { ...it, qty: n, total: n * it.rate * (1 + it.gstRate / 100) } : it));
                         }} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all">-</button>
                         <span className="font-black text-slate-900 text-xl min-w-[2rem]">{item.qty}</span>
                         <button onClick={() => {
                           const n = item.qty + 1;
                           setItems(items.map((it, i) => i === idx ? { ...it, qty: n, total: n * it.rate * (1 + it.gstRate / 100) } : it));
                         }} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all">+</button>
                       </div>
                     </td>
                     <td className="p-6 text-right font-black text-slate-600">₹{item.rate.toLocaleString()}</td>
                     <td className="p-6 text-right text-slate-400">{item.gstRate}%</td>
                     <td className="p-6 text-right font-black text-slate-900 text-lg">₹{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                     <td className="p-6 text-center">
                        <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-red-200 hover:text-red-600 transition-all p-3 rounded-2xl hover:bg-red-50">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                     </td>
                   </tr>
                 ))}
                 {items.length === 0 && (
                   <tr><td colSpan={6} className="p-24 text-center text-slate-400 italic font-black text-xl uppercase opacity-20 tracking-widest">Draft is Clear</td></tr>
                 )}
               </tbody>
             </table>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-2xl sticky top-24 border-8 border-slate-800">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-10 text-center">Verification Dashboard</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center group">
                  <span className="text-slate-500 font-black text-xs uppercase tracking-widest group-hover:text-slate-300 transition-colors">Net Valuation</span>
                  <span className="font-black text-2xl">₹{items.reduce((acc, i) => acc + (i.rate * i.qty), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-slate-500 font-black text-xs uppercase tracking-widest group-hover:text-slate-300 transition-colors">Total Tax (GST)</span>
                  <span className="text-emerald-400 font-black text-2xl">₹{items.reduce((acc, i) => acc + (i.rate * i.qty * i.gstRate / 100), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-10 border-t border-slate-800 mt-10 text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.4em] mb-4">Payable Aggregate</p>
                    <p className="text-6xl font-black text-white tracking-tighter shadow-sm">₹{(items.reduce((acc, i) => acc + i.total, 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
              <button 
                disabled={items.length === 0}
                onClick={handleCreate}
                className="w-full mt-12 py-6 bg-blue-600 rounded-[2rem] font-black text-2xl hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-10 disabled:grayscale disabled:cursor-not-allowed shadow-3xl shadow-blue-500/40 border-b-8 border-blue-900"
              >
                AUTHORIZE SALE
              </button>
           </div>
           <div className="p-8 bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm text-center group">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Compliance Integrity</p>
              <div className="flex items-center justify-center gap-2 text-emerald-500 font-black text-sm group-hover:scale-110 transition-transform">
                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                 TAX SLABS VALIDATED
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const navigate = useNavigate();

  useEffect(() => { api.getDashboardStats().then(setStats); }, []);
  if (!stats) return <div className="p-16 flex items-center justify-center font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Synchronizing Terminal...</div>;

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900">Operations Command</h2>
          <p className="text-slate-500 font-bold text-lg">Real-time enterprise metrics & logistics health.</p>
        </div>
        <div className="text-right bg-white p-4 rounded-3xl border shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">System Epoch</p>
           <p className="text-xl font-black text-slate-900 tracking-tight">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="p-8 bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all group">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2 group-hover:text-blue-600 transition-colors">Daily Revenue</p>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{stats.todaySales.toLocaleString()}</p>
        </div>
        <div className="p-8 bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all group">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2 group-hover:text-blue-600 transition-colors">Monthly turnover</p>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{stats.monthlySales.toLocaleString()}</p>
        </div>
        <button 
          onClick={() => navigate('/inventory?filter=low-stock')}
          className={`p-8 border-2 rounded-[2.5rem] shadow-sm text-left transition-all active:scale-95 group overflow-hidden relative ${stats.lowStockItems > 0 ? 'bg-red-600 text-white border-red-700 shadow-xl shadow-red-600/20' : 'bg-white border-slate-50 hover:shadow-2xl'}`}
        >
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${stats.lowStockItems > 0 ? 'text-red-200' : 'text-slate-400'}`}>Inventory Shortage</p>
          <div className="flex items-center justify-between">
            <p className="text-4xl font-black tracking-tighter">{stats.lowStockItems}</p>
            {stats.lowStockItems > 0 && (
              <span className="text-[10px] bg-white text-red-600 px-3 py-1.5 rounded-full font-black animate-pulse shadow-inner uppercase">Action Required</span>
            )}
          </div>
          <p className={`text-[10px] mt-4 font-black uppercase tracking-widest ${stats.lowStockItems > 0 ? 'text-red-100 underline decoration-2' : 'text-slate-400'}`}>Drill down criticals →</p>
        </button>
        <div className="p-8 bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all group">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2 group-hover:text-blue-600 transition-colors">Active Vouchers</p>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats.activeInvoices}</p>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm relative group overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-500/10 transition-all duration-1000"></div>
           <h3 className="font-black text-2xl mb-8 flex items-center gap-4 text-slate-900">
             Logistics Analytics
             <span className="h-3 w-3 bg-blue-600 rounded-full animate-ping shadow-lg shadow-blue-500/50"></span>
           </h3>
           <div className="space-y-8 relative z-10">
              <div className="h-6 w-full bg-slate-100 rounded-3xl overflow-hidden border-2 border-slate-100 shadow-inner p-1">
                <div className="h-full bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 w-4/5 rounded-2xl shadow-lg transition-all duration-1000 ease-out"></div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:shadow-inner transition-all">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Growth Sector</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tight uppercase">Pharma Ledger</p>
                </div>
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:shadow-inner transition-all">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Unit Efficiency</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tight">₹4,250 <span className="text-[10px] text-slate-400 uppercase">/ Bill</span></p>
                </div>
              </div>
              <p className="text-lg text-slate-500 italic font-bold leading-relaxed opacity-80">"Advanced Logic Insight: Stock velocity for 'Sanitizer' indicates imminent stockout. Predicted loss potential: ₹25k / day."</p>
           </div>
         </div>
         <div className="bg-slate-900 p-10 rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden group border-8 border-slate-800">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-blue-600/40 transition-all duration-700"></div>
            <h3 className="font-black text-2xl mb-8 text-white tracking-tight uppercase tracking-widest">Master Workflow</h3>
            <div className="space-y-6 relative z-10">
               <Link to="/billing" className="block w-full text-center py-6 bg-blue-600 text-white rounded-[1.5rem] font-black text-2xl hover:bg-blue-500 shadow-2xl shadow-blue-600/40 transition-all active:scale-95 border-b-4 border-blue-800">START BILLING</Link>
               <Link to="/reports" className="block w-full text-center py-4 bg-slate-800 text-slate-400 rounded-2xl font-black text-lg hover:bg-slate-700 hover:text-white transition-all tracking-widest uppercase">Analytics Hub</Link>
               <Link to="/inventory" className="block w-full text-center py-4 bg-slate-800 text-slate-400 rounded-2xl font-black text-lg hover:bg-slate-700 hover:text-white transition-all tracking-widest uppercase">Asset Ledger</Link>
            </div>
         </div>
      </div>
    </div>
  );
};

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [selected, setSelected] = useState('admin');
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] p-6">
      <div className="bg-white p-16 rounded-[4rem] shadow-3xl w-full max-w-lg text-center animate-in fade-in zoom-in duration-500 relative overflow-hidden border-8 border-slate-50">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
        <div className="mb-12">
          <div className="w-24 h-24 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-600/40 mb-6 border-4 border-white transform rotate-3 hover:rotate-0 transition-transform cursor-default select-none">OB</div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase tracking-[0.1em]">OmniBill Pro</h1>
          <p className="text-slate-400 text-sm mt-3 font-black uppercase tracking-[0.3em] opacity-60">Enterprise ERP Simulation</p>
        </div>
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-left ml-4 mb-2">Select Operator Context</label>
            <select className="w-full p-5 border-4 border-slate-50 rounded-3xl font-black text-slate-800 bg-slate-50 focus:border-blue-500 focus:bg-white transition-all outline-none text-lg appearance-none cursor-pointer" value={selected} onChange={e => setSelected(e.target.value)}>
              <option value="admin">Institutional Administrator</option>
              <option value="billing">Terminal Operator</option>
              <option value="viewer">Audit Auditor (View-Only)</option>
            </select>
          </div>
          <button onClick={() => login(selected)} className="w-full bg-blue-600 py-6 rounded-[2rem] text-white font-black text-2xl hover:bg-blue-700 hover:shadow-2xl transition-all active:scale-95 shadow-xl shadow-blue-600/30 border-b-8 border-blue-900">INITIALIZE SESSION</button>
        </div>
        <p className="mt-12 text-[10px] text-slate-300 uppercase tracking-[0.5em] font-black select-none">Validated Cloud Enterprise Architecture</p>
      </div>
    </div>
  );
};

// --- Missing Components Implementation ---
const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  useEffect(() => { api.getInvoices().then(setInvoices); }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Invoices Ledger</h2>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <tr><th className="p-4 text-left">Invoice No</th><th className="p-4 text-left">Date</th><th className="p-4 text-left">Customer</th><th className="p-4 text-right">Amount</th><th className="p-4 text-center">Status</th></tr>
          </thead>
          <tbody className="divide-y text-sm">
            {invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold">{inv.invoiceNo}</td>
                <td className="p-4 text-slate-500">{new Date(inv.date).toLocaleDateString()}</td>
                <td className="p-4 font-medium">{inv.customerName}</td>
                <td className="p-4 text-right font-bold">₹{inv.grandTotal.toLocaleString()}</td>
                <td className="p-4 text-center">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] rounded-full font-bold">PAID</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  useEffect(() => { api.getAuditLogs().then(setLogs); }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">System Audit Logs</h2>
      <div className="space-y-4">
        {logs.map(log => (
          <div key={log.id} className="bg-white p-4 rounded-xl border flex items-center gap-4">
            <div className="text-xs font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</div>
            <div className="font-bold text-blue-600 w-32">{log.action}</div>
            <div className="flex-1 text-sm">{log.details}</div>
            <div className="text-xs font-bold text-slate-400">by {log.userName}</div>
          </div>
        ))}
        {logs.length === 0 && <div className="p-20 text-center text-slate-400 italic font-black text-xl uppercase tracking-widest opacity-20">NO AUDIT RECORDS</div>}
      </div>
    </div>
  );
};

// --- Routing Component ---
const AppRoutes = () => {
  const { user } = useAuth();
  if (!user) return <LoginPage />;

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/gst-reports" element={<GstReports />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="pt-16 flex-1 bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')]">{children}</main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
