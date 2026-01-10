
import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
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
