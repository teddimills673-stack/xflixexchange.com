'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { ShieldCheck, AlertCircle, RefreshCw, X, Lock, Send } from 'lucide-react';
import { Success3DAnimation } from '@/components/Success3DAnimation';
import { TransactionRecord } from '@/types';

interface SendBtcModalProps {
  onClose: () => void;
}

export const SendBtcModal: React.FC<SendBtcModalProps> = ({ onClose }) => {
  const { balances, setBalances, transactions, setTransactions, addAuditLog, user, checkAccountActive, setIsActivationModalOpen } = useApp();

  const btcBalanceObj = balances.find(b => b.assetSymbol === 'BTC') || { available: 1.245, valueUSD: 112050 };
  
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [btcAmount, setBtcAmount] = useState<string>('0.05');
  const [step, setStep] = useState<'form' | 'review'>('form');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState<boolean>(false);
  const [successResultData, setSuccessResultData] = useState<{ title: string; subtitle: string } | null>(null);

  const btcPriceUSD = 90000; // current approx price
  const fiatEquivalent = (parseFloat(btcAmount || '0') * btcPriceUSD).toFixed(2);
  const networkFeeBTC = 0.0001;
  const totalBtcDeduction = parseFloat(btcAmount || '0') + networkFeeBTC;

  const handleProceedReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkAccountActive()) {
      onClose();
      return;
    }
    const amt = parseFloat(btcAmount);
    if (isNaN(amt) || amt <= 0) {
      setErrorMsg('Please enter a valid BTC amount.');
      return;
    }
    if (totalBtcDeduction > btcBalanceObj.available) {
      setErrorMsg('Insufficient BTC balance including network fee (0.0001 BTC).');
      return;
    }
    if (!recipientAddress.trim() || recipientAddress.length < 20) {
      setErrorMsg('Please enter a valid recipient Bitcoin address.');
      return;
    }

    // Check invalid address simulation
    if (recipientAddress.startsWith('INVALID')) {
      setErrorMsg('Your Bitcoin transaction was not completed. Invalid destination address.');
      return;
    }

    setErrorMsg('');
    setStep('review');
  };

  const handleConfirmSendBtc = async () => {
    if (!checkAccountActive()) {
      onClose();
      return;
    }

    setIsSending(true);
    setErrorMsg('');

    try {
      const amt = parseFloat(btcAmount);
      const res = await fetch('/api/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'SEND_BTC', amount: amt, userId: user.id, accountStatus: user.accountStatus })
      });
      const data = await res.json();
      if (!res.ok || data.error === 'ACCOUNT_REACTIVATION_REQUIRED') {
        setIsSending(false);
        setErrorMsg(data.message || 'Your main account is currently Dormant. Transactions are temporarily unavailable.');
        addAuditLog('TRANSACTION_BLOCKED_DORMANT', data.message || 'Dormant account transaction blocked server-side.', 'FAILED');
        setIsActivationModalOpen(true);
        onClose();
        return;
      }
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      setIsSending(false);

      const amt = parseFloat(btcAmount);

      // Update balances
      const updatedBalances = balances.map(b => {
        if (b.assetSymbol === 'BTC') {
          const newAvail = b.available - totalBtcDeduction;
          return {
            ...b,
            available: newAvail > 0 ? newAvail : 0,
            valueUSD: newAvail * btcPriceUSD
          };
        }
        return b;
      });
      setBalances(updatedBalances);

      // Create transaction record
      const newTx: TransactionRecord = {
        id: `BTC-TX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        timestamp: Date.now(),
        type: 'withdrawal',
        status: 'Completed',
        coin: 'BTC',
        amount: amt,
        fiatValue: parseFloat(fiatEquivalent),
        direction: 'outflow',
        network: 'Bitcoin Mainnet',
        walletType: 'Cold Storage Vault',
        confirmationCount: 1,
        anonymousCounterpartyId: recipientAddress.slice(0, 10) + '...',
        fee: networkFeeBTC,
        reference: `Send BTC to ${recipientAddress}`
      };

      setTransactions([newTx, ...transactions]);
      addAuditLog('BTC_SENT_SUCCESSFUL', `Successfully broadcasted ${amt} BTC to ${recipientAddress}. Tx Hash: 0x${Math.random().toString(16).substring(2, 16)}`, 'SUCCESS');

      setSuccessResultData({
        title: 'BTC Sent Successfully',
        subtitle: `${amt} BTC (~$${fiatEquivalent})`
      });
      setShowSuccessAnimation(true);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {showSuccessAnimation && successResultData && (
        <Success3DAnimation
          title={successResultData.title}
          subtitle={successResultData.subtitle}
          onClose={() => {
            setShowSuccessAnimation(false);
            onClose();
          }}
        />
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-scaleUp">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono">
              ₿
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Send Bitcoin (BTC)</h3>
              <p className="text-xs text-slate-400">Secure crypto infrastructure transfer</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleProceedReview} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-400">Recipient Bitcoin Address</label>
                <span className="text-[10px] text-amber-400 font-mono">Available: {btcBalanceObj.available} BTC</span>
              </div>
              <input
                type="text"
                placeholder="bc1q... or 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Amount in BTC</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.00001"
                  min="0.0001"
                  value={btcAmount}
                  onChange={(e) => setBtcAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-16 py-2 text-xs text-white font-mono font-bold"
                  required
                />
                <span className="absolute right-3 top-2 text-xs font-mono text-slate-400">BTC</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">
                ≈ ${fiatEquivalent} USD (Exchange Rate: $90,000 / BTC)
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Network Fee:</span>
                <span className="text-white">0.0001 BTC</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Deduction:</span>
                <span className="text-amber-400 font-bold">{totalBtcDeduction.toFixed(5)} BTC</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-amber-600/30 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Review BTC Send</span>
              </button>
            </div>
          </form>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Review Bitcoin Transfer</h4>
              
              <div className="py-1 border-b border-slate-800/60">
                <span className="text-[10px] text-slate-400 uppercase font-mono">Destination Address:</span>
                <p className="text-xs text-white font-mono break-all mt-0.5">{recipientAddress}</p>
              </div>

              <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                <span className="text-slate-400">BTC Amount:</span>
                <span className="text-amber-400 font-mono font-bold">{btcAmount} BTC</span>
              </div>

              <div className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Fiat Equivalent:</span>
                <span className="text-white font-mono">${fiatEquivalent} USD</span>
              </div>

              <div className="flex justify-between text-xs py-1">
                <span className="text-slate-400">Network Miner Fee:</span>
                <span className="text-slate-300 font-mono">0.0001 BTC</span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Transaction will be broadcasted to the Bitcoin Mainnet infrastructure. Once broadcasted, blockchain transfers are irreversible.
              </span>
            </div>

            {isSending && (
              <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 p-3 rounded-xl text-xs flex items-center gap-2 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-blue-400" />
                <span>Broadcasting Transaction to Bitcoin Network...</span>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStep('form')}
                disabled={isSending}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmSendBtc}
                disabled={isSending}
                className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-amber-600/30 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isSending ? 'Broadcasting...' : 'Confirm & Broadcast BTC'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
