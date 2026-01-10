
import React, { useState, useEffect } from 'react';
import { Invoice } from '../types';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { InvoicePreview } from '../components/InvoicePreview';

export const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [preview, setPreview] = useState<Invoice | null>(null);
  useEffect(() => { api.getInvoices().then(setInvoices); }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-black tracking-tighter">Sales Repository</h2>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Issued</p>
          <p className="text-lg font-black">{invoices.length} Bills</p>
        </div>
      </div>
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
            <tr><th className="p-5 text-left">Ref Number</th><th className="p-5 text-left">Time Stamp</th><th className="p-5 text-left">Constituent</th><th className="p-5 text-right">Net Value</th><th className="p-5 text-center">Action</th></tr>
          </thead>
          <tbody className="divide-y font-medium text-slate-600">
            {invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-5 font-mono font-black text-blue-600 tracking-tighter text-base group-hover:scale-105 transition-transform origin-left">{inv.invoiceNo}</td>
                <td className="p-5 text-slate-400 font-bold">{new Date(inv.date).toLocaleDateString()}</td>
                <td className="p-5 font-black text-slate-900">{inv.customerName}</td>
                <td className="p-5 text-right font-black text-slate-900 text-base">₹{inv.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="p-5 text-center"><button onClick={() => setPreview(inv)} className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-slate-800 shadow-md shadow-slate-900/10 active:scale-95 transition-all">VIEW DOCUMENT</button></td>
              </tr>
            ))}
            {invoices.length === 0 && <tr><td colSpan={5} className="p-20 text-center text-slate-400 italic font-black">Archive is empty.</td></tr>}
          </tbody>
        </table>
      </div>
      <Modal isOpen={!!preview} onClose={() => setPreview(null)} title="Official Tax Invoice Preview">
        {preview && <InvoicePreview invoice={preview} />}
      </Modal>
    </div>
  );
};
