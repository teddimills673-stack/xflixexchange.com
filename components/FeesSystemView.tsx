'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Lock, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw, Save, Edit, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { FeeConfiguration } from '@/types';

export const FeesSystemView: React.FC = () => {
  const { user, feeConfiguration, updateFeeConfiguration, resetFeeConfiguration, addAuditLog, changeOwnerPassword, t } = useApp();

  const isOwner = user.role === 'owner' || user.email === 'richardshannon901@gmail.com';

  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Edit mode state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedConfig, setEditedConfig] = useState<FeeConfiguration>(feeConfiguration);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string>('');

  // Sub-tab state & Change Password state
  const [activeSubTab, setActiveSubTab] = useState<'fees' | 'password'>('fees');
  const [currentPassInput, setCurrentPassInput] = useState<string>('');
  const [newPassInput, setNewPassInput] = useState<string>('');
  const [confirmPassInput, setConfirmPassInput] = useState<string>('');
  const [showCurrentPass, setShowCurrentPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [isChangingPass, setIsChangingPass] = useState<boolean>(false);

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!newPassInput) {
      setPassError(t('xrwa.passErrorEmpty'));
      return;
    }
    if (newPassInput !== confirmPassInput) {
      setPassError(t('xrwa.passErrorMatch'));
      return;
    }
    if (newPassInput === currentPassInput) {
      setPassError(t('xrwa.passErrorSame'));
      return;
    }
    if (newPassInput.length < 6) {
      setPassError(t('xrwa.passErrorMin'));
      return;
    }

    setIsChangingPass(true);
    const result = changeOwnerPassword(currentPassInput, newPassInput);
    setIsChangingPass(false);

    if (!result.success && result.errorKey) {
      setPassError(t(result.errorKey));
    } else if (result.success) {
      setPassSuccess(t('xrwa.passChangedSuccess'));
      setCurrentPassInput('');
      setNewPassInput('');
      setConfirmPassInput('');
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
          The X-RWA section is restricted exclusively to authorized administrators. Ordinary user accounts cannot access institutional fee configurations.
        </p>
      </div>
    );
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setAuthError('Please enter the security verification password.');
      return;
    }
    setIsLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/verify-fees-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput.trim() })
      });
      const data = await res.json();

      if (data.success) {
        setIsUnlocked(true);
        setEditedConfig(feeConfiguration);
        addAuditLog('X_RWA_UNLOCKED', 'Administrator successfully authenticated and unlocked X-RWA dashboard.', 'SUCCESS');
      } else {
        setAuthError('Invalid password. Access denied.');
        addAuditLog('X_RWA_UNLOCK_FAILED', 'Failed attempt to unlock X-RWA with incorrect password.', 'FAILED');
      }
    } catch (err) {
      setAuthError('Verification service error. Please try again.');
    } finally {
      setIsLoading(false);
      setPasswordInput('');
    }
  };

  const handleSave = () => {
    const updated: FeeConfiguration = {
      ...editedConfig,
      lastUpdated: new Date().toISOString(),
      updatedBy: `${user.username} (${user.email})`
    };
    updateFeeConfiguration(updated);
    setIsEditing(false);
    setSaveSuccessMessage('Fee configuration successfully updated. Active warning synchronized with Withdraw Funds.');
    setTimeout(() => setSaveSuccessMessage(''), 4000);
  };

  const handleCancel = () => {
    setEditedConfig(feeConfiguration);
    setIsEditing(false);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all withdrawal warning configurations to default values?')) {
      resetFeeConfiguration();
      setEditedConfig(feeConfiguration);
      setSaveSuccessMessage('Fee configuration reset to default values.');
      setTimeout(() => setSaveSuccessMessage(''), 4000);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto my-16 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl animate-fadeIn">
        <div className="text-center space-y-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">X-RWA Security Verification</h1>
          <p className="text-xs text-slate-400">
            Secure backend credential required to access the X-RWA administration portal and withdrawal fee configuration.
          </p>
        </div>

        {authError && (
          <div className="mb-4 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Security Authorization Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500 pr-10"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Authenticate & Open X-RWA</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  const activeKeyDisplay = feeConfiguration.activeWarningKey || 'step1';
  const activeStepNumber = activeKeyDisplay === 'step1' ? '1' : activeKeyDisplay === 'step2' ? '2' : activeKeyDisplay === 'step3' ? '3' : '4';

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-5xl mx-auto px-4 sm:px-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono uppercase font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Secure Session Active
            </span>
            <span className="text-xs text-amber-400 font-mono font-bold">Active Warning: Warning {activeStepNumber}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">X-RWA</h1>
          <p className="text-xs text-slate-400 mt-1">Select which single warning configuration appears on Withdraw Funds. Changes synchronize instantly.</p>
        </div>

        <div className="flex items-center gap-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => {
                  setEditedConfig(feeConfiguration);
                  setIsEditing(true);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-600/20"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Configuration</span>
              </button>
              <button
                onClick={handleReset}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset to Default</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
              <button
                onClick={handleCancel}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-emerald-300 text-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Sub-Tabs: Fee Configuration vs Change Login Password */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('fees')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'fees'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          Fee Configuration
        </button>
        <button
          onClick={() => setActiveSubTab('password')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'password'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{t('xrwa.changePasswordTitle')}</span>
        </button>
      </div>

      {activeSubTab === 'password' ? (
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6 animate-fadeIn my-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">{t('xrwa.changePasswordTitle')}</h2>
            <p className="text-xs text-slate-400">
              {t('xrwa.passRequirements')}
            </p>
          </div>

          {passError && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{passError}</span>
            </div>
          )}

          {passSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3 text-emerald-300 text-xs">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">{passSuccess}</p>
                <p className="text-[11px] text-emerald-400/80">You have been signed out securely. Please sign in again using your new password.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">{t('xrwa.currentPassword')}</label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassInput}
                  onChange={(e) => setCurrentPassInput(e.target.value)}
                  placeholder="Enter current password..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">{t('xrwa.newPassword')}</label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  placeholder="Enter new password..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">{t('xrwa.confirmNewPassword')}</label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPassInput}
                  onChange={(e) => setConfirmPassInput(e.target.value)}
                  placeholder="Confirm new password..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              {isChangingPass ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>{t('xrwa.changePasswordBtn')}</span>}
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Audit Info & Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
            <div>
              <span>Last Updated: <strong className="text-white font-mono">{new Date(feeConfiguration.lastUpdated).toUTCString()}</strong></span>
            </div>
            <div>
              <span>Updated By: <strong className="text-white font-mono">{feeConfiguration.updatedBy}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-emerald-400 font-semibold">Single Active Warning Display Enabled</span>
            </div>
          </div>

          {/* Four Warning Configurations */}
          <div className="space-y-6">
            {(['step1', 'step2', 'step3', 'step4'] as const).map((stepKey, index) => {
              const stepData = isEditing ? editedConfig[stepKey] : feeConfiguration[stepKey];
              const isActive = (isEditing ? editedConfig.activeWarningKey : feeConfiguration.activeWarningKey) === stepKey;
              return (
                <div
                  key={stepKey}
                  className={`bg-slate-900 border rounded-3xl p-6 shadow-xl space-y-4 transition-all ${
                    isActive ? 'border-amber-500/60 ring-1 ring-amber-500/30' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-xl font-mono font-bold flex items-center justify-center border ${
                        isActive ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                      }`}>
                        0{index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Warning Option {index + 1}</h2>
                          {isActive && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
                              Active on Withdraw Funds
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">Select this option to make it the single active warning displayed on Withdraw Funds.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {!isEditing ? (
                        <span className="text-xs bg-slate-950 text-amber-400 px-3 py-1 rounded-xl font-mono font-bold border border-slate-800">
                          {stepData.amount}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditedConfig(prev => ({ ...prev, activeWarningKey: stepKey }));
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            isActive
                              ? 'bg-amber-500 text-slate-950 shadow-amber-500/30 font-extrabold'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {isActive ? '✓ Active Warning Selected' : 'Select as Active Warning'}
                        </button>
                      )}
                    </div>
                  </div>

                  {!isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Title & Amount</label>
                        <p className="text-sm font-bold text-white mt-0.5">{stepData.title} ({stepData.amount})</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Warning Wording / Instructions</label>
                        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-300 font-mono whitespace-pre-line mt-1 leading-relaxed">
                          {stepData.description}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-400 mb-1">Warning Title</label>
                          <input
                            type="text"
                            value={stepData.title}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditedConfig(prev => ({
                                ...prev,
                                [stepKey]: { ...prev[stepKey], title: val }
                              }));
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Amount</label>
                          <input
                            type="text"
                            value={stepData.amount}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditedConfig(prev => ({
                                ...prev,
                                [stepKey]: { ...prev[stepKey], amount: val }
                              }));
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Detailed Warning Wording / Instructions</label>
                        <textarea
                          rows={5}
                          value={stepData.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditedConfig(prev => ({
                              ...prev,
                              [stepKey]: { ...prev[stepKey], description: val }
                            }));
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500 leading-relaxed"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
