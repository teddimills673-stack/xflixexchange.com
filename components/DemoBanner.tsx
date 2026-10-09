'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { user } = useApp();

  if (user.accountStatus === 'ACTIVE') {
    return (
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 text-xs text-emerald-300 flex items-center justify-between font-medium">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate flex items-center gap-2">
            <strong className="font-semibold uppercase tracking-wider bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-400">
              INSTITUTIONAL VIP ACCOUNT — ACTIVE
            </strong>
            <span className="text-slate-300 text-[11px]">
              UID: {user.id} • All security verifications cleared.
            </span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-300 flex items-center justify-between font-medium">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="truncate flex items-center gap-2">
          <strong className="font-semibold uppercase tracking-wider bg-amber-500/20 px-2 py-0.5 rounded text-amber-400">
            INSTITUTIONAL VIP ACCOUNT — PENDING VERIFICATION
          </strong>
          <span className="text-slate-400 text-[11px]">
            UID: {user.id} • Security verification required.
          </span>
        </span>
      </div>
    </div>
  );
};
