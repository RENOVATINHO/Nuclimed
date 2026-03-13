"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { getDashboardFinanceiro } from "@/lib/actions/financeiro";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusTransacao = "pago" | "pendente" | "cancelado";
type TipoTransacao = "receita" | "despesa";

interface Transacao {
  id: string;
  data: string;
  paciente: string;
  descricao: string;
  categoria: string;
  convenio?: string;
  valor: number;
  status: StatusTransacao;
  tipo: TipoTransacao;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function moeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const STATUS_CONFIG_FIN = {
  pago: { label: "Pago", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  pendente: { label: "Pendente", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  cancelado: { label: "Cancelado", cls: "bg-red-100 text-red-600 border-red-200" },
} as const;

// ─── Custom Tooltips ──────────────────────────────────────────────────────────

interface LinePayload { name: string; value: number; color: string }
interface PiePayload { name: string; value: number }

function CustomLineTooltip({ active, payload, label }: { active?: boolean; payload?: LinePayload[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border rounded-xl shadow-lg p-3 text-xs min-w-[150px]">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p: LinePayload) => (
        <div key={p.name} className="flex items-center justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5" style={{ color: p.color }}>
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-semibold text-slate-800">{moeda(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function makePieTooltip(pieTotal: number) {
  return function CustomPieTooltip({ active, payload }: { active?: boolean; payload?: PiePayload[] }) {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border rounded-xl shadow-lg p-3 text-xs">
        <p className="font-semibold text-slate-800">{payload[0].name}</p>
        <p className="text-slate-600 mt-0.5">{moeda(payload[0].value)}</p>
        <p className="text-slate-400">{pieTotal > 0 ? ((payload[0].value / pieTotal) * 100).toFixed(1) : "0.0"}%</p>
      </div>
    );
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FinanceiroDashboardPage() {
  const { toast } = useToast();
  const [dataInicio, setDataInicio] = useState("2026-02-01");
  const [dataFim, setDataFim] = useState("2026-03-12");

  type DashboardData = Awaited<ReturnType<typeof getDashboardFinanceiro>>;
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardFinanceiro()
      .then(setData)
      .catch(() => toast({ title: "Erro ao carregar dados financeiros", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const dadosLinha = data?.semanas ?? [];
  const categorias = data?.categorias ?? [];
  const transacoesRecentes = data?.transacoesRecentes ?? [];
  const totalReceitas = data?.receitas ?? 0;
  const totalDespesas = data?.despesas ?? 0;
  const saldo = data?.saldo ?? 0;
  const varReceitas = data?.varReceitas ?? 0;
  const varDespesas = data?.varDespesas ?? 0;
  const varSaldo = data?.varSaldo ?? 0;
  const pieTotal = categorias.reduce((s, c) => s + c.valor, 0);

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Financeiro</h1>
          <p className="text-sm text-slate-500 mt-0.5">Visão geral das finanças da clínica</p>
        </div>
        <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 shadow-sm">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <Input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="border-0 p-0 h-auto text-sm w-32 focus-visible:ring-0 shadow-none"
          />
          <span className="text-slate-300">–</span>
          <Input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="border-0 p-0 h-auto text-sm w-32 focus-visible:ring-0 shadow-none"
          />
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="bg-white rounded-xl border shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Receitas</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1 tabular-nums">{moeda(totalReceitas)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className={cn("flex items-center gap-0.5 font-semibold", varReceitas >= 0 ? "text-emerald-600" : "text-red-500")}>
                {varReceitas >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {Math.abs(varReceitas)}%
              </span>
              <span className="text-slate-400">vs. período anterior</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Despesas</p>
                <p className="text-3xl font-bold text-red-500 mt-1 tabular-nums">{moeda(totalDespesas)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className={cn("flex items-center gap-0.5 font-semibold", varDespesas <= 0 ? "text-emerald-600" : "text-red-500")}>
                {varDespesas <= 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                {Math.abs(varDespesas)}%
              </span>
              <span className="text-slate-400">vs. período anterior</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo líquido</p>
                <p className="text-3xl font-bold text-violet-600 mt-1 tabular-nums">{moeda(saldo)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-violet-600" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className={cn("flex items-center gap-0.5 font-semibold", varSaldo >= 0 ? "text-emerald-600" : "text-red-500")}>
                {varSaldo >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {Math.abs(varSaldo)}%
              </span>
              <span className="text-slate-400">vs. período anterior</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Charts ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="lg:col-span-2 h-80 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* LineChart */}
          <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-5">
            <h2 className="font-semibold text-slate-900 text-sm mb-0.5">Receitas vs. Despesas</h2>
            <p className="text-xs text-slate-400 mb-4">Evolução semanal no período selecionado</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={dadosLinha} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="semana" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={(props) => <CustomLineTooltip {...(props as Parameters<typeof CustomLineTooltip>[0])} />} />
                <Line type="monotone" dataKey="receitas" name="Receitas" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: "#10B981", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="despesas" name="Despesas" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3, fill: "#EF4444", strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-5 mt-3 justify-center">
              <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" />Receitas</span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-3 h-0.5 bg-red-400 inline-block rounded" />Despesas</span>
            </div>
          </div>

          {/* PieChart */}
          <div className="bg-white rounded-xl border shadow-sm p-5 flex flex-col">
            <h2 className="font-semibold text-slate-900 text-sm mb-0.5">Distribuição por serviço</h2>
            <p className="text-xs text-slate-400 mb-2">Receitas brutas por tipo</p>
            <div className="flex-1 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categorias} cx="50%" cy="50%" innerRadius={46} outerRadius={70} paddingAngle={3} dataKey="valor" nameKey="nome">
                    {categorias.map((entry, idx) => (
                      <Cell key={idx} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip content={(props) => { const C = makePieTooltip(pieTotal); return <C {...(props as Parameters<typeof C>[0])} />; }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-2 mt-1">
                {categorias.map((c) => (
                  <div key={c.nome} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: c.cor }} />
                    <span className="flex-1 text-slate-600">{c.nome}</span>
                    <span className="font-semibold text-slate-700">{pieTotal > 0 ? ((c.valor / pieTotal) * 100).toFixed(0) : "0"}%</span>
                    <span className="text-slate-400 tabular-nums">{moeda(c.valor)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Últimas Transações ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="font-semibold text-slate-900 text-sm">Últimas transações</h2>
            <p className="text-xs text-slate-400 mt-0.5">10 registros mais recentes</p>
          </div>
          <Link href="/financeiro/transacoes">
            <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 gap-1 text-xs h-8">
              Ver todas <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50/60">
                {["Data", "Paciente", "Descrição", "Categoria", "Convênio", "Valor", "Status"].map((h) => (
                  <th key={h} className={cn(
                    "py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider",
                    h === "Valor" ? "px-4 text-right" : h === "Status" ? "px-4 text-center" : "px-4 text-left"
                  )}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : transacoesRecentes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-sm">
                    Nenhuma transação encontrada no período.
                  </td>
                </tr>
              ) : transacoesRecentes.map((t) => {
                const dataFormatada = new Date(t.dataEmissao).toLocaleDateString("pt-BR");
                const nomePaciente = t.paciente?.nome ?? "—";
                const statusRaw = t.status.toLowerCase() as StatusTransacao;
                const tipoRaw = t.tipo.toLowerCase() as TipoTransacao;
                const statusCfg = STATUS_CONFIG_FIN[statusRaw] ?? STATUS_CONFIG_FIN.pendente;
                return (
                  <tr key={t.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{dataFormatada}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium text-xs">{nomePaciente}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{t.descricao}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{t.categoria}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">—</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn("text-sm font-bold tabular-nums", tipoRaw === "receita" ? "text-emerald-600" : "text-red-500")}>
                        {tipoRaw === "despesa" ? "−" : "+"}{moeda(t.valorLiquido)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border", statusCfg.cls)}>
                        {statusCfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t bg-slate-50/60">
          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <CreditCard className="w-3.5 h-3.5" />{transacoesRecentes.length} transações recentes
          </span>
          <div className="flex items-center gap-6 text-xs">
            <span className="text-slate-500">Receitas: <span className="font-bold text-emerald-600">{moeda(totalReceitas)}</span></span>
            <span className="text-slate-500">Despesas: <span className="font-bold text-red-500">{moeda(totalDespesas)}</span></span>
            <span className="text-slate-500">Saldo: <span className="font-bold text-violet-600">{moeda(saldo)}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
