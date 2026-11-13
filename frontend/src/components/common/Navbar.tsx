import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useNotifications } from '../../context/NotificationContext.js';
import {
  Compass,
  MapPin,
  Radio,
  Shuffle,
  BarChart3,
  AlertCircle,
  Bot,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ShieldAlert,
  SlidersHorizontal,
  Home
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileDropdownOpen(false);
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Journey Planner', path: '/planner', icon: Compass },
    { label: 'Live Tracking', path: '/tracking', icon: Radio },
    { label: 'Alternatives', path: '/alternatives', icon: Shuffle },
    { label: 'AI Companion', path: '/ai-assistant', icon: Bot },
    { label: 'Demand AI', path: '/demand', icon: BarChart3 },
    { label: 'Report Problem', path: '/report', icon: AlertCircle }
  ];

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin';
    if (role === 'operator') return '/operator';
    return '/dashboard';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-9 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-navy-900 to-brand-blue flex items-center justify-center text-white shadow-md shadow-brand-blue/20 group-hover:scale-105 transition">
              <Compass className="w-6 h-6 text-amber-400 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-navy-900">ROUTELESS</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-300">
                  THE LAST MILE
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                AI Rural Mobility & Education Access
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    isActive(link.path)
                      ? 'bg-brand-blue text-white shadow-sm'
                      : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2.5">
            {/* Dashboard Quick Pill */}
            {user && (
              <Link
                to={getDashboardPath()}
                className="hidden md:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-navy-800 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 transition"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-brand-blue" />
                <span>{role === 'admin' ? 'Admin Hub' : role === 'operator' ? 'Operator Console' : 'My Student Hub'}</span>
              </Link>
            )}

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdownOpen(false);
                }}
                className="relative p-2 rounded-full text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition"
                title="Alerts and Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popup Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-sm text-navy-900">Transport Alerts & Updates</span>
                    <span className="text-xs text-brand-blue font-semibold">{unreadCount} unread</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">No active alerts at this time.</div>
                    ) : (
                      notifications.slice(0, 5).map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markAsRead(n.id);
                            if (n.actionUrl) {
                              navigate(n.actionUrl);
                              setNotificationsOpen(false);
                            }
                          }}
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition ${
                            !n.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="font-semibold text-slate-800">{n.title}</span>
                            {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-brand-blue"></span>}
                          </div>
                          <p className="text-slate-600 line-clamp-2">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-slate-100 text-center">
                    <Link
                      to="/dashboard"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs text-brand-blue font-semibold hover:underline"
                    >
                      View all activity on Dashboard
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown or Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-brand-blue/20"
                  />
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-navy-900 leading-tight">{user.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium capitalize">{user.role}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-navy-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 uppercase">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                      <span>{role === 'admin' ? 'Admin Dashboard' : role === 'operator' ? 'Operator Console' : 'Student Dashboard'}</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Profile & Settings</span>
                    </Link>

                    <Link
                      to="/about"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <ShieldAlert className="w-4 h-4 text-slate-400" />
                      <span>About ROUTELESS</span>
                    </Link>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-navy-900 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/login?mode=register"
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-blue hover:bg-brand-blue-dark rounded-lg shadow-sm transition"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-navy-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-lg animate-fadeIn">
          {navLinks.map(link => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                  isActive(link.path)
                    ? 'bg-brand-blue text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          {user && (
            <Link
              to={getDashboardPath()}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-brand-blue bg-blue-50"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Go to {role === 'admin' ? 'Admin Hub' : role === 'operator' ? 'Operator Console' : 'My Student Hub'}</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
