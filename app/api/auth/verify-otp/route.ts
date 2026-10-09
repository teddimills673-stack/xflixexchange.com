import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ success: false, error: 'Email and verification code are required.' }, { status: 400 });
    }

    const emailKey = email.toLowerCase().trim();
    const record = global.otpStore?.get(emailKey);

    if (!record) {
      return NextResponse.json({ success: false, error: 'No verification code found for this email. Please request a new code.' }, { status: 400 });
    }

    // Check if already used
    if (record.used) {
      return NextResponse.json({ success: false, error: 'This verification code has already been used. Please request a new code.' }, { status: 400 });
    }

    // Check expiration (30 seconds)
    if (Date.now() > record.expiresAt) {
      global.otpStore.delete(emailKey);
      return NextResponse.json({ success: false, error: 'Verification code has expired (30s limit). Please request a new code.' }, { status: 400 });
    }

    // Check attempt limit (max 3 attempts)
    if (record.attempts >= 3) {
      global.otpStore.delete(emailKey);
      return NextResponse.json({ success: false, error: 'Maximum verification attempts exceeded. Please request a new code.' }, { status: 400 });
    }

    // Hash submitted code and compare
    const submittedHash = crypto.createHash('sha256').update(code.trim()).digest('hex');

    if (submittedHash !== record.hash) {
      record.attempts += 1;
      global.otpStore.set(emailKey, record);
      const remainingAttempts = 3 - record.attempts;
      return NextResponse.json({
        success: false,
        error: `Invalid verification code. ${remainingAttempts} attempt(s) remaining.`
      }, { status: 400 });
    }

    // Successful verification - mark as used and remove
    record.used = true;
    global.otpStore.delete(emailKey);

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully.'
    });

  } catch (err: any) {
    console.error('Error in verify-otp API:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
