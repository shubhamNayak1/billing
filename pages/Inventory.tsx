
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Product } from '../types';
import { api } from '../services/api';
import { ProductModal } from '../components/ProductModal';

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');

  const load = () => api.getProducts().then(setProducts);
  useEffect(() => { load(); }, []);

  const handleRetire = async (p: Product) => {
    if (confirm(`Retire "${p.name}" from the asset ledger? This cannot be undone.`)) {
      await api.deleteProduct(p.id);
      load();
    }
  };

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
                  <button onClick={() => handleRetire(p)} className="text-red-400 font-black text-xs hover:text-red-600 transition-colors">Retire</button>
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
