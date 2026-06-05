import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Mail, Lock, LogIn, Loader2, ShieldCheck, Truck, User } from 'lucide-react';
import { useToast } from '../../components/common/Toast';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import apiClient from '../../api/axios';

const DEMO_ACCOUNTS = [
  {
    role: 'Admin',
    icon: ShieldCheck,
    email: 'adminR',
    password: 'admin123',
    color: 'from-blue-600/20 to-blue-800/20 border-blue-500/30 hover:border-blue-400/60',
    badge: 'bg-blue-600/30 text-blue-300',
  },
  {
    role: 'Supplier',
    icon: Truck,
    email: 'supplier@sports.com',
    password: 'supplier123',
    color: 'from-orange-600/20 to-orange-800/20 border-orange-500/30 hover:border-orange-400/60',
    badge: 'bg-orange-600/30 text-orange-300',
  },
  {
    role: 'Customer',
    icon: User,
    email: 'customer@sports.com',
    password: 'customer123',
    color: 'from-emerald-600/20 to-emerald-800/20 border-emerald-500/30 hover:border-emerald-400/60',
    badge: 'bg-emerald-600/30 text-emerald-300',
  },
];

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);

  // IMPORTANT: useForm must be called before any conditional returns (Rules of Hooks)
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' }
  });

  // Redirect already-authenticated users to their dashboard
  if (isAuthenticated) {
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (role === 'SUPPLIER') return <Navigate to="/supplier" replace />;
    return <Navigate to="/" replace />;
  }

  const fillDemo = (account) => {
    setValue('email', account.email);
    setValue('password', account.password);
    setActiveDemo(account.role);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    dispatch(loginStart());
    try {
      const response = await apiClient.post('/auth/login', data);
      const { user, accessToken, refreshToken } = response.data;
      dispatch(loginSuccess({ user, accessToken, refreshToken }));
      showToast(`Welcome back, ${user.name}!`, 'success');

      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'SUPPLIER') navigate('/supplier');
      else navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      const errMsg = error.response?.data?.error || 'Invalid email or password.';
      dispatch(loginFailure(errMsg));
      showToast(errMsg, 'error');
      setActiveDemo(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4 bg-gradient-to-tr from-slate-900 via-slate-950 to-blue-950">
      
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-500 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-orange-500 blur-3xl" />
      </div>

      <div className="z-10 w-full max-w-md space-y-4 animate-fade-in">

        {/* Demo Quick-Login Cards */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
            ⚡ Quick Login — Click a role to auto-fill
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              const isActive = activeDemo === acc.role;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border bg-gradient-to-b transition-all duration-200 cursor-pointer group ${acc.color} ${isActive ? 'ring-2 ring-white/30 scale-[1.03]' : ''}`}
                >
                  <Icon className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${acc.badge}`}>
                    {acc.role}
                  </span>
                  <span className="text-[8px] text-slate-400 truncate w-full text-center leading-tight">
                    {acc.email}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Login Card */}
        <div className="p-8 rounded-3xl glass-panel shadow-2xl border border-white/10 text-white">
          
          {/* Logo / Header */}
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent uppercase tracking-wider">
              FULL<span className="text-slate-200">SPORTS</span>
            </h1>
            <p className="text-xs text-slate-400">Inventory &amp; E-Commerce Console Login</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Email or Username</label>
              <div className="relative">
                <input
                  id="login-email"
                  type="text"
                  {...register('email', { required: 'Email or Username is required' })}
                  placeholder="Username or Email"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-slate-500"
                />
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              </div>
              {errors.email && (
                <span className="text-[10px] text-red-400 font-semibold">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-[10px] text-orange-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-slate-500"
                />
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              </div>
              {errors.password && (
                <span className="text-[10px] text-red-400 font-semibold">{errors.password.message}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 font-semibold text-sm transition-all shadow-lg shadow-blue-950/40 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" /> Sign In
                </>
              )}
            </button>
          </form>

          {/* Register Redirect */}
          <div className="text-center mt-6 text-xs text-slate-400">
            New to the platform?{' '}
            <Link to="/register" className="text-orange-400 font-semibold hover:underline">
              Register Customer Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
