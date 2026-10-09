'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { 
  ShieldAlert, ShieldCheck, Users, Wallet, History, Settings, Lock, Eye, EyeOff, 
  AlertTriangle, CheckCircle2, Globe, Smartphone, Laptop, Tablet, RefreshCw, 
  Trash2, LogOut, Key, Check, Info, Server, Activity, ArrowRight, Shield, Coins 
} from 'lucide-react';
import { OwnerSession, SecurityEvent } from '@/types';

export const AdminView: React.FC = () => {
  const { 
    user, auditLogs, adminBtcAddress, setAdminBtcAddress, 
    isAdminAuthenticated, verifyAdminPassword, changeAdminPin, addAuditLog,
    ownerSessions, securityEvents, ownerAccruals,
    revokeSession, removeSession, revokeAllOtherSessions, runDailyOwnerAccrual,
    adminLastVerifiedAt, balances
  } = useApp();

  const isOwner = user.role === 'owner' || user.email === 'richardshannon901@gmail.com';

  const [reauthPass, setReauthPass] = useState('');
  const [reauthError, setReauthError] = useState('');
  const [showReauthPass, setShowReauthPass] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'security' | 'devices' | 'login-activity' | 'alerts' | 'portfolio' | 'controls' | 'audit' | 'settings'
  >('overview');

  // Modal confirmations
  const [sessionToLogout, setSessionToLogout] = useState<OwnerSession | null>(null);
  const [sessionToRemove, setSessionToRemove] = useState<OwnerSession | null>(null);
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);
  const [selectedDeviceDetail, setSelectedDeviceDetail] = useState<OwnerSession | null>(null);

  // Filters for login activity
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  // Change Admin Pin state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ success: boolean; text: string } | null>(null);

  // New BTC Address state
  const [newBtcAddr, setNewBtcAddr] = useState<string>(adminBtcAddress);
  const [btcSaved, setBtcSaved] = useState<boolean>(false);

  const [nowTime, setNowTime] = useState<number>(() => Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => setNowTime(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Check if re-authentication is required (20 minutes = 1,200,000 ms)
  const isReauthExpired = !adminLastVerifiedAt || (nowTime - adminLastVerifiedAt > 1200000);

  const handleReauthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reauthPass) {
      setReauthError('Please enter your administrator password.');
      return;
    }
    const success = verifyAdminPassword(reauthPass);
    if (!success) {
      setReauthError('Incorrect administrator password. Please try again.');
      setReauthPass('');
    } else {
      setReauthError('');
      setReauthPass('');
    }
  };

  const handleSaveBtc = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminBtcAddress(newBtcAddr);
    setBtcSaved(true);
    addAuditLog('ADMIN_BTC_UPDATED', `Institutional withdrawal BTC address updated to ${newBtcAddr}.`, 'SUCCESS');
    setTimeout(() => setBtcSaved(false), 3000);
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeMsg(null);
    if (!currentPin || !newPin || !confirmPin) {
      setPinChangeMsg({ success: false, text: 'All password fields are required.' });
      return;
    }
    if (newPin !== confirmPin) {
      setPinChangeMsg({ success: false, text: 'New password confirmation does not match.' });
      return;
    }
    if (newPin.length < 6) {
      setPinChangeMsg({ success: false, text: 'Password must be at least 6 characters.' });
      return;
    }
    const success = changeAdminPin(currentPin, newPin);
    if (success) {
      setPinChangeMsg({ success: true, text: 'Admin security password successfully updated.' });
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } else {
      setPinChangeMsg({ success: false, text: 'Current password verification failed.' });
    }
  };

  if (!isOwner) {
    return (
      <div className="max-w-md mx-auto my-20 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-xs text-slate-400 mb-6">
          The Admin Security Center requires designated Administrator privileges. Ordinary user sessions cannot access institutional security controls.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (isReauthExpired) {
    return (
      <div className="max-w-md mx-auto my-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-fadeIn">
        <div className="text-center space-y-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Admin Security Check</h2>
          <p className="text-xs text-slate-400">
            For your protection, please verify your password to continue accessing Administrator Controls. Session re-authentication required every 20 minutes.
          </p>
        </div>

        {reauthError && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{reauthError}</span>
          </div>
        )}

        <form onSubmit={handleReauthSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Security Password / Admin PIN</label>
            <div className="relative">
              <input
                type={showReauthPass ? 'text' : 'password'}
                value={reauthPass}
                onChange={(e) => setReauthPass(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500 pr-10"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowReauthPass(!showReauthPass)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showReauthPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all"
          >
            Verify & Continue
          </button>
        </form>
      </div>
    );
  }

  const activeDevicesCount = ownerSessions.filter(s => s.status === 'Active').length;
  const suspiciousCount = ownerSessions.filter(s => s.status === 'Suspicious').length;
  const recentLoginsCount = securityEvents.length;
  const countriesCount = Array.from(new Set(ownerSessions.map(s => s.country))).length;

  const filteredSessions = ownerSessions.filter(s => {
    if (deviceFilter !== 'all' && s.deviceType !== deviceFilter) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (countryFilter !== 'all' && s.country !== countryFilter) return false;
    return true;
  });

  const getDeviceIcon = (type: string) => {
    if (type.includes('iPhone') || (type.includes('Android') && !type.includes('Tablet'))) return <Smartphone className="w-5 h-5 text-blue-400" />;
    if (type.includes('iPad') || type.includes('Tablet')) return <Tablet className="w-5 h-5 text-purple-400" />;
    return <Laptop className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-7xl mx-auto px-4 sm:px-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono uppercase font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Administrator Authenticated
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {user.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Security & Account Center</h1>
          <p className="text-xs text-slate-400 mt-1">Professional session management, automated device telemetry, and institutional portfolio controls.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => runDailyOwnerAccrual()}
            className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md"
          >
            <Coins className="w-4 h-4" />
            <span>Process Daily Accrual (0.0010%)</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'security', label: 'Security Center', icon: ShieldCheck },
          { id: 'devices', label: 'Device Sessions', icon: Laptop, badge: activeDevicesCount },
          { id: 'login-activity', label: 'Login Activity', icon: History },
          { id: 'alerts', label: 'Security Alerts', icon: AlertTriangle, badge: securityEvents.filter(e => e.severity === 'WARNING').length },
          { id: 'controls', label: 'Administrator Controls', icon: Lock },
          { id: 'audit', label: 'Audit Log', icon: Server },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-medium">Active Devices</span>
                <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{activeDevicesCount}</p>
              <p className="text-[10px] text-emerald-400 mt-1 font-mono">🟢 Secure Cryptographic Sessions</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-medium">Suspicious Sessions</span>
                <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{suspiciousCount}</p>
              <p className="text-[10px] text-amber-400 mt-1 font-mono">⚠️ Requires Owner Review</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-medium">Countries Detected</span>
                <span className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{countriesCount}</p>
              <p className="text-[10px] text-blue-400 mt-1 font-mono">🌍 Multi-Region Telemetry</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-medium">Account Status</span>
                <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-white">Protected</p>
              <p className="text-[10px] text-emerald-400 mt-1 font-mono">🔒 Zero Unauthorized Breaches</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Active Security Sessions</h3>
                <button
                  onClick={() => setActiveTab('security')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {ownerSessions.slice(0, 2).map((session) => (
                  <div key={session.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        {getDeviceIcon(session.deviceType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-white">{session.deviceName}</p>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                            session.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {session.status === 'Active' ? '🟢 Active' : '🔴 Suspicious'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{session.operatingSystem} • {session.browser} • {session.country} ({session.region})</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedDeviceDetail(session)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-medium border border-slate-800 transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white">Quick Actions</h3>
              <div className="space-y-2.5">
                <button
                  onClick={() => setShowLogoutAllConfirm(true)}
                  className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    <span>Log Out All Other Devices</span>
                  </span>
                  <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded">Remote</span>
                </button>

                <button
                  onClick={() => setActiveTab('portfolio')}
                  className="w-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    <span>Review Owner Portfolio Accrual</span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTab('login-activity')}
                  className="w-full bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-400" />
                    <span>View Complete Login Audit</span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SECURITY CENTER */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Security & Device Control Center</h3>
                <p className="text-xs text-slate-400">Review all active and recent sessions authenticated to the main administrator account.</p>
              </div>
              <button
                onClick={() => setShowLogoutAllConfirm(true)}
                className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-rose-600/20 transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out All Other Devices</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ownerSessions.map((session) => (
                <div key={session.id} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-md relative overflow-hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                        {getDeviceIcon(session.deviceType)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{session.deviceName}</h4>
                        <p className="text-xs text-slate-400">{session.operatingSystem} • {session.browser}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-bold ${
                      session.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      session.status === 'Suspicious' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {session.status === 'Active' ? '🟢 Active' : session.status === 'Suspicious' ? '🔴 Suspicious' : session.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span className="text-white font-medium">{session.country}, {session.region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Login Time:</span>
                      <span className="text-white font-mono">{new Date(session.firstLoginAt).toUTCString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">IP Address:</span>
                      <span className="text-white font-mono">{session.ipAddress}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setSelectedDeviceDetail(session)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      View Full Details →
                    </button>

                    <div className="flex items-center gap-2">
                      {session.status !== 'Logged out' && session.status !== 'Removed' && !session.isCurrentSession && (
                        <>
                          <button
                            onClick={() => setSessionToLogout(session)}
                            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold border border-rose-500/20 transition-all"
                          >
                            Log Out Device
                          </button>
                          <button
                            onClick={() => setSessionToRemove(session)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-slate-800 transition-all"
                          >
                            Remove Session
                          </button>
                        </>
                      )}
                      {session.isCurrentSession && (
                        <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg">Current Device</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DEVICE SESSIONS */}
      {activeTab === 'devices' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Active Device Sessions ({activeDevicesCount})</h3>
                <p className="text-xs text-slate-400">Manage, audit, and terminate authorized remote endpoints.</p>
              </div>
              <button
                onClick={() => setShowLogoutAllConfirm(true)}
                className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-all"
              >
                Log Out All Other Devices
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Device / OS</th>
                    <th className="p-3.5">Browser</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">IP Address</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {ownerSessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          {getDeviceIcon(s.deviceType)}
                          <div>
                            <p className="font-bold text-white">{s.deviceName}</p>
                            <p className="text-[10px] text-slate-400">{s.operatingSystem}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-300 font-mono">{s.browser}</td>
                      <td className="p-3.5 text-slate-300">{s.country}, {s.region}</td>
                      <td className="p-3.5 text-slate-400 font-mono">{s.ipAddress}</td>
                      <td className="p-3.5">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                          s.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {!s.isCurrentSession && s.status === 'Active' && (
                          <button
                            onClick={() => setSessionToLogout(s)}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-xl font-bold transition-all"
                          >
                            Log Out
                          </button>
                        )}
                        {s.isCurrentSession && (
                          <span className="text-[10px] text-slate-500 font-mono italic">Current</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: LOGIN ACTIVITY */}
      {activeTab === 'login-activity' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Complete Login Activity & Audit Trail</h3>
              <p className="text-xs text-slate-400">Review historical login attempts, country derivations, and security telemetry.</p>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Filter Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Suspicious">Suspicious</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Filter Country</label>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="all">All Countries</option>
                  <option value="Ghana">Ghana</option>
                  <option value="United States">United States</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Filter Device</label>
                <select
                  value={deviceFilter}
                  onChange={(e) => setDeviceFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="all">All Devices</option>
                  <option value="iPhone">iPhone</option>
                  <option value="Windows PC">Windows PC</option>
                </select>
              </div>
            </div>

            {/* Activity Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Event / Type</th>
                    <th className="p-3.5">Device</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">IP Address</th>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {securityEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="p-3.5 font-bold text-white">{evt.eventType}</td>
                      <td className="p-3.5 text-slate-300">{evt.deviceType}</td>
                      <td className="p-3.5 text-slate-300">{evt.country}, {evt.region}</td>
                      <td className="p-3.5 text-slate-400 font-mono">{evt.ipAddress}</td>
                      <td className="p-3.5 text-slate-400 font-mono">{new Date(evt.timestamp).toUTCString()}</td>
                      <td className="p-3.5">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                          evt.severity === 'INFO' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {evt.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SECURITY ALERTS */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white">Security Alerts</h3>
            <p className="text-xs text-slate-400">Automated warning notices regarding unrecognized devices, IP shifts, and remote session terminations.</p>

            <div className="space-y-3">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">⚠️ New Device Signed Into Administrator Account</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    <strong>Windows Desktop Workstation</strong> logged in from New York, USA. If this was not initiated by you, please revoke session immediately.
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-2">August 30, 2026 — 18:21 UTC</p>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wide">🔒 Routine Cryptographic Rotation Completed</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Administrator session tokens successfully re-hashed and rotated according to institutional security protocol.
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-2">August 31, 2026 — 00:00 UTC</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* TAB CONTENT: ADMINISTRATOR CONTROLS */}
      {activeTab === 'controls' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Institutional Administrator Controls & Security Password</h3>
              <p className="text-xs text-slate-400">Manage administrator credentials and global pipeline parameters.</p>
            </div>

            {pinChangeMsg && (
              <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
                pinChangeMsg.success ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
              }`}>
                {pinChangeMsg.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{pinChangeMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePin} className="space-y-4 max-w-lg bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Change Admin Security Password</h4>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">New Password (Min 6 chars)</label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
              >
                Update Admin Password
              </button>
            </form>

            <form onSubmit={handleSaveBtc} className="space-y-4 max-w-lg bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Target Institutional BTC Withdrawal Address</h4>
              {btcSaved && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs">
                  BTC address successfully updated across pipeline.
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Bitcoin Address</label>
                <input
                  type="text"
                  value={newBtcAddr}
                  onChange={(e) => setNewBtcAddr(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
              >
                Save BTC Address
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">System Audit Log</h3>
              <p className="text-xs text-slate-400">Immutable record of security and administrative operations.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Log ID</th>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Event Type</th>
                    <th className="p-3.5">Details</th>
                    <th className="p-3.5">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="p-3.5 font-mono text-white">{log.id}</td>
                      <td className="p-3.5 font-mono text-slate-400">{log.timestamp}</td>
                      <td className="p-3.5 font-bold text-blue-400">{log.eventType}</td>
                      <td className="p-3.5 text-slate-300">{log.details}</td>
                      <td className="p-3.5">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                          log.result === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {log.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-white">Security & Environment Settings</h3>
            <p className="text-xs text-slate-400">Configure global session timeouts and cryptographic preferences.</p>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Strict IP Geofencing</h4>
                  <p className="text-xs text-slate-400">Enforce geographic anomaly detection for incoming owner sessions.</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-blue-600" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Automated Token Rotation</h4>
                  <p className="text-xs text-slate-400">Rotate cryptographic session tokens every 24 hours.</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-blue-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOG OUT DEVICE CONFIRMATION */}
      {sessionToLogout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Log out this device?</h3>
              <p className="text-xs text-slate-400">
                This will immediately terminate the active session for <strong className="text-white">{sessionToLogout.deviceName}</strong> ({sessionToLogout.operatingSystem}).
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSessionToLogout(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  revokeSession(sessionToLogout.id);
                  setSessionToLogout(null);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-xl text-xs font-bold shadow-lg transition-colors"
              >
                Log Out Device
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REMOVE SUSPICIOUS SESSION */}
      {sessionToRemove && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Remove Suspicious Session?</h3>
              <p className="text-xs text-slate-400">
                This will revoke authentication and mark session <strong className="text-white">{sessionToRemove.deviceName}</strong> as removed, preserving an audit record.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSessionToRemove(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeSession(sessionToRemove.id);
                  setSessionToRemove(null);
                }}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-xl text-xs font-bold shadow-lg transition-colors"
              >
                Remove Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LOG OUT ALL OTHER DEVICES */}
      {showLogoutAllConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">Log Out All Other Devices?</h3>
              <p className="text-xs text-slate-400">
                Every other active session will be terminated server-side. Your current device will remain signed in securely.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowLogoutAllConfirm(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  revokeAllOtherSessions();
                  setShowLogoutAllConfirm(false);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-xl text-xs font-bold shadow-lg transition-colors"
              >
                Log Out All Other Devices
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETAILED SECURITY PANEL */}
      {selectedDeviceDetail && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">DEVICE SECURITY DETAILS</h3>
                <p className="text-xs text-slate-400 font-mono">Session ID: {selectedDeviceDetail.id}</p>
              </div>
              <button
                onClick={() => setSelectedDeviceDetail(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Device</span>
                <span className="font-bold text-white">{selectedDeviceDetail.deviceName}</span>
              </div>
              <div className="flex justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Operating System</span>
                <span className="font-bold text-white">{selectedDeviceDetail.operatingSystem}</span>
              </div>
              <div className="flex justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Browser</span>
                <span className="font-bold text-white">{selectedDeviceDetail.browser}</span>
              </div>
              <div className="flex justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">First Login</span>
                <span className="font-mono text-white">{new Date(selectedDeviceDetail.firstLoginAt).toUTCString()}</span>
              </div>
              <div className="flex justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Last Active</span>
                <span className="font-mono text-white">{new Date(selectedDeviceDetail.lastActiveAt).toUTCString()}</span>
              </div>
              <div className="flex justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Approximate Location</span>
                <span className="font-bold text-white">{selectedDeviceDetail.country}, {selectedDeviceDetail.region}</span>
              </div>
              <div className="flex justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">IP Address</span>
                <span className="font-mono text-white">{selectedDeviceDetail.ipAddress}</span>
              </div>
              <div className="flex justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Session Status</span>
                <span className="font-bold text-emerald-400">{selectedDeviceDetail.status}</span>
              </div>
              <div className="flex justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Security Status</span>
                <span className="font-bold text-blue-400">{selectedDeviceDetail.isTrusted ? 'Trusted Device' : 'Suspicious / Untrusted'}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedDeviceDetail(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl text-xs font-bold transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
