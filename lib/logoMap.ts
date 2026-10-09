export const ASSET_LOGOS: Record<string, string> = {
  // Cryptocurrencies (Local Pristine SVG Assets)
  BTC: '/public/logos/bitcoin.svg',
  ETH: '/public/logos/ethereum.svg',
  USDT: '/public/logos/tether.svg',
  SOL: '/public/logos/solana.svg',
  BNB: '/public/logos/bnb.svg',
  ADA: 'https://assets.coincap.io/assets/icons/ada@2x.png',
  XRP: 'https://assets.coincap.io/assets/icons/xrp@2x.png',
  DOGE: 'https://assets.coincap.io/assets/icons/doge@2x.png',
  RENDER: 'https://assets.coincap.io/assets/icons/render@2x.png',
  ARB: 'https://assets.coincap.io/assets/icons/arb@2x.png',
  USDC: 'https://assets.coincap.io/assets/icons/usdc@2x.png',
  LTC: 'https://assets.coincap.io/assets/icons/ltc@2x.png',

  // Global Equities (Local Pristine SVG Assets in /public/logos/)
  AAPL: '/public/logos/aapl.svg',
  NVDA: '/public/logos/nvda.svg',
  MSFT: '/public/logos/msft.svg',
  GOOGL: '/public/logos/googl.svg',
  AMZN: '/public/logos/amzn.svg',
  META: '/public/logos/meta.svg',
  TSM: '/public/logos/tsm.svg',
  SPCX: '/public/logos/spacex.svg',

  // Tokenized Equities
  'TSLA.X': '/public/logos/tesla.svg',
  'AAPL.X': '/public/logos/aapl.svg',
  TSLA: '/public/logos/tesla.svg',
};

export function getAssetLogo(symbol: string): string {
  if (!symbol) return '';
  const upper = symbol.toUpperCase().trim();
  // Clean leading /public prefix if needed or return direct path
  const path = ASSET_LOGOS[upper] || '';
  return path.startsWith('/public/') ? path.replace('/public', '') : path;
}
