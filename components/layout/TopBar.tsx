"use client";

import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Bell, ChevronRight, Settings, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileSidebar } from "./Sidebar";

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  consulta: "Consulta",
  nova: "Nova Consulta",
  modelos: "Modelos",
  chat: "Chat IA",
  agenda: "Agenda",
  pacientes: "Pacientes",
  financeiro: "Financeiro",
  transacoes: "Transações",
  relatorios: "Relatórios",
  marketing: "Marketing",
  estoque: "Estoque",
  mev: "MEV",
  avaliacao: "Avaliação",
  plano: "Plano",
  configuracoes: "Configurações",
  perfil: "Perfil",
};

function Breadcrumb() {
  const pathname = usePathname();
  // Remove leading slash, split segments
  const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);

  // Skip dynamic segments that look like IDs (cuid / UUID-ish)
  const readable = segments.filter((s) => !s.match(/^[a-z0-9]{20,}$/i));

  if (readable.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <span className="text-foreground font-medium">
        {ROUTE_LABELS[readable[0]] ?? readable[0]}
      </span>
      {readable.slice(1).map((seg, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5" />
          <span className={i === readable.length - 2 ? "text-foreground font-medium" : ""}>
            {ROUTE_LABELS[seg] ?? seg}
          </span>
        </span>
      ))}
    </nav>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

export function TopBar() {
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
    <header className="fixed top-0 right-0 left-0 lg:left-60 z-20 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-sm px-4 shadow-sm">
      {/* Mobile: hambúrguer */}
      <MobileSidebar />

      {/* Breadcrumb */}
      <div className="flex-1">
        <Breadcrumb />
      </div>

      {/* Ações direita */}
      <div className="flex items-center gap-2">
        {/* Sino */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {/* Badge de notificação (exemplo estático) */}
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-violet-600" />
          <span className="sr-only">Notificações</span>
        </Button>

        {/* Avatar + dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image ?? undefined} />
                <AvatarFallback className="bg-violet-600 text-white text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                {user?.name ?? "Médico"}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-sm truncate">
                  {user?.name ?? "Médico"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user?.email ?? ""}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
