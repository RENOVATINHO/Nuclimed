"use client";

import {
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Search, UserPlus, User, ChevronDown, ChevronLeft,
  Check, Plus, X, Sparkles, RefreshCw, FileText,
  Printer, Download, Calendar, Clock, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MODELOS_PADRAO } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  GravacaoButton,
  formatarTempo,
  type EstadoGravacao,
} from "@/components/consulta/GravacaoButton";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Etapa = 1 | 2 | 3;
type ModalidadeConsulta = "presencial" | "telemedicina";

interface PacienteMock { id: string; nome: string; cpf: string }

interface DadosIdentificacao {
  tipoPaciente: "existente" | "novo";
  pacienteId: string;
  pacienteNome: string;
  pacienteCpf: string;
  pacienteDataNasc: string;
  pacienteTelefone: string;
  modalidade: ModalidadeConsulta;
  modeloId: string;
  convenioId: string;
}

interface SinaisVitais { pa: string; fc: string; temp: string; satO2: string; glicemia: string }

interface HipoteseDiagnostica { id: string; descricao: string; cid: string }

interface ResultadoIA {
  queixaPrincipal: string;
  historiaDoencaAtual: string;
  medicacoesUso: string[];
  historiaPregressa: string;
  sinaisVitais: SinaisVitais;
  hipotesesDiagnosticas: HipoteseDiagnostica[];
  medicacoesPrescritas: string[];
  orientacoes: string[];
  examesSolicitados: string[];
  encaminhamento: string;
  atestado: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
// TODO: substituir por fetch à API

const PACIENTES_MOCK: PacienteMock[] = [
  { id: "p1", nome: "Ana Carolina Souza", cpf: "123.456.789-00" },
  { id: "p2", nome: "Roberto Lima", cpf: "987.654.321-00" },
  { id: "p3", nome: "Mariana Ferreira", cpf: "456.789.123-00" },
  { id: "p4", nome: "Carlos Eduardo Melo", cpf: "321.654.987-00" },
  { id: "p5", nome: "Fernanda Oliveira", cpf: "654.321.098-00" },
  { id: "p6", nome: "Beatriz Santos", cpf: "789.012.345-00" },
];

const CONVENIOS_MOCK = [
  { id: "particular", nome: "Particular" },
  { id: "unimed", nome: "Unimed" },
  { id: "bradesco", nome: "Bradesco Saúde" },
  { id: "sulamerica", nome: "SulAmérica" },
  { id: "amil", nome: "Amil" },
  { id: "hapvida", nome: "Hapvida" },
];

// TODO: resultado real virá da API de IA
const MOCK_RESULTADO_IA: ResultadoIA = {
  queixaPrincipal:
    "Paciente refere dor lombar há 3 dias, de caráter contínuo, intensidade 7/10, sem irradiação, que piora com movimento e melhora com repouso. Nega febre, perda de peso ou alterações urinárias.",
  historiaDoencaAtual:
    "Início há 3 dias após esforço físico durante mudança de móveis. Dor em região lombar baixa, bilateral, sem irradiação para membros inferiores. Piora ao levantar da cadeira e ao dobrar o tronco. Fez uso de ibuprofeno 600mg com melhora parcial.",
  medicacoesUso: [
    "Ibuprofeno 600mg — uso eventual",
    "Losartana 50mg — 1x ao dia (HAS)",
  ],
  historiaPregressa:
    "Hipertensão arterial sistêmica controlada. Nega DM, cardiopatias ou cirurgias prévias. Alergia a dipirona (rash cutâneo).",
  sinaisVitais: { pa: "130/85", fc: "78", temp: "36,7", satO2: "98", glicemia: "" },
  hipotesesDiagnosticas: [
    { id: "h1", descricao: "Lombalgia aguda", cid: "M54.5" },
    { id: "h2", descricao: "Contratura muscular paravertebral", cid: "M62.8" },
  ],
  medicacoesPrescritas: [
    "Ciclobenzaprina 5mg — 1 comprimido à noite por 5 dias",
    "Ibuprofeno 600mg — 1 comprimido 8/8h por 5 dias (com alimento)",
    "Omeprazol 20mg — 1 comprimido em jejum por 5 dias",
  ],
  orientacoes: [
    "Repouso relativo por 48–72 horas",
    "Evitar esforços físicos e levantamento de peso",
    "Aplicar calor local por 20 min, 3x ao dia",
    "Retornar se surgir irradiação para MMII, fraqueza ou alteração urinária",
  ],
  examesSolicitados: ["Raio-X de coluna lombar AP e Perfil", "Hemograma completo"],
  encaminhamento: "",
  atestado:
    "Atesto que o paciente encontra-se sob meus cuidados médicos, necessitando de repouso por 2 (dois) dias a contar desta data.",
};

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function SecaoEditavel({
  titulo,
  children,
  defaultAberta = true,
}: {
  titulo: string;
  children: ReactNode;
  defaultAberta?: boolean;
}) {
  const [aberta, setAberta] = useState(defaultAberta);
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setAberta(!aberta)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-700">{titulo}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform duration-200",
            aberta && "rotate-180"
          )}
        />
      </button>
      {aberta && <div className="border-t px-4 pb-4 pt-3">{children}</div>}
    </div>
  );
}

function ListaEditavel({
  items,
  onChange,
  placeholder = "Adicionar item...",
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={item}
            onChange={(e) => {
              const c = [...items];
              c[i] = e.target.value;
              onChange(c);
            }}
            className="h-8 text-sm"
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="shrink-0 text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700"
      >
        <Plus className="h-3.5 w-3.5" /> Adicionar
      </button>
    </div>
  );
}

function HipotesesEditaveis({
  items,
  onChange,
}: {
  items: HipoteseDiagnostica[];
  onChange: (items: HipoteseDiagnostica[]) => void;
}) {
  const upd = (id: string, campo: keyof HipoteseDiagnostica, val: string) =>
    onChange(items.map((h) => (h.id === id ? { ...h, [campo]: val } : h)));
  return (
    <div className="space-y-2">
      {items.map((h) => (
        <div key={h.id} className="flex items-center gap-2">
          <Input
            value={h.descricao}
            onChange={(e) => upd(h.id, "descricao", e.target.value)}
            className="h-8 text-sm flex-1"
            placeholder="Hipótese diagnóstica"
          />
          <Input
            value={h.cid}
            onChange={(e) => upd(h.id, "cid", e.target.value)}
            className="h-8 text-sm w-24 shrink-0"
            placeholder="CID-10"
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((x) => x.id !== h.id))}
            className="shrink-0 text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([...items, { id: `h${Date.now()}`, descricao: "", cid: "" }])
        }
        className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700"
      >
        <Plus className="h-3.5 w-3.5" /> Adicionar hipótese
      </button>
    </div>
  );
}

function SinaisVitaisGrid({
  valor,
  onChange,
}: {
  valor: SinaisVitais;
  onChange: (sv: SinaisVitais) => void;
}) {
  const campos: Array<[keyof SinaisVitais, string, string, string]> = [
    ["pa", "Pressão Arterial", "120/80", "mmHg"],
    ["fc", "Freq. Cardíaca", "75", "bpm"],
    ["temp", "Temperatura", "36.5", "°C"],
    ["satO2", "SatO₂", "98", "%"],
    ["glicemia", "Glicemia", "—", "mg/dL"],
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {campos.map(([key, label, placeholder, unidade]) => (
        <div key={key}>
          <Label className="text-[11px] uppercase tracking-wide text-slate-500">{label}</Label>
          <div className="relative mt-1">
            <Input
              value={valor[key]}
              onChange={(e) => onChange({ ...valor, [key]: e.target.value })}
              className="h-8 text-sm pr-12"
              placeholder={placeholder}
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 pointer-events-none">
              {unidade}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

const ETAPAS_CONFIG = [
  { n: 1 as Etapa, label: "Identificação" },
  { n: 2 as Etapa, label: "Consulta" },
  { n: 3 as Etapa, label: "Revisar & Salvar" },
];

function Stepper({ etapaAtual }: { etapaAtual: Etapa }) {
  return (
    <div className="flex items-center">
      {ETAPAS_CONFIG.map((e, i) => {
        const concluida = etapaAtual > e.n;
        const ativa = etapaAtual === e.n;
        return (
          <div key={e.n} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all",
                  ativa && "bg-violet-600 text-white shadow-sm shadow-violet-300",
                  concluida && "bg-emerald-500 text-white",
                  !ativa && !concluida && "bg-slate-100 text-slate-400"
                )}
              >
                {concluida ? <Check className="h-3.5 w-3.5" /> : e.n}
              </div>
              <span
                className={cn(
                  "hidden sm:block text-sm font-medium",
                  ativa && "text-slate-800",
                  concluida && "text-emerald-600",
                  !ativa && !concluida && "text-slate-400"
                )}
              >
                {e.label}
              </span>
            </div>
            {i < ETAPAS_CONFIG.length - 1 && (
              <div
                className={cn(
                  "mx-3 h-px w-10 sm:w-16 transition-colors",
                  etapaAtual > e.n ? "bg-emerald-300" : "bg-slate-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Painel de resultado IA ───────────────────────────────────────────────────

function PainelResultadoIA({
  resultado,
  onAtualizar,
  onRefazer,
  onAvancar,
}: {
  resultado: ResultadoIA;
  onAtualizar: <K extends keyof ResultadoIA>(campo: K, valor: ResultadoIA[K]) => void;
  onRefazer: () => void;
  onAvancar: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <h3 className="text-sm font-semibold text-slate-700">
            Anamnese gerada pela Nuclimed IA
          </h3>
        </div>
        <Badge className="bg-violet-600 text-white text-[10px] px-2 py-0.5">IA</Badge>
      </div>

      <div
        className="flex-1 overflow-y-auto space-y-2 pr-1"
        style={{ maxHeight: "calc(100vh - 320px)" }}
      >
        <SecaoEditavel titulo="Queixa Principal">
          <Textarea
            value={resultado.queixaPrincipal}
            onChange={(e) => onAtualizar("queixaPrincipal", e.target.value)}
            className="text-sm min-h-[80px] resize-none"
          />
        </SecaoEditavel>

        <SecaoEditavel titulo="História da Doença Atual">
          <Textarea
            value={resultado.historiaDoencaAtual}
            onChange={(e) => onAtualizar("historiaDoencaAtual", e.target.value)}
            className="text-sm min-h-[80px] resize-none"
          />
        </SecaoEditavel>

        <SecaoEditavel titulo="Medicações em Uso" defaultAberta={false}>
          <ListaEditavel
            items={resultado.medicacoesUso}
            onChange={(v) => onAtualizar("medicacoesUso", v)}
            placeholder="Ex: Losartana 50mg — 1x ao dia"
          />
        </SecaoEditavel>

        <SecaoEditavel titulo="História Pregressa" defaultAberta={false}>
          <Textarea
            value={resultado.historiaPregressa}
            onChange={(e) => onAtualizar("historiaPregressa", e.target.value)}
            className="text-sm min-h-[60px] resize-none"
          />
        </SecaoEditavel>

        <SecaoEditavel titulo="Sinais Vitais">
          <SinaisVitaisGrid
            valor={resultado.sinaisVitais}
            onChange={(sv) => onAtualizar("sinaisVitais", sv)}
          />
        </SecaoEditavel>

        <SecaoEditavel titulo="Hipóteses Diagnósticas com CID-10">
          <HipotesesEditaveis
            items={resultado.hipotesesDiagnosticas}
            onChange={(v) => onAtualizar("hipotesesDiagnosticas", v)}
          />
        </SecaoEditavel>

        <SecaoEditavel titulo="Medicações Prescritas" defaultAberta={false}>
          <ListaEditavel
            items={resultado.medicacoesPrescritas}
            onChange={(v) => onAtualizar("medicacoesPrescritas", v)}
            placeholder="Ex: Amoxicilina 500mg — 8/8h por 7 dias"
          />
        </SecaoEditavel>

        <SecaoEditavel titulo="Orientações" defaultAberta={false}>
          <ListaEditavel
            items={resultado.orientacoes}
            onChange={(v) => onAtualizar("orientacoes", v)}
          />
        </SecaoEditavel>

        <SecaoEditavel titulo="Exames Solicitados" defaultAberta={false}>
          <ListaEditavel
            items={resultado.examesSolicitados}
            onChange={(v) => onAtualizar("examesSolicitados", v)}
            placeholder="Ex: Hemograma completo"
          />
        </SecaoEditavel>

        {/* Encaminhamento — só mostra se preenchido */}
        {resultado.encaminhamento.trim() ? (
          <SecaoEditavel titulo="Encaminhamento" defaultAberta={false}>
            <Textarea
              value={resultado.encaminhamento}
              onChange={(e) => onAtualizar("encaminhamento", e.target.value)}
              className="text-sm min-h-[60px] resize-none"
            />
          </SecaoEditavel>
        ) : (
          <button
            type="button"
            onClick={() => onAtualizar("encaminhamento", " ")}
            className="flex w-full items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-xs font-medium text-slate-500 hover:border-violet-300 hover:text-violet-600 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar encaminhamento
          </button>
        )}

        {/* Atestado — só mostra se preenchido */}
        {resultado.atestado.trim() ? (
          <SecaoEditavel titulo="Atestado" defaultAberta={false}>
            <Textarea
              value={resultado.atestado}
              onChange={(e) => onAtualizar("atestado", e.target.value)}
              className="text-sm min-h-[60px] resize-none"
            />
          </SecaoEditavel>
        ) : (
          <button
            type="button"
            onClick={() => onAtualizar("atestado", " ")}
            className="flex w-full items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-xs font-medium text-slate-500 hover:border-violet-300 hover:text-violet-600 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar atestado
          </button>
        )}
      </div>

      <div className="mt-4 flex gap-2 pt-3 border-t">
        <Button variant="outline" size="sm" onClick={onRefazer} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Refazer com IA
        </Button>
        <Button
          size="sm"
          onClick={onAvancar}
          className="flex-1 bg-violet-600 hover:bg-violet-700 gap-1.5"
        >
          Avançar para revisão
        </Button>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function NovaConsultaPage() {
  const router = useRouter();

  // Fluxo
  const [etapaAtual, setEtapaAtual] = useState<Etapa>(1);

  // Etapa 1
  const [dadosId, setDadosId] = useState<DadosIdentificacao>({
    tipoPaciente: "existente",
    pacienteId: "",
    pacienteNome: "",
    pacienteCpf: "",
    pacienteDataNasc: "",
    pacienteTelefone: "",
    modalidade: "presencial",
    modeloId: "",
    convenioId: "",
  });
  const [busca, setBusca] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Etapa 2
  const [estadoGravacao, setEstadoGravacao] = useState<EstadoGravacao>("parado");
  const [tempoGravacao, setTempoGravacao] = useState(0);
  const [duracaoGravacao, setDuracaoGravacao] = useState(0);
  const [anotacoes, setAnotacoes] = useState("");
  const [textoDigitado, setTextoDigitado] = useState("");
  const [resultadoIA, setResultadoIA] = useState<ResultadoIA | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Timer
  useEffect(() => {
    if (estadoGravacao === "gravando") {
      timerRef.current = setInterval(() => setTempoGravacao((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [estadoGravacao]);

  const iniciarGravacao = () => { setTempoGravacao(0); setEstadoGravacao("gravando"); };
  const pararGravacao = () => { setDuracaoGravacao(tempoGravacao); setEstadoGravacao("parado"); };

  const processarIA = () => {
    setEstadoGravacao("processando");
    // TODO: POST /api/consulta/processar com áudio/texto gravado ou textoDigitado
    setTimeout(() => {
      setResultadoIA(MOCK_RESULTADO_IA);
      setEstadoGravacao("parado");
    }, 2000);
  };

  const refazerIA = () => { setResultadoIA(null); setEstadoGravacao("parado"); };

  const atualizarIA = <K extends keyof ResultadoIA>(campo: K, valor: ResultadoIA[K]) =>
    setResultadoIA((prev) => (prev ? { ...prev, [campo]: valor } : prev));

  // Validação E1
  const podeAvancarE1 =
    (dadosId.tipoPaciente === "existente"
      ? !!dadosId.pacienteId
      : !!dadosId.pacienteNome.trim()) && !!dadosId.modeloId;

  // Autocomplete
  const pacientesFiltrados =
    busca.length >= 2
      ? PACIENTES_MOCK.filter(
          (p) =>
            p.nome.toLowerCase().includes(busca.toLowerCase()) ||
            p.cpf.includes(busca)
        )
      : [];

  const selecionarPaciente = (p: PacienteMock) => {
    setDadosId((d) => ({ ...d, pacienteId: p.id, pacienteNome: p.nome, tipoPaciente: "existente" }));
    setBusca(p.nome);
    setShowDropdown(false);
  };

  const modeloSelecionado = MODELOS_PADRAO.find((m) => m.id === dadosId.modeloId);

  const finalizar = () => {
    // TODO: POST /api/consultas com { dadosId, resultadoIA }
    router.push("/consulta/nova-123");
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Nova Consulta</h1>
          <p className="text-sm text-muted-foreground capitalize">
            {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <Stepper etapaAtual={etapaAtual} />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ETAPA 1 — Identificação
      ══════════════════════════════════════════════════════════════════════ */}
      {etapaAtual === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Identificação do Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Tipo de paciente */}
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { tipo: "existente" as const, icon: User, label: "Paciente existente" },
                  { tipo: "novo" as const, icon: UserPlus, label: "Paciente novo" },
                ] as const
              ).map(({ tipo, icon: Icon, label }) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() =>
                    setDadosId((d) => ({
                      ...d,
                      tipoPaciente: tipo,
                      pacienteId: tipo === "novo" ? "" : d.pacienteId,
                    }))
                  }
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                    dadosId.tipoPaciente === tipo
                      ? "border-violet-600 bg-violet-50 text-violet-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  )}
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>

            {/* Busca de paciente existente */}
            {dadosId.tipoPaciente === "existente" && (
              <div className="relative">
                <Label>Buscar paciente</Label>
                <div className="relative mt-1.5">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    value={busca}
                    onChange={(e) => {
                      setBusca(e.target.value);
                      setShowDropdown(true);
                      if (!e.target.value)
                        setDadosId((d) => ({ ...d, pacienteId: "" }));
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    placeholder="Nome ou CPF do paciente..."
                    className="pl-9"
                  />
                </div>
                {showDropdown && pacientesFiltrados.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border bg-white shadow-lg">
                    {pacientesFiltrados.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onMouseDown={() => selecionarPaciente(p)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{p.nome}</p>
                          <p className="text-xs text-slate-500">{p.cpf}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {dadosId.pacienteId && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600">
                    <Check className="h-3.5 w-3.5" /> Paciente selecionado
                  </p>
                )}
              </div>
            )}

            {/* Formulário novo paciente */}
            {dadosId.tipoPaciente === "novo" && (
              <div className="rounded-lg border bg-slate-50 p-4 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Dados do novo paciente
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Nome completo *</Label>
                    <Input
                      value={dadosId.pacienteNome}
                      onChange={(e) =>
                        setDadosId((d) => ({ ...d, pacienteNome: e.target.value }))
                      }
                      placeholder="Nome completo"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>CPF</Label>
                    <Input
                      value={dadosId.pacienteCpf}
                      onChange={(e) =>
                        setDadosId((d) => ({ ...d, pacienteCpf: e.target.value }))
                      }
                      placeholder="000.000.000-00"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Data de nascimento</Label>
                    <Input
                      type="date"
                      value={dadosId.pacienteDataNasc}
                      onChange={(e) =>
                        setDadosId((d) => ({ ...d, pacienteDataNasc: e.target.value }))
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input
                      value={dadosId.pacienteTelefone}
                      onChange={(e) =>
                        setDadosId((d) => ({ ...d, pacienteTelefone: e.target.value }))
                      }
                      placeholder="(00) 00000-0000"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Modalidade + Modelo + Convênio */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <Label>Modalidade</Label>
                <div className="mt-1.5 flex rounded-lg border bg-slate-50 p-1">
                  {(["presencial", "telemedicina"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDadosId((d) => ({ ...d, modalidade: m }))}
                      className={cn(
                        "flex-1 rounded-md py-1.5 text-sm font-medium capitalize transition-all",
                        dadosId.modalidade === m
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {m === "presencial" ? "Presencial" : "Telemedicina"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Modelo *</Label>
                <Select
                  value={dadosId.modeloId}
                  onValueChange={(v) => setDadosId((d) => ({ ...d, modeloId: v }))}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELOS_PADRAO.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Convênio (opcional)</Label>
                <Select
                  value={dadosId.convenioId}
                  onValueChange={(v) => setDadosId((d) => ({ ...d, convenioId: v }))}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Selecionar convênio" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONVENIOS_MOCK.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setEtapaAtual(2)}
                disabled={!podeAvancarE1}
                className="gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40"
              >
                Iniciar Consulta
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ETAPA 2 — Registro da Consulta
      ══════════════════════════════════════════════════════════════════════ */}
      {etapaAtual === 2 && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setEtapaAtual(1)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
          >
            <ChevronLeft className="h-4 w-4" /> Voltar à identificação
          </button>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[55%_1fr]">

            {/* Coluna esquerda */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Registro da Consulta</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Paciente:{" "}
                  <span className="font-medium text-slate-700">{dadosId.pacienteNome}</span>
                  {dadosId.modalidade === "telemedicina" && (
                    <Badge variant="secondary" className="ml-2 text-xs">Telemedicina</Badge>
                  )}
                </p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="gravar">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="gravar" className="flex-1">Gravar consulta</TabsTrigger>
                    <TabsTrigger value="digitar" className="flex-1">Digitar consulta</TabsTrigger>
                  </TabsList>

                  {/* Tab: Gravar */}
                  <TabsContent value="gravar" className="space-y-6">
                    <div className="flex flex-col items-center py-6">
                      <GravacaoButton
                        estado={estadoGravacao}
                        tempoSegundos={tempoGravacao}
                        onIniciar={iniciarGravacao}
                        onParar={pararGravacao}
                      />
                      {duracaoGravacao > 0 &&
                        estadoGravacao === "parado" &&
                        !resultadoIA && (
                          <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600">
                            <Check className="h-3.5 w-3.5" />
                            Gravação salva ({formatarTempo(duracaoGravacao)}) — pronto para processar
                          </p>
                        )}
                    </div>

                    <div>
                      <Label>Anotações adicionais</Label>
                      <Textarea
                        value={anotacoes}
                        onChange={(e) => setAnotacoes(e.target.value)}
                        placeholder="Complemente com anotações, sinais vitais, observações clínicas..."
                        className="mt-1.5 min-h-[120px] resize-none"
                        disabled={estadoGravacao === "gravando"}
                      />
                    </div>

                    <Button
                      onClick={processarIA}
                      disabled={
                        estadoGravacao !== "parado" || !!resultadoIA
                      }
                      className="w-full gap-2 bg-violet-600 hover:bg-violet-700"
                    >
                      {estadoGravacao === "processando" ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Processando...</>
                      ) : (
                        <><Sparkles className="h-4 w-4" /> Processar com IA</>
                      )}
                    </Button>
                  </TabsContent>

                  {/* Tab: Digitar */}
                  <TabsContent value="digitar" className="space-y-4">
                    <div>
                      <Label>Texto da consulta</Label>
                      <Textarea
                        value={textoDigitado}
                        onChange={(e) => setTextoDigitado(e.target.value)}
                        placeholder="Descreva a consulta completa: queixa, história, medicações, sinais vitais, hipóteses diagnósticas, conduta..."
                        className="mt-1.5 min-h-[280px] resize-none"
                      />
                      <p className="mt-1 text-right text-xs text-slate-400">
                        {textoDigitado.length} caracteres
                      </p>
                    </div>

                    <Button
                      onClick={processarIA}
                      disabled={textoDigitado.trim().length < 10 || !!resultadoIA}
                      className="w-full gap-2 bg-violet-600 hover:bg-violet-700"
                    >
                      {estadoGravacao === "processando" ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Processando...</>
                      ) : (
                        <><Sparkles className="h-4 w-4" /> Processar com IA</>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Coluna direita — resultado IA */}
            <Card>
              <CardContent className="pt-5">
                {resultadoIA ? (
                  <PainelResultadoIA
                    resultado={resultadoIA}
                    onAtualizar={atualizarIA}
                    onRefazer={refazerIA}
                    onAvancar={() => setEtapaAtual(3)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-50">
                      <Sparkles className="h-7 w-7 text-violet-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-600">
                      Aguardando processamento
                    </p>
                    <p className="mt-1.5 max-w-[220px] text-xs text-muted-foreground">
                      Grave ou digite a consulta e clique em{" "}
                      <span className="font-medium text-violet-600">Processar com IA</span>{" "}
                      para gerar a anamnese automaticamente.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ETAPA 3 — Revisão e Salvamento
      ══════════════════════════════════════════════════════════════════════ */}
      {etapaAtual === 3 && resultadoIA && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setEtapaAtual(2)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
          >
            <ChevronLeft className="h-4 w-4" /> Voltar para edição
          </button>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">

            {/* Preview formatado */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Preview da Anamnese</CardTitle>
                  <Badge variant="secondary">Leitura</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">

                {[
                  { t: "QUEIXA PRINCIPAL", v: resultadoIA.queixaPrincipal },
                  { t: "HISTÓRIA DA DOENÇA ATUAL", v: resultadoIA.historiaDoencaAtual },
                  { t: "HISTÓRIA PREGRESSA", v: resultadoIA.historiaPregressa },
                ].map(({ t, v }) =>
                  v ? (
                    <div key={t}>
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{t}</p>
                      <p className="leading-relaxed text-slate-700">{v}</p>
                      <Separator className="mt-4" />
                    </div>
                  ) : null
                )}

                {/* Sinais vitais */}
                {Object.values(resultadoIA.sinaisVitais).some(Boolean) && (
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">SINAIS VITAIS</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        resultadoIA.sinaisVitais.pa && `PA: ${resultadoIA.sinaisVitais.pa} mmHg`,
                        resultadoIA.sinaisVitais.fc && `FC: ${resultadoIA.sinaisVitais.fc} bpm`,
                        resultadoIA.sinaisVitais.temp && `Temp: ${resultadoIA.sinaisVitais.temp}°C`,
                        resultadoIA.sinaisVitais.satO2 && `SatO₂: ${resultadoIA.sinaisVitais.satO2}%`,
                        resultadoIA.sinaisVitais.glicemia && `Glicemia: ${resultadoIA.sinaisVitais.glicemia} mg/dL`,
                      ]
                        .filter(Boolean)
                        .map((label) => (
                          <span key={label as string} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            {label}
                          </span>
                        ))}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                )}

                {/* Hipóteses */}
                {resultadoIA.hipotesesDiagnosticas.length > 0 && (
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">HIPÓTESES DIAGNÓSTICAS</p>
                    <ul className="space-y-1">
                      {resultadoIA.hipotesesDiagnosticas.map((h) => (
                        <li key={h.id} className="flex items-center gap-2 text-slate-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                          {h.descricao}
                          {h.cid && (
                            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">{h.cid}</Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                    <Separator className="mt-4" />
                  </div>
                )}

                {/* Listas */}
                {(
                  [
                    ["MEDICAÇÕES EM USO", resultadoIA.medicacoesUso],
                    ["MEDICAÇÕES PRESCRITAS", resultadoIA.medicacoesPrescritas],
                    ["ORIENTAÇÕES", resultadoIA.orientacoes],
                    ["EXAMES SOLICITADOS", resultadoIA.examesSolicitados],
                  ] as [string, string[]][]
                ).map(([titulo, lista]) =>
                  lista.length > 0 ? (
                    <div key={titulo}>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{titulo}</p>
                      <ul className="space-y-1">
                        {lista.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-700">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Separator className="mt-4" />
                    </div>
                  ) : null
                )}

                {resultadoIA.encaminhamento.trim() && (
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">ENCAMINHAMENTO</p>
                    <p className="leading-relaxed text-slate-700">{resultadoIA.encaminhamento}</p>
                  </div>
                )}

                {resultadoIA.atestado.trim() && (
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">ATESTADO</p>
                    <p className="italic leading-relaxed text-slate-700">{resultadoIA.atestado}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumo + ações */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { Icon: User, label: "Paciente", value: dadosId.pacienteNome || "—" },
                    { Icon: Calendar, label: "Data", value: format(new Date(), "dd/MM/yyyy") },
                    { Icon: Clock, label: "Hora", value: format(new Date(), "HH:mm") },
                    { Icon: FileText, label: "Modelo", value: modeloSelecionado?.nome ?? "—" },
                    ...(duracaoGravacao > 0
                      ? [{ Icon: Clock, label: "Duração", value: formatarTempo(duracaoGravacao) }]
                      : []),
                  ].map(({ Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-2.5">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div>
                        <p className="text-[11px] text-slate-400">{label}</p>
                        <p className="text-sm font-medium text-slate-700">{value}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-2 pt-4">
                  <Button
                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                    onClick={finalizar}
                  >
                    <Check className="h-4 w-4" /> Finalizar Consulta
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Download className="h-4 w-4" /> Gerar PDF
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Printer className="h-4 w-4" /> Imprimir
                  </Button>
                  <Button variant="ghost" className="w-full gap-2 text-slate-500">
                    <FileText className="h-4 w-4" /> Salvar no prontuário
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
