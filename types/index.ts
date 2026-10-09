export type TabType = 
  | 'dashboard'
  | 'markets'
  | 'trading'
  | 'portfolio'
  | 'wallet'
  | 'transactions'
  | 'calculator'
  | 'chat'
  | 'security'
  | 'settings'
  | 'legal'
  | 'law-enforcement'
  | 'faq'
  | 'admin'
  | 'fees-system';

export type ThemeMode = 'light' | 'dark' | 'system';
export type BaseCurrency = 
  | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF' | 'CAD' | 'AUD' | 'NZD' | 'CNY' | 'HKD' 
  | 'SGD' | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'CZK' | 'HUF' | 'RON' | 'BGN' | 'TRY' 
  | 'ILS' | 'AED' | 'SAR' | 'QAR' | 'KWD' | 'BHD' | 'OMR' | 'JOD' | 'EGP' | 'ZAR' 
  | 'NGN' | 'GHS' | 'KES' | 'UGX' | 'TZS' | 'MAD' | 'INR' | 'PKR' | 'BDT' | 'THB' 
  | 'MYR' | 'IDR' | 'PHP' | 'KRW' | 'VND' | 'MXN' | 'BRL' | 'ARS' | 'CLP' | 'COP';
export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh' | 'ja';
export type AccountStatus = 'INACTIVE' | 'PENDING_VERIFICATION' | 'DORMANT' | 'ACTIVE' | 'SUSPENDED';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  country: string;
  baseCurrency: BaseCurrency;
  language: LanguageCode;
  timeZone: string;
  createdAt: string;
  isVerified: boolean;
  securityScore: number;
  role: 'owner' | 'user' | 'super_admin' | 'compliance_admin' | 'support_agent' | 'analyst';
  twoFactorEnabled: boolean;
  passkeyEnabled: boolean;
  biometricEnabled: boolean;
  antiPhishingCode?: string;
  accountStatus: AccountStatus;
  privacyMode: boolean;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumberMasked: string;
  routingNumber?: string;
  accountType: 'Checking' | 'Savings' | 'Business' | 'Credit Card';
  status: 'Verified' | 'Pending' | 'Failed' | 'Disconnected';
  isPreferred: boolean;
  connectedAt: string;
}

export interface CreditCardMethod {
  id: string;
  cardHolder: string;
  cardBrand: 'Visa' | 'Mastercard' | 'Amex' | 'Discover';
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  status: 'Verified' | 'Pending' | 'Declined' | 'Expired' | 'Card details valid' | 'Card verified by payment provider' | 'Card requires verification' | 'Card expired' | 'Card could not be verified';
  isPreferred: boolean;
  tokenizedId: string;
  addedAt: string;
  isTokenized?: boolean;
}

export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  priceUSD: number;
  change1h: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  maxSupply?: number;
  category: 'Hot' | 'Trending' | 'Top Market Cap' | 'DeFi' | 'AI Tokens' | 'Layer 1' | 'Layer 2' | 'Meme Coins' | 'Stablecoins' | 'RWA' | 'TradFi';
  iconUrl?: string;
  sparkline?: number[];
}

export interface WalletBalance {
  assetSymbol: string;
  assetName: string;
  available: number;
  locked: number;
  valueUSD: number;
  icon: string;
}

export interface TransactionRecord {
  id: string;
  date: string;
  time: string;
  timestamp: number;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'trade' | 'fee';
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled';
  coin: string;
  amount: number;
  fiatValue: number;
  direction: 'inflow' | 'outflow' | 'internal';
  network: string;
  walletType: string;
  confirmationCount: number;
  anonymousCounterpartyId: string;
  fee: number;
  reference: string;
  isSimulatedHistorical?: boolean;
}

export interface TradingOrder {
  id: string;
  pair: string;
  type: 'spot' | 'futures' | 'margin';
  side: 'buy' | 'sell';
  orderType: 'limit' | 'market' | 'stop' | 'take_profit';
  price: number;
  amount: number;
  filled: number;
  status: 'open' | 'filled' | 'cancelled';
  timestamp: number;
}

export interface PriceAlert {
  id: string;
  assetSymbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  notificationMethod: 'push' | 'email' | 'both';
  active: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  lastUpdated: string;
  messages: {
    sender: 'user' | 'agent' | 'ai';
    senderName: string;
    text: string;
    timestamp: string;
  }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  eventType: string;
  ipMetadata: string;
  result: 'SUCCESS' | 'FAILED' | 'WARNING';
  details: string;
}

export interface AppreciationRecord {
  id: string;
  ownerId: string;
  timestamp: number;
  dateStr: string;
  previousValue: number;
  newValue: number;
  rate: number;
  amount: number;
  triggerType: 'DAILY' | 'MARKET_VALUE_CHANGE';
}

export type DeviceCategory = 
  | 'iPhone' 
  | 'Android' 
  | 'Windows PC' 
  | 'Mac' 
  | 'Linux PC' 
  | 'iPad' 
  | 'Android Tablet' 
  | 'Other Tablet' 
  | 'Other Device';

export interface OwnerSession {
  id: string;
  ownerUserId: string;
  sessionTokenHash: string;
  deviceType: DeviceCategory;
  deviceName: string;
  operatingSystem: string;
  browser: string;
  ipAddress: string;
  country: string;
  region: string;
  city?: string;
  firstLoginAt: number;
  lastActiveAt: number;
  status: 'Active' | 'Suspicious' | 'Logged out' | 'Removed';
  isTrusted: boolean;
  createdAt: string;
  revokedAt?: number;
  revokedBy?: string;
  isCurrentSession?: boolean;
}

export interface SecurityEvent {
  id: string;
  ownerUserId: string;
  sessionId?: string;
  eventType: string;
  timestamp: number;
  ipAddress: string;
  country: string;
  region: string;
  deviceType: DeviceCategory;
  metadata: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface OwnerPortfolioAccrual {
  id: string;
  ownerUserId: string;
  accrualDate: string; // YYYY-MM-DD
  startingBalance: number;
  rate: number;
  creditAmount: number;
  createdAt: number;
}

export interface FeeConfigItem {
  title: string;
  amount: string;
  description: string;
}

export interface FeeConfiguration {
  feeSystemEnabled: boolean;
  activeWarningKey: 'step1' | 'step2' | 'step3' | 'step4';
  step1: FeeConfigItem;
  step2: FeeConfigItem;
  step3: FeeConfigItem;
  step4: FeeConfigItem;
  lastUpdated: string;
  updatedBy: string;
}


