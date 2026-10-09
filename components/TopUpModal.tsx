'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { CreditCard, Landmark, ArrowRight, ShieldCheck, AlertCircle, RefreshCw, X, Lock } from 'lucide-react';
import { Success3DAnimation } from '@/components/Success3DAnimation';
import { TransactionRecord } from '@/types';

interface TopUpModalProps {
  onClose: () => void;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({ onClose }) => {
  const { bankAccounts, creditCards, balances, setBalances, transactions, setTransactions, addAuditLog, formatMoney, user, checkAccountActive, setIsActivationModalOpen } = useApp();
  
  const [step, setStep] = useState<'select' | 'review' | 'processing'>('select');
  const [fundingSourceType, setFundingSourceType] = useState<'bank' | 'card'>('card');
  const [selectedSourceId, setSelectedSourceId] = useState<string>(creditCards[0]?.id || bankAccounts[0]?.id || '');
  const [amount, setAmount] = useState<string>('500');
  const [destinationBalance, setDestinationBalance] = useState<string>('USD');
  const [cvv, setCvv] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState<boolean>(false);
  const [successResultData, setSuccessResultData] = useState<{ title: string; subtitle: string } | null>(null);

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkAccountActive()) {
      onClose();
      return;
    }
    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      setErrorMsg('Please enter a valid top-up amount.');
      return;
    }
    if (numAmt > 5000000) {
      setErrorMsg('Insufficient funds. Your available balance is not enough to complete this transaction.');
      return;
    }
    if (cvv === '000') {
      setErrorMsg('Unable to verify available funds. Please try again or use another verified payment method.');
      return;
    }
    if (fundingSourceType === 'card' && (!cvv || cvv.length < 3)) {
      setErrorMsg('Please enter your secure CVV for payment provider authorization.');
      return;
    }

    setErrorMsg('');
    setStep('review');
  };

  const handleConfirmTopUp = async () => {
    if (!checkAccountActive()) {
      onClose();
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const numAmt = parseFloat(amount);
      const res = await fetch('/api/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'TOP_UP', amount: numAmt, userId: user.id, accountStatus: user.accountStatus })
      });
      const data = await res.json();
      if (!res.ok || data.error === 'ACCOUNT_REACTIVATION_REQUIRED') {
        setIsProcessing(false);
        setErrorMsg(data.message || 'Your main account is currently Dormant. Transactions are temporarily unavailable.');
        addAuditLog('TRANSACTION_BLOCKED_DORMANT', data.message || 'Dormant account transaction blocked server-side.', 'FAILED');
        setIsActivationModalOpen(true);
        onClose();
        return;
      }
    } catch (e) {
      console.error(e);
    }

    // Simulate real authorized payment processing and settlement
    setTimeout(() => {
      setIsProcessing(false);

      // Check if card or funding failed/declined/insufficient funds simulation
      if (cvv === '000' || amount === '99999') {
        setErrorMsg('Your selected payment method does not have enough available funds for this transaction.');
        addAuditLog('TOP_UP_FAILED', 'Top-up declined due to insufficient available funds.', 'FAILED');
        setStep('select');
        return;
      }

      const numAmt = parseFloat(amount);

      // Update balances
      const updatedBalances = balances.map(b => {
        if (b.assetSymbol === destinationBalance || (destinationBalance === 'USD' && b.assetSymbol === 'USDT')) {
          const newAvail = b.available + numAmt;
          const ratio = b.available > 0 ? b.valueUSD / b.available : 1;
          return {
            ...b,
            available: newAvail,
            valueUSD: newAvail * (destinationBalance === 'USD' ? 1 : ratio)
          };
        }
        return b;
      });
      setBalances(updatedBalances);

      // Create transaction record
      const sourceName = fundingSourceType === 'card' 
        ? `Card •••• ${creditCards.find(c => c.id === selectedSourceId)?.last4 || '1234'}`
        : `Bank Account (${bankAccounts.find(b => b.id === selectedSourceId)?.bankName || 'Partner Bank'})`;

      const newTx: TransactionRecord = {
        id: `TOP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        timestamp: Date.now(),
        type: 'deposit',
        status: 'Completed',
        coin: destinationBalance,
        amount: numAmt,
        fiatValue: numAmt,
        direction: 'inflow',
        network: 'Payment Gateway',
        walletType: 'Main Account Balance',
        confirmationCount: 1,
        anonymousCounterpartyId: sourceName,
        fee: 0.00,
        reference: `Top Up via ${sourceName}`
      };

      setTransactions([newTx, ...transactions]);
      addAuditLog('TOP_UP_SUCCESSFUL', `Successfully topped up $${numAmt.toFixed(2)} via ${sourceName}.`, 'SUCCESS');

      // Clear CVV
      setCvv('');

      // Trigger 3D Success Animation
      setSuccessResultData({
        title: 'Funds Added Successfully',
        subtitle: `+$${numAmt.toFixed(2)}`
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

      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-scaleUp">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Dedicated Top Up Feature</h3>
              <p className="text-xs text-slate-400">Add funds instantly via verified bank or debit/credit card</p>
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

        {step === 'select' && (
          <form onSubmit={handleProceedToReview} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Select Funding Source Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFundingSourceType('card');
                    setSelectedSourceId(creditCards[0]?.id || '');
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    fundingSourceType === 'card' 
                      ? 'bg-blue-600/20 border-blue-500 text-white' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Linked Debit/Credit Card</p>
                    <p className="text-[10px] text-slate-400">Instant Settlement</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFundingSourceType('bank');
                    setSelectedSourceId(bankAccounts[0]?.id || '');
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    fundingSourceType === 'bank' 
                      ? 'bg-blue-600/20 border-blue-500 text-white' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Landmark className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Bank Account</p>
                    <p className="text-[10px] text-slate-400">ACH / Wire Transfer</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Select specific account/card */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {fundingSourceType === 'card' ? 'Select Tokenized Card' : 'Select Bank Account'}
              </label>
              <select
                value={selectedSourceId}
                onChange={(e) => setSelectedSourceId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                required
              >
                {fundingSourceType === 'card' ? (
                  creditCards.length === 0 ? (
                    <option value="">No cards linked. Please add a card first in Banking & Cards.</option>
                  ) : (
                    creditCards.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.cardBrand} •••• {c.last4} ({c.cardHolder})
                      </option>
                    ))
                  )
                ) : (
                  bankAccounts.length === 0 ? (
                    <option value="">No bank accounts linked. Please add a bank account first.</option>
                  ) : (
                    bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} - {b.accountType} ({b.accountNumberMasked})
                      </option>
                    ))
                  )
                )}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Top-Up Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-400">$</span>
                <input
                  type="number"
                  step="1"
                  min="10"
                  max="50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white font-mono font-bold"
                  required
                />
              </div>
            </div>

            {/* Destination Balance */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Destination Balance</label>
              <select
                value={destinationBalance}
                onChange={(e) => setDestinationBalance(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="USD">Available Account Balance (USD)</option>
                <option value="USDT">USDT Stablecoin Balance</option>
                <option value="BTC">Bitcoin (BTC) Purchase Balance</option>
                <option value="ETH">Ethereum (ETH) Purchase Balance</option>
              </select>
            </div>

            {/* CVV if card */}
            {fundingSourceType === 'card' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-400">Card CVV (Secure Authorization Check)</label>
                  <span className="text-[10px] text-amber-400 font-mono">Never Stored</span>
                </div>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="•••"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono tracking-widest text-center"
                  required
                />
              </div>
            )}

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
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
              >
                <span>Review Top Up</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Review Transaction Details</h4>
              
              <div className="flex justify-between text-xs py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Funding Source:</span>
                <span className="text-white font-mono font-bold">
                  {fundingSourceType === 'card' 
                    ? `Card •••• ${creditCards.find(c => c.id === selectedSourceId)?.last4 || '1234'}`
                    : `Bank Account (${bankAccounts.find(b => b.id === selectedSourceId)?.bankName || 'Partner'})`
                  }
                </span>
              </div>

              <div className="flex justify-between text-xs py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Top-Up Amount:</span>
                <span className="text-emerald-400 font-mono font-bold text-sm">${parseFloat(amount || '0').toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-xs py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Destination Balance:</span>
                <span className="text-white font-mono font-bold">{destinationBalance}</span>
              </div>

              <div className="flex justify-between text-xs py-1.5">
                <span className="text-slate-400">Provider Fee:</span>
                <span className="text-slate-300 font-mono">$0.00 (Institutional Zero Fee)</span>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Funds will be credited immediately upon successful authorization by the payment processor and settlement confirmation.
              </span>
            </div>

            {isProcessing && (
              <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 p-3 rounded-xl text-xs flex items-center gap-2 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-blue-400" />
                <span>Processing Payment Gateway Authorization & Settlement...</span>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStep('select')}
                disabled={isProcessing}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmTopUp}
                disabled={isProcessing}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Authorizing...' : 'Confirm & Authorize Payment'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
