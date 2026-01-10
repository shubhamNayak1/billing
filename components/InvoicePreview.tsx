
import React from 'react';
import { Invoice } from '../types';

export const InvoicePreview: React.FC<{ invoice: Invoice }> = ({ invoice }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-8 border shadow-sm max-w-4xl mx-auto font-sans" id="printable-invoice">
      <div className="flex justify-between items-start mb-8 border-b pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tighter">OmniBill Pro</h1>
          <p className="text-sm text-slate-500 font-medium">Retailers & SME Solutions Inc.</p>
          <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">GSTIN: 27AABCO0000Z1Z5</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-black text-blue-600">TAX INVOICE</h2>
          <p className="text-sm font-bold mt-2">No: <span className="text-slate-900">{invoice.invoiceNo}</span></p>
          <p className="text-xs text-slate-500 uppercase font-bold mt-1">Date: {new Date(invoice.date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Billed To:</p>
          <p className="text-lg font-black text-slate-900 leading-tight">{invoice.customerName}</p>
          <p className="text-sm text-slate-600 mt-1 font-medium tracking-tight">GSTIN: {invoice.customerGstin || 'UNREGISTERED/CONSUMER'}</p>
          <p className="text-xs text-slate-500 uppercase font-bold mt-0.5">Supply Place: {invoice.customerState}</p>
        </div>
      </div>

      <table className="w-full text-xs mb-8">
        <thead>
          <tr className="bg-slate-900 text-white">
            <th className="px-4 py-3 text-left uppercase tracking-widest font-black">Description</th>
            <th className="px-4 py-3 text-left uppercase tracking-widest font-black">HSN</th>
            <th className="px-4 py-3 text-right uppercase tracking-widest font-black">Qty</th>
            <th className="px-4 py-3 text-right uppercase tracking-widest font-black">Rate</th>
            <th className="px-4 py-3 text-right uppercase tracking-widest font-black">GST</th>
            <th className="px-4 py-3 text-right uppercase tracking-widest font-black">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y border-x border-b">
          {invoice.items.map((item, idx) => (
            <tr key={idx} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-bold text-slate-900">{item.productName}</td>
              <td className="px-4 py-3 text-slate-400 font-mono">{item.hsnCode}</td>
              <td className="px-4 py-3 text-right font-medium">{item.qty}</td>
              <td className="px-4 py-3 text-right">₹{item.rate.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-slate-500">{item.gstRate}%</td>
              <td className="px-4 py-3 text-right font-black">₹{item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-12">
        <div className="w-72 space-y-2 border-t pt-6">
          <div className="flex justify-between text-slate-500 font-medium">
            <span>Taxable Val:</span>
            <span>₹{invoice.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-slate-500 font-medium">
            <span>GST Amount:</span>
            <span className="text-emerald-600">₹{invoice.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-2xl font-black text-slate-900 border-t border-slate-900 pt-3 mt-4">
            <span className="uppercase tracking-tighter">Net Total:</span>
            <span className="text-blue-600">₹{invoice.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-slate-400 border-t pt-6 space-y-1 font-medium">
        <p>• Certified that information provided above is true and correct.</p>
        <p>• Goods once sold cannot be returned unless expired/damaged at time of delivery.</p>
        <p className="mt-8 text-center font-black text-slate-900 uppercase tracking-widest">This is a Computer Generated Tax Invoice</p>
      </div>

      <button 
        onClick={handlePrint}
        className="mt-12 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all no-print shadow-xl shadow-slate-900/20 active:scale-[0.98]"
      >
        Print Tax Invoice
      </button>
    </div>
  );
};
