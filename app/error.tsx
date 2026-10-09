'use client';

import React from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-sm text-zinc-400">{error?.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={() => reset()}
          className="inline-block py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
