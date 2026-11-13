import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { UserRole } from '../types/index.js';
import {
  Compass,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  MapPin,
  School,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('Kinnigoli');
  const [institution, setInstitution] = useState("Alva's College, Moodbidri");
  const [error, setError] = useState<string | null>(null);

  const { login, demoLogin, register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register({
        name,
        email,
        password,
        phone,
        village,
        institution,
        role: 'student'
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setError(null);
    await demoLogin(role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'operator') navigate('/operator');
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="max-w-md w-full space-y-8">
        {/* LOGO */}
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-navy-900 to-brand-blue items-center justify-center text-white shadow-md mb-3">
            <Compass className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">ROUTELESS — THE LAST MILE</h1>
          <p className="text-xs text-slate-500 mt-1">Every student deserves a way to reach their future.</p>
        </div>

        {/* 1-CLICK DEMO LOGIN CARD (ESSENTIAL FOR HACKATHONS) */}
        <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white p-5 rounded-2xl border border-navy-700 shadow-lg space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>Hackathon Quick Demo Logins (1-Click)</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => handleQuickDemo('student')}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-center transition flex flex-col items-center gap-1"
            >
              <span className="text-sm">🎓</span>
              <strong className="text-white text-[11px]">Student</strong>
              <span className="text-[9px] text-slate-300">Ananya Rao</span>
            </button>

            <button
              onClick={() => handleQuickDemo('admin')}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-center transition flex flex-col items-center gap-1"
            >
              <span className="text-sm">🛡️</span>
              <strong className="text-white text-[11px]">Admin</strong>
              <span className="text-[9px] text-slate-300">K.R. Hegde</span>
            </button>

            <button
              onClick={() => handleQuickDemo('operator')}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-center transition flex flex-col items-center gap-1"
            >
              <span className="text-sm">🚌</span>
              <strong className="text-white text-[11px]">Operator</strong>
              <span className="text-[9px] text-slate-300">Suresh Naik</span>
            </button>
          </div>
        </div>

        {/* FORM CONTAINER */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          {/* TABS */}
          <div className="flex border-b border-slate-200 text-xs font-bold">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-center border-b-2 transition ${
                mode === 'login' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 text-center border-b-2 transition ${
                mode === 'register' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Register Student Account
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="student@routeless.org"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-navy-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Rao"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-navy-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="student@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-navy-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98450 00000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-navy-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Home Village</label>
                  <input
                    type="text"
                    value={village}
                    onChange={e => setVillage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-navy-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">College</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={e => setInstitution(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-navy-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-navy-900"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold rounded-xl shadow-md transition"
              >
                {isLoading ? 'Creating Account...' : 'Register as Student'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
