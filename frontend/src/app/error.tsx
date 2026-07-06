'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 bg-[#0A0A0A]">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4 text-[#FF1744]">!</div>
        <h2 className="text-xl font-bold text-white font-outfit mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-500 mb-6">An unexpected error occurred. Please try again.</p>
        <button onClick={reset} className="px-4 py-2 bg-[#FFD400] text-black rounded-lg text-xs font-bold hover:bg-[#E6BF00] transition-colors">
          Try Again
        </button>
      </div>
    </div>
  );
}
