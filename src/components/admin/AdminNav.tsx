"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookHeart, Calculator, ExternalLink, LogOut, Package } from "lucide-react";
import { Logo } from "@/components/icons";

const links = [
  { href: "/admin", label: "Métricas", icon: BarChart3 },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/calculadora", label: "Calculadora", icon: Calculator },
  { href: "/admin/receitas", label: "Receitas", icon: BookHeart },
];

export default function AdminNav() {
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
          <form action="/admin/sair" method="post">
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
    <nav className="no-scrollbar mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
      {links.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : !!pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-2.5 pb-2.5 pt-1 text-sm font-bold sm:px-3 transition-colors ${
              active
                ? "border-terracota text-terracota-escuro"
                : "border-transparent text-cafe hover:text-grafite"
            }`}
          >
            <Icon className="hidden size-4 sm:block" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
