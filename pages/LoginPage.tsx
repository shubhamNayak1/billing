
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Username and password are required');
      return;
    }
    setLoading(true);
    const result = await login(username.trim(), password);
    setLoading(false);
    if (!result.ok) setError(result.error || 'Login failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] p-6">
      <div className="bg-white p-16 rounded-[4rem] shadow-3xl w-full max-w-lg text-center animate-in fade-in zoom-in duration-500 relative overflow-hidden border-8 border-slate-50">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
        <div className="mb-12">
          <div className="w-24 h-24 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-600/40 mb-6 border-4 border-white transform rotate-3 hover:rotate-0 transition-transform cursor-default select-none">OB</div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase tracking-[0.1em]">OmniBill Pro</h1>
          <p className="text-slate-400 text-sm mt-3 font-black uppercase tracking-[0.3em] opacity-60">Enterprise ERP Simulation</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-left ml-4 mb-2">Username</label>
            <input
              type="text"
              autoComplete="username"
              className="w-full p-5 border-4 border-slate-50 rounded-3xl font-black text-slate-800 bg-slate-50 focus:border-blue-500 focus:bg-white transition-all outline-none text-lg"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-left ml-4 mb-2">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full p-5 border-4 border-slate-50 rounded-3xl font-black text-slate-800 bg-slate-50 focus:border-blue-500 focus:bg-white transition-all outline-none text-lg"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm font-black uppercase tracking-widest bg-red-50 border-2 border-red-100 rounded-2xl p-3">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 py-6 rounded-[2rem] text-white font-black text-2xl hover:bg-blue-700 hover:shadow-2xl transition-all active:scale-95 shadow-xl shadow-blue-600/30 border-b-8 border-blue-900 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'AUTHENTICATING…' : 'INITIALIZE SESSION'}
          </button>
        </form>
        <div className="mt-10 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] space-y-1">
          <p className="opacity-70">Demo Credentials</p>
          <p className="opacity-50">admin / admin123 — billing / billing123 — viewer / viewer123</p>
        </div>
      </div>
    </div>
  );
};
