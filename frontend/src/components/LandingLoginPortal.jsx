import React, { useState } from 'react';
import { Sparkles, User, ShieldCheck, Mail, Lock, Phone, ArrowRight, ShoppingBag, LayoutDashboard, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingLoginPortal = ({ onLoginSuccess }) => {
  const { loginWithRole, demoLogin } = useAuth();

  // Role selector: 'customer' | 'admin'
  const [role, setRole] = useState('customer');
  // Auth mode: 'login' | 'register'
  const [mode, setMode] = useState('login');

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // Phone validation: Compulsory 10 digits
    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      setErrorMsg('Phone number must be exactly 10 digits.');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Please enter a password.');
      return;
    }

    if (mode === 'register' && !fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const res = await loginWithRole({
      email: email.trim(),
      phone: cleanedPhone,
      password: password.trim(),
      role,
      fullName: mode === 'register' ? fullName.trim() : (role === 'admin' ? 'Store Administrator' : 'Fashion Customer'),
    });

    if (res.success) {
      onLoginSuccess(res.data);
    } else {
      setErrorMsg(res.message || 'Authentication failed.');
    }
  };

  const handleDemoCustomer = () => {
    const session = demoLogin('customer');
    onLoginSuccess(session);
  };

  const handleDemoAdmin = () => {
    const session = demoLogin('admin');
    onLoginSuccess(session);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden selection:bg-rose-600 selection:text-white">
      
      {/* Background Luxury Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-rose-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="StyleStack PnR Logo"
            className="h-8 md:h-10 w-auto object-contain drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]"
          />
          <div className="flex flex-col">
            <span className="font-sans font-bold text-xl md:text-2xl tracking-tight text-[#F3F4F6]">
              StyleStack
            </span>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-rose-400 -mt-1">
              Dress &amp; Clothing Hub
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 font-medium">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Haute Couture Collection 2026</span>
        </div>
      </header>

      {/* Main Welcome Portal Content */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full">
          
          {/* Left Column: Hero Text & Monogram Centerpiece */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            
            {/* Centerpiece PnR Logo */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              <div className="p-3 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md inline-block">
                <img
                  src="/logo.png"
                  alt="StyleStack PnR Logo"
                  className="h-20 md:h-24 w-auto object-contain drop-shadow-[0_4px_20px_rgba(225,29,72,0.35)]"
                />
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Princel &amp; Pearlin Monogram Edition</span>
              </div>
            </div>

            <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Curated Fashion &amp; <br />
              <span className="bg-gradient-to-r from-rose-400 via-amber-200 to-rose-300 bg-clip-text text-transparent italic">
                Style Stack Hub
              </span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto lg:mx-0 font-normal leading-relaxed">
              Explore haute couture silk maxis, Italian leather totes, and botanical cosmetics, or manage store inventory and fulfill live customer orders.
            </p>

            {/* Quick Demo Access Buttons */}
            <div className="pt-2 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Instant Quick Access (One-Click Demo):
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <button
                  type="button"
                  onClick={handleDemoCustomer}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2 group"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Demo Login as Customer</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={handleDemoAdmin}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2 group"
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-400" />
                  <span>Demo Login as Admin</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Centralized Auth Card */}
          <div className="lg:col-span-6 max-w-md mx-auto w-full">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-950/20 relative">
              
              {/* Role Selector */}
              <div className="mb-6">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
                  Select Login Portal Role
                </label>
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setRole('customer');
                      setErrorMsg('');
                    }}
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
                    onClick={() => {
                      setRole('admin');
                      setErrorMsg('');
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      role === 'admin'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              {/* Card Title */}
              <div className="text-center mb-6">
                <h3 className="font-sans font-bold text-2xl text-[#F3F4F6]">
                  {role === 'customer' ? 'StyleStack Sign In' : 'Admin Portal Access'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {mode === 'login'
                    ? `Enter your ${role} credentials to continue`
                    : `Create a new ${role} account`}
                </p>
              </div>

              {/* Mode Toggle (Sign In vs Register) */}
              <div className="flex border-b border-slate-800 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className={`flex-1 pb-2 text-xs font-bold border-b-2 transition-all ${
                    mode === 'login'
                      ? 'border-rose-500 text-rose-400'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                  }}
                  className={`flex-1 pb-2 text-xs font-bold border-b-2 transition-all ${
                    mode === 'register'
                      ? 'border-rose-500 text-rose-400'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Error Message Alert */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
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
                        placeholder="Princel Tixeira"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
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
                      placeholder={role === 'admin' ? 'admin@stylestack.com' : 'customer@stylestack.com'}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* Compulsory 10-Digit Mobile Number */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Mobile Number (Compulsory 10 Digits) *
                    </label>
                    <span className="text-[10px] text-rose-400 font-semibold">
                      {phone.replace(/\D/g, '').length}/10
                    </span>
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      required
                      maxLength="10"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
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
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 mt-4 ${
                    role === 'admin'
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20'
                  }`}
                >
                  <span>{mode === 'login' ? `Sign In as ${role === 'admin' ? 'Admin' : 'Customer'}` : `Register ${role === 'admin' ? 'Admin' : 'Customer'} Account`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-900">
        © {new Date().getFullYear()} StyleStack Dress &amp; Clothing Hub. Monogram Identity PnR by Princel &amp; Pearlin.
      </footer>

    </div>
  );
};
