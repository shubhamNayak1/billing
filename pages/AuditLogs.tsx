
import React, { useState, useEffect } from 'react';
import { AuditLog } from '../types';
import { api } from '../services/api';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  useEffect(() => { api.getAuditLogs().then(setLogs); }, []);
  return (
    <div className="p-8">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter flex items-center gap-4">
            Security Audit Trail 
            <span className="text-[10px] bg-amber-500 text-white px-3 py-1 rounded-full shadow-lg shadow-amber-500/20 font-black uppercase tracking-widest">PRO TIER</span>
          </h2>
          <p className="text-slate-500 font-medium mt-1">Irrevocable log of every operation in the terminal.</p>
        </div>
      </div>
      <div className="bg-white rounded-3xl border shadow-sm divide-y">
        {logs.map(log => (
          <div key={log.id} className="p-5 flex items-center justify-between text-sm hover:bg-slate-50 transition-colors group">
            <div className="flex items-center gap-6">
               <div className="w-2.5 h-2.5 rounded-full bg-blue-600 group-hover:scale-125 transition-transform"></div>
               <div>
                  <span className="font-black text-blue-600 uppercase tracking-tighter text-xs px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-md">[{log.action}]</span>
                  <span className="mx-3 text-slate-400 font-bold">BY</span>
                  <span className="font-black text-slate-800 uppercase tracking-tight">{log.userName}</span>
                  <p className="text-sm text-slate-500 mt-2 font-medium">{log.details}</p>
               </div>
            </div>
            <div className="text-xs font-black font-mono text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border">{new Date(log.timestamp).toLocaleString()}</div>
          </div>
        ))}
        {logs.length === 0 && <div className="p-20 text-center text-slate-400 italic font-black text-lg">System trail is clean. No logged operations.</div>}
      </div>
    </div>
  );
};
