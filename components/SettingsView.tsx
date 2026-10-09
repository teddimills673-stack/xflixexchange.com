'use client';

import React, { useState } from 'react';
import { useApp, CURRENCY_SYMBOLS } from '@/lib/store';
import { BaseCurrency } from '@/types';
import { Settings, User, Globe, Shield, Eye, EyeOff, CheckCircle2, Camera, Upload, Trash2, Loader2, AlertTriangle, X } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, setUser, theme, setTheme, baseCurrency, setBaseCurrency, language, setLanguage, logout, addAuditLog } = useApp();
  const [success, setSuccess] = useState(false);
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const [currencyMsg, setCurrencyMsg] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatarUrl || '');

  // Account Deletion States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');

    if (deleteEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
      setDeleteError('The entered email does not match your currently authenticated account.');
      return;
    }

    if (confirmDeleteText !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm permanent account erasure.');
      return;
    }

    if (!deletePassword) {
      setDeleteError('Please enter your account password for secure verification.');
      return;
    }

    setIsDeleting(true);

    try {
      // Call secure server-side deletion verification route
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: deleteEmail, password: deletePassword })
      });

      const data = await res.json();

      if (!data.success) {
        setDeleteError(data.error || 'Account deletion verification failed.');
        setIsDeleting(false);
        return;
      }

      // Perform local data cleanup
      try {
        const registeredStr = localStorage.getItem('okxflix_registered_users');
        if (registeredStr) {
          const registeredUsers = JSON.parse(registeredStr);
          delete registeredUsers[user.email.toLowerCase()];
          localStorage.setItem('okxflix_registered_users', JSON.stringify(registeredUsers));
        }
        localStorage.removeItem(`okxflix_balances_${user.id}`);
        localStorage.removeItem(`okxflix_transactions_${user.id}`);
        localStorage.removeItem('okxflix_session_token');
        addAuditLog('ACCOUNT_DELETED_PERMANENTLY', `Account permanently deleted by user/owner ${user.email}`, 'SUCCESS');
      } catch (err) {
        console.error('Cleanup error:', err);
      }

      setIsDeleting(false);
      setShowDeleteModal(false);
      logout();
    } catch (err: any) {
      console.error('Network or server error during account deletion:', err);
      setDeleteError(err?.message || 'Network error during account deletion. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleCurrencyChange = (newCurr: BaseCurrency) => {
    setCurrencyLoading(true);
    setCurrencyMsg(`Fetching institutional exchange rates for ${newCurr}...`);
    setTimeout(() => {
      setBaseCurrency(newCurr);
      setCurrencyLoading(false);
      setCurrencyMsg(`Base currency successfully updated to ${newCurr}`);
      addAuditLog('BASE_CURRENCY_UPDATED', `Base currency updated to ${newCurr} with live exchange rates`, 'SUCCESS');
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCurrencyMsg('');
      }, 3500);
    }, 700);
  };

  const togglePrivacyMode = () => {
    setUser(prev => ({
      ...prev,
      privacyMode: !prev.privacyMode
    }));
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setUser(prev => ({ ...prev, avatarUrl: result }));
        addAuditLog('PROFILE_PICTURE_UPDATED', 'User profile picture updated successfully from device gallery.', 'SUCCESS');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    setUser(prev => ({ ...prev, avatarUrl: '' }));
    addAuditLog('PROFILE_PICTURE_REMOVED', 'User profile picture removed.', 'SUCCESS');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Preferences & Settings</h1>
          <p className="text-xs text-slate-400 mt-1">Configure appearance, privacy mode, base currency, language, and secure account management.</p>
        </div>

        {success && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-3 rounded-2xl text-xs flex items-center gap-2 backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Preferences successfully updated and persisted.</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Profile Picture Management */}
          <div className="glass-card p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-14 h-14 rounded-2xl object-cover border border-blue-500/40 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-500">
                    <User className="w-7 h-7" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Profile Picture</h3>
                <p className="text-xs text-slate-400">Upload or change your institutional avatar from device gallery</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-lg shadow-blue-600/20 flex items-center gap-1.5 transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
              {user.avatarUrl && (
                <button
                  onClick={handleRemoveAvatar}
                  className="bg-slate-900/80 hover:bg-rose-500/10 text-rose-400 p-2 rounded-xl border border-slate-800 transition-colors"
                  title="Remove Photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Privacy Mode Toggle */}
          <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user.privacyMode ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-900/80 text-slate-400'}`}>
                {user.privacyMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Privacy Mode</h3>
                <p className="text-xs text-slate-400">Hide wallet balances, portfolio values, and transaction amounts with ••••••••</p>
              </div>
            </div>
            <button
              onClick={togglePrivacyMode}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                user.privacyMode 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {user.privacyMode ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Theme */}
          <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Appearance & Theme</h3>
              <p className="text-xs text-slate-400">Select interface color palette</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('dark')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${theme === 'dark' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-900/80 text-slate-400 border border-slate-800'}`}
              >
                Dark Charcoal
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold ${theme === 'light' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-900/80 text-slate-400 border border-slate-800'}`}
              >
                Light
              </button>
            </div>
          </div>

          {/* Base Currency */}
          <div className="glass-card p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Base Currency (50 Supported)</h3>
                <p className="text-xs text-slate-400">Default fiat currency for portfolio reporting and valuation</p>
              </div>
              <div className="flex items-center gap-2">
                {currencyLoading && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                <select
                  value={baseCurrency}
                  disabled={currencyLoading}
                  onChange={(e) => handleCurrencyChange(e.target.value as BaseCurrency)}
                  className="glass-input text-white text-xs px-3 py-1.5 rounded-xl font-mono disabled:opacity-50 focus:outline-none"
                >
                  {(Object.keys(CURRENCY_SYMBOLS) as BaseCurrency[]).map(code => {
                    const item = CURRENCY_SYMBOLS[code];
                    return (
                      <option key={code} value={code} className="bg-slate-900 text-white">
                        {code} — {item.name} ({item.symbol})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            {currencyMsg && (
              <p className="text-[11px] text-blue-400 font-mono animate-pulse">{currencyMsg}</p>
            )}
          </div>

          {/* Language */}
          <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Interface Language</h3>
              <p className="text-xs text-slate-400">Localization and regional terminology</p>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="glass-input text-white text-xs px-3.5 py-2 rounded-xl font-mono focus:outline-none"
            >
              <option value="en" className="bg-slate-900">English (US)</option>
              <option value="es" className="bg-slate-900">Español</option>
              <option value="fr" className="bg-slate-900">Français</option>
              <option value="de" className="bg-slate-900">Deutsch</option>
              <option value="pt" className="bg-slate-900">Português</option>
              <option value="zh" className="bg-slate-900">中文</option>
              <option value="ja" className="bg-slate-900">日本語</option>
            </select>
          </div>

          {/* Account Deletion */}
          <div className="bg-rose-950/20 backdrop-blur-xl p-5 rounded-2xl border border-rose-900/40 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-rose-400">Delete Account Permanently</h3>
              <p className="text-xs text-slate-400">Permanently erase account records, wallet data, and release your email and username.</p>
            </div>
            <button
              onClick={() => {
                setDeleteEmail('');
                setDeletePassword('');
                setConfirmDeleteText('');
                setDeleteError('');
                setShowDeleteModal(true);
              }}
              className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition-all shrink-0 cursor-pointer"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl border border-rose-500/30 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Permanent Account Deletion</h3>
                  <p className="text-[11px] text-rose-300">This action cannot be undone.</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to permanently delete your institutional account (<strong className="text-white font-mono">{user.email}</strong>). All associated wallet balances, portfolio logs, transaction history, and credentials will be permanently erased.
            </p>

            {deleteError && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleDeleteAccountSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Confirm Registered Email *</label>
                <input
                  type="email"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  placeholder={user.email}
                  className="glass-input w-full rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Account Password *</label>
                <div className="relative">
                  <input
                    type={showDeletePassword ? 'text' : 'password'}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your secure password"
                    className="glass-input w-full rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Type <span className="text-rose-400 font-bold">DELETE</span> to confirm *</label>
                <input
                  type="text"
                  value={confirmDeleteText}
                  onChange={(e) => setConfirmDeleteText(e.target.value)}
                  placeholder="DELETE"
                  className="glass-input w-full rounded-xl px-3.5 py-2.5 text-xs font-mono tracking-widest text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 bg-slate-800/80 hover:bg-slate-800 text-slate-300 py-3 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Erasing...</span>
                    </>
                  ) : (
                    <span>Delete Account Permanently</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
