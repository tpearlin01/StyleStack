import React, { useState } from 'react';
import { User, ShieldCheck, Mail, Lock, ArrowRight, ShoppingBag, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';

export const LandingLoginPortal = ({ onLoginSuccess }) => {
  const { registerUser, loginUser } = useAuth();

  // Role selector: 'customer' | 'admin'
  const [role, setRole] = useState('customer');
  // Auth mode: 'login' | 'register'
  const [mode, setMode] = useState('login');

  // Form State: all inputs mount completely blank
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrorMsg('');
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedEmail = email.trim();

    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }

      if (!trimmedEmail) {
        setErrorMsg('Please enter your email address.');
        return;
      }

      if (!password || password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }

      const res = await registerUser({
        fullName: fullName.trim(),
        email: trimmedEmail,
        password,
        role,
      });

      if (res.success) {
        setSuccessMsg('Account registered successfully! Please sign in with your credentials.');
        setMode('login');
        setPassword('');
      } else {
        setErrorMsg(res.message);
      }
    } else {
      // Sign In mode
      if (!trimmedEmail) {
        setErrorMsg('Please enter your email address.');
        return;
      }

      if (!password) {
        setErrorMsg('Please enter your password.');
        return;
      }

      const res = await loginUser({
        email: trimmedEmail,
        password,
        role,
      });

      if (res.success) {
        if (onLoginSuccess) {
          onLoginSuccess(res.data);
        }
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden selection:bg-rose-600 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-slate-800/40 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Container - Centered Clean Layout */}
      <main className="relative z-10 max-w-xl mx-auto w-full px-4 sm:px-6 py-10 flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Top Centered Brand Monogram & Title */}
        <div className="flex flex-col items-center text-center space-y-3">
          <BrandLogo size="lg" subtitle="DRESS & CLOTHING HUB" />
        </div>

        {/* Centralized Clean Login / Register Card */}
        <div className="w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950/60">
          {/* Role Selector (Customer vs Admin) */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800/80">
              <button
                type="button"
                onClick={() => handleRoleChange('customer')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  role === 'customer'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Customer</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  role === 'admin'
                    ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Mode Toggle Tabs (Sign In vs Register) */}
          <div className="flex border-b border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => handleModeChange('login')}
              className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-all ${
                mode === 'login'
                  ? 'border-rose-600 text-rose-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('register')}
              className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-all ${
                mode === 'register'
                  ? 'border-rose-600 text-rose-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Success Message Alert */}
          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Input Fields */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Minimum 6 characters' : 'Enter your password'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
                />
              </div>
              {mode === 'register' && (
                <p className="text-[10px] text-slate-500 mt-1">Must be at least 6 characters long.</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 mt-4 bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30 cursor-pointer"
            >
              <span>
                {mode === 'login'
                  ? `Sign In as ${role === 'admin' ? 'Admin' : 'Customer'}`
                  : `Register ${role === 'admin' ? 'Admin' : 'Customer'} Account`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-900">
        © {new Date().getFullYear()} StyleStack. All rights reserved.
      </footer>
    </div>
  );
};

