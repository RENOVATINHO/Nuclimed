import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  Mic,
  Heart,
  Gift,
  AlertTriangle,
  Sparkles,
  FileEdit,
  FileCheck,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GraficoAtendimentos, type DiaAtendimento } from "@/components/dashboard/GraficoAtendimentos";
import { STATUS_AGENDA, type StatusAgenda } from "@/lib/constants";
import { cn } from "@/lib/utils";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ConsultaHoje {
  id: string;
  horario: string;
  paciente: string;
  tipo: string;
  status: StatusAgenda;
}

interface ConsultaIA {
  id: string;
  paciente: string;
  dataFormatada: string;
  statusIA: "PROCESSADO" | "PENDENTE_REVISAO" | "RASCUNHO";
}

interface PacienteSemRetorno {
  id: string;
  nome: string;
  diasSemRetorno: number;
}

interface PacienteMevCritico {
  id: string;
  nome: string;
  score: number;
}

interface Aniversariante {
  id: string;
  nome: string;
  diaNasc: number;
}

interface MetricaDia {
  consultasAgendadas: number;
  consultasFinalizadas: number;
  pacientesEspera: number;
  receitaDia: number;
  varConsultasAgendadas: number;   // % vs semana anterior
  varConsultasFinalizadas: number;
  varPacientesEspera: number;
  varReceitaDia: number;
}

// ─── Dados mock ───────────────────────────────────────────────────────────────
// TODO: substituir por fetch à API/Prisma em cada seção

const METRICAS_MOCK: MetricaDia = {
  consultasAgendadas: 12,
  consultasFinalizadas: 7,
  pacientesEspera: 3,
  receitaDia: 2840,
  varConsultasAgendadas: +8.3,
  varConsultasFinalizadas: +14.2,
  varPacientesEspera: -25.0,
  varReceitaDia: +5.7,
};

const PROXIMAS_CONSULTAS_MOCK: ConsultaHoje[] = [
  { id: "1", horario: "09:00", paciente: "Ana Carolina Souza",   tipo: "Consulta inicial",  status: "FINALIZADO" },
  { id: "2", horario: "09:45", paciente: "Roberto Lima",         tipo: "Retorno",           status: "FINALIZADO" },
  { id: "3", horario: "10:30", paciente: "Mariana Ferreira",     tipo: "Consulta inicial",  status: "ESPERA"     },
  { id: "4", horario: "11:15", paciente: "Carlos Eduardo Melo",  tipo: "Perícia médica",    status: "AGENDADO"   },
  { id: "5", horario: "14:00", paciente: "Fernanda Oliveira",    tipo: "Retorno",           status: "AGENDADO"   },
];

const ATIVIDADE_IA_MOCK: ConsultaIA[] = [
  { id: "a1", paciente: "Ana Carolina Souza",  dataFormatada: "hoje, 09:52",   statusIA: "PROCESSADO"      },
  { id: "a2", paciente: "Roberto Lima",        dataFormatada: "hoje, 10:38",   statusIA: "PENDENTE_REVISAO" },
  { id: "a3", paciente: "Luís Henrique Costa", dataFormatada: "ontem, 16:20",  statusIA: "PROCESSADO"      },
  { id: "a4", paciente: "Patrícia Nunes",      dataFormatada: "ontem, 14:05",  statusIA: "RASCUNHO"        },
];

const SEM_RETORNO_MOCK: PacienteSemRetorno[] = [
  { id: "p1", nome: "João Augusto Mendes",   diasSemRetorno: 142 },
  { id: "p2", nome: "Silvia Ramos",          diasSemRetorno: 118 },
  { id: "p3", nome: "Thiago Carvalho",       diasSemRetorno: 97  },
];

const MEV_CRITICO_MOCK: PacienteMevCritico[] = [
  { id: "p4", nome: "Beatriz Santos",        score: 28 },
  { id: "p5", nome: "Marcos Vinícius Leal",  score: 35 },
  { id: "p6", nome: "Helena Costa",          score: 38 },
];

const ANIVERSARIANTES_MOCK: Aniversariante[] = [
  { id: "p7", nome: "André Felipe Rocha",    diaNasc: 12 },
  { id: "p8", nome: "Camila Duarte",         diaNasc: 15 },
  { id: "p9", nome: "Ricardo Alves",         diaNasc: 18 },
];

// Gera 30 dias de dados para o gráfico
// TODO: substituir por query GROUP BY data no Prisma
function gerarDadosGrafico(): DiaAtendimento[] {
  const hoje = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const d = subDays(hoje, 29 - i);
    const realizados = Math.floor(Math.random() * 10) + 3;
    const cancelados = Math.floor(Math.random() * 3);
    return {
      dia: format(d, "dd/MM"),
      realizados,
      cancelados,
    };
  });
}

// ─── Helpers de UI ────────────────────────────────────────────────────────────

function Variacao({ value }: { value: number }) {
  const positivo = value >= 0;
  return (
    <span
      className={cn(
        "flex items-center gap-0.5 text-xs font-medium",
        positivo ? "text-emerald-600" : "text-red-500"
      )}
    >
      {positivo ? (
        <TrendingUp className="h-3.5 w-3.5" />
      ) : (
        <TrendingDown className="h-3.5 w-3.5" />
      )}
      {positivo ? "+" : ""}
      {value.toFixed(1)}% vs semana anterior
    </span>
  );
}

function StatusBadge({ status }: { status: StatusAgenda }) {
  const s = STATUS_AGENDA[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        s.bg,
        s.text,
        s.border
      )}
    >
      {s.label}
    </span>
  );
}

const IA_STATUS_CONFIG = {
  PROCESSADO: {
    label: "Processado",
    icon: FileCheck,
    className: "bg-emerald-100 text-emerald-700 border-emerald-300",
  },
  PENDENTE_REVISAO: {
    label: "Pendente revisão",
    icon: FileEdit,
    className: "bg-amber-100 text-amber-700 border-amber-300",
  },
  RASCUNHO: {
    label: "Rascunho",
    icon: Mic,
    className: "bg-slate-100 text-slate-600 border-slate-300",
  },
} as const;

function saudacao(hora: number): string {
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  // TODO: adicionar { cache: "no-store" } quando conectar a dados reais
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const agora = new Date();
  const primeiroNome = session.user?.name?.split(" ")[0] ?? "Médico";
  const dataFormatada = format(agora, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const greeting = saudacao(agora.getHours());

  // TODO: buscar dados reais com Promise.all([...queries Prisma])
  const metricas = METRICAS_MOCK;
  const proximasConsultas = PROXIMAS_CONSULTAS_MOCK;
  const atividadeIA = ATIVIDADE_IA_MOCK;
  const semRetorno = SEM_RETORNO_MOCK;
  const mevCritico = MEV_CRITICO_MOCK;
  const aniversariantes = ANIVERSARIANTES_MOCK;
  const dadosGrafico = gerarDadosGrafico();

  const totalHoje = proximasConsultas.length;

  return (
    <div className="space-y-6">

      {/* ── SEÇÃO 1 — Boas-vindas ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {greeting}, Dr(a). {primeiroNome} 👋
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground capitalize">
            {dataFormatada} &middot; Você tem{" "}
            <span className="font-semibold text-slate-700">{totalHoje} consultas</span> hoje
          </p>
        </div>

        {/* Botão principal */}
        <Link href="/consulta/nova">
          <Button className="gap-2 bg-violet-600 hover:bg-violet-700 shadow-sm">
            <Plus className="h-4 w-4" />
            Nova Consulta
          </Button>
        </Link>
      </div>

      {/* ── SEÇÃO 2 — Métricas do dia ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        {/* Consultas Agendadas */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Agendadas
                </p>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {metricas.consultasAgendadas}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-2">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-3">
              <Variacao value={metricas.varConsultasAgendadas} />
            </div>
          </CardContent>
        </Card>

        {/* Consultas Finalizadas */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Finalizadas
                </p>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {metricas.consultasFinalizadas}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <div className="mt-3">
              <Variacao value={metricas.varConsultasFinalizadas} />
            </div>
          </CardContent>
        </Card>

        {/* Pacientes em Espera */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Em Espera
                </p>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {metricas.pacientesEspera}
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <div className="mt-3">
              <Variacao value={metricas.varPacientesEspera} />
            </div>
          </CardContent>
        </Card>

        {/* Receita do Dia */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Receita do Dia
                </p>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {metricas.receitaDia.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    minimumFractionDigits: 0,
                  })}
                </p>
              </div>
              <div className="rounded-lg bg-violet-50 p-2">
                <TrendingUp className="h-5 w-5 text-violet-600" />
              </div>
            </div>
            <div className="mt-3">
              <Variacao value={metricas.varReceitaDia} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── SEÇÕES 3 & 4 — Consultas + IA ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">

        {/* Próximas Consultas (60%) */}
        <Card className="xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">
              Próximas consultas hoje
            </CardTitle>
            <Link href="/agenda">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
                Ver agenda
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="px-0">
            <div className="divide-y">
              {/* TODO: map sobre consultas do dia vindas do banco */}
              {proximasConsultas.map((c) => (
                <Link
                  key={c.id}
                  href={`/consulta/${c.id}`}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors"
                >
                  {/* Horário */}
                  <div className="w-12 shrink-0 text-center">
                    <span className="text-sm font-semibold text-slate-700">
                      {c.horario}
                    </span>
                  </div>

                  <Separator orientation="vertical" className="h-8" />

                  {/* Nome + tipo */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {c.paciente}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.tipo}
                    </p>
                  </div>

                  {/* Status */}
                  <StatusBadge status={c.status} />
                </Link>
              ))}
            </div>

            {proximasConsultas.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                Nenhuma consulta agendada para hoje.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Atividade da IA (40%) */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Sparkles className="h-4 w-4 text-violet-500" />
              Atividade da IA
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="divide-y">
              {/* TODO: buscar últimas consultas com status de processamento IA */}
              {atividadeIA.map((c) => {
                const cfg = IA_STATUS_CONFIG[c.statusIA];
                const Icon = cfg.icon;
                return (
                  <Link
                    key={c.id}
                    href={`/consulta/${c.id}`}
                    className="flex items-start gap-3 px-6 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className={cn(
                      "mt-0.5 rounded-md p-1.5 border",
                      cfg.className
                    )}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {c.paciente}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.dataFormatada}
                      </p>
                      <span className={cn(
                        "mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        cfg.className
                      )}>
                        {cfg.label}
                      </span>
                    </div>
                    <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-300" />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── SEÇÃO 5 — Pacientes que precisam de atenção ────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {/* Sem retorno */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <div className="rounded-md bg-orange-100 p-1.5">
                <Clock className="h-4 w-4 text-orange-500" />
              </div>
              Sem retorno há +90 dias
              <Badge variant="secondary" className="ml-auto text-xs">
                {semRetorno.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-4">
            {/* TODO: query WHERE ultimaConsulta < NOW() - INTERVAL '90 days' */}
            {semRetorno.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
              >
                <div>
                  <p className="text-xs font-medium text-slate-700 leading-tight">
                    {p.nome}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {p.diasSemRetorno} dias
                  </p>
                </div>
                <Link href={`/agenda?paciente=${p.id}`}>
                  <Button variant="outline" size="sm" className="h-7 text-[11px]">
                    Agendar
                  </Button>
                </Link>
              </div>
            ))}
            {semRetorno.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">
                Nenhum paciente sem retorno.
              </p>
            )}
          </CardContent>
        </Card>

        {/* MEV crítico */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <div className="rounded-md bg-red-100 p-1.5">
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
              MEV crítico (&lt;40%)
              <Badge variant="secondary" className="ml-auto text-xs">
                {mevCritico.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-4">
            {/* TODO: query WHERE scoreMev < 40 ORDER BY scoreMev ASC */}
            {mevCritico.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
              >
                <div>
                  <p className="text-xs font-medium text-slate-700 leading-tight">
                    {p.nome}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <div className="h-1.5 w-20 rounded-full bg-slate-200">
                      <div
                        className="h-1.5 rounded-full bg-red-500"
                        style={{ width: `${p.score}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-red-600">
                      {p.score}%
                    </span>
                  </div>
                </div>
                <Link href={`/mev/avaliacao/${p.id}`}>
                  <Button variant="outline" size="sm" className="h-7 text-[11px]">
                    Ver MEV
                  </Button>
                </Link>
              </div>
            ))}
            {mevCritico.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">
                Nenhum paciente em situação crítica.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Aniversariantes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <div className="rounded-md bg-pink-100 p-1.5">
                <Gift className="h-4 w-4 text-pink-500" />
              </div>
              Aniversariantes do mês
              <Badge variant="secondary" className="ml-auto text-xs">
                {aniversariantes.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-4">
            {/* TODO: query WHERE EXTRACT(MONTH FROM dataNasc) = EXTRACT(MONTH FROM NOW()) */}
            {aniversariantes.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">🎂</span>
                  <div>
                    <p className="text-xs font-medium text-slate-700 leading-tight">
                      {p.nome}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Dia {p.diaNasc}
                    </p>
                  </div>
                </div>
                <Link href={`/marketing?paciente=${p.id}&tipo=aniversario`}>
                  <Button variant="outline" size="sm" className="h-7 text-[11px]">
                    Enviar
                  </Button>
                </Link>
              </div>
            ))}
            {aniversariantes.length === 0 && (
              <p className="py-4 text-center text-xs text-muted-foreground">
                Sem aniversariantes este mês.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── SEÇÃO 6 — Gráfico de atendimentos ─────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Atendimentos — últimos 30 dias
            </CardTitle>
            {/* TODO: adicionar seletor de período */}
            <span className="text-xs text-muted-foreground">
              {format(subDays(new Date(), 29), "dd/MM")} –{" "}
              {format(new Date(), "dd/MM/yyyy")}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {/* TODO: substituir dadosGrafico por dados reais do Prisma */}
          <GraficoAtendimentos data={dadosGrafico} />
        </CardContent>
      </Card>

    </div>
  );
}
