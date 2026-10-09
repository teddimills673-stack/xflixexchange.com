import { NextResponse } from "next/server";
import { INITIAL_ASSETS } from "@/lib/mockData";

export const GLOBAL_EQUITIES = [
  { id: 'apple', name: 'Apple Inc.', symbol: 'AAPL', priceUSD: 232.45, change24h: 1.24, category: 'Global Equities', marketStatus: 'Open', type: 'Ordinary Share', iconUrl: 'https://assets.coincap.io/assets/icons/aapl@2x.png', lastUpdated: new Date().toISOString() },
  { id: 'nvidia', name: 'NVIDIA Corporation', symbol: 'NVDA', priceUSD: 128.50, change24h: 3.45, category: 'Global Equities', marketStatus: 'Open', type: 'Ordinary Share', iconUrl: 'https://cryptologos.cc/logos/nvidia-nvda-logo.svg', lastUpdated: new Date().toISOString() },
  { id: 'microsoft', name: 'Microsoft Corporation', symbol: 'MSFT', priceUSD: 428.10, change24h: 0.85, category: 'Global Equities', marketStatus: 'Open', type: 'Ordinary Share', iconUrl: 'https://cryptologos.cc/logos/microsoft-msft-logo.svg', lastUpdated: new Date().toISOString() },
  { id: 'alphabet', name: 'Alphabet Inc. (Google)', symbol: 'GOOGL', priceUSD: 178.20, change24h: -0.42, category: 'Global Equities', marketStatus: 'Open', type: 'Ordinary Share', iconUrl: 'https://cryptologos.cc/logos/google-g-logo.svg', lastUpdated: new Date().toISOString() },
  { id: 'amazon', name: 'Amazon.com Inc.', symbol: 'AMZN', priceUSD: 186.30, change24h: 1.10, category: 'Global Equities', marketStatus: 'Open', type: 'Ordinary Share', iconUrl: 'https://cryptologos.cc/logos/amazon-amzn-logo.svg', lastUpdated: new Date().toISOString() },
  { id: 'meta', name: 'Meta Platforms Inc.', symbol: 'META', priceUSD: 512.80, change24h: 2.15, category: 'Global Equities', marketStatus: 'Open', type: 'Ordinary Share', iconUrl: 'https://cryptologos.cc/logos/meta-logo.svg', lastUpdated: new Date().toISOString() },
  { id: 'tsm', name: 'Taiwan Semiconductor (TSMC ADR)', symbol: 'TSM', priceUSD: 174.90, change24h: 1.82, category: 'Global Equities', marketStatus: 'Open', type: 'ADR Instrument', iconUrl: 'https://assets.coincap.io/assets/icons/tsm@2x.png', lastUpdated: new Date().toISOString() },
  { id: 'spacex', name: 'SpaceX (Space Exploration Holdings)', symbol: 'SPCX', priceUSD: 0.00, change24h: 0.00, category: 'Private Instruments', marketStatus: 'Private / Closed', type: 'Privately Held (No Public Ticker)', iconUrl: 'https://assets.coincap.io/assets/icons/spcx@2x.png', lastUpdated: new Date().toISOString() },
  // Tokenized Equities
  { id: 'tok-tsla', name: 'Tokenized Tesla Inc.', symbol: 'TSLA.x', priceUSD: 245.60, change24h: 2.40, category: 'Tokenized Equities', marketStatus: '24/7 DeFi', type: 'Tokenized Equity', iconUrl: 'https://assets.coincap.io/assets/icons/tsla@2x.png', lastUpdated: new Date().toISOString() },
  { id: 'tok-aapl', name: 'Tokenized Apple Inc.', symbol: 'AAPL.x', priceUSD: 232.45, change24h: 1.24, category: 'Tokenized Equities', marketStatus: '24/7 DeFi', type: 'Tokenized Equity', iconUrl: 'https://assets.coincap.io/assets/icons/aapl@2x.png', lastUpdated: new Date().toISOString() },
];

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=1h,24h,7d', {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
      next: { revalidate: 30 }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`CoinGecko API returned status ${res.status}`);
    }

    const data = await res.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid API response format");
    }

    const formatted = data.map((coin: any) => ({
      id: coin.id || 'unknown',
      name: coin.name || 'Unknown',
      symbol: (coin.symbol || '???').toUpperCase(),
      priceUSD: typeof coin.current_price === 'number' ? coin.current_price : 0.00,
      change1h: coin.price_change_percentage_1h_in_currency || 0,
      change24h: coin.price_change_percentage_24h || 0,
      change7d: coin.price_change_percentage_7d_in_currency || 0,
      marketCap: coin.market_cap || 0,
      volume24h: coin.total_volume || 0,
      circulatingSupply: coin.circulating_supply || 0,
      maxSupply: coin.max_supply || undefined,
      category: (coin.market_cap_rank && coin.market_cap_rank <= 5) ? 'Top Market Cap' : 'Hot',
      iconUrl: coin.image || '',
      sparkline: Array.isArray(coin.sparkline_in_7d?.price) ? coin.sparkline_in_7d.price.slice(-10) : [],
      lastUpdated: new Date().toISOString()
    }));

    return NextResponse.json({ 
      status: 'LIVE', 
      source: 'CoinGecko API & Global Stock Feed', 
      assets: formatted,
      equities: GLOBAL_EQUITIES 
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'UNAVAILABLE', 
      source: 'Standard Fallback Feed', 
      error: 'Market data temporarily unavailable. Please try again.',
      assets: INITIAL_ASSETS,
      equities: GLOBAL_EQUITIES 
    });
  }
}
