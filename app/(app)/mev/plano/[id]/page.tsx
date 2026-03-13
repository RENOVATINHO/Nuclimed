"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Download, Save, GitCompareArrows, AlertCircle, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import RadarMEV from "@/components/mev/RadarMEV";
import PilarCard from "@/components/mev/PilarCard";
import { getAvaliacaoById } from "@/lib/actions/mev";

// ─── Static config ────────────────────────────────────────────────────────────

const PILARES_CONFIG = [
  { key: "nutricao", scoreKey: "scorePilar1" as const, nome: "Nutrição", icone: "🥗", corBg: "bg-emerald-50 border-emerald-200", corTexto: "text-emerald-700" },
  { key: "atividade", scoreKey: "scorePilar2" as const, nome: "Atividade Física", icone: "🏃", corBg: "bg-blue-50 border-blue-200", corTexto: "text-blue-700" },
  { key: "sono", scoreKey: "scorePilar3" as const, nome: "Sono", icone: "😴", corBg: "bg-indigo-50 border-indigo-200", corTexto: "text-indigo-700" },
  { key: "toxicos", scoreKey: "scorePilar4" as const, nome: "Controle de Tóxicos", icone: "🚭", corBg: "bg-orange-50 border-orange-200", corTexto: "text-orange-700" },
  { key: "mental", scoreKey: "scorePilar5" as const, nome: "Saúde Mental", icone: "🧠", corBg: "bg-violet-50 border-violet-200", corTexto: "text-violet-700" },
  { key: "social", scoreKey: "scorePilar6" as const, nome: "Conexões Sociais", icone: "👥", corBg: "bg-pink-50 border-pink-200", corTexto: "text-pink-700" },
];

const ATENCAO_DEFAULT: Record<string, string> = {
  nutricao: "Alto consumo de ultraprocessados e baixa hidratação identificados.",
  atividade: "Tempo sedentário elevado e ausência de treino resistido.",
  sono: "Duração insuficiente do sono e exposição a telas antes de dormir.",
  toxicos: "Consumo regular de álcool e exposição a contaminantes.",
  mental: "Estresse frequente sem práticas regulares de manejo emocional.",
  social: "Vínculos sociais frágeis e baixo engajamento comunitário.",
};

const PILAR_COR_MAP: Record<string, string> = {
  "Nutrição": "bg-emerald-100 text-emerald-700",
  "Atividade Física": "bg-blue-100 text-blue-700",
  "Sono": "bg-indigo-100 text-indigo-700",
  "Controle de Tóxicos": "bg-orange-100 text-orange-700",
  "Saúde Mental": "bg-violet-100 text-violet-700",
  "Conexões Sociais": "bg-pink-100 text-pink-700",
};

const PILAR_ICONE_MAP: Record<string, string> = {
  "Nutrição": "🥗",
  "Atividade Física": "🏃",
  "Sono": "😴",
  "Controle de Tóxicos": "🚭",
  "Saúde Mental": "🧠",
  "Conexões Sociais": "👥",
};

function imcClassificacao(imc: string | number | null | undefined) {
  const v = typeof imc === "number" ? imc : parseFloat(String(imc ?? ""));
  if (isNaN(v)) return { label: "—", cor: "text-slate-400" };
  if (v < 18.5) return { label: "Abaixo do peso", cor: "text-blue-600" };
  if (v < 25) return { label: "Peso normal", cor: "text-emerald-600" };
  if (v < 30) return { label: "Sobrepeso", cor: "text-amber-600" };
  return { label: "Obesidade", cor: "text-red-600" };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlanoMevPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  type AvaliacaoData = Awaited<ReturnType<typeof getAvaliacaoById>>;
  const [avaliacao, setAvaliacao] = useState<AvaliacaoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id === "nova") {
      setLoading(false);
      return;
    }
    getAvaliacaoById(params.id)
      .then(setAvaliacao)
      .catch(() => toast({ title: "Erro ao carregar avaliação", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [params.id]);

  // Scores: from avaliacao if loaded, else from URL search params, else defaults
  const scores = {
    nutricao: avaliacao?.scorePilar1 ?? (Number(searchParams.get("n")) || 62),
    atividade: avaliacao?.scorePilar2 ?? (Number(searchParams.get("af")) || 50),
    sono: avaliacao?.scorePilar3 ?? (Number(searchParams.get("s")) || 35),
    toxicos: avaliacao?.scorePilar4 ?? (Number(searchParams.get("t")) || 75),
    mental: avaliacao?.scorePilar5 ?? (Number(searchParams.get("sm")) || 45),
    social: avaliacao?.scorePilar6 ?? (Number(searchParams.get("sc")) || 80),
  };

  // Patient info: from avaliacao relation or fallback
  const nomePaciente = avaliacao?.paciente?.nome ?? searchParams.get("nome") ?? "Paciente";
  const peso = avaliacao?.peso != null ? `${avaliacao.peso} kg` : "—";
  const altura = avaliacao?.altura != null ? `${avaliacao.altura} cm` : "—";
  const imcVal = avaliacao?.imc ?? null;
  const imcInfo = imcClassificacao(imcVal);
  const imcDisplay = imcVal != null ? String(imcVal) : "—";
  const comorbidades: string[] = avaliacao?.comorbidadesParsed ?? [];
  const hoje = avaliacao
    ? new Date(avaliacao.createdAt).toLocaleDateString("pt-BR")
    : new Date().toLocaleDateString("pt-BR");

  const radarData = PILARES_CONFIG.map((p) => ({
    pilar: p.nome,
    score: scores[p.key as keyof typeof scores],
  }));

  // Risks: pilares with score ≤ 40
  const riscos = avaliacao?.riscosParsed?.length
    ? avaliacao.riscosParsed as Array<{ pilar: string; icone: string; score: number }>
    : PILARES_CONFIG
        .filter((p) => scores[p.key as keyof typeof scores] <= 40)
        .map((p) => ({
          pilar: p.nome,
          icone: p.icone,
          score: scores[p.key as keyof typeof scores],
        }));

  // Plano de ação from server or derived from scores
  type MetaItem = { pilar: string; meta: string; prazo: string; concluida: boolean };
  const metasServidor: MetaItem[] = avaliacao?.planoAcaoParsed ?? [];

  // Metas state (checkboxes) — keyed by index
  const [metasConcluidas, setMetasConcluidas] = useState<Set<number>>(new Set());
  function toggleMeta(idx: number) {
    setMetasConcluidas((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  // Score médio geral
  const scoreGeral = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / 6
  );

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Relatório MEV</p>
          <h1 className="text-2xl font-bold text-slate-900">{nomePaciente}</h1>
          <p className="text-xs text-slate-500 mt-1">Avaliação realizada em {hoje}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-slate-600">
            <GitCompareArrows className="w-4 h-4" />
            Comparar anterior
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-slate-600">
            <Save className="w-4 h-4" />
            Salvar prontuário
          </Button>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Download className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Score geral banner */}
      <div className={cn(
        "rounded-xl border p-5 mb-6 flex items-center justify-between",
        scoreGeral <= 40 ? "bg-red-50 border-red-200"
          : scoreGeral <= 70 ? "bg-amber-50 border-amber-200"
          : "bg-emerald-50 border-emerald-200"
      )}>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Score MEV Geral</p>
          <p className={cn(
            "text-4xl font-bold",
            scoreGeral <= 40 ? "text-red-600"
              : scoreGeral <= 70 ? "text-amber-600"
              : "text-emerald-600"
          )}>
            {scoreGeral}%
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {scoreGeral <= 40 ? "Estado crítico — atenção imediata necessária"
              : scoreGeral <= 70 ? "Moderado — há espaço significativo para melhoria"
              : "Bom estilo de vida — manutenção e otimização"}
          </p>
        </div>
        <div className="text-5xl opacity-30">
          {scoreGeral <= 40 ? "⚠️" : scoreGeral <= 70 ? "📈" : "✅"}
        </div>
      </div>

      {/* Perfil Metabólico */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Perfil Metabólico
        </h2>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="grid grid-cols-3 gap-6 mb-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Peso</p>
              <p className="font-semibold text-slate-800">{peso}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Altura</p>
              <p className="font-semibold text-slate-800">{altura}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">IMC</p>
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-800">{imcDisplay}</p>
                <span className={cn("text-xs font-medium", imcInfo.cor)}>
                  {imcInfo.label}
                </span>
              </div>
            </div>
          </div>
          {comorbidades.length > 0 && (
            <>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-400 mb-2">Comorbidades</p>
                <div className="flex flex-wrap gap-2">
                  {comorbidades.map((c) => (
                    <span
                      key={c}
                      className="text-xs px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 rounded-full font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Radar chart */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Mapa dos 6 Pilares
        </h2>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <RadarMEV scores={radarData} />
        </div>
      </section>

      {/* Pilar cards grid */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Avaliação por Pilar
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {PILARES_CONFIG.map((p) => (
            <PilarCard
              key={p.key}
              nome={p.nome}
              icone={p.icone}
              score={scores[p.key as keyof typeof scores]}
              atencao={ATENCAO_DEFAULT[p.key]}
              corBg={p.corBg}
              corTexto={p.corTexto}
            />
          ))}
        </div>
      </section>

      {/* Riscos identificados */}
      {riscos.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Riscos Identificados
            </h2>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex flex-wrap gap-2">
              {riscos.map((r) => (
                <span
                  key={r.pilar}
                  className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
                >
                  {r.icone} {r.pilar} — {r.score}%
                </span>
              ))}
            </div>
            <p className="text-xs text-red-600 mt-3 leading-relaxed">
              Os pilares acima estão em estado crítico (score ≤ 40%) e requerem intervenção prioritária no plano de ação.
            </p>
          </div>
        </section>
      )}

      {/* Plano de Ação */}
      {metasServidor.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Plano de Ação — Metas MEV
            </h2>
            <span className="text-xs text-slate-400">
              gerado por Pulso IA
            </span>
          </div>
          <div className="space-y-3">
            {metasServidor.map((meta, idx) => {
              const concluida = metasConcluidas.has(idx);
              const pilarCor = PILAR_COR_MAP[meta.pilar] ?? "bg-slate-100 text-slate-700";
              const pilarIcone = PILAR_ICONE_MAP[meta.pilar] ?? "📋";
              return (
                <div
                  key={idx}
                  className={cn(
                    "bg-white border rounded-xl p-4 transition-all",
                    concluida ? "border-emerald-200 bg-emerald-50/40 opacity-70" : "border-slate-200"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleMeta(idx)}
                      className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      {concluida ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-slate-400">Meta {idx + 1}</span>
                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", pilarCor)}>
                          {pilarIcone} {meta.pilar}
                        </span>
                        <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {meta.prazo}
                        </span>
                      </div>
                      <p className={cn(
                        "text-sm text-slate-700 leading-relaxed",
                        concluida && "line-through text-slate-400"
                      )}>
                        {meta.meta}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Bottom action bar */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <Button
          variant="ghost"
          className="text-slate-500"
          onClick={() => router.push("/mev")}
        >
          Voltar ao Hub MEV
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 text-slate-600">
            <GitCompareArrows className="w-4 h-4" />
            Comparar com avaliação anterior
          </Button>
          <Button variant="outline" className="gap-2 text-slate-600">
            <Save className="w-4 h-4" />
            Salvar no prontuário
          </Button>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Download className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
