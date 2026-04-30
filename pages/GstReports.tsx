
import React, { useState, useEffect, useMemo } from 'react';
import { Invoice } from '../types';
import { api } from '../services/api';

export const GstReports: React.FC = () => {
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

  const handleExport = () => {
    const period = new Date().toISOString().slice(0, 7);
    const payload = {
      gstr: 'GSTR-1',
      period,
      generatedAt: new Date().toISOString(),
      b2b: b2bInvoices.map(inv => ({
        invoiceNo: inv.invoiceNo,
        date: inv.date,
        gstin: inv.customerGstin,
        customerName: inv.customerName,
        placeOfSupply: inv.customerState,
        taxableValue: inv.subTotal,
        totalTax: inv.totalTax,
        invoiceValue: inv.grandTotal,
        items: inv.items
      })),
      b2c: b2cInvoices.map(inv => ({
        invoiceNo: inv.invoiceNo,
        date: inv.date,
        customerName: inv.customerName,
        placeOfSupply: inv.customerState,
        taxableValue: inv.subTotal,
        totalTax: inv.totalTax,
        invoiceValue: inv.grandTotal
      })),
      hsnSummary: Object.entries(taxSummary).map(([rate, data]) => ({
        gstRate: Number(rate),
        taxableValue: Number(data.taxable.toFixed(2)),
        cgst: Number(data.cgst.toFixed(2)),
        sgst: Number(data.sgst.toFixed(2)),
        igst: Number(data.igst.toFixed(2))
      }))
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR1-${period}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">GSTR-1 Tax Assistant</h2>
          <p className="text-slate-500 text-sm font-medium">Auto-aggregated tax slabs for monthly compliance.</p>
        </div>
        <button onClick={handleExport} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black shadow-xl shadow-emerald-500/20 text-sm flex items-center gap-2 active:scale-95 transition-all hover:bg-emerald-700">
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
