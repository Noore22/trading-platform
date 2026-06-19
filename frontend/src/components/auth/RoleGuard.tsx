'use client';

import { ReactNode, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const user = useStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user && !allowedRoles.includes(user.role)) {
      // User doesn't have permission to view this page
      router.replace('/dashboard');
    }
  }, [user, allowedRoles, router]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#090d16] text-gray-400">
        <div className="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Checking Authorizations...</p>
      </div>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#090d16] text-gray-400">
        <div className="text-danger mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        </div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-white mb-2">Access Denied</h1>
        <p className="text-xs font-semibold text-gray-500">Your role ({user.role}) does not have permission to view this page.</p>
        <button 
          onClick={() => router.replace('/dashboard')}
          className="mt-6 py-2 px-4 bg-primary/20 text-primary border border-primary/40 rounded-xl text-xs font-bold transition hover:bg-primary hover:text-white"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
