import React from 'react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#090d16] text-gray-400">
      <h1 className="text-4xl font-bold text-danger mb-4">403 Unauthorized</h1>
      <p className="text-sm font-semibold mb-6">You do not have permission to access this page.</p>
      <Link href="/dashboard" className="px-4 py-2 bg-primary text-white rounded-lg">
        Return to Dashboard
      </Link>
    </div>
  );
}
