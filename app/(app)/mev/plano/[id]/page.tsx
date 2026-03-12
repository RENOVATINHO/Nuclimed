"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Download, Save, GitCompareArrows, AlertCircle, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import RadarMEV from "@/components/mev/RadarMEV";
import PilarCard from "@/components/mev/PilarCard";

// ─── Mock patient data ────────────────────────────────────────────────
const PACIENTES_MOCK: Record<string, { nome: string; peso: string; altura: string; imc: string; comorbidades: string[] }> = {
  p1: { nome: "Maria Silva", peso: "68 kg", altura: "162 cm", imc: "25.9", comorbidades: ["Hipertensão"] },
  p2: { nome: "João Oliveira", peso: "92 kg", altura: "175 cm", imc: "30.0", comorbidades: ["Obesidade", "Diabetes tipo 2"] },
  p3: { nome: "Ana Ferreira", peso: "55 kg", altura: "158 cm", imc: "22.0", comorbidades: [] },
  p4: { nome: "Carlos Mendes", peso: "80 kg", altura: "178 cm", imc: "25.2", comorbidades: ["Síndrome metabólica"] },
  p5: { nome: "Beatriz Costa", peso: "74 kg", altura: "165 cm", imc: "27.2", comorbidades: ["Hipertensão", "Doenças cardiovasculares"] },
  novo: { nome: "Paciente", peso: "—", altura: "—", imc: "—", comorbidades: [] },
};

const PILARES_CONFIG = [
  { key: "nutricao", nome: "Nutrição", icone: "🥗", corBg: "bg-emerald-50 border-emerald-200", corTexto: "text-emerald-700" },
  { key: "atividade", nome: "Atividade Física", icone: "🏃", corBg: "bg-blue-50 border-blue-200", corTexto: "text-blue-700" },
  { key: "sono", nome: "Sono", icone: "😴", corBg: "bg-indigo-50 border-indigo-200", corTexto: "text-indigo-700" },
  { key: "toxicos", nome: "Controle de Tóxicos", icone: "🚭", corBg: "bg-orange-50 border-orange-200", corTexto: "text-orange-700" },
  { key: "mental", nome: "Saúde Mental", icone: "🧠", corBg: "bg-violet-50 border-violet-200", corTexto: "text-violet-700" },
  { key: "social", nome: "Conexões Sociais", icone: "👥", corBg: "bg-pink-50 border-pink-200", corTexto: "text-pink-700" },
];

const ATENCAO_DEFAULT: Record<string, string> = {
  nutricao: "Alto consumo de ultraprocessados e baixa hidratação identificados.",
  atividade: "Tempo sedentário elevado e ausência de treino resistido.",
  sono: "Duração insuficiente do sono e exposição a telas antes de dormir.",
  toxicos: "Consumo regular de álcool e exposição a contaminantes.",
  mental: "Estresse frequente sem práticas regulares de manejo emocional.",
  social: "Vínculos sociais frágeis e baixo engajamento comunitário.",
};

const METAS_PLANO = [
  {
    id: "m1",
    pilar: "Sono",
    pilarCor: "bg-indigo-100 text-indigo-700",
    icone: "😴",
    meta: "Estabelecer rotina de sono consistente: deitar entre 22h–23h e acordar entre 6h–7h, mantendo o mesmo horário inclusive nos fins de semana para regular o ritmo circadiano.",
    prazo: "30 dias",
  },
  {
    id: "m2",
    pilar: "Nutrição",
    pilarCor: "bg-emerald-100 text-emerald-700",
    icone: "🥗",
    meta: "Substituir 2 refeições por semana que incluam ultraprocessados por opções integrais e naturais, priorizando vegetais coloridos e proteínas magras.",
    prazo: "2 semanas",
  },
  {
    id: "m3",
    pilar: "Atividade Física",
    pilarCor: "bg-blue-100 text-blue-700",
    icone: "🏃",
    meta: "Iniciar programa de caminhadas de 30 minutos, 4× por semana, podendo progredir para corrida leve após 30 dias de adaptação.",
    prazo: "15 dias",
  },
  {
    id: "m4",
    pilar: "Saúde Mental",
    pilarCor: "bg-violet-100 text-violet-700",
    icone: "🧠",
    meta: "Praticar 10 minutos diários de meditação guiada (Headspace ou Insight Timer) pela manhã antes de iniciar as atividades do dia.",
    prazo: "14 dias",
  },
  {
    id: "m5",
    pilar: "Nutrição",
    pilarCor: "bg-emerald-100 text-emerald-700",
    icone: "🥗",
    meta: "Aumentar ingestão hídrica para 35 ml/kg de peso corporal ao dia, distribuídos em 8–10 copos ao longo do dia, reduzindo bebidas açucaradas.",
    prazo: "1 semana",
  },
];

function imcClassificacao(imc: string) {
  const v = parseFloat(imc);
  if (isNaN(v)) return { label: "—", cor: "text-slate-400" };
  if (v < 18.5) return { label: "Abaixo do peso", cor: "text-blue-600" };
  if (v < 25) return { label: "Peso normal", cor: "text-emerald-600" };
  if (v < 30) return { label: "Sobrepeso", cor: "text-amber-600" };
  return { label: "Obesidade", cor: "text-red-600" };
}

export default function PlanoMevPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paciente = PACIENTES_MOCK[params.id] ?? PACIENTES_MOCK["novo"];
  const imcInfo = imcClassificacao(paciente.imc);
  const hoje = new Date().toLocaleDateString("pt-BR");

  // Scores from URL params or mock fallback
  const scores = {
    nutricao: Number(searchParams.get("n")) || 62,
    atividade: Number(searchParams.get("af")) || 50,
    sono: Number(searchParams.get("s")) || 35,
    toxicos: Number(searchParams.get("t")) || 75,
    mental: Number(searchParams.get("sm")) || 45,
    social: Number(searchParams.get("sc")) || 80,
  };

  const radarData = PILARES_CONFIG.map((p) => ({
    pilar: p.nome,
    score: scores[p.key as keyof typeof scores],
  }));

  // Risks: pilares with score ≤ 40
  const riscos = PILARES_CONFIG
    .filter((p) => scores[p.key as keyof typeof scores] <= 40)
    .map((p) => ({
      label: p.nome,
      icone: p.icone,
      score: scores[p.key as keyof typeof scores],
    }));

  // Metas state (checkboxes)
  const [metasConcluidas, setMetasConcluidas] = useState<Set<string>>(new Set());
  function toggleMeta(id: string) {
    setMetasConcluidas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Score médio geral
  const scoreGeral = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / 6
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Relatório MEV</p>
          <h1 className="text-2xl font-bold text-slate-900">{paciente.nome}</h1>
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
              <p className="font-semibold text-slate-800">{paciente.peso}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Altura</p>
              <p className="font-semibold text-slate-800">{paciente.altura}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">IMC</p>
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-800">{paciente.imc}</p>
                <span className={cn("text-xs font-medium", imcInfo.cor)}>
                  {imcInfo.label}
                </span>
              </div>
            </div>
          </div>
          {paciente.comorbidades.length > 0 && (
            <>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-400 mb-2">Comorbidades</p>
                <div className="flex flex-wrap gap-2">
                  {paciente.comorbidades.map((c) => (
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
                  key={r.label}
                  className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
                >
                  {r.icone} {r.label} — {r.score}%
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
          {METAS_PLANO.map((meta, idx) => {
            const concluida = metasConcluidas.has(meta.id);
            return (
              <div
                key={meta.id}
                className={cn(
                  "bg-white border rounded-xl p-4 transition-all",
                  concluida ? "border-emerald-200 bg-emerald-50/40 opacity-70" : "border-slate-200"
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleMeta(meta.id)}
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
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", meta.pilarCor)}>
                        {meta.icone} {meta.pilar}
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
