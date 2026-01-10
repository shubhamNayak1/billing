
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardStats } from '../types';
import { api } from '../services/api';

export const Dashboard: React.FC = () => {
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
