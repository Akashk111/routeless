import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { User, MapPin, School, Phone, Mail, Shield, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [savedMessage, setSavedMessage] = useState(false);

  const [name, setName] = useState(user?.name || 'Ananya Rao');
  const [village, setVillage] = useState(user?.village || 'Kinnigoli');
  const [institution, setInstitution] = useState(user?.institution || "Alva's College, Moodbidri");
  const [phone, setPhone] = useState(user?.phone || '+91 98451 22341');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900">Student Profile & Mobility Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage your home village, college destination, and transit notifications</p>
        </div>

        {savedMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile and notification preferences updated!</span>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-brand-blue/20 shadow-md"
            />
            <div>
              <h2 className="text-lg font-bold text-navy-900">{user?.name}</h2>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-brand-blue border border-blue-200">
                <Shield className="w-3.5 h-3.5" />
                <span>Dakshina Kannada KSRTC Concession Pass #DK-2026-8819</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-navy-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-navy-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Village / Origin</label>
                <input
                  type="text"
                  value={village}
                  onChange={e => setVillage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-navy-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Educational Institution</label>
                <input
                  type="text"
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-navy-900"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold rounded-xl shadow-md transition"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
