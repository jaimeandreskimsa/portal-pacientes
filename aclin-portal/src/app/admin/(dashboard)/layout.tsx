"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

const NAV = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/admin/auditoria",
    label: "Auditoría",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [username, setUsername] = useState("Admin");

  useEffect(() => {
    // Obtener username del token (via cookie decode simplificado)
    // Solo mostramos "Admin" — el token real es HttpOnly
    setUsername("Super Admin");
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-30 flex flex-col
          transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="bg-[#0d7749] px-5 py-5 flex items-center gap-3">
          <Image
            src="/logo-aclin.png"
            alt="ACLIN"
            width={110}
            height={46}
            className="h-8 w-auto object-contain"
          />
          <span className="text-xs font-bold text-green-200 tracking-widest uppercase">Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                ${
                  isActive(item.href)
                    ? "bg-[#0d7749]/10 text-[#0d7749]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }
              `}
            >
              <span className={isActive(item.href) ? "text-[#0d7749]" : "text-gray-400"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User + logout */}
        <div className="border-t border-gray-200 px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#0d7749]/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-[#0d7749]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{username}</p>
              <p className="text-xs text-gray-500">Sesión activa</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {loggingOut ? "Cerrando..." : "Cerrar sesión"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 lg:px-6">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-semibold text-gray-900">
              {NAV.find((n) => isActive(n.href))?.label ?? "Admin"}
            </h1>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
