"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/components/auth-provider";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Listings", href: "/listings" },
];

const authLinks = [
  { name: "Login", href: "/login" },
  { name: "Register", href: "/register" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isAdmin = ["admin", "moderator"].includes(user?.role ?? "");
  const links = isAdmin ? [...navLinks, { name: "Admin", href: "/admin" }] : navLinks;

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3 text-slate-900">
          <Image
            src="/branding/logo.png"
            alt="PropertySystems logo"
            width={40}
            height={40}
            className="rounded-xl shadow-sm"
            priority
          />
          <div className="leading-tight">
            <div className="text-sm font-medium text-slate-500">Property</div>
            <div className="text-lg font-semibold text-slate-900">Systems</div>
          </div>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={
                  "transition-colors hover:text-slate-950 " +
                  (isActive ? "text-slate-950" : "text-slate-600")
                }
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/listings/create"
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Create Listing
          </Link>
          {user ? (
            <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-900 shadow-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold uppercase text-white">
                  {(user.full_name || user.email || "?").charAt(0)}
                </span>
                <div className="leading-tight">
                  <p className="text-xs text-slate-500">Signed in</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {user.full_name || user.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
              {authLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="transition-colors hover:text-slate-950"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 text-sm font-medium text-slate-700">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={closeMenu}
                  className={
                    "flex items-center justify-between rounded-lg px-3 py-2 transition hover:bg-slate-50 " +
                    (isActive ? "text-slate-950" : "text-slate-700")
                  }
                >
                  {link.name}
                </Link>
              );
            })}

            <Link
              href="/listings/create"
              onClick={closeMenu}
              className="flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-white shadow-sm transition hover:bg-slate-800"
            >
              Create Listing
            </Link>

            <div className="flex flex-col gap-2 pt-1 text-slate-700">
              {user ? (
                <>
                  <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-slate-900">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold uppercase text-white">
                      {(user.full_name || user.email || "?").charAt(0)}
                    </span>
                    <div className="leading-tight">
                      <p className="text-xs text-slate-500">Signed in</p>
                      <p className="text-sm font-semibold text-slate-900">{user.full_name || user.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-left font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                authLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={closeMenu}
                    className="rounded-lg px-3 py-2 transition hover:bg-slate-50"
                  >
                    {link.name}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
