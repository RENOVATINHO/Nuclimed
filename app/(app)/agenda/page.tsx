"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
  Users,
  Stethoscope,
  X,
  Edit2,
  FileText,
  Search,
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
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  getAgendamentos,
  getResumoAgenda,
  criarAgendamento,
  atualizarStatusAgendamento,
  type AgendamentoComPaciente,
} from "@/lib/actions/agenda";

// ─── Types ──────────────────────────────────────────────────────────────────

type StatusAgendamento = "agendado" | "finalizado" | "cancelado" | "retorno" | "espera";
type TipoConsulta = "Consulta" | "Retorno" | "Procedimento" | "Cirurgia" | "Exame";
type ViewMode = "dia" | "semana" | "mes";

// Internal display type mapped from server data
interface Agendamento {
  id: string;
  paciente: string;
  pacienteAbrev: string;
  pacienteId: string;
  tipo: TipoConsulta;
  status: StatusAgendamento;
  data: string; // YYYY-MM-DD
  horaInicio: string; // HH:MM
  duracao: number; // minutos
  convenio?: string;
  valor?: number;
  observacoes?: string;
}

interface ResumoAgenda {
  agendados: number;
  finalizados: number;
  cancelados: number;
  retornos: number;
  espera: number;
  total: number;
}

interface NovoAgendamentoData {
  paciente: string;
  pacienteId: string;
  data: string;
  hora: string;
  tipo: string;
  convenio: string;
  duracao: string;
  observacoes: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const SLOT_HEIGHT = 48; // px por 30 min
const HORA_INICIO = 7;
const HORA_FIM = 20;
const TOTAL_SLOTS = (HORA_FIM - HORA_INICIO) * 2; // 26 slots

const STATUS_CONFIG = {
  agendado: {
    label: "Agendado",
    bg: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    ring: "ring-blue-400",
  },
  finalizado: {
    label: "Finalizado",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    ring: "ring-emerald-400",
  },
  cancelado: {
    label: "Cancelado",
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-500",
    badge: "bg-red-100 text-red-600 border-red-200",
    dot: "bg-red-500",
    ring: "ring-red-300",
  },
  retorno: {
    label: "Retorno",
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    ring: "ring-amber-400",
  },
  espera: {
    label: "Em espera",
    bg: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-700",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
    ring: "ring-orange-400",
  },
} as const;

const DIAS_ABREV = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const CONVENIOS = ["Particular", "Unimed", "Bradesco Saúde", "SulAmérica", "Amil", "Porto Seguro"];
const PACIENTES_MOCK = [
  "Ana Paula Ferreira", "Carlos Eduardo Santos", "Mariana Costa Oliveira",
  "Beatriz Nascimento", "Lucas Ferreira Dias", "Patricia Rodrigues",
  "Thiago Mendes", "Vanessa Albuquerque", "Roberto Alves Lima",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getWeekDates(ref: Date): Date[] {
  const dow = ref.getDay();
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTop(minutes: number): number {
  return ((minutes - HORA_INICIO * 60) / 30) * SLOT_HEIGHT;
}

function durationToHeight(duration: number): number {
  return (duration / 30) * SLOT_HEIGHT;
}

function formatWeekRange(dates: Date[]): string {
  const first = dates[0];
  const last = dates[dates.length - 1];
  const mesA = MESES[first.getMonth()].toLowerCase();
  const mesB = MESES[last.getMonth()].toLowerCase();
  if (first.getMonth() === last.getMonth()) {
    return `${first.getDate()} – ${last.getDate()} de ${mesA} de ${first.getFullYear()}`;
  }
  return `${first.getDate()} de ${mesA} – ${last.getDate()} de ${mesB} de ${last.getFullYear()}`;
}

function isToday(date: Date): boolean {
  const t = new Date();
  return date.getDate() === t.getDate() &&
    date.getMonth() === t.getMonth() &&
    date.getFullYear() === t.getFullYear();
}

function endTime(horaInicio: string, duracao: number): string {
  const total = timeToMinutes(horaInicio) + duracao;
  return `${Math.floor(total / 60).toString().padStart(2, "0")}:${(total % 60).toString().padStart(2, "0")}`;
}

function initials(name: string): string {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

/** Map server AgendamentoComPaciente → local Agendamento display type */
function mapAgendamento(a: AgendamentoComPaciente): Agendamento {
  const dt = new Date(a.dataHora);
  const data = formatDateKey(dt);
  const horaInicio = `${dt.getHours().toString().padStart(2, "0")}:${dt.getMinutes().toString().padStart(2, "0")}`;
  const rawStatus = a.status.toLowerCase() as StatusAgendamento;
  const status: StatusAgendamento =
    rawStatus === "agendado" || rawStatus === "finalizado" || rawStatus === "cancelado" ||
    rawStatus === "retorno" || rawStatus === "espera"
      ? rawStatus
      : "agendado";
  const nomePartes = a.paciente.nome.split(" ");
  const pacienteAbrev = nomePartes.length >= 2
    ? `${nomePartes[0]} ${nomePartes[1][0]}.`
    : nomePartes[0];
  return {
    id: a.id,
    paciente: a.paciente.nome,
    pacienteAbrev,
    pacienteId: a.paciente.id,
    tipo: (a.tipo as TipoConsulta) || "Consulta",
    status,
    data,
    horaInicio,
    duracao: a.duracao,
    convenio: a.convenio ?? undefined,
    valor: a.valor ?? undefined,
    observacoes: a.observacoes ?? undefined,
  };
}

// ─── MiniCalendário ───────────────────────────────────────────────────────────

function MiniCalendario({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}) {
  const [viewMonth, setViewMonth] = useState(new Date(selectedDate));

  const firstDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const lastDay = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
  const firstDow = (firstDay.getDay() + 6) % 7; // 0 = Seg

  const days: (Date | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) =>
      new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i + 1)
    ),
  ];
  while (days.length % 7 !== 0) days.push(null);

  const selectedWeekKeys = getWeekDates(selectedDate).map(formatDateKey);

  return (
    <div className="select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
          className="p-1 rounded hover:bg-slate-100 text-slate-500"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-semibold text-slate-700">
          {MESES[viewMonth.getMonth()].substring(0, 3)} {viewMonth.getFullYear()}
        </span>
        <button
          onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
          className="p-1 rounded hover:bg-slate-100 text-slate-500"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7">
        {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-slate-400 py-0.5">
            {d}
          </div>
        ))}
        {days.map((date, i) => {
          if (!date) return <div key={i} />;
          const key = formatDateKey(date);
          const inWeek = selectedWeekKeys.includes(key);
          const tod = isToday(date);
          return (
            <button
              key={i}
              onClick={() => onSelectDate(date)}
              className={cn(
                "text-center text-[11px] py-1 rounded-sm transition-colors",
                "hover:bg-violet-50 hover:text-violet-700",
                inWeek && "bg-violet-100 text-violet-700 font-medium",
                tod && "font-bold",
                tod && !inWeek && "text-violet-600"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── NovoAgendamentoModal ─────────────────────────────────────────────────────

function NovoAgendamentoModal({
  open,
  onOpenChange,
  initialDate,
  initialHora,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialDate?: string;
  initialHora?: string;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NovoAgendamentoData>({
    paciente: "",
    pacienteId: "",
    data: initialDate || formatDateKey(new Date()),
    hora: initialHora || "09:00",
    tipo: "",
    convenio: "",
    duracao: "30",
    observacoes: "",
  });
  const [busca, setBusca] = useState("");

  // Reset form when modal opens
  const handleOpenChange = (v: boolean) => {
    if (v) {
      setForm({
        paciente: "",
        pacienteId: "",
        data: initialDate || formatDateKey(new Date()),
        hora: initialHora || "09:00",
        tipo: "",
        convenio: "",
        duracao: "30",
        observacoes: "",
      });
      setBusca("");
    }
    onOpenChange(v);
  };

  const sugestoes = busca.length > 1
    ? PACIENTES_MOCK.filter(p => p.toLowerCase().includes(busca.toLowerCase()))
    : [];

  const handleSubmit = async () => {
    if (!form.paciente || !form.tipo) return;
    setSaving(true);
    try {
      const dataHora = `${form.data}T${form.hora}:00`;
      // Note: criarAgendamento requires a real pacienteId from DB.
      // For now we pass pacienteId from form (would be populated via real patient search).
      await criarAgendamento({
        pacienteId: form.pacienteId || form.paciente, // fallback: name used as ID placeholder
        dataHora,
        duracao: Number(form.duracao),
        tipo: form.tipo,
        convenio: form.convenio || undefined,
        observacoes: form.observacoes || undefined,
      });
      toast({ title: "Agendamento criado com sucesso!" });
      handleOpenChange(false);
      onSuccess();
    } catch {
      toast({ title: "Erro ao criar agendamento", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4 text-violet-600" />
            Novo Agendamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Paciente */}
          <div className="space-y-1.5">
            <Label>Paciente *</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
              <Input
                className="pl-8"
                placeholder="Buscar paciente..."
                value={form.paciente || busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setForm(f => ({ ...f, paciente: "", pacienteId: "" }));
                }}
              />
              {sugestoes.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-36 overflow-y-auto">
                  {sugestoes.map((p) => (
                    <button
                      key={p}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                      onClick={() => {
                        setForm(f => ({ ...f, paciente: p, pacienteId: p }));
                        setBusca("");
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {form.paciente && (
              <p className="text-xs text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {form.paciente}
              </p>
            )}
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Data *</Label>
              <Input
                type="date"
                value={form.data}
                onChange={(e) => setForm(f => ({ ...f, data: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Hora *</Label>
              <Input
                type="time"
                value={form.hora}
                onChange={(e) => setForm(f => ({ ...f, hora: e.target.value }))}
              />
            </div>
          </div>

          {/* Tipo */}
          <div className="space-y-1.5">
            <Label>Tipo *</Label>
            <Select value={form.tipo} onValueChange={(v) => setForm(f => ({ ...f, tipo: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar tipo..." />
              </SelectTrigger>
              <SelectContent>
                {(["Consulta", "Retorno", "Procedimento", "Cirurgia", "Exame"] as const).map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Convênio + Duração */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Convênio</Label>
              <Select value={form.convenio} onValueChange={(v) => setForm(f => ({ ...f, convenio: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  {CONVENIOS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Duração</Label>
              <Select value={form.duracao} onValueChange={(v) => setForm(f => ({ ...f, duracao: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["15", "30", "45", "60"].map((d) => (
                    <SelectItem key={d} value={d}>{d} min</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea
              placeholder="Anotações opcionais..."
              rows={2}
              className="resize-none"
              value={form.observacoes}
              onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            className="bg-violet-600 hover:bg-violet-700"
            disabled={!form.paciente || !form.tipo || saving}
            onClick={handleSubmit}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {saving ? "Agendando..." : "Agendar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── DetalhesSidebar ──────────────────────────────────────────────────────────

function DetalhesSidebar({
  agendamento,
  onClose,
  onStatusChange,
}: {
  agendamento: Agendamento;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  const cfg = STATUS_CONFIG[agendamento.status];
  const [actionLoading, setActionLoading] = useState(false);

  const handleStatus = async (status: string) => {
    setActionLoading(true);
    await onStatusChange(agendamento.id, status);
    setActionLoading(false);
    onClose();
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l shadow-xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50 shrink-0">
        <h3 className="font-semibold text-sm text-slate-900">Detalhes do agendamento</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status */}
        <span className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
          cfg.badge
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
          {cfg.label}
        </span>

        {/* Patient card */}
        <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3 border">
          <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-sm font-semibold shrink-0">
            {initials(agendamento.paciente)}
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900">{agendamento.paciente}</p>
            <p className="text-xs text-slate-500">Paciente</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-start gap-2.5 text-sm text-slate-600">
            <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p>{agendamento.horaInicio} – {endTime(agendamento.horaInicio, agendamento.duracao)}</p>
              <p className="text-xs text-slate-400">{agendamento.duracao} minutos</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <Stethoscope className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{agendamento.tipo}</span>
          </div>
          {agendamento.convenio && (
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{agendamento.convenio}</span>
            </div>
          )}
          {agendamento.valor && (
            <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
              <span className="w-4 h-4 shrink-0 text-slate-400 text-xs flex items-center justify-center font-bold">R$</span>
              <span>{agendamento.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>
          )}
        </div>

        {agendamento.observacoes && (
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
            <p className="text-xs text-amber-700">{agendamento.observacoes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t space-y-2 shrink-0">
        <Button className="w-full bg-violet-600 hover:bg-violet-700 text-sm" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Abrir consulta
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Edit2 className="w-3.5 h-3.5 mr-1.5" />
            Editar
          </Button>
          {agendamento.status !== "finalizado" && agendamento.status !== "cancelado" && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              disabled={actionLoading}
              onClick={() => handleStatus("FINALIZADO")}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Finalizar
            </Button>
          )}
        </div>
        {agendamento.status !== "cancelado" && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs text-red-500 border-red-200 hover:bg-red-50"
            disabled={actionLoading}
            onClick={() => handleStatus("CANCELADO")}
          >
            <XCircle className="w-3.5 h-3.5 mr-1.5" />
            Cancelar consulta
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── AgendaPage ───────────────────────────────────────────────────────────────

export default function AgendaPage() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("semana");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [multiprofissional, setMultiprofissional] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [slotInicial, setSlotInicial] = useState<{ data: string; hora: string } | undefined>();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // ── Server data state ───────────────────────────────────────────────────────
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loadingAgendamentos, setLoadingAgendamentos] = useState(true);
  const [resumo, setResumo] = useState<ResumoAgenda | null>(null);
  const [loadingResumo, setLoadingResumo] = useState(true);

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  // ── Fetch agendamentos for the current week ────────────────────────────────
  const fetchAgendamentos = useCallback(async () => {
    setLoadingAgendamentos(true);
    const dataInicio = weekDates[0];
    const dataInicioBOD = new Date(dataInicio);
    dataInicioBOD.setHours(0, 0, 0, 0);
    const dataFim = weekDates[weekDates.length - 1];
    const dataFimEOD = new Date(dataFim);
    dataFimEOD.setHours(23, 59, 59, 999);
    getAgendamentos(dataInicioBOD, dataFimEOD)
      .then((data) => setAgendamentos(data.map(mapAgendamento)))
      .catch(() => toast({ title: "Erro ao carregar agendamentos", variant: "destructive" }))
      .finally(() => setLoadingAgendamentos(false));
  }, [weekDates, toast]);

  // ── Fetch resumo for today ─────────────────────────────────────────────────
  const fetchResumo = useCallback(async () => {
    setLoadingResumo(true);
    getResumoAgenda()
      .then(setResumo)
      .catch(() => toast({ title: "Erro ao carregar resumo", variant: "destructive" }))
      .finally(() => setLoadingResumo(false));
  }, [toast]);

  useEffect(() => {
    fetchAgendamentos();
  }, [fetchAgendamentos]);

  useEffect(() => {
    fetchResumo();
  }, [fetchResumo]);

  // ── Derived data ───────────────────────────────────────────────────────────
  const agendamentosPorDia = useMemo(() => {
    const map = new Map<string, Agendamento[]>();
    weekDates.forEach((d) => {
      const key = formatDateKey(d);
      map.set(key, agendamentos.filter((a) => a.data === key));
    });
    return map;
  }, [weekDates, agendamentos]);

  // Waiting room: agendamentos with status "espera" for today
  const salaEspera = useMemo(() => {
    const todayKey = formatDateKey(new Date());
    return agendamentos.filter((a) => a.data === todayKey && a.status === "espera");
  }, [agendamentos]);

  const navigateWeek = (dir: -1 | 1) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dir * 7);
    setCurrentDate(d);
  };

  const handleSlotClick = (dateKey: string, hour: number, minute: number) => {
    setSlotInicial({
      data: dateKey,
      hora: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
    });
    setModalNovoAberto(true);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await atualizarStatusAgendamento(id, status);
      toast({ title: "Status atualizado com sucesso!" });
      fetchAgendamentos();
      fetchResumo();
    } catch {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-6 overflow-hidden">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-5 py-2.5 bg-white border-b shrink-0 flex-wrap gap-y-2">
        <h1 className="text-lg font-semibold text-slate-900">Agenda</h1>

        {/* Date nav */}
        <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5 ml-1">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-slate-600 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2.5 py-1 text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm rounded-md transition-all"
          >
            Hoje
          </button>
          <button
            onClick={() => navigateWeek(1)}
            className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-slate-600 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Period label */}
        <span className="text-sm font-medium text-slate-700 tabular-nums">
          {formatWeekRange(weekDates)}
        </span>

        {/* View tabs */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-sm ml-1">
          {(["Dia", "Semana", "Mês"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v.toLowerCase() as ViewMode)}
              className={cn(
                "px-3 py-1.5 rounded-md font-medium transition-all",
                viewMode === v.toLowerCase()
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Multiprofissional toggle */}
        <button
          onClick={() => setMultiprofissional(!multiprofissional)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
            multiprofissional
              ? "bg-violet-50 border-violet-300 text-violet-700"
              : "bg-white border-slate-200 text-slate-600 hover:border-violet-200"
          )}
        >
          <Users className="w-4 h-4" />
          Multiprofissional
        </button>

        <div className="flex-1" />

        {/* New appointment */}
        <Button
          className="bg-violet-600 hover:bg-violet-700 gap-1.5"
          size="sm"
          onClick={() => { setSlotInicial(undefined); setModalNovoAberto(true); }}
        >
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Panel ───────────────────────────────────────── */}
        <div className="w-[252px] shrink-0 bg-white border-r overflow-y-auto flex flex-col gap-4 p-4">

          {/* Mini calendar */}
          <MiniCalendario selectedDate={currentDate} onSelectDate={setCurrentDate} />

          {/* Day summary */}
          <div className="border-t pt-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Resumo do dia
            </p>
            {loadingResumo ? (
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
                  <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide">Agendados</p>
                  <p className="text-2xl font-bold text-blue-700 mt-0.5 leading-none">{resumo?.agendados ?? 0}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-2.5 border border-emerald-100">
                  <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wide">Finalizados</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-0.5 leading-none">{resumo?.finalizados ?? 0}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-2.5 border border-red-100">
                  <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">Cancelados</p>
                  <p className="text-2xl font-bold text-red-600 mt-0.5 leading-none">{resumo?.cancelados ?? 0}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-100">
                  <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wide">Retornos</p>
                  <p className="text-2xl font-bold text-amber-700 mt-0.5 leading-none">{resumo?.retornos ?? 0}</p>
                </div>
              </div>
            )}
          </div>

          {/* Waiting room */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Sala de espera
              </p>
              <span className="w-4 h-4 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold flex items-center justify-center">
                {salaEspera.length}
              </span>
            </div>
            <div className="space-y-2">
              {salaEspera.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-3">Nenhum paciente aguardando</p>
              ) : (
                salaEspera.map((ag) => (
                  <div
                    key={ag.id}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-orange-50 border border-orange-100 cursor-pointer hover:border-orange-300 transition-colors"
                    onClick={() => setSelectedAgendamento(ag)}
                  >
                    <div className="w-7 h-7 rounded-full bg-orange-200 flex items-center justify-center text-orange-800 text-[10px] font-bold shrink-0">
                      {initials(ag.pacienteAbrev)}
                    </div>
                    <p className="flex-1 text-xs font-medium text-slate-800 truncate">{ag.pacienteAbrev}</p>
                    <div className="flex items-center gap-1 text-orange-600 shrink-0">
                      <Timer className="w-3 h-3" />
                      <span className="text-[10px] font-semibold">—</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Calendar Grid ─────────────────────────────────────── */}
        <div className="flex-1 overflow-auto bg-slate-50">

          {/* Day headers — sticky */}
          <div className="flex sticky top-0 z-20 bg-white border-b shadow-sm">
            <div className="w-12 shrink-0 border-r" />
            {weekDates.map((date, idx) => {
              const tod = isToday(date);
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center py-2 border-r last:border-r-0 min-w-[90px]",
                    tod && "bg-violet-50"
                  )}
                >
                  <span className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider",
                    tod ? "text-violet-500" : "text-slate-400"
                  )}>
                    {DIAS_ABREV[idx]}
                  </span>
                  <span className={cn(
                    "text-xl font-bold leading-tight",
                    tod ? "text-violet-700" : "text-slate-800"
                  )}>
                    {date.getDate()}
                  </span>
                  {tod && <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-0.5" />}
                </div>
              );
            })}
          </div>

          {/* Hour grid */}
          <div className="flex">
            {/* Hour labels */}
            <div className="w-12 shrink-0">
              {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
                const total = HORA_INICIO * 60 + i * 30;
                const h = Math.floor(total / 60);
                const m = total % 60;
                return (
                  <div
                    key={i}
                    style={{ height: SLOT_HEIGHT }}
                    className="border-b border-slate-100 flex items-start justify-end pr-2 pt-1"
                  >
                    {m === 0 && (
                      <span className="text-[10px] font-medium text-slate-400 leading-none">
                        {h.toString().padStart(2, "0")}h
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Day columns */}
            {weekDates.map((date, dayIdx) => {
              const dateKey = formatDateKey(date);
              const dayAgs = agendamentosPorDia.get(dateKey) || [];
              const tod = isToday(date);

              return (
                <div
                  key={dayIdx}
                  className={cn(
                    "flex-1 relative border-r last:border-r-0 min-w-[90px]",
                    tod && "bg-violet-50/20"
                  )}
                  style={{ height: TOTAL_SLOTS * SLOT_HEIGHT }}
                >
                  {/* Loading skeleton overlay */}
                  {loadingAgendamentos && (
                    <div className="absolute inset-0 z-10 flex flex-col gap-2 p-2 pointer-events-none">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton
                          key={i}
                          className="w-full rounded-md"
                          style={{ height: SLOT_HEIGHT * 1.5, marginTop: i * SLOT_HEIGHT * 2 }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Slot lines + click targets */}
                  {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
                    const total = HORA_INICIO * 60 + i * 30;
                    const h = Math.floor(total / 60);
                    const m = total % 60;
                    return (
                      <div
                        key={i}
                        style={{ height: SLOT_HEIGHT, top: i * SLOT_HEIGHT }}
                        className={cn(
                          "absolute left-0 right-0 border-b cursor-pointer",
                          "hover:bg-violet-50/50 transition-colors group",
                          m === 0 ? "border-slate-200" : "border-dashed border-slate-100"
                        )}
                        onClick={() => handleSlotClick(dateKey, h, m)}
                      >
                        <span className="hidden group-hover:flex absolute inset-0 items-center justify-center">
                          <Plus className="w-3.5 h-3.5 text-violet-400" />
                        </span>
                      </div>
                    );
                  })}

                  {/* Appointment cards */}
                  {!loadingAgendamentos && dayAgs.map((ag: Agendamento) => {
                    const cfg = STATUS_CONFIG[ag.status];
                    const startMins = timeToMinutes(ag.horaInicio);
                    const top = minutesToTop(startMins);
                    const height = Math.max(durationToHeight(ag.duracao), 26);
                    const hovered = hoveredId === ag.id;

                    return (
                      <div
                        key={ag.id}
                        style={{ top: top + 2, height: height - 4, left: 3, right: 3 }}
                        className={cn(
                          "absolute rounded-md border cursor-pointer transition-all select-none z-10",
                          "flex flex-col justify-start overflow-hidden px-1.5 pt-1",
                          cfg.bg, cfg.border,
                          hovered && `shadow-md ring-1 ${cfg.ring}`
                        )}
                        onMouseEnter={() => setHoveredId(ag.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAgendamento(ag);
                        }}
                      >
                        <p className={cn(
                          "text-[10px] font-semibold leading-tight",
                          cfg.text,
                          ag.status === "cancelado" && "line-through"
                        )}>
                          {ag.horaInicio}
                        </p>
                        {height >= 38 && (
                          <p className={cn(
                            "text-[11px] font-bold leading-tight truncate",
                            cfg.text,
                            ag.status === "cancelado" && "line-through"
                          )}>
                            {ag.pacienteAbrev}
                          </p>
                        )}
                        {height >= 58 && (
                          <p className={cn(
                            "text-[10px] leading-tight opacity-70 truncate",
                            cfg.text
                          )}>
                            {ag.tipo}
                          </p>
                        )}

                        {/* Tooltip */}
                        {hovered && (
                          <div
                            className="absolute left-full ml-2 top-0 z-50 w-52 bg-slate-900 text-white rounded-xl p-3 shadow-2xl text-xs pointer-events-none"
                            style={{ minWidth: 196 }}
                          >
                            <p className="font-bold text-sm leading-snug">{ag.paciente}</p>
                            <p className="text-slate-300 mt-0.5">{ag.tipo}</p>
                            <div className="mt-2 space-y-0.5 text-slate-300">
                              <p>{ag.horaInicio} – {endTime(ag.horaInicio, ag.duracao)} · {ag.duracao}min</p>
                              {ag.convenio && <p>{ag.convenio}</p>}
                              {ag.valor && (
                                <p className="text-white font-semibold">
                                  R$ {ag.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </p>
                              )}
                            </div>
                            <div className={cn(
                              "mt-2 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-medium",
                              cfg.badge
                            )}>
                              <span className={cn("w-1 h-1 rounded-full", cfg.dot)} />
                              {cfg.label}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Detail Sidebar overlay ────────────────────────────────── */}
      {selectedAgendamento && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-30"
            onClick={() => setSelectedAgendamento(null)}
          />
          <DetalhesSidebar
            agendamento={selectedAgendamento}
            onClose={() => setSelectedAgendamento(null)}
            onStatusChange={handleStatusChange}
          />
        </>
      )}

      {/* ── Novo Agendamento Modal ────────────────────────────────── */}
      <NovoAgendamentoModal
        open={modalNovoAberto}
        onOpenChange={setModalNovoAberto}
        initialDate={slotInicial?.data}
        initialHora={slotInicial?.hora}
        onSuccess={() => { fetchAgendamentos(); fetchResumo(); }}
      />
    </div>
  );
}
