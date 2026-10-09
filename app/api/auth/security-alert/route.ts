import { NextRequest, NextResponse } from 'next/server';

declare global {
  var serverSecurityAlerts: Array<{
    id: string;
    timestamp: number;
    dateFormatted: string;
    maskedEmail: string;
    accountType: 'Owner' | 'User';
    eventType: 'Successful Login' | 'New Account Registration';
    device: string;
    status: 'Successful';
  }>;
}

if (!global.serverSecurityAlerts) {
  global.serverSecurityAlerts = [];
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'xx***@xx.com';
  const [name, domain] = email.split('@');
  if (name.length <= 2) {
    return `${name[0]}***@${domain}`;
  }
  return `${name.slice(0, 2)}***@${domain}`;
}

export async function POST(req: NextRequest) {
  try {
    const { email, accountType = 'User', eventType = 'Successful Login', device = 'Desktop Browser' } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }

    const maskedEmail = maskEmail(email);
    const timestamp = Date.now();
    const dateFormatted = new Date(timestamp).toUTCString();
    const alertId = `SEC-ALRT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newAlert = {
      id: alertId,
      timestamp,
      dateFormatted,
      maskedEmail,
      accountType: accountType as 'Owner' | 'User',
      eventType: eventType as 'Successful Login' | 'New Account Registration',
      device: device || 'Standard Device',
      status: 'Successful' as const,
    };

    global.serverSecurityAlerts.unshift(newAlert);
    if (global.serverSecurityAlerts.length > 100) {
      global.serverSecurityAlerts.pop();
    }

    console.log(`🔐 OKX FLIX SECURITY ALERT: A ${accountType.toLowerCase()} successfully performed ${eventType.toLowerCase()} for ${maskedEmail} at ${dateFormatted} (${device})`);

    return NextResponse.json({
      success: true,
      alert: newAlert,
      message: 'Security alert successfully recorded and dispatched to operator channels.'
    });

  } catch (err: any) {
    console.error('Error in security-alert API:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    alerts: global.serverSecurityAlerts || []
  });
}
