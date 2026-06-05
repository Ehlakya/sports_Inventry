import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useToast } from '../../components/common/Toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    setLoading(true);
    // Simulate sending recovery email
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      showToast('If an account exists, a recovery email has been sent.', 'info');
    }, 1500);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4 bg-gradient-to-tr from-slate-900 via-slate-950 to-blue-950">
      
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-500 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-orange-500 blur-3xl" />
      </div>

      <div className="z-10 w-full max-w-md p-8 rounded-3xl glass-panel shadow-2xl border border-white/10 text-white animate-fade-in">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent uppercase tracking-wider">
            Reset Password
          </h1>
          <p className="text-xs text-slate-400">Enter your email to receive recovery instructions</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
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
                  placeholder="yourname@sports.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-slate-500"
                />
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              </div>
              {errors.email && (
                <span className="text-[10px] text-red-400 font-semibold">{errors.email.message}</span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 font-semibold text-sm transition-all shadow-lg shadow-blue-950/40 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" /> Send Recovery Link
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-900/30 text-blue-400 border border-blue-800/40">
              <Mail className="h-6 w-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold">Check your Inbox</h3>
            <p className="text-xs text-slate-400 leading-relaxed px-4">
              We have dispatched recovery instructions to your email address. Follow the link enclosed within the mail to set up a new password.
            </p>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link to="/login" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
