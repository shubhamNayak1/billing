
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { api } from '../services/api';

export const Billing: React.FC = () => {
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
    try {
      await api.createInvoice({
        customerName: customer.name,
        customerGstin: customer.gstin || undefined,
        customerState: customer.state,
        items: items.map(i => ({ productId: i.productId, qty: i.qty, rate: i.rate })),
      });
      navigate('/invoices');
    } catch (e: any) {
      alert(e?.message || 'Failed to create invoice');
    }
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
                   <th className="p-6 text-right">Base Rate</th>
                   <th className="p-6 text-right">GST Rate</th>
                   <th className="p-6 text-right">Gross Total</th>
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
