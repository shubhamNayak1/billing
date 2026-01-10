
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Icons } from './Icons';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/', label: 'Dashboard', icon: Icons.Dashboard, roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER] },
    { to: '/billing', label: 'Billing', icon: Icons.Billing, roles: [UserRole.ADMIN, UserRole.OPERATOR] },
    { to: '/invoices', label: 'Invoices', icon: Icons.Invoices, roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER] },
    { to: '/inventory', label: 'Inventory', icon: Icons.Inventory, roles: [UserRole.ADMIN, UserRole.OPERATOR] },
    { to: '/reports', label: 'Reports', icon: Icons.Reports, roles: [UserRole.ADMIN, UserRole.VIEWER] },
    { to: '/gst-reports', label: 'GST Reports', icon: Icons.Reports, roles: [UserRole.ADMIN], tier2: true },
    { to: '/users', label: 'User Management', icon: Icons.Users, roles: [UserRole.ADMIN], tier2: true },
    { to: '/audit-logs', label: 'Audit Logs', icon: Icons.Logs, roles: [UserRole.ADMIN], tier2: true },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen text-slate-300 fixed left-0 top-0 overflow-y-auto z-50">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="bg-blue-600 p-1 rounded">OB</span> OmniBill Pro
        </h1>
        <p className="text-xs mt-1 text-slate-500">{user?.tier} Plan</p>
      </div>
      <nav className="mt-6">
        {links.map((link) => {
          if (!link.roles.includes(user?.role as UserRole)) return null;
          if (link.tier2 && user?.tier !== 'TIER-2') return null;

          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <link.icon />
              <span className="font-medium text-sm">{link.label}</span>
              {link.tier2 && (
                <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">PRO</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
