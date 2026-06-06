import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Phone, MapPin, UserPlus, Loader2 } from 'lucide-react';
import { useToast } from '../../components/common/Toast';
import apiClient from '../../api/axios';
import SportsBackground from '../../components/common/SportsBackground';

const Register = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
      role: 'CUSTOMER'
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await apiClient.post('/auth/register', data);
      
      showToast('Account created successfully.', 'success');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      const errMsg = error.response?.data?.error || 'Registration failed. Please try again.';
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const onError = (errors) => {
    if (Object.keys(errors).length > 0) {
      // If the error is specifically password mismatch, show that, otherwise show generic required error
      if (errors.confirmPassword && errors.confirmPassword.type === 'validate') {
        showToast('Passwords do not match.', 'error');
      } else {
        showToast('All fields are required.', 'error');
      }
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] items-center justify-center p-4 bg-gradient-to-tr from-slate-900 via-slate-950 to-blue-950">
      <SportsBackground variant="customer" />
      
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-500 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-orange-500 blur-3xl" />
      </div>

      <div className="z-10 w-full max-w-lg p-8 rounded-3xl glass-panel shadow-2xl border border-white/10 text-white animate-fade-in my-8">
        
        {/* Logo / Header */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent uppercase tracking-wider">
            Create Account
          </h1>
          <p className="text-xs text-slate-400">Join Antigravity Sports community today</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <div className="relative">
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-slate-650"
              />
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Username</label>
            <div className="relative">
              <input
                type="text"
                {...register('username', { required: 'Username is required' })}
                placeholder="johndoe123"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-slate-650"
              />
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                })}
                placeholder="johndoe@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-slate-650"
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <input
                type="password"
                {...register('password', { 
                  required: 'Password is required'
                })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-slate-650"
              />
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                {...register('confirmPassword', { 
                  required: 'Confirm Password is required',
                  validate: value => value === watch('password') || 'Passwords do not match.'
                })}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-slate-650"
              />
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                {...register('phone', { required: 'Phone Number is required' })}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-slate-650"
              />
              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Address</label>
            <div className="relative">
              <textarea
                rows="2"
                {...register('address', { required: 'Address is required' })}
                placeholder="Street Address, City, Pincode"
                className="w-full pl-10 pr-4 py-2 bg-slate-950/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-slate-650 resize-none"
              />
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 font-semibold text-sm transition-all shadow-lg shadow-blue-950/40 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <UserPlus className="h-4 w-4" /> Create Account
              </>
            )}
          </button>
        </form>

        {/* Sign In Redirect */}
        <div className="text-center mt-6 text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-400 font-semibold hover:underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
