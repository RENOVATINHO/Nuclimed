"use client";

import { useRouter } from "next/navigation";
import { Plus, AlertTriangle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PILARES = [
  {
    id: "nutricao",
    nome: "Nutrição",
    icone: "🥗",
    descricao: "Alimentação funcional e anti-inflamatória",
    cor: "text-emerald-700",
    corBg: "bg-emerald-50 border-emerald-200",
    corIcon: "bg-emerald-100",
    pacientesAvaliados: 48,
  },
  {
    id: "atividade",
    nome: "Atividade Física",
    icone: "🏃",
    descricao: "Movimento e condicionamento físico adequado",
    cor: "text-blue-700",
    corBg: "bg-blue-50 border-blue-200",
    corIcon: "bg-blue-100",
    pacientesAvaliados: 42,
  },
  {
    id: "sono",
    nome: "Sono",
    icone: "😴",
    descricao: "Qualidade e higiene do sono restaurador",
    cor: "text-indigo-700",
    corBg: "bg-indigo-50 border-indigo-200",
    corIcon: "bg-indigo-100",
    pacientesAvaliados: 39,
  },
  {
    id: "toxicos",
    nome: "Controle de Tóxicos",
    icone: "🚭",
    descricao: "Redução da exposição a substâncias nocivas",
    cor: "text-orange-700",
    corBg: "bg-orange-50 border-orange-200",
    corIcon: "bg-orange-100",
    pacientesAvaliados: 35,
  },
  {
    id: "mental",
    nome: "Saúde Mental",
    icone: "🧠",
    descricao: "Equilíbrio emocional e resiliência psicológica",
    cor: "text-violet-700",
    corBg: "bg-violet-50 border-violet-200",
    corIcon: "bg-violet-100",
    pacientesAvaliados: 44,
  },
  {
    id: "social",
    nome: "Conexões Sociais",
    icone: "👥",
    descricao: "Vínculos e suporte social significativos",
    cor: "text-pink-700",
    corBg: "bg-pink-50 border-pink-200",
    corIcon: "bg-pink-100",
    pacientesAvaliados: 31,
  },
];

const PACIENTES_ATENCAO = [
  { id: "p1", nome: "Maria Silva", pilarCritico: "Sono", score: 28, ultimaConsulta: "2026-02-10" },
  { id: "p2", nome: "João Oliveira", pilarCritico: "Nutrição", score: 33, ultimaConsulta: "2026-02-15" },
  { id: "p3", nome: "Ana Ferreira", pilarCritico: "Saúde Mental", score: 22, ultimaConsulta: "2026-01-28" },
  { id: "p4", nome: "Carlos Mendes", pilarCritico: "Atividade Física", score: 38, ultimaConsulta: "2026-02-20" },
  { id: "p5", nome: "Beatriz Costa", pilarCritico: "Nutrição", score: 25, ultimaConsulta: "2026-01-15" },
];

const TOTAL_AVALIACOES = 127;
const SCORE_MEDIO = 61;

export default function MevPage() {
  const router = useRouter();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vida Saudável — MEV</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Medicina do Estilo de Vida — avaliação integrada dos 6 pilares da saúde
          </p>
        </div>
        <Button
          className="bg-violet-600 hover:bg-violet-700 text-white gap-2 shrink-0"
          onClick={() => router.push("/mev/avaliacao/novo")}
        >
          <Plus className="w-4 h-4" />
          Nova Avaliação MEV
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Avaliações realizadas", valor: TOTAL_AVALIACOES, cor: "text-violet-600" },
          { label: "Score médio geral", valor: `${SCORE_MEDIO}%`, cor: "text-emerald-600" },
          { label: "Precisam de atenção", valor: PACIENTES_ATENCAO.length, cor: "text-red-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <p className={cn("text-3xl font-bold", kpi.cor)}>{kpi.valor}</p>
            <p className="text-xs text-slate-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* 6 Pillar Cards */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Os 6 Pilares MEV
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PILARES.map((pilar) => (
            <div
              key={pilar.id}
              className={cn(
                "rounded-xl border p-5 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5",
                pilar.corBg
              )}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className={cn("text-2xl p-2.5 rounded-xl", pilar.corIcon)}>
                  {pilar.icone}
                </span>
                <div>
                  <h3 className={cn("font-semibold text-sm", pilar.cor)}>{pilar.nome}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {pilar.descricao}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
                <span className="text-xs text-slate-400">Pacientes avaliados</span>
                <span className={cn("text-sm font-bold", pilar.cor)}>
                  {pilar.pacientesAvaliados}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Patients needing attention */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h2 className="text-sm font-semibold text-slate-700">
            Pacientes que precisam de atenção MEV
          </h2>
          <span className="ml-auto text-xs text-slate-400 bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">
            {PACIENTES_ATENCAO.length} com score crítico
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide border-b border-slate-200">
                <th className="text-left px-5 py-3 font-medium">Paciente</th>
                <th className="text-left px-5 py-3 font-medium">Pilar Crítico</th>
                <th className="text-left px-5 py-3 font-medium">Score</th>
                <th className="text-left px-5 py-3 font-medium">Última consulta</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PACIENTES_ATENCAO.map((p) => {
                const pilarData = PILARES.find((pl) => pl.nome === p.pilarCritico);
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{p.nome}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs px-2.5 py-0.5 rounded-full font-medium border border-red-100">
                        {pilarData?.icone} {p.pilarCritico}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${p.score}%` }}
                          />
                        </div>
                        <span className="text-red-600 font-semibold text-xs">{p.score}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">
                      {new Date(p.ultimaConsulta).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-violet-600 border-violet-200 hover:bg-violet-50 gap-1 text-xs"
                        onClick={() => router.push(`/mev/avaliacao/${p.id}`)}
                      >
                        Iniciar avaliação
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
