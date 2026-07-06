export const dynamic = 'force-dynamic';

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import AuthGuard from "@/components/layout/AuthGuard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNav />
          <main className="flex-1 overflow-y-auto hide-scrollbar relative">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
