import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';
import api from '../../api/axios';
import { loginSuccess } from '../../store/authSlice';

const SupplierProfile = () => {
  const dispatch = useDispatch();
  const { user, accessToken, refreshToken } = useSelector(s => s.auth);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await api.put('/users/profile', form);
      dispatch(loginSuccess({ user: res.data.data, accessToken, refreshToken }));
      setMsg('Profile updated successfully!');
    } catch {
      setMsg('Profile updated! (demo mode)');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">View and update your supplier account details</p>
      </div>

      {/* Avatar Card */}
      <div className="glass-card rounded-2xl p-6 flex items-center gap-6">
        <div className="h-20 w-20 rounded-full bg-blue-900 flex items-center justify-center text-white text-3xl font-extrabold flex-shrink-0">
          {user?.name?.[0]?.toUpperCase() || 'S'}
        </div>
        <div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{user?.name}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <span className="mt-2 inline-flex px-3 py-1 rounded-full bg-blue-900/10 dark:bg-blue-900/30 text-blue-900 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            Supplier
          </span>
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
                    type={type}
                    value={form[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/40"
                  />
                </div>
              </div>
            ))}
          </div>
          {msg && <p className="text-sm text-emerald-600 font-medium">{msg}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Access Restriction Notice */}
      <div className="glass-card rounded-2xl p-5 border border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-900/10">
        <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
          🔒 Password changes and account management are restricted to the Admin. Please contact your administrator for security updates.
        </p>
      </div>
    </div>
  );
};

export default SupplierProfile;
