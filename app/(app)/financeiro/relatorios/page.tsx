"use client";

import { useState } from "react";
import type { ElementType } from "react";
import {
  FileBarChart2,
  TrendingUp,
  AlertTriangle,
  Stethoscope,
  CreditCard,
  ArrowLeftRight,
  FileText,
  Download,
  Eye,
  X,
  TableProperties,
  Calendar,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Relatorio {
  id: string;
  titulo: string;
  descricao: string;
  icon: ElementType;
  cor: string;
  corBg: string;
  corBorda: string;
  filtros: FiltroRelatorio[];
  badge?: string;
}

interface FiltroRelatorio {
  key: string;
  label: string;
  tipo: "date" | "select" | "multiselect";
  opcoes?: string[];
}

// ─── Relatórios Disponíveis ───────────────────────────────────────────────────

const RELATORIOS: Relatorio[] = [
  {
    id: "faturamento",
    titulo: "Relatório de Faturamento",
    descricao: "Análise detalhada do faturamento por período, por tipo de serviço e por convênio. Inclui totais, médias e comparativos.",
    icon: FileBarChart2,
    cor: "text-violet-700",
    corBg: "bg-violet-50",
    corBorda: "border-violet-200",
    badge: "Mais usado",
    filtros: [
      { key: "dataInicio", label: "Data início", tipo: "date" },
      { key: "dataFim", label: "Data fim", tipo: "date" },
      { key: "servico", label: "Tipo de serviço", tipo: "select", opcoes: ["Todos", "Consultas", "Retornos", "Procedimentos", "Cirurgias", "Exames"] },
      { key: "convenio", label: "Convênio", tipo: "select", opcoes: ["Todos", "Particular", "Unimed", "Bradesco Saúde", "SulAmérica", "Amil"] },
      { key: "agrupamento", label: "Agrupar por", tipo: "select", opcoes: ["Dia", "Semana", "Mês", "Trimestre"] },
    ],
  },
  {
    id: "dre",
    titulo: "DRE — Demonstrativo de Resultado",
    descricao: "Demonstrativo completo de resultado do exercício: receitas brutas, deduções, custos operacionais, despesas administrativas e resultado líquido.",
    icon: TrendingUp,
    cor: "text-emerald-700",
    corBg: "bg-emerald-50",
    corBorda: "border-emerald-200",
    filtros: [
      { key: "dataInicio", label: "Data início", tipo: "date" },
      { key: "dataFim", label: "Data fim", tipo: "date" },
      { key: "comparativo", label: "Período comparativo", tipo: "select", opcoes: ["Sem comparativo", "Mês anterior", "Mesmo período ano anterior", "Último trimestre"] },
    ],
  },
  {
    id: "inadimplencia",
    titulo: "Relatório de Inadimplência",
    descricao: "Lista de cobranças pendentes e em atraso, com aging (tempo de atraso), valor total inadimplente e contato dos pacientes devedores.",
    icon: AlertTriangle,
    cor: "text-amber-700",
    corBg: "bg-amber-50",
    corBorda: "border-amber-200",
    filtros: [
      { key: "vencidoApos", label: "Vencido após", tipo: "date" },
      { key: "vencidoAte", label: "Vencido até", tipo: "date" },
      { key: "minimoAtraso", label: "Mínimo de dias em atraso", tipo: "select", opcoes: ["Qualquer", "7 dias", "15 dias", "30 dias", "60 dias", "90 dias"] },
      { key: "convenio", label: "Convênio", tipo: "select", opcoes: ["Todos", "Particular", "Unimed", "Bradesco Saúde", "SulAmérica", "Amil"] },
    ],
  },
  {
    id: "convenio",
    titulo: "Relatório por Convênio (TISS)",
    descricao: "Faturamento e glosas por operadora, no padrão TISS. Consolidado de procedimentos, guias emitidas, valores aprovados e repasses recebidos.",
    icon: Stethoscope,
    cor: "text-blue-700",
    corBg: "bg-blue-50",
    corBorda: "border-blue-200",
    filtros: [
      { key: "dataInicio", label: "Data início", tipo: "date" },
      { key: "dataFim", label: "Data fim", tipo: "date" },
      { key: "convenio", label: "Convênio", tipo: "select", opcoes: ["Todos", "Unimed", "Bradesco Saúde", "SulAmérica", "Amil", "Porto Seguro"] },
      { key: "status", label: "Status guia", tipo: "select", opcoes: ["Todas", "Aprovadas", "Glosadas", "Em análise", "Pagas"] },
    ],
  },
  {
    id: "formapagamento",
    titulo: "Extrato por Forma de Pagamento",
    descricao: "Resumo e detalhamento de todas as movimentações agrupadas por forma de pagamento: Dinheiro, PIX, Cartão, Convênio e Boleto.",
    icon: CreditCard,
    cor: "text-indigo-700",
    corBg: "bg-indigo-50",
    corBorda: "border-indigo-200",
    filtros: [
      { key: "dataInicio", label: "Data início", tipo: "date" },
      { key: "dataFim", label: "Data fim", tipo: "date" },
      { key: "formaPagamento", label: "Forma de pagamento", tipo: "select", opcoes: ["Todas", "Dinheiro", "PIX", "Cartão de crédito", "Cartão de débito", "Convênio", "Boleto"] },
    ],
  },
  {
    id: "repasses",
    titulo: "Relatório de Repasses",
    descricao: "Controle de repasses para médicos, parceiros e prestadores de serviço. Calcula percentuais, deduções e valores a repassar por profissional.",
    icon: ArrowLeftRight,
    cor: "text-pink-700",
    corBg: "bg-pink-50",
    corBorda: "border-pink-200",
    filtros: [
      { key: "dataInicio", label: "Data início", tipo: "date" },
      { key: "dataFim", label: "Data fim", tipo: "date" },
      { key: "profissional", label: "Profissional", tipo: "select", opcoes: ["Todos", "Dr. João Silva", "Dra. Maria Oliveira", "Dr. Carlos Lima"] },
      { key: "status", label: "Status repasse", tipo: "select", opcoes: ["Todos", "Pendente", "Realizado", "Cancelado"] },
    ],
  },
];

// ─── Relatório Modal ──────────────────────────────────────────────────────────

function RelatorioModal({
  relatorio,
  onClose,
}: {
  relatorio: Relatorio | null;
  onClose: () => void;
}) {
  const [filtros, setFiltros] = useState<Record<string, string>>({});
  const [gerado, setGerado] = useState(false);

  if (!relatorio) return null;

  const Icon = relatorio.icon;

  const setFiltro = (key: string, valor: string) => setFiltros(f => ({ ...f, [key]: valor }));

  return (
    <Dialog open={!!relatorio} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", relatorio.corBg)}>
              <Icon className={cn("w-4 h-4", relatorio.cor)} />
            </div>
            {relatorio.titulo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <p className="text-xs text-slate-500 leading-relaxed">{relatorio.descricao}</p>

          <div className="border-t pt-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">Filtros do relatório</span>
            </div>

            <div className="space-y-3">
              {/* Datas lado a lado */}
              {relatorio.filtros.filter(f => f.tipo === "date").length >= 2 && (
                <div className="grid grid-cols-2 gap-3">
                  {relatorio.filtros.filter(f => f.tipo === "date").map((f) => (
                    <div key={f.key} className="space-y-1.5">
                      <Label className="text-xs">{f.label}</Label>
                      <Input
                        type="date"
                        className="h-8 text-xs"
                        value={filtros[f.key] || ""}
                        onChange={(e) => setFiltro(f.key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Selects */}
              {relatorio.filtros.filter(f => f.tipo === "select").map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-xs">{f.label}</Label>
                  <Select value={filtros[f.key] || ""} onValueChange={(v) => setFiltro(f.key, v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                    <SelectContent>
                      {f.opcoes?.map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {/* Preview de resultado */}
          {gerado && (
            <div className="bg-slate-50 rounded-lg border border-dashed border-slate-200 p-4 text-center">
              <TableProperties className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Relatório gerado com sucesso</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Clique em Visualizar para abrir ou Exportar para baixar</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">Cancelar</Button>
          {gerado ? (
            <>
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                <Eye className="w-3.5 h-3.5" />Visualizar
              </Button>
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                <Download className="w-3.5 h-3.5" />Excel
              </Button>
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-xs gap-1.5">
                <FileText className="w-3.5 h-3.5" />Exportar PDF
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className={cn("text-xs gap-1.5", relatorio.corBg.replace("bg-", "bg-").replace("-50", "-600"), "text-white hover:opacity-90")}
              onClick={() => setGerado(true)}
            >
              <FileBarChart2 className="w-3.5 h-3.5" />
              Gerar Relatório
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RelatoriosPage() {
  const [relatorioAberto, setRelatorioAberto] = useState<Relatorio | null>(null);
  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Relatórios Financeiros</h1>
          <p className="text-sm text-slate-400 mt-0.5">Gere e exporte relatórios detalhados da clínica</p>
        </div>
      </div>

      {/* ── Info banner ────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
        <Calendar className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-violet-800">Dados do período atual</p>
          <p className="text-xs text-violet-600 mt-0.5">Os relatórios são gerados com base nos dados da clínica. Defina os filtros de período e parâmetros antes de gerar.</p>
        </div>
      </div>

      {/* ── Cards Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {RELATORIOS.map((rel) => {
          const Icon = rel.icon;
          return (
            <div
              key={rel.id}
              className="bg-white rounded-xl border shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col group"
            >
              {/* Card header */}
              <div className="p-5 flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", rel.corBg)}>
                    <Icon className={cn("w-5 h-5", rel.cor)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm text-slate-900 leading-snug">{rel.titulo}</h3>
                      {rel.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 whitespace-nowrap shrink-0">
                          {rel.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{rel.descricao}</p>

                {/* Filter tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {rel.filtros.slice(0, 3).map((f) => (
                    <span key={f.key} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                      {f.label}
                    </span>
                  ))}
                  {rel.filtros.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">
                      +{rel.filtros.length - 3} filtros
                    </span>
                  )}
                </div>
              </div>

              {/* Card footer */}
              <div className={cn("flex items-center gap-2 px-5 py-3 border-t rounded-b-xl", rel.corBg, rel.corBorda.replace("border", "border-t"))}>
                <Button
                  size="sm"
                  className={cn(
                    "flex-1 text-xs gap-1.5 h-8 font-semibold",
                    rel.cor.replace("text-", "bg-").replace("-700", "-600"),
                    "text-white hover:opacity-90"
                  )}
                  onClick={() => setRelatorioAberto(rel)}
                >
                  <FileBarChart2 className="w-3.5 h-3.5" />
                  Gerar Relatório
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("text-xs h-8 gap-1", rel.cor, "hover:bg-white/60")}
                  onClick={() => setRelatorioAberto(rel)}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Pré-visualizar
                </Button>
              </div>
            </div>
          );
        })}

        {/* Card placeholder — solicitar relatório */}
        <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center gap-3 hover:border-violet-200 hover:bg-violet-50/30 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-white border-2 border-dashed border-slate-200 group-hover:border-violet-300 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-slate-300 group-hover:text-violet-400 rotate-45 transition-colors" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 group-hover:text-violet-600 transition-colors">Solicitar relatório</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-snug">Não encontrou o que precisa? Solicite um relatório personalizado.</p>
          </div>
        </div>
      </div>

      {/* ── Histórico de relatórios recentes ───────────────────────── */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-semibold text-sm text-slate-900">Relatórios recentes</h2>
          <span className="text-xs text-slate-400">Últimos 30 dias</span>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { nome: "Faturamento – Fevereiro 2026", gerado: "05/03/2026 14:22", formato: "PDF", tamanho: "284 KB", icon: FileBarChart2, cor: "text-violet-600", bg: "bg-violet-100" },
            { nome: "DRE – Q1 2026", gerado: "01/03/2026 09:15", formato: "Excel", tamanho: "196 KB", icon: TrendingUp, cor: "text-emerald-600", bg: "bg-emerald-100" },
            { nome: "Inadimplência – Fevereiro 2026", gerado: "28/02/2026 16:40", formato: "PDF", tamanho: "142 KB", icon: AlertTriangle, cor: "text-amber-600", bg: "bg-amber-100" },
            { nome: "Relatório Unimed – Fevereiro 2026", gerado: "26/02/2026 11:30", formato: "PDF", tamanho: "318 KB", icon: Stethoscope, cor: "text-blue-600", bg: "bg-blue-100" },
          ].map((r, i) => {
            const RIcon = r.icon;
            return (
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", r.bg)}>
                  <RIcon className={cn("w-4 h-4", r.cor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{r.nome}</p>
                  <p className="text-xs text-slate-400">Gerado em {r.gerado} · {r.tamanho}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", r.formato === "PDF" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700")}>
                    {r.formato}
                  </span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-slate-500">
                    <Download className="w-3 h-3" />Baixar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <RelatorioModal relatorio={relatorioAberto} onClose={() => setRelatorioAberto(null)} />
    </div>
  );
}
