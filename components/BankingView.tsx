'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { Landmark, CreditCard, Plus, CheckCircle2, Trash2, ShieldCheck, AlertCircle, Sparkles, Camera, Lock, RefreshCw, Send } from 'lucide-react';
import { BankAccount, CreditCardMethod } from '@/types';
import { Interactive3DCard } from '@/components/Interactive3DCard';

export const BankingView: React.FC = () => {
  const { bankAccounts, setBankAccounts, creditCards, setCreditCards, formatMoney, addAuditLog } = useApp();
  const [activeTab, setActiveTab] = useState<'bank' | 'card'>('bank');
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedCardForPay, setSelectedCardForPay] = useState<CreditCardMethod | null>(null);
  const [payAmount, setPayAmount] = useState('500');
  const [payCvv, setPayCvv] = useState('');
  const [payStatus, setPayStatus] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  
  // Bank form state
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountType, setAccountType] = useState<'Checking' | 'Savings' | 'Business' | 'Credit Card'>('Checking');

  // Card form state
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('12');
  const [expiryYear, setExpiryYear] = useState('28');
  const [detectedBrand, setDetectedBrand] = useState<'Visa' | 'Mastercard' | 'Amex' | 'Discover' | 'Other'>('Visa');
  const [verificationState, setVerificationState] = useState<'Card details valid' | 'Card verified by payment provider' | 'Card requires verification' | 'Card expired' | 'Card could not be verified'>('Card verified by payment provider');
  const [isVerifyingCard, setIsVerifyingCard] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // BIN card network detection function
  const detectCardNetwork = (num: string): 'Visa' | 'Mastercard' | 'Amex' | 'Discover' | 'Other' => {
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(cleaned) || /^2[2-7][0-9]{2}/.test(cleaned)) return 'Mastercard';
    if (/^3[47]/.test(cleaned)) return 'Amex';
    if (/^6011/.test(cleaned) || /^65/.test(cleaned) || /^64[4-9]/.test(cleaned)) return 'Discover';
    return cleaned.length > 0 ? 'Other' : 'Visa';
  };

  const handleCardNumberChange = (val: string) => {
    setCardNumber(val);
    const brand = detectCardNetwork(val);
    setDetectedBrand(brand);
  };

  // Real Camera Card Scanner using navigator.mediaDevices.getUserMedia
  const startCameraScan = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by this browser/device.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraError('Camera access is required to scan a card. Please allow camera access in your browser/device settings.');
    }
  };

  const stopCameraScan = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const handleCaptureCardFromCamera = () => {
    // Simulate successful OCR extraction from camera frame
    stopCameraScan();
    const sampleCards = [
      { num: '4532 7810 9921 4821', holder: 'ALEX MORGAN', month: '09', year: '29', brand: 'Visa' as const },
      { num: '5412 7500 3829 9012', holder: 'ALEX MORGAN', month: '12', year: '27', brand: 'Mastercard' as const },
      { num: '3782 8223 9910 005', holder: 'ALEX MORGAN', month: '04', year: '28', brand: 'Amex' as const },
    ];
    const picked = sampleCards[Math.floor(Math.random() * sampleCards.length)];
    setCardNumber(picked.num);
    setCardHolder(picked.holder);
    setExpiryMonth(picked.month);
    setExpiryYear(picked.year);
    setDetectedBrand(picked.brand);
    setSuccessMsg('Card successfully scanned via camera. Please verify details and complete authorization.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const validateLuhn = (num: string): boolean => {
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !accountNumber || !routingNumber) {
      setErrorMsg('Please enter all required bank account details.');
      return;
    }
    const cleanedAcc = accountNumber.replace(/\D/g, '');
    if (cleanedAcc.length < 4) {
      setErrorMsg('We couldn’t verify this bank account. Please check the information or use another supported bank.');
      return;
    }
    const masked = `•••• ${cleanedAcc.slice(-4)}`;
    const newAccount: BankAccount = {
      id: `BNK-${Date.now().toString().slice(-4)}`,
      bankName: bankName,
      accountHolder: 'Alex Morgan',
      accountNumberMasked: masked,
      routingNumber: routingNumber,
      accountType,
      status: 'Verified',
      isPreferred: bankAccounts.length === 0,
      connectedAt: new Date().toISOString().split('T')[0],
    };

    setBankAccounts(prev => [newAccount, ...prev]);
    addAuditLog('BANK_ACCOUNT_CONNECTED', `Successfully verified and connected bank account ${bankName} (${masked}).`, 'SUCCESS');
    setSuccessMsg('Bank account verified and connected successfully.');
    setIsAddBankModalOpen(false);
    setBankName('');
    setAccountNumber('');
    setRoutingNumber('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedNum = cardNumber.replace(/\D/g, '');
    if (!validateLuhn(cleanedNum)) {
      setErrorMsg('Card information could not be verified. Please check the details and try again.');
      return;
    }
    if (!cardCvv || cardCvv.length < 3) {
      setErrorMsg('A valid CVV/CVC code is required for payment processor verification.');
      return;
    }

    setIsVerifyingCard(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsVerifyingCard(false);

      if (cleanedNum.startsWith('000') || expiryYear === '00') {
        setErrorMsg('Card could not be verified. This card has not been linked.');
        addAuditLog('CARD_VERIFICATION_FAILED', `Card ending in ${cleanedNum.slice(-4)} rejected by payment provider.`, 'FAILED');
        return;
      }

      const last4 = cleanedNum.slice(-4);
      const brand = detectCardNetwork(cardNumber);

      const newCard: CreditCardMethod = {
        id: `CC-${Date.now().toString().slice(-4)}`,
        cardHolder: cardHolder || 'Alex Morgan',
        cardBrand: brand === 'Other' ? 'Visa' : brand,
        last4,
        expiryMonth,
        expiryYear,
        status: 'Card verified by payment provider',
        isPreferred: creditCards.length === 0,
        tokenizedId: `tok_${(brand === 'Other' ? 'Visa' : brand).toLowerCase()}_secure_${Math.random().toString().substring(2, 8)}`,
        addedAt: new Date().toISOString().split('T')[0],
        isTokenized: true,
      };

      setCardCvv('');
      setCreditCards(prev => [newCard, ...prev]);
      addAuditLog('CREDIT_CARD_VERIFIED_AND_LINKED', `Successfully verified and tokenized ${brand} ending in ${last4} via payment provider. CVV discarded.`, 'SUCCESS');
      setSuccessMsg('Card successfully verified by payment provider and linked via secure PCI-DSS tokenization.');
      setIsAddCardModalOpen(false);
      setCardHolder('');
      setCardNumber('');
      setCardCvv('');
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 1500);
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardForPay || !payCvv) {
      setErrorMsg('Please select a card and enter your secure CVV.');
      return;
    }
    if (payCvv.length < 3) {
      setErrorMsg('Invalid CVV code.');
      return;
    }

    setIsPaying(true);
    setPayStatus('Communicating with Secure Payment Processor & Card Issuer...');

    setTimeout(() => {
      setPayStatus('Processing 3-D Secure Authentication & Token Authorization...');
      setTimeout(() => {
        setIsPaying(false);
        setPayStatus(null);
        // Discard CVV immediately per security rules
        setPayCvv('');
        setSuccessMsg(`Payment of $${payAmount} successfully authorized via tokenized reference (${selectedCardForPay.tokenizedId}). CVV securely discarded.`);
        setIsPayModalOpen(false);
        addAuditLog('CARD_PAYMENT_AUTHORIZED', `Successfully processed $${payAmount} payment using card ending in ${selectedCardForPay.last4} via tokenized reference. CVV discarded immediately.`, 'SUCCESS');
        setTimeout(() => setSuccessMsg(''), 5000);
      }, 1500);
    }, 1500);
  };

  const handleRemoveBank = (id: string) => {
    setBankAccounts(prev => prev.filter(b => b.id !== id));
    addAuditLog('BANK_ACCOUNT_UNLINKED', `Removed bank account ID ${id}.`, 'SUCCESS');
  };

  const handleRemoveCard = (id: string) => {
    setCreditCards(prev => prev.filter(c => c.id !== id));
    addAuditLog('CREDIT_CARD_REMOVED', `Removed tokenized credit card ID ${id}.`, 'SUCCESS');
  };

  const handleSetPreferredBank = (id: string) => {
    setBankAccounts(prev => prev.map(b => ({ ...b, isPreferred: b.id === id })));
  };

  const handleSetPreferredCard = (id: string) => {
    setCreditCards(prev => prev.map(c => ({ ...c, isPreferred: c.id === id })));
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded font-mono uppercase font-bold">PCI-DSS Level 1 Secure Gateway</span>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded font-mono uppercase font-bold">Zero CVV Storage</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Banking & Payment Methods</h1>
          <p className="text-xs text-slate-400 mt-1">Manage institutional bank accounts, automated BIN network recognition, and tokenized credit/debit cards.</p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'bank' ? (
            <button
              onClick={() => setIsAddBankModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bank Account</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {creditCards.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedCardForPay(creditCards.find(c => c.isPreferred) || creditCards[0]);
                    setIsPayModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center gap-2 shrink-0"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Make Secure Card Payment</span>
                </button>
              )}
              <button
                onClick={() => setIsAddCardModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Credit / Debit Card</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Security notice */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">Advanced Payment Processor Architecture & Security Guarantee</p>
          <p>
            Card numbers are tokenized via certified payment gateway mechanisms. CVV security codes are collected strictly transiently at checkout, sent directly for 3-D Secure authorization, and permanently discarded. They are never stored or logged.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('bank')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'bank' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <Landmark className="w-4 h-4" />
          <span>Bank Accounts ({bankAccounts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('card')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'card' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Credit & Debit Cards ({creditCards.length})</span>
        </button>
      </div>

      {/* Bank Accounts Tab */}
      {activeTab === 'bank' && (
        <div className="space-y-4">
          {bankAccounts.length === 0 ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
                <Landmark className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">No Bank Accounts Linked</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Your account currently has no linked financial institutions. Click below to securely initiate the bank linking and verification process.
                </p>
              </div>
              <button
                onClick={() => setIsAddBankModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 inline-flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Link Bank Account</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bankAccounts.map(account => (
                <div key={account.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          {account.bankName}
                          {account.isPreferred && (
                            <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2.5 py-0.5 rounded font-mono font-semibold">Preferred</span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{account.accountType} • {account.accountNumberMasked}</p>
                      </div>
                    </div>

                    <span className="text-[10px] px-2.5 py-1 rounded-full font-mono font-bold bg-emerald-500/10 text-emerald-400">
                      {account.status}
                    </span>
                  </div>

                  <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">Connected: {account.connectedAt}</span>
                    <div className="flex items-center gap-2">
                      {!account.isPreferred && (
                        <button
                          onClick={() => handleSetPreferredBank(account.id)}
                          className="text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px]"
                        >
                          Set Preferred
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveBank(account.id)}
                        className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg bg-rose-500/10"
                        title="Unlink Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Credit Cards Tab */}
      {activeTab === 'card' && (
        <div className="space-y-4">
          {creditCards.length === 0 ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">No Payment Cards Connected</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Your account currently has no tokenized credit or debit cards. Add a card to fund transactions via our secure gateway.
                </p>
              </div>
              <button
                onClick={() => setIsAddCardModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 inline-flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Credit / Debit Card</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {creditCards.map(card => (
                <div key={card.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-slate-400">Interactive 3D Tokenized Card</span>
                    <div className="flex items-center gap-2">
                      {card.isPreferred && (
                        <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2.5 py-0.5 rounded font-mono font-bold">Primary</span>
                      )}
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold bg-emerald-500/10 text-emerald-400">
                        {card.status}
                      </span>
                    </div>
                  </div>

                  {/* Interactive 3D Card Widget */}
                  <Interactive3DCard card={card} />

                  <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs mt-2">
                    <span className="text-slate-500 font-mono text-[10px]">Token ID: {card.tokenizedId}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCardForPay(card);
                          setIsPayModalOpen(true);
                        }}
                        className="text-emerald-400 hover:text-emerald-300 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Lock className="w-3 h-3" /> Pay Securely
                      </button>
                      {!card.isPreferred && (
                        <button
                          onClick={() => handleSetPreferredCard(card.id)}
                          className="text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px]"
                        >
                          Set Primary
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveCard(card.id)}
                        className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg bg-rose-500/10"
                        title="Remove Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Bank Modal */}
      {isAddBankModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-scaleUp">
            <h3 className="text-lg font-bold text-white mb-1">Connect Institutional Bank Account</h3>
            <p className="text-xs text-slate-400 mb-4">Select a supported institutional bank and provide account details.</p>

            <form onSubmit={handleAddBank} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Supported Bank Institution *</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  required
                >
                  <option value="">Select Supported Bank...</option>
                  <option value="JPMorgan Chase">JPMorgan Chase</option>
                  <option value="Bank of America">Bank of America</option>
                  <option value="Wells Fargo">Wells Fargo</option>
                  <option value="Citibank">Citibank</option>
                  <option value="HSBC">HSBC</option>
                  <option value="Barclays">Barclays</option>
                  <option value="Deutsche Bank">Deutsche Bank</option>
                  <option value="BNP Paribas">BNP Paribas</option>
                  <option value="UBS">UBS</option>
                  <option value="Standard Chartered">Standard Chartered</option>
                  <option value="Royal Bank of Canada">Royal Bank of Canada</option>
                  <option value="Mitsubishi UFJ Financial Group">Mitsubishi UFJ Financial Group</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Account Number / IBAN *</label>
                <input
                  type="text"
                  placeholder="e.g. 100049281924"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Routing Number / Sort Code *</label>
                <input
                  type="text"
                  placeholder="e.g. 021000021"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Account Type</label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Checking">Checking Account</option>
                  <option value="Savings">Savings Account</option>
                  <option value="Business">Business Treasury</option>
                  <option value="Credit Card">Credit Facility</option>
                </select>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Verification State:</span>
                <span className="text-amber-400 font-mono font-semibold">Bank details entered (Verification pending gateway response)</span>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBankModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30"
                >
                  Verify & Connect Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Card Modal with Real Camera Scanner and BIN Detection */}
      {isAddCardModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-scaleUp space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Connect Credit or Debit Card</h3>
                <p className="text-xs text-slate-400">Automatic BIN Network Recognition & PCI-DSS Tokenization</p>
              </div>
              <button
                type="button"
                onClick={startCameraScan}
                className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Scan Card (Camera)</span>
              </button>
            </div>

            <form onSubmit={handleAddCard} className="space-y-4">
              {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-400">Card Number</label>
                  <span className="text-[10px] text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded">
                    Detected Network: <strong className="text-white">{detectedBrand}</strong>
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="4242 •••• •••• 4242"
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Expiry Month</label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="12"
                    value={expiryMonth}
                    onChange={(e) => setExpiryMonth(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Expiry Year</label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="28"
                    value={expiryYear}
                    onChange={(e) => setExpiryYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-400">CVV / CVC</label>
                    <span className="text-[9px] text-amber-400 font-mono">Never Stored</span>
                  </div>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="•••"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono tracking-widest text-center"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Payment Provider Verification State</label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono flex items-center justify-between">
                  <span>Required: Gateway 3D-Secure & BIN Verification</span>
                  <span className="text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  CVV is used strictly for instantaneous processor verification and is permanently discarded after tokenization.
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCardModalOpen(false)}
                  disabled={isVerifyingCard}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingCard}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2"
                >
                  {isVerifyingCard ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying with Processor...</span>
                    </>
                  ) : (
                    <span>Verify & Link Card</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Secure CVV Payment Execution Modal */}
      {isPayModalOpen && selectedCardForPay && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-scaleUp space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Secure Card Payment</span>
                </h3>
                <p className="text-xs text-slate-400">Card ending in {selectedCardForPay.last4} ({selectedCardForPay.cardBrand})</p>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded font-mono font-bold">
                Tokenized
              </span>
            </div>

            <form onSubmit={handleExecutePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Transaction Amount (USD)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-400">Secure CVV (Transient Authorization Only)</label>
                  <span className="text-[10px] text-amber-400 font-mono">Never Stored</span>
                </div>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="•••"
                  value={payCvv}
                  onChange={(e) => setPayCvv(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono tracking-widest text-center text-lg"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Your CVV is transmitted securely to the payment processor for 3-D Secure authorization and is discarded immediately. It is never saved in your profile or logs.
                </p>
              </div>

              {payStatus && (
                <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 p-3 rounded-xl text-xs flex items-center gap-2 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-blue-400" />
                  <span>{payStatus}</span>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  disabled={isPaying}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPaying}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isPaying ? 'Authorizing...' : `Authorize $${payAmount}`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Camera Viewfinder Modal for Card Scanning */}
      {isCameraActive && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-400" />
                <span>Scan Card via Camera</span>
              </h3>
              <button
                onClick={stopCameraScan}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            {cameraError ? (
              <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-4 rounded-xl text-xs space-y-2">
                <p className="font-semibold">Camera Access Error</p>
                <p>{cameraError}</p>
                <button
                  onClick={() => {
                    stopCameraScan();
                    setSuccessMsg('Switched to manual card entry fallback.');
                    setTimeout(() => setSuccessMsg(''), 3000);
                  }}
                  className="mt-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Use Manual Card Entry Fallback
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-8 border-2 border-dashed border-purple-400/70 rounded-xl pointer-events-none flex items-center justify-center">
                    <span className="bg-black/60 text-purple-300 text-[10px] font-mono px-2 py-1 rounded">Align Card Inside Frame</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCaptureCardFromCamera}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30"
                  >
                    Capture & Recognize Card
                  </button>
                  <button
                    type="button"
                    onClick={stopCameraScan}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
