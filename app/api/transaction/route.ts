import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actionType, amount, userId, accountStatus } = body;

    // Server-side enforcement: Check if account status is DORMANT or inactive
    if (accountStatus && accountStatus !== 'ACTIVE') {
      return NextResponse.json(
        {
          error: 'ACCOUNT_REACTIVATION_REQUIRED',
          message: 'Your main account is currently Dormant. Transactions are temporarily unavailable. To continue with this transaction, you must first complete the Account Reactivation process.'
        },
        { status: 403 }
      );
    }

    // Process simulated secure authorized transaction backend settlement
    return NextResponse.json({
      success: true,
      transactionId: `TXN-SEC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      status: 'Completed',
      timestamp: Date.now(),
      message: `Successfully processed ${actionType} of $${amount || 0}`
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
