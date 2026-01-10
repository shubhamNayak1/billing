
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modal';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  onSave: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product, onSave }) => {
  const { user } = useAuth();
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
        
        {user?.tier === 'TIER-2' && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <h4 className="text-xs font-bold text-amber-700 uppercase mb-3 flex items-center gap-2">
               Advanced Logistics <span className="text-[8px] bg-amber-200 px-1.5 rounded-full font-black">PRO TIER</span>
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Batch Identifier" className="text-sm p-2 border rounded outline-none focus:ring-2 focus:ring-amber-500 bg-white" />
              <input type="date" className="text-sm p-2 border rounded outline-none focus:ring-2 focus:ring-amber-500 bg-white" />
            </div>
          </div>
        )}

        <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition shadow-xl shadow-blue-500/20 active:scale-[0.98] mt-4">
          {product ? 'Synchronize Catalog' : 'Finalize Stock Addition'}
        </button>
      </form>
    </Modal>
  );
};
