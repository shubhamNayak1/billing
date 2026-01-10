
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { UserModal } from '../components/UserModal';

export const UserManagement: React.FC = () => {
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
