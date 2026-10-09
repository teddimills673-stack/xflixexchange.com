import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory store for OTP records (persisted across requests in Node server)
declare global {
  var otpStore: Map<string, {
    hash: string;
    expiresAt: number;
    createdAt: number;
    attempts: number;
    used: boolean;
  }>;
}

if (!global.otpStore) {
  global.otpStore = new Map();
}

export async function POST(req: NextRequest) {
  console.log('[DIAGNOSTIC] POST /api/auth/send-otp endpoint reached.');

  try {
    const { email, purpose = 'auth' } = await req.json();

    if (!email || typeof email !== 'string') {
      console.error('[DIAGNOSTIC] Invalid or missing email address provided.');
      return NextResponse.json({ success: false, error: 'Valid email address is required.' }, { status: 400 });
    }

    const emailKey = email.toLowerCase().trim();

    // Rate limiting / cooldown protection (minimum 3 seconds between requests)
    const existingRecord = global.otpStore.get(emailKey);
    if (existingRecord && (Date.now() - existingRecord.createdAt < 3000)) {
      console.warn('[DIAGNOSTIC] Rate limit hit for email key.');
      return NextResponse.json({ 
        success: false, 
        error: 'Rate limit exceeded. Please wait a moment before requesting another verification code.' 
      }, { status: 429 });
    }

    // Generate 6-digit cryptographic OTP using crypto.randomInt (server-side authority)
    const otp = crypto.randomInt(100000, 1000000).toString();
    const createdAt = Date.now();
    const expiresAt = createdAt + 30 * 1000; // Exactly 30 seconds expiration authority

    // Securely hash OTP (SHA-256)
    const hash = crypto.createHash('sha256').update(otp).digest('hex');

    // Store OTP record securely server-side
    global.otpStore.set(emailKey, {
      hash,
      expiresAt,
      createdAt,
      attempts: 0,
      used: false,
    });

    console.log(`[DIAGNOSTIC] Development testing OTP generated for ${emailKey}`);

    // Return success and the OTP code for on-screen display in development testing fallback mode
    return NextResponse.json({
      success: true,
      otp,
      message: 'Verification code generated for testing.',
      expiresIn: 30
    });

  } catch (err: any) {
    console.error('[DIAGNOSTIC] Exception in send-otp API:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
