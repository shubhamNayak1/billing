
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { Modal } from './Modal';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  onSave: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    username: '',
    password: '',
    role: UserRole.OPERATOR,
    tier: 'TIER-1'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    if (user) setFormData({ ...user, password: '' });
    else setFormData({ name: '', username: '', password: '', role: UserRole.OPERATOR, tier: 'TIER-1' });
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const isCreate = !user?.id;
    const password = (formData.password || '').trim();
    if (isCreate && password.length < 4) {
      setError('Password is required (min 4 characters)');
      return;
    }
    if (!isCreate && password && password.length < 4) {
      setError('New password must be at least 4 characters');
      return;
    }
    const finalPassword = password ? password : (user?.password || '');
    await api.saveUser({ ...formData, password: finalPassword, id: user?.id } as User);
    onSave();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Edit Staff Member' : 'Enroll Staff Member'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
          <input required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
          <input required className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.username || ''} onChange={e => setFormData({...formData, username: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Password {user ? <span className="text-slate-400 normal-case font-medium">(leave blank to keep current)</span> : <span className="text-red-500">*</span>}
          </label>
          <input
            type="password"
            autoComplete="new-password"
            placeholder={user ? '••••••••' : 'Min 4 characters'}
            className="w-full p-3 bg-slate-50 border rounded-xl"
            value={formData.password || ''}
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
        </div>
        {error && <div className="text-red-600 text-xs font-bold bg-red-50 border border-red-100 rounded-xl p-3">{error}</div>}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
            <select className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.OPERATOR}>Operator</option>
              <option value={UserRole.VIEWER}>Viewer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tier</label>
            <select className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value as 'TIER-1' | 'TIER-2'})}>
              <option value="TIER-1">Tier 1 (Basic)</option>
              <option value="TIER-2">Tier 2 (Pro)</option>
            </select>
          </div>
        </div>
        <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold mt-4">Save Profile</button>
      </form>
    </Modal>
  );
};
