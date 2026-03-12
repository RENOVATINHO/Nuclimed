"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ─── Mock patient lookup ─────────────────────────────────────────────
const PACIENTES_MOCK: Record<string, string> = {
  novo: "Novo Paciente",
  p1: "Maria Silva",
  p2: "João Oliveira",
  p3: "Ana Ferreira",
  p4: "Carlos Mendes",
  p5: "Beatriz Costa",
};

// ─── Section config ────────────────────────────────────────────────────
const SECOES = [
  { id: 0, titulo: "Dados Biométricos e Laboratoriais", icone: "📊", corBg: "bg-slate-50 border-slate-200", corHeader: "text-slate-700", corBtn: "bg-slate-200" },
  { id: 1, titulo: "Pilar 1 — Nutrição", icone: "🥗", corBg: "bg-emerald-50 border-emerald-200", corHeader: "text-emerald-700", corBtn: "bg-emerald-100" },
  { id: 2, titulo: "Pilar 2 — Atividade Física", icone: "🏃", corBg: "bg-blue-50 border-blue-200", corHeader: "text-blue-700", corBtn: "bg-blue-100" },
  { id: 3, titulo: "Pilar 3 — Sono", icone: "😴", corBg: "bg-indigo-50 border-indigo-200", corHeader: "text-indigo-700", corBtn: "bg-indigo-100" },
  { id: 4, titulo: "Pilar 4 — Controle de Tóxicos", icone: "🚭", corBg: "bg-orange-50 border-orange-200", corHeader: "text-orange-700", corBtn: "bg-orange-100" },
  { id: 5, titulo: "Pilar 5 — Saúde Mental", icone: "🧠", corBg: "bg-violet-50 border-violet-200", corHeader: "text-violet-700", corBtn: "bg-violet-100" },
  { id: 6, titulo: "Pilar 6 — Conexões Sociais", icone: "👥", corBg: "bg-pink-50 border-pink-200", corHeader: "text-pink-700", corBtn: "bg-pink-100" },
];

const COMORBIDADES_OPTS = [
  "Diabetes tipo 2", "Hipertensão", "Doenças cardiovasculares",
  "Obesidade", "DPOC", "Síndrome metabólica",
];

// ─── Sub-components ────────────────────────────────────────────────────
function SimNao({ pergunta, value, onChange }: { pergunta: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-sm text-slate-700 flex-1 leading-relaxed">{pergunta}</p>
      <div className="flex gap-2 shrink-0">
        {["Sim", "Não"].map((op) => (
          <button
            key={op}
            type="button"
            onClick={() => onChange(op)}
            className={cn(
              "px-4 py-1.5 text-sm rounded-lg border font-medium transition-all",
              value === op
                ? op === "Sim"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-red-500 text-white border-red-500"
                : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
            )}
          >
            {op}
          </button>
        ))}
      </div>
    </div>
  );
}

function RadioGrupo({ pergunta, value, onChange, opcoes }: { pergunta: string; value: string; onChange: (v: string) => void; opcoes: string[] }) {
  return (
    <div>
      <p className="text-sm text-slate-700 mb-2 leading-relaxed">{pergunta}</p>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((op) => (
          <button
            key={op}
            type="button"
            onClick={() => onChange(op)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg border font-medium transition-all",
              value === op
                ? "bg-violet-600 text-white border-violet-600"
                : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
            )}
          >
            {op}
          </button>
        ))}
      </div>
    </div>
  );
}

function SliderInput({ pergunta, value, onChange, min, max, unit, saudavelLabel }: { pergunta: string; value: number; onChange: (v: number) => void; min: number; max: number; unit: string; saudavelLabel?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-slate-700 flex-1 leading-relaxed">{pergunta}</p>
        <span className="ml-4 text-sm font-bold text-violet-600 shrink-0">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-violet-600 h-2 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>{min} {unit}</span>
        {saudavelLabel && <span className="text-emerald-600 font-medium">{saudavelLabel}</span>}
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-slate-200/70 my-1" />;
}

// ─── Main component ─────────────────────────────────────────────────────
export default function AvaliacaoPage({ params }: { params: { pacienteId: string } }) {
  const router = useRouter();
  const nomePaciente = PACIENTES_MOCK[params.pacienteId] ?? `Paciente ${params.pacienteId}`;
  const hoje = new Date().toLocaleDateString("pt-BR");

  const [abertas, setAbertas] = useState<Set<number>>(new Set([0]));

  // Biometric
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [circAbd, setCircAbd] = useState("");
  const [comorbidades, setComorbidades] = useState<string[]>([]);
  const [insulina, setInsulina] = useState("");
  const [tgHdl, setTgHdl] = useState("");
  const [vitD, setVitD] = useState("");
  const [magnesio, setMagnesio] = useState("");
  const [vitB12, setVitB12] = useState("");

  // Pilar 1 - Nutrição
  const [n_ultra, setN_ultra] = useState("");
  const [n_vegetais, setN_vegetais] = useState("");
  const [n_agua, setN_agua] = useState("");
  const [n_acucar, setN_acucar] = useState("");
  const [n_fermentados, setN_fermentados] = useState("");

  // Pilar 2 - Atividade Física
  const [af_exercicio, setAf_exercicio] = useState("");
  const [af_resistencia, setAf_resistencia] = useState("");
  const [af_aerobico, setAf_aerobico] = useState("");
  const [af_sedentario, setAf_sedentario] = useState(8);

  // Pilar 3 - Sono
  const [s_horas, setS_horas] = useState(7);
  const [s_ambiente, setS_ambiente] = useState("");
  const [s_telas, setS_telas] = useState("");
  const [s_descansado, setS_descansado] = useState("");
  const [s_dificuldade, setS_dificuldade] = useState("");

  // Pilar 4 - Tóxicos
  const [t_fuma, setT_fuma] = useState("");
  const [t_alcool, setT_alcool] = useState("");
  const [t_pesticidas, setT_pesticidas] = useState("");
  const [t_plastico, setT_plastico] = useState("");

  // Pilar 5 - Saúde Mental
  const [sm_relaxamento, setSm_relaxamento] = useState("");
  const [sm_hobby, setSm_hobby] = useState("");
  const [sm_ansiedade, setSm_ansiedade] = useState("");
  const [sm_suporte, setSm_suporte] = useState("");

  // Pilar 6 - Social
  const [sc_relacoes, setSc_relacoes] = useState("");
  const [sc_solidao, setSc_solidao] = useState("");
  const [sc_familia, setSc_familia] = useState("");
  const [sc_comunidade, setSc_comunidade] = useState("");

  // IMC
  const imc = useMemo(() => {
    const p = parseFloat(peso);
    const h = parseFloat(altura);
    if (!p || !h) return null;
    return (p / Math.pow(h / 100, 2)).toFixed(1);
  }, [peso, altura]);

  // Progress
  const progresso = useMemo(() => {
    const respostas = [
      n_ultra, n_vegetais, n_agua, n_acucar, n_fermentados,
      af_exercicio, af_resistencia, af_aerobico,
      s_ambiente, s_telas, s_descansado, s_dificuldade,
      t_fuma, t_alcool, t_pesticidas, t_plastico,
      sm_relaxamento, sm_hobby, sm_ansiedade, sm_suporte,
      sc_relacoes, sc_solidao, sc_familia, sc_comunidade,
    ].filter(Boolean).length;
    return Math.round(((respostas + 2) / 26) * 100); // +2 for always-filled sliders
  }, [n_ultra, n_vegetais, n_agua, n_acucar, n_fermentados, af_exercicio, af_resistencia, af_aerobico, s_ambiente, s_telas, s_descansado, s_dificuldade, t_fuma, t_alcool, t_pesticidas, t_plastico, sm_relaxamento, sm_hobby, sm_ansiedade, sm_suporte, sc_relacoes, sc_solidao, sc_familia, sc_comunidade]);

  // Score functions
  function scoreNutricao() {
    let pts = 0;
    if (n_ultra === "Nunca" || n_ultra === "Raramente") pts++;
    if (n_vegetais === "Sim") pts++;
    if (n_agua === "Sim") pts++;
    if (n_acucar === "Não") pts++;
    if (n_fermentados === "Sim") pts++;
    return Math.round((pts / 5) * 100);
  }
  function scoreAtividade() {
    let pts = 0;
    if (af_exercicio === "Sim") pts++;
    if (af_resistencia === "Sim") pts++;
    if (af_aerobico === "Sim") pts++;
    if (af_sedentario <= 4) pts++;
    return Math.round((pts / 4) * 100);
  }
  function scoreSono() {
    let pts = 0;
    if (s_horas >= 7 && s_horas <= 9) pts++;
    if (s_ambiente === "Sim") pts++;
    if (s_telas === "Sim") pts++;
    if (s_descansado === "Sim") pts++;
    if (s_dificuldade === "Não") pts++;
    return Math.round((pts / 5) * 100);
  }
  function scoreToxicos() {
    let pts = 0;
    if (t_fuma === "Não") pts++;
    if (t_alcool === "Nunca" || t_alcool === "Raramente") pts++;
    if (t_pesticidas === "Não") pts++;
    if (t_plastico === "Sim") pts++;
    return Math.round((pts / 4) * 100);
  }
  function scoreMental() {
    let pts = 0;
    if (sm_relaxamento === "Sim") pts++;
    if (sm_hobby === "Sim") pts++;
    if (sm_ansiedade === "Não") pts++;
    if (sm_suporte === "Sim") pts++;
    return Math.round((pts / 4) * 100);
  }
  function scoreSocial() {
    let pts = 0;
    if (sc_relacoes === "Sim") pts++;
    if (sc_solidao === "Não") pts++;
    if (sc_familia === "Sim") pts++;
    if (sc_comunidade === "Sim") pts++;
    return Math.round((pts / 4) * 100);
  }

  function toggleSecao(id: number) {
    setAbertas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function gerarRelatorio() {
    const scores = {
      n: scoreNutricao(),
      af: scoreAtividade(),
      s: scoreSono(),
      t: scoreToxicos(),
      sm: scoreMental(),
      sc: scoreSocial(),
    };
    const qs = new URLSearchParams(
      Object.entries(scores).map(([k, v]) => [k, String(v)])
    ).toString();
    router.push(`/mev/plano/${params.pacienteId}?${qs}`);
  }

  function toggleComorbidade(c: string) {
    setComorbidades((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Avaliação MEV</p>
            <h1 className="text-xl font-bold text-slate-900">{nomePaciente}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{hoje}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">Preenchimento</p>
            <p className="text-2xl font-bold text-violet-600">{progresso}%</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-3xl mx-auto mt-3">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-3xl mx-auto px-4 mt-6 space-y-3">
        {SECOES.map((sec) => (
          <div key={sec.id} className={cn("rounded-xl border overflow-hidden", sec.corBg)}>
            {/* Section header */}
            <button
              type="button"
              className="w-full flex items-center justify-between px-5 py-4 text-left"
              onClick={() => toggleSecao(sec.id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{sec.icone}</span>
                <span className={cn("font-semibold text-sm", sec.corHeader)}>
                  {sec.titulo}
                </span>
              </div>
              {abertas.has(sec.id) ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Section content */}
            {abertas.has(sec.id) && (
              <div className="px-5 pb-5 space-y-5 border-t border-slate-200/50">
                <div className="pt-4" />

                {/* ── SEÇÃO 0: Biométricos ── */}
                {sec.id === 0 && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-slate-600 mb-1.5 block">Peso (kg)</Label>
                        <Input
                          type="number"
                          placeholder="ex: 72.5"
                          value={peso}
                          onChange={(e) => setPeso(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600 mb-1.5 block">Altura (cm)</Label>
                        <Input
                          type="number"
                          placeholder="ex: 170"
                          value={altura}
                          onChange={(e) => setAltura(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                    </div>
                    {imc && (
                      <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-2.5 border border-slate-200">
                        <span className="text-xs text-slate-500">IMC calculado:</span>
                        <span className={cn(
                          "text-lg font-bold",
                          parseFloat(imc) < 18.5 ? "text-blue-600"
                            : parseFloat(imc) < 25 ? "text-emerald-600"
                            : parseFloat(imc) < 30 ? "text-amber-600"
                            : "text-red-600"
                        )}>
                          {imc}
                        </span>
                        <span className="text-xs text-slate-400">
                          {parseFloat(imc) < 18.5 ? "Abaixo do peso"
                            : parseFloat(imc) < 25 ? "Peso normal"
                            : parseFloat(imc) < 30 ? "Sobrepeso"
                            : "Obesidade"}
                        </span>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs text-slate-600 mb-1.5 block">
                        Circunferência abdominal (cm)
                      </Label>
                      <Input
                        type="number"
                        placeholder="ex: 88"
                        value={circAbd}
                        onChange={(e) => setCircAbd(e.target.value)}
                        className="bg-white max-w-xs"
                      />
                    </div>
                    <Divider />
                    <div>
                      <Label className="text-xs text-slate-600 mb-2 block">Comorbidades</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {COMORBIDADES_OPTS.map((c) => (
                          <label
                            key={c}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-all",
                              comorbidades.includes(c)
                                ? "bg-slate-700 text-white border-slate-700"
                                : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                            )}
                          >
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={comorbidades.includes(c)}
                              onChange={() => toggleComorbidade(c)}
                            />
                            <span className={cn(
                              "w-4 h-4 rounded border-2 flex items-center justify-center shrink-0",
                              comorbidades.includes(c) ? "bg-white border-white" : "border-slate-400"
                            )}>
                              {comorbidades.includes(c) && (
                                <span className="w-2 h-2 bg-slate-700 rounded-sm block" />
                              )}
                            </span>
                            {c}
                          </label>
                        ))}
                      </div>
                    </div>
                    <Divider />
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Indicadores Laboratoriais
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Insulina em jejum", unit: "μU/mL", value: insulina, set: setInsulina },
                        { label: "Triglicerídeos/HDL", unit: "ratio", value: tgHdl, set: setTgHdl },
                        { label: "Vitamina D", unit: "ng/mL", value: vitD, set: setVitD },
                        { label: "Magnésio", unit: "mg/dL", value: magnesio, set: setMagnesio },
                        { label: "Vitamina B12", unit: "pg/mL", value: vitB12, set: setVitB12 },
                      ].map((lab) => (
                        <div key={lab.label}>
                          <Label className="text-xs text-slate-600 mb-1.5 block">
                            {lab.label}{" "}
                            <span className="text-slate-400 font-normal">({lab.unit})</span>
                          </Label>
                          <Input
                            type="number"
                            placeholder="—"
                            value={lab.value}
                            onChange={(e) => lab.set(e.target.value)}
                            className="bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* ── SEÇÃO 1: Nutrição ── */}
                {sec.id === 1 && (
                  <>
                    <RadioGrupo
                      pergunta="Com que frequência consome alimentos ultraprocessados?"
                      value={n_ultra}
                      onChange={setN_ultra}
                      opcoes={["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"]}
                    />
                    <Divider />
                    <SimNao pergunta="Inclui vegetais coloridos em todas as refeições?" value={n_vegetais} onChange={setN_vegetais} />
                    <Divider />
                    <SimNao pergunta="Bebe pelo menos 35 ml de água por kg de peso ao dia?" value={n_agua} onChange={setN_agua} />
                    <Divider />
                    <SimNao pergunta="Usa açúcar refinado ou adoçantes artificiais?" value={n_acucar} onChange={setN_acucar} />
                    <Divider />
                    <SimNao pergunta="Consome alimentos fermentados diariamente (iogurte, kefir, kombucha)?" value={n_fermentados} onChange={setN_fermentados} />
                  </>
                )}

                {/* ── SEÇÃO 2: Atividade Física ── */}
                {sec.id === 2 && (
                  <>
                    <SimNao pergunta="Pratica pelo menos 30 minutos de exercício na maioria dos dias?" value={af_exercicio} onChange={setAf_exercicio} />
                    <Divider />
                    <SimNao pergunta="Sua rotina inclui exercícios de resistência (musculação, funcional)?" value={af_resistencia} onChange={setAf_resistencia} />
                    <Divider />
                    <SimNao pergunta="Pratica exercícios aeróbicos (caminhada, corrida, natação)?" value={af_aerobico} onChange={setAf_aerobico} />
                    <Divider />
                    <SliderInput
                      pergunta="Quantas horas por dia fica sentado ou deitado?"
                      value={af_sedentario}
                      onChange={setAf_sedentario}
                      min={0}
                      max={16}
                      unit="h"
                      saudavelLabel="Ideal: ≤ 4h"
                    />
                  </>
                )}

                {/* ── SEÇÃO 3: Sono ── */}
                {sec.id === 3 && (
                  <>
                    <SliderInput
                      pergunta="Quantas horas dorme em média por noite?"
                      value={s_horas}
                      onChange={setS_horas}
                      min={0}
                      max={12}
                      unit="h"
                      saudavelLabel="Ideal: 7–9h"
                    />
                    <Divider />
                    <SimNao pergunta="Dorme em ambiente escuro e silencioso?" value={s_ambiente} onChange={setS_ambiente} />
                    <Divider />
                    <SimNao pergunta="Evita telas (celular, TV) 1h antes de dormir?" value={s_telas} onChange={setS_telas} />
                    <Divider />
                    <SimNao pergunta="Acorda se sentindo descansado?" value={s_descansado} onChange={setS_descansado} />
                    <Divider />
                    <SimNao pergunta="Tem dificuldade para adormecer ou acorda durante a noite?" value={s_dificuldade} onChange={setS_dificuldade} />
                  </>
                )}

                {/* ── SEÇÃO 4: Tóxicos ── */}
                {sec.id === 4 && (
                  <>
                    <SimNao pergunta="Fuma ou usa cigarro eletrônico?" value={t_fuma} onChange={setT_fuma} />
                    <Divider />
                    <RadioGrupo
                      pergunta="Com que frequência consome álcool?"
                      value={t_alcool}
                      onChange={setT_alcool}
                      opcoes={["Nunca", "Raramente", "Semanalmente", "Diariamente"]}
                    />
                    <Divider />
                    <SimNao pergunta="Está regularmente exposto a pesticidas, solventes ou poluentes?" value={t_pesticidas} onChange={setT_pesticidas} />
                    <Divider />
                    <SimNao pergunta="Tem cuidado com embalagens plásticas para alimentos quentes?" value={t_plastico} onChange={setT_plastico} />
                  </>
                )}

                {/* ── SEÇÃO 5: Saúde Mental ── */}
                {sec.id === 5 && (
                  <>
                    <SimNao pergunta="Dedica tempo diário ao relaxamento ou meditação?" value={sm_relaxamento} onChange={setSm_relaxamento} />
                    <Divider />
                    <SimNao pergunta="Tem algum hobby ou atividade prazerosa regular?" value={sm_hobby} onChange={setSm_hobby} />
                    <Divider />
                    <SimNao pergunta="Sente ansiedade ou estresse de forma frequente?" value={sm_ansiedade} onChange={setSm_ansiedade} />
                    <Divider />
                    <SimNao pergunta="Tem acesso a suporte psicológico quando necessário?" value={sm_suporte} onChange={setSm_suporte} />
                  </>
                )}

                {/* ── SEÇÃO 6: Conexões Sociais ── */}
                {sec.id === 6 && (
                  <>
                    <SimNao pergunta="Mantém relações sociais ativas e satisfatórias?" value={sc_relacoes} onChange={setSc_relacoes} />
                    <Divider />
                    <SimNao pergunta="Sente-se sozinho ou isolado com frequência?" value={sc_solidao} onChange={setSc_solidao} />
                    <Divider />
                    <SimNao pergunta="Tem família ou amigos próximos com quem pode contar?" value={sc_familia} onChange={setSc_familia} />
                    <Divider />
                    <SimNao pergunta="Participa de atividades comunitárias, grupos ou voluntariado?" value={sc_comunidade} onChange={setSc_comunidade} />
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fixed footer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progresso do questionário</span>
              <span className="font-semibold text-violet-600">{progresso}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white gap-2 shrink-0"
            onClick={gerarRelatorio}
          >
            <ClipboardList className="w-4 h-4" />
            Gerar Relatório MEV
          </Button>
        </div>
      </div>
    </div>
  );
}
