'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 bg-[#0A0A0A]">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-[#FFD400] font-outfit mb-4">404</div>
        <h2 className="text-xl font-bold text-white font-outfit mb-2">Page Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">The page you are looking for does not exist or has been moved.</p>
        <div className="flex justify-center gap-3">
          <Link href="/dashboard" className="px-4 py-2 bg-[#FFD400] text-black rounded-lg text-xs font-bold hover:bg-[#E6BF00] transition-colors">
            Go to Dashboard
          </Link>
          <button onClick={() => window.history.back()} className="px-4 py-2 bg-[#0A0A0A] border border-[#2B2B2B] text-gray-400 rounded-lg text-xs font-medium hover:border-[#FFD400]/50 hover:text-white transition-all">
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
