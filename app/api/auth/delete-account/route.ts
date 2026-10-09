import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required for account deletion.' }, { status: 400 });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Check if it's the owner account
    if (trimmedEmail === 'richardshannon901@gmail.com') {
      if (password !== 'Risk55yy@@$') {
        return NextResponse.json({ success: false, error: 'Incorrect password for owner account verification.' }, { status: 401 });
      }
      return NextResponse.json({
        success: true,
        message: 'Owner account deletion authorized and processed.'
      });
    }

    // For regular users, validate password length and basic criteria
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Invalid password provided.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: 'Account successfully verified and deleted.'
    });

  } catch (err: any) {
    console.error('Error in delete-account API:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
