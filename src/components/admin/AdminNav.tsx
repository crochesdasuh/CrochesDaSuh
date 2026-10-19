"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ExternalLink, LogOut, Package } from "lucide-react";
import { signOut } from "@/app/admin/actions";
import { Logo } from "@/components/icons";
import { IGNORE_METRICS_KEY } from "@/lib/track";

const links = [
  { href: "/admin", label: "Métricas", icon: BarChart3 },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
];

export default function AdminNav() {
  // As visitas da própria Suh ao site não entram nas métricas.
  useEffect(() => {
    try {
      localStorage.setItem(IGNORE_METRICS_KEY, "1");
    } catch {}
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-amber-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <Link href="/admin" aria-label="Painel — início">
          <Logo />
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <a
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-cafe hover:bg-creme hover:text-terracota"
          >
            <ExternalLink className="size-4" />
            <span className="hidden sm:inline">Ver site</span>
          </a>
          <form action={signOut}>
            <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-cafe hover:bg-creme hover:text-terracota">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </form>
        </div>
      </div>
      <Suspense fallback={<NavLinks pathname={null} />}>
        <CurrentNavLinks />
      </Suspense>
    </header>
  );
}

function CurrentNavLinks() {
  return <NavLinks pathname={usePathname()} />;
}

function NavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav className="mx-auto flex max-w-6xl gap-1 px-4 sm:px-6">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : !!pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-center gap-2 border-b-2 px-3 pb-2.5 pt-1 text-sm font-bold transition-colors ${
              active
                ? "border-terracota text-terracota-escuro"
                : "border-transparent text-cafe hover:text-grafite"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
