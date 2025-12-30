"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    logout();
    const timer = setTimeout(() => router.replace("/"), 800);
    return () => clearTimeout(timer);
  }, [logout, router]);

  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 pb-20 pt-16 text-center">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Signing out</p>
        <h1 className="text-3xl font-bold text-slate-900">You&apos;re being logged out</h1>
        <p className="text-sm text-slate-600">We&apos;ll take you back to the homepage shortly.</p>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
      </div>
    </main>
  );
}
