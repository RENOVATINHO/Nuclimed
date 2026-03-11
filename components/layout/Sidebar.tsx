"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Mic,
  FileText,
  FileCode,
  MessageSquare,
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  Megaphone,
  Package,
  Heart,
  ClipboardList,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { NAV_GRUPOS } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Mapa de ícones
const ICONES: Record<string, React.ComponentType<{ className?: string }>> = {
  Mic,
  FileText,
  FileCode,
  MessageSquare,
  LayoutDashboard,
  Calendar,
  Users,
  DollarSign,
  Megaphone,
  Package,
  Heart,
  ClipboardList,
};

// Mapa de cores para a bolinha/barra do grupo
const COR_GRUPO: Record<string, string> = {
  consulta: "#6D28D9",
  gestao: "#0EA5E9",
  mev: "#10B981",
};

function NavItem({
  href,
  label,
  icone,
  active,
  onClose,
}: {
  href: string;
  label: string;
  icone: string;
  active: boolean;
  onClose?: () => void;
}) {
  const Icon = ICONES[icone] ?? FileText;
  return (
    <Link
      href={href}
      onClick={onClose}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
        active
          ? "bg-violet-600 text-white font-medium shadow-sm"
          : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "MD";

  return (
    <div className="flex h-full flex-col" style={{ background: "#0F172A" }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
          <Activity className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">
          Nuclimed
        </span>
      </div>

      <Separator className="bg-slate-800" />

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GRUPOS.map((grupo) => (
          <div key={grupo.label}>
            {/* Label do grupo */}
            <div className="mb-1.5 flex items-center gap-2 px-3">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: grupo.cor }}
              />
              <span className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                {grupo.label}
              </span>
            </div>

            {/* Itens */}
            <div className="space-y-0.5">
              {grupo.itens.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icone={item.icone}
                  active={
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href)
                  }
                  onClose={onClose}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <Separator className="bg-slate-800" />

      {/* Rodapé — avatar do médico */}
      <div className="flex items-center gap-3 px-4 py-4">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={user?.image ?? undefined} />
          <AvatarFallback className="bg-violet-700 text-white text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">
            {user?.name ?? "Médico"}
          </p>
          <p className="truncate text-xs text-slate-500">
            {user?.email ?? ""}
          </p>
        </div>
        <Link
          href="/configuracoes"
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <Settings className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

// ─── Sidebar desktop (fixa) ───────────────────────────────────────────────────

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-60 flex-col fixed inset-y-0 left-0 z-30 border-r border-slate-800">
      <SidebarContent />
    </aside>
  );
}

// ─── Sidebar mobile (Sheet) ───────────────────────────────────────────────────

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-60 p-0 border-r border-slate-800">
        <SidebarContent onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
