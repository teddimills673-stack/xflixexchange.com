import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b0f19',
};

export const metadata: Metadata = {
  title: 'OKX FLIX Cryptocurrency Exchange',
  description: 'OKX FLIX Cryptocurrency Exchange is a professional digital-asset cryptocurrency trading platform providing spot trading, margin trading, secure multi-asset wallet, and market analytics.',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.svg',
    apple: '/home-icon.jpg',
    shortcut: '/home-icon.jpg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'OKX FLIX',
  },
  openGraph: {
    title: 'OKX FLIX Cryptocurrency Exchange',
    description: 'OKX FLIX Cryptocurrency Exchange is a professional digital-asset cryptocurrency trading platform providing spot trading, margin trading, secure multi-asset wallet, and market analytics.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OKX FLIX Cryptocurrency Exchange',
    description: 'OKX FLIX Cryptocurrency Exchange is a professional digital-asset cryptocurrency trading platform providing spot trading, margin trading, secure multi-asset wallet, and market analytics.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
