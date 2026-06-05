import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { useToast } from '../../components/common/Toast';
import { loginStart, loginSuccess, loginFailure } from '../../store/authSlice';
import apiClient from '../../api/axios';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);

  // Redirect already-authenticated users to their dashboard
  if (isAuthenticated) {
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (role === 'SUPPLIER') return <Navigate to="/supplier" replace />;
    return <Navigate to="/" replace />;
  }

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    dispatch(loginStart());
    try {
      const response = await apiClient.post('/auth/login', data);
      
      const { user, accessToken, refreshToken } = response.data;
      
      dispatch(loginSuccess({ user, accessToken, refreshToken }));
      showToast(`Welcome back, ${user.name}!`, 'success');

      // Navigate based on user role
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'SUPPLIER') {
        navigate('/supplier');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errMsg = error.response?.data?.error || 'Invalid email or password.';
      dispatch(loginFailure(errMsg));
      showToast(errMsg, 'error');
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

      <div className="z-10 w-full max-w-md p-8 rounded-3xl glass-panel shadow-2xl border border-white/10 text-white animate-fade-in">
        
        {/* Logo / Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent uppercase tracking-wider">
            FULL<span className="text-slate-800 dark:text-slate-200">SPORTS</span>
          </h1>
          <p className="text-xs text-slate-400">Inventory & E-Commerce Console Login</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email or Username</label>
            <div className="relative">
              <input
                type="text"
                {...register('email', { 
                  required: 'Email or Username is required'
                })}
                placeholder="yourname@sports.com or adminR"
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
  );
};

export default Login;
