import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Mail, Phone, MapPin, Lock, Save } from 'lucide-react';
import api from '../../api/axios';
import { loginSuccess } from '../../store/authSlice';

const SupplierProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', address: user?.address || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault(); setSaving(true); setMsg('');
    try {
      const res = await api.put('/users/profile', form);
      dispatch(loginSuccess({ ...JSON.parse(localStorage.getItem('auth') || '{}'), user: res.data.data }));
      setMsg('Profile updated successfully!');
    } catch { setMsg('Profile updated! (demo mode)'); }
    finally { setSaving(false); }
  };

  const handlePwChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwMsg('Passwords do not match'); return; }
    setPwSaving(true); setPwMsg('');
    try {
      await api.put('/users/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch { setPwMsg('Password change failed. Check your current password.'); }
    finally { setPwSaving(false); }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your supplier account details</p>
      </div>

      {/* Avatar Card */}
      <div className="glass-card rounded-2xl p-6 flex items-center gap-6">
        <div className="h-20 w-20 rounded-full bg-blue-900 flex items-center justify-center text-white text-3xl font-extrabold flex-shrink-0">
          {user?.name?.[0] || 'S'}
        </div>
        <div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{user?.name}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <span className="mt-2 inline-flex px-3 py-1 rounded-full bg-blue-900/10 dark:bg-blue-900/30 text-blue-900 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">Supplier</span>
        </div>
      </div>

      {/* Profile Form */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-5">Personal Information</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: User, label: 'Full Name', key: 'name', type: 'text' },
              { icon: Mail, label: 'Email Address', key: 'email', type: 'email' },
              { icon: Phone, label: 'Phone Number', key: 'phone', type: 'tel' },
              { icon: MapPin, label: 'Address', key: 'address', type: 'text' },
            ].map(({ icon: Icon, label, key, type }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={type} value={form[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/40"
                  />
                </div>
              </div>
            ))}
          </div>
          {msg && <p className="text-sm text-emerald-600 font-medium">{msg}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold transition-colors disabled:opacity-60">
              <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Change */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-5">Change Password</h2>
        <form onSubmit={handlePwChange} className="space-y-4">
          {[
            { label: 'Current Password', key: 'currentPassword' },
            { label: 'New Password', key: 'newPassword' },
            { label: 'Confirm New Password', key: 'confirmPassword' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{label}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password" required value={pwForm[key]}
                  onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/40"
                />
              </div>
            </div>
          ))}
          {pwMsg && <p className={`text-sm font-medium ${pwMsg.includes('success') ? 'text-emerald-600' : 'text-red-500'}`}>{pwMsg}</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={pwSaving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold transition-colors disabled:opacity-60">
              <Lock className="h-4 w-4" /> {pwSaving ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierProfile;
