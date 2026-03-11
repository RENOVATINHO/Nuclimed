"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Download,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Phone,
  UserCheck,
  UserX,
  Users,
  Gift,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { NovoPacienteModal } from "@/components/pacientes/NovoPacienteModal";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type StatusPaciente = "Ativo" | "Inativo";

interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  status: StatusPaciente;
  ultimaVisita: string | null;
  telefone: string;
  email: string;
  convenio: string | null;
  cidade: string;
  dataNasc: string; // "YYYY-MM-DD"
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const PACIENTES_MOCK: Paciente[] = [
  {
    id: "p001",
    nome: "Ana Carolina Souza",
    cpf: "123.456.789-00",
    status: "Ativo",
    ultimaVisita: "2026-02-28",
    telefone: "(11) 99123-4567",
    email: "ana.souza@email.com",
    convenio: "Unimed",
    cidade: "São Paulo",
    dataNasc: "1988-03-15",
  },
  {
    id: "p002",
    nome: "Roberto Lima",
    cpf: "987.654.321-11",
    status: "Ativo",
    ultimaVisita: "2026-03-05",
    telefone: "(11) 98765-4321",
    email: "roberto.lima@email.com",
    convenio: "Bradesco Saúde",
    cidade: "São Paulo",
    dataNasc: "1975-07-22",
  },
  {
    id: "p003",
    nome: "Mariana Ferreira",
    cpf: "111.222.333-44",
    status: "Ativo",
    ultimaVisita: "2026-03-10",
    telefone: "(21) 97654-3210",
    email: "mariana.f@email.com",
    convenio: null,
    cidade: "Rio de Janeiro",
    dataNasc: "1995-11-08",
  },
  {
    id: "p004",
    nome: "Carlos Eduardo Melo",
    cpf: "555.666.777-88",
    status: "Inativo",
    ultimaVisita: "2025-09-14",
    telefone: "(31) 96543-2109",
    email: "carlos.melo@email.com",
    convenio: "SulAmérica",
    cidade: "Belo Horizonte",
    dataNasc: "1980-05-30",
  },
  {
    id: "p005",
    nome: "Fernanda Oliveira",
    cpf: "444.333.222-11",
    status: "Ativo",
    ultimaVisita: "2026-02-20",
    telefone: "(11) 95432-1098",
    email: "fernanda.o@email.com",
    convenio: "Amil",
    cidade: "Campinas",
    dataNasc: "1992-03-12",
  },
  {
    id: "p006",
    nome: "João Augusto Mendes",
    cpf: "222.111.444-55",
    status: "Inativo",
    ultimaVisita: "2025-10-22",
    telefone: "(11) 94321-0987",
    email: "joao.mendes@email.com",
    convenio: "Unimed",
    cidade: "São Paulo",
    dataNasc: "1965-03-18",
  },
  {
    id: "p007",
    nome: "Silvia Ramos",
    cpf: "777.888.999-00",
    status: "Inativo",
    ultimaVisita: "2025-11-15",
    telefone: "(41) 93210-9876",
    email: "silvia.ramos@email.com",
    convenio: null,
    cidade: "Curitiba",
    dataNasc: "1970-08-25",
  },
  {
    id: "p008",
    nome: "Thiago Carvalho",
    cpf: "333.444.555-66",
    status: "Ativo",
    ultimaVisita: "2026-01-30",
    telefone: "(11) 92109-8765",
    email: "thiago.c@email.com",
    convenio: "Bradesco Saúde",
    cidade: "São Paulo",
    dataNasc: "1990-12-03",
  },
  {
    id: "p009",
    nome: "Beatriz Santos",
    cpf: "666.777.888-99",
    status: "Ativo",
    ultimaVisita: "2026-03-08",
    telefone: "(85) 91098-7654",
    email: "bia.santos@email.com",
    convenio: "SulAmérica",
    cidade: "Fortaleza",
    dataNasc: "1998-03-05",
  },
  {
    id: "p010",
    nome: "Marcos Vinícius Leal",
    cpf: "888.999.000-11",
    status: "Ativo",
    ultimaVisita: "2026-02-14",
    telefone: "(71) 90987-6543",
    email: "marcos.leal@email.com",
    convenio: "Amil",
    cidade: "Salvador",
    dataNasc: "1985-06-17",
  },
  {
    id: "p011",
    nome: "Helena Costa",
    cpf: "000.111.222-33",
    status: "Inativo",
    ultimaVisita: "2025-12-20",
    telefone: "(51) 99876-5432",
    email: "helena.costa@email.com",
    convenio: null,
    cidade: "Porto Alegre",
    dataNasc: "1978-09-29",
  },
  {
    id: "p012",
    nome: "André Felipe Rocha",
    cpf: "999.000.111-22",
    status: "Ativo",
    ultimaVisita: "2026-03-01",
    telefone: "(11) 98765-1234",
    email: "andre.rocha@email.com",
    convenio: "Unimed",
    cidade: "São Paulo",
    dataNasc: "1993-03-12",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function iniciais(nome: string) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function corAvatar(nome: string) {
  const cores = [
    "bg-violet-100 text-violet-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-pink-100 text-pink-700",
    "bg-cyan-100 text-cyan-700",
  ];
  const idx = nome.charCodeAt(0) % cores.length;
  return cores[idx];
}

function formatarData(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function mesAtual() {
  return new Date().getMonth() + 1;
}

function ehAniversariante(dataNasc: string) {
  const mes = parseInt(dataNasc.split("-")[1], 10);
  return mes === mesAtual();
}

function diasDesdeUltimaVisita(ultimaVisita: string | null): number {
  if (!ultimaVisita) return Infinity;
  const diff = new Date().getTime() - new Date(ultimaVisita).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

const ITEMS_POR_PAGINA = 8;

type Aba = "todos" | "ativos" | "inativos" | "aniversariantes" | "sem-retorno";

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PacientesPage() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroConvenio, setFiltroConvenio] = useState<string>("todos");
  const [filtroCidade, setFiltroCidade] = useState<string>("todos");
  const [aba, setAba] = useState<Aba>("todos");
  const [pagina, setPagina] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);

  const convenios = useMemo(() => {
    const set = new Set(PACIENTES_MOCK.map((p) => p.convenio).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, []);

  const cidades = useMemo(() => {
    const set = new Set(PACIENTES_MOCK.map((p) => p.cidade));
    return Array.from(set).sort();
  }, []);

  const filtrados = useMemo(() => {
    let lista = [...PACIENTES_MOCK];

    // Aba
    if (aba === "ativos") lista = lista.filter((p) => p.status === "Ativo");
    else if (aba === "inativos") lista = lista.filter((p) => p.status === "Inativo");
    else if (aba === "aniversariantes") lista = lista.filter((p) => ehAniversariante(p.dataNasc));
    else if (aba === "sem-retorno") lista = lista.filter((p) => diasDesdeUltimaVisita(p.ultimaVisita) >= 90);

    // Busca
    if (busca.trim()) {
      const q = busca.toLowerCase();
      lista = lista.filter(
        (p) =>
          p.nome.toLowerCase().includes(q) ||
          p.cpf.replace(/\D/g, "").includes(q.replace(/\D/g, ""))
      );
    }

    // Filtros
    if (filtroStatus !== "todos") lista = lista.filter((p) => p.status === filtroStatus);
    if (filtroConvenio !== "todos") lista = lista.filter((p) => p.convenio === filtroConvenio);
    if (filtroCidade !== "todos") lista = lista.filter((p) => p.cidade === filtroCidade);

    return lista;
  }, [busca, filtroStatus, filtroConvenio, filtroCidade, aba]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITEMS_POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const exibidos = filtrados.slice(
    (paginaAtual - 1) * ITEMS_POR_PAGINA,
    paginaAtual * ITEMS_POR_PAGINA
  );

  function mudarAba(novaAba: Aba) {
    setAba(novaAba);
    setPagina(1);
  }

  const totalAtivos = PACIENTES_MOCK.filter((p) => p.status === "Ativo").length;
  const totalInativos = PACIENTES_MOCK.filter((p) => p.status === "Inativo").length;

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" />
              {PACIENTES_MOCK.length} total
            </Badge>
            <Badge className="gap-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs border border-emerald-200">
              <UserCheck className="h-3.5 w-3.5" />
              {totalAtivos} ativos
            </Badge>
            <Badge className="gap-1.5 bg-slate-100 text-slate-600 hover:bg-slate-100 text-xs border border-slate-200">
              <UserX className="h-3.5 w-3.5" />
              {totalInativos} inativos
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-violet-600 hover:bg-violet-700"
            onClick={() => setModalAberto(true)}
          >
            <Plus className="h-4 w-4" />
            Novo Paciente
          </Button>
        </div>
      </div>

      {/* ── Barra de busca e filtros ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />

          <Select value={filtroStatus} onValueChange={(v) => { setFiltroStatus(v); setPagina(1); }}>
            <SelectTrigger className="w-32 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="Ativo">Ativos</SelectItem>
              <SelectItem value="Inativo">Inativos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtroConvenio} onValueChange={(v) => { setFiltroConvenio(v); setPagina(1); }}>
            <SelectTrigger className="w-36 text-xs">
              <SelectValue placeholder="Convênio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos convênios</SelectItem>
              {convenios.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtroCidade} onValueChange={(v) => { setFiltroCidade(v); setPagina(1); }}>
            <SelectTrigger className="w-36 text-xs">
              <SelectValue placeholder="Cidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas cidades</SelectItem>
              {cidades.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Abas ────────────────────────────────────────────────────────────── */}
      <Tabs value={aba} onValueChange={(v) => mudarAba(v as Aba)}>
        <TabsList className="h-9">
          <TabsTrigger value="todos" className="text-xs px-3">
            Todos
            <Badge variant="secondary" className="ml-1.5 h-4 min-w-[18px] px-1 text-[10px]">
              {PACIENTES_MOCK.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="ativos" className="text-xs px-3">
            Ativos
            <Badge variant="secondary" className="ml-1.5 h-4 min-w-[18px] px-1 text-[10px]">
              {totalAtivos}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="inativos" className="text-xs px-3">
            Inativos
            <Badge variant="secondary" className="ml-1.5 h-4 min-w-[18px] px-1 text-[10px]">
              {totalInativos}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="aniversariantes" className="gap-1 text-xs px-3">
            <Gift className="h-3 w-3" />
            Aniversariantes
          </TabsTrigger>
          <TabsTrigger value="sem-retorno" className="gap-1 text-xs px-3">
            <Clock className="h-3 w-3" />
            Sem retorno
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ── Tabela ──────────────────────────────────────────────────────────── */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="w-10 px-4 py-3 text-left">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Paciente</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">CPF</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Última visita</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Telefone</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {exibidos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                    Nenhum paciente encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                exibidos.map((p) => (
                  <tr
                    key={p.id}
                    className="group hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>

                    <td className="px-4 py-3">
                      <Link href={`/pacientes/${p.id}`} className="flex items-center gap-3">
                        {/* Avatar */}
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                            corAvatar(p.nome)
                          )}
                        >
                          {iniciais(p.nome)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 group-hover:text-violet-700 transition-colors">
                            {p.nome}
                          </p>
                          <p className="text-xs text-muted-foreground">{p.email}</p>
                        </div>
                      </Link>
                    </td>

                    <td className="px-4 py-3">
                      <Link href={`/pacientes/${p.id}`} className="block">
                        <span className="text-slate-600 font-mono text-xs">{p.cpf}</span>
                      </Link>
                    </td>

                    <td className="px-4 py-3">
                      <Link href={`/pacientes/${p.id}`} className="block">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
                            p.status === "Ativo"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          )}
                        >
                          {p.status}
                        </span>
                      </Link>
                    </td>

                    <td className="px-4 py-3">
                      <Link href={`/pacientes/${p.id}`} className="block">
                        {p.ultimaVisita ? (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs">{formatarData(p.ultimaVisita)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </Link>
                    </td>

                    <td className="px-4 py-3">
                      <Link href={`/pacientes/${p.id}`} className="block">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs">{p.telefone}</span>
                        </div>
                      </Link>
                    </td>

                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem asChild>
                            <Link href={`/pacientes/${p.id}`}>Ver perfil</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/consulta/nova?paciente=${p.id}`}>Nova consulta</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/agenda?paciente=${p.id}`}>Agendar</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:text-red-600">
                            {p.status === "Ativo" ? "Inativar" : "Reativar"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé / paginação */}
        <div className="flex items-center justify-between border-t bg-slate-50 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Mostrando{" "}
            <span className="font-medium text-slate-700">
              {filtrados.length === 0
                ? 0
                : (paginaAtual - 1) * ITEMS_POR_PAGINA + 1}
              –{Math.min(paginaAtual * ITEMS_POR_PAGINA, filtrados.length)}
            </span>{" "}
            de{" "}
            <span className="font-medium text-slate-700">{filtrados.length}</span> pacientes
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={paginaAtual <= 1}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <Button
                key={n}
                variant={n === paginaAtual ? "default" : "outline"}
                size="icon"
                className={cn(
                  "h-7 w-7 text-xs",
                  n === paginaAtual && "bg-violet-600 hover:bg-violet-700 border-violet-600"
                )}
                onClick={() => setPagina(n)}
              >
                {n}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={paginaAtual >= totalPaginas}
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Modal Novo Paciente ──────────────────────────────────────────────── */}
      <NovoPacienteModal open={modalAberto} onOpenChange={setModalAberto} />
    </div>
  );
}
