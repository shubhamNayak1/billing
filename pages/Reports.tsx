
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Invoice, DashboardStats } from '../types';
import { api } from '../services/api';

export const Reports: React.FC = () => {
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
