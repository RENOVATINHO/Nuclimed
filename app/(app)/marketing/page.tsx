"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  MessageCircle,
  Mail,
  Calendar,
  Megaphone,
  Plus,
  Send,
  Clock,
  UserX,
  Sparkles,
  GripVertical,
  Phone,
  RefreshCw,
  CheckSquare,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { getAniversariantes, getPacientesInativos } from "@/lib/actions/pacientes";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Aniversariante {
  id: string;
  nome: string;
  dataNascimento: Date | null;
  email: string | null;
  telefone: string | null;
  convenio: string | null;
  diaNascimento: number;
}

interface PacienteInativo {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  convenio: string | null;
  ultimoAgendamento: Date | null;
  diasInativo: number | null;
}

interface Oportunidade {
  id: string;
  nome: string;
  origem: string;
  telefone: string;
  observacao?: string;
  coluna: "novo" | "agendado" | "consultado" | "convertido";
  data: string;
}

// ─── Static Mock Data (no server action available) ────────────────────────────

const MESES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const OPORTUNIDADES_MOCK: Oportunidade[] = [
  { id: "1", nome: "Rodrigo Tavares", origem: "Indicação", telefone: "(11) 98001-1001", coluna: "novo", data: "10/03/2026" },
  { id: "2", nome: "Larissa Campos", origem: "Busca online", telefone: "(11) 98002-2002", coluna: "novo", data: "11/03/2026" },
  { id: "3", nome: "André Figueiredo", origem: "Convênio", telefone: "(11) 98003-3003", coluna: "agendado", data: "09/03/2026", observacao: "Consulta dia 14/03" },
  { id: "4", nome: "Júlia Marques", origem: "Indicação", telefone: "(11) 98004-4004", coluna: "agendado", data: "08/03/2026" },
  { id: "5", nome: "Marcos Silveira", origem: "Busca online", telefone: "(11) 98005-5005", coluna: "consultado", data: "05/03/2026", observacao: "Aguardando retorno" },
  { id: "6", nome: "Renata Moura", origem: "Indicação", telefone: "(11) 98006-6006", coluna: "consultado", data: "04/03/2026" },
  { id: "7", nome: "Felipe Cardoso", origem: "Convênio", telefone: "(11) 98007-7007", coluna: "convertido", data: "01/03/2026", observacao: "Paciente ativo ✓" },
  { id: "8", nome: "Aline Souza Cruz", origem: "Indicação", telefone: "(11) 98008-8008", coluna: "convertido", data: "28/02/2026" },
];

const COLUNAS_KANBAN = [
  { id: "novo", label: "Novo Contato", cor: "border-blue-300", corBg: "bg-blue-50", corHeader: "bg-blue-100 text-blue-700", corDot: "bg-blue-500" },
  { id: "agendado", label: "Agendado", cor: "border-violet-300", corBg: "bg-violet-50", corHeader: "bg-violet-100 text-violet-700", corDot: "bg-violet-500" },
  { id: "consultado", label: "Consultado", cor: "border-amber-300", corBg: "bg-amber-50", corHeader: "bg-amber-100 text-amber-700", corDot: "bg-amber-500" },
  { id: "convertido", label: "Convertido", cor: "border-emerald-300", corBg: "bg-emerald-50", corHeader: "bg-emerald-100 text-emerald-700", corDot: "bg-emerald-500" },
] as const;

const ORIGENS_COR: Record<string, string> = {
  "Indicação": "bg-violet-100 text-violet-700",
  "Busca online": "bg-blue-100 text-blue-700",
  "Convênio": "bg-emerald-100 text-emerald-700",
};

// ─── Mensagem em Massa Modal ──────────────────────────────────────────────────

function MensagemMassaModal({
  open,
  onOpenChange,
  destinatarios,
  tipo,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  destinatarios: string[];
  tipo: "aniversario" | "reativacao";
}) {
  const templateAniversario = `Olá, {nome}! 🎂\n\nA equipe da Clínica Nuclimed deseja um feliz aniversário! Esperamos que o seu dia seja muito especial.\n\nEstamos à disposição para cuidar da sua saúde. Que tal agendar uma consulta de aniversário com desconto especial?\n\nAbraços,\nEquipe Nuclimed`;
  const templateReativacao = `Olá, {nome}!\n\nSentimos a sua falta! Faz algum tempo que não temos notícias suas por aqui.\n\nGostaríamos de lembrá-lo(a) que sua saúde é nossa prioridade. Que tal agendar uma consulta de acompanhamento?\n\nEstamos esperando você!\n\nEquipe Nuclimed`;

  const [mensagem, setMensagem] = useState(tipo === "aniversario" ? templateAniversario : templateReativacao);
  const [canal, setCanal] = useState("whatsapp");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Send className="w-4 h-4 text-violet-600" />
            Mensagem em massa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Canal */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Canal de envio</Label>
              <Select value={canal} onValueChange={setCanal}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Destinatários</Label>
              <div className="h-8 flex items-center px-3 bg-slate-50 border rounded-md text-xs text-slate-600 font-medium">
                {destinatarios.length} selecionados
              </div>
            </div>
          </div>

          {/* Destinatários preview */}
          <div className="bg-slate-50 rounded-lg border p-2.5 max-h-20 overflow-y-auto">
            <div className="flex flex-wrap gap-1">
              {destinatarios.slice(0, 12).map((d, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-white border rounded-full text-slate-600">{d}</span>
              ))}
              {destinatarios.length > 12 && (
                <span className="text-[10px] px-1.5 py-0.5 text-slate-400">+{destinatarios.length - 12} mais</span>
              )}
            </div>
          </div>

          {/* Template */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Mensagem</Label>
              <span className="text-[10px] text-slate-400">Use {"{nome}"} para personalizar</span>
            </div>
            <Textarea
              rows={6}
              className="resize-none text-xs"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-xs gap-1.5" onClick={() => onOpenChange(false)}>
            <Send className="w-3.5 h-3.5" />
            Enviar para {destinatarios.length} pacientes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Nova Oportunidade Modal ──────────────────────────────────────────────────

function NovaOportunidadeModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600" />
            Nova Oportunidade
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome do contato *</Label>
            <Input placeholder="Nome completo" className="h-8 text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Telefone</Label>
              <Input placeholder="(11) 9..." className="h-8 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Origem</Label>
              <Select>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {["Indicação", "Busca online", "Convênio", "Redes sociais", "Outro"].map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Observação</Label>
            <Textarea placeholder="Contexto ou notas..." rows={2} className="resize-none text-xs" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-xs" onClick={() => onOpenChange(false)}>Adicionar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Aba Aniversariantes ──────────────────────────────────────────────────────

function AbaAniversariantes() {
  const { toast } = useToast();
  const MES_ATUAL = new Date().getMonth() + 1;
  const [filtroPeriodo, setFiltroPeriodo] = useState("este-mes");
  const [busca, setBusca] = useState("");
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [modalMensagem, setModalMensagem] = useState(false);

  const [aniversariantes, setAniversariantes] = useState<Aniversariante[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch current month + next month together, filter in UI
    Promise.all([
      getAniversariantes(MES_ATUAL),
      getAniversariantes(MES_ATUAL === 12 ? 1 : MES_ATUAL + 1),
    ])
      .then(([thisMonth, nextMonth]) => {
        const combined = [...thisMonth, ...nextMonth];
        // Deduplicate by id
        const seen = new Set<string>();
        setAniversariantes(combined.filter((a) => {
          if (seen.has(a.id)) return false;
          seen.add(a.id);
          return true;
        }));
      })
      .catch(() => toast({ title: "Erro ao carregar aniversariantes", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const filtrados = useMemo(() => {
    return aniversariantes.filter((a) => {
      const mesPaciente = a.dataNascimento ? new Date(a.dataNascimento).getMonth() + 1 : null;
      const mesFiltro = filtroPeriodo === "este-mes" ? MES_ATUAL : MES_ATUAL === 12 ? 1 : MES_ATUAL + 1;
      const matchMes = filtroPeriodo === "todos" || mesPaciente === mesFiltro;
      const matchBusca = !busca || a.nome.toLowerCase().includes(busca.toLowerCase());
      return matchMes && matchBusca;
    });
  }, [aniversariantes, filtroPeriodo, busca, MES_ATUAL]);

  const toggleSelecionado = (id: string) => {
    setSelecionados(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const toggleTodos = () => {
    setSelecionados(s => s.length === filtrados.length ? [] : filtrados.map(a => a.id));
  };

  const nomeSelecionados = selecionados.map(id => filtrados.find(a => a.id === id)?.nome ?? "").filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Filters + actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex rounded-lg border overflow-hidden text-xs font-medium">
          {[{ v: "este-mes", l: "Este mês" }, { v: "proximo-mes", l: "Próximo mês" }, { v: "todos", l: "Todos" }].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => setFiltroPeriodo(v)}
              className={cn("px-3 py-1.5 transition-colors", filtroPeriodo === v ? "bg-violet-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50")}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
          <Input className="pl-8 h-8 text-xs" placeholder="Buscar por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div className="flex-1" />
        {selecionados.length > 0 && (
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-xs gap-1.5 h-8" onClick={() => setModalMensagem(true)}>
            <Send className="w-3.5 h-3.5" />
            Mensagem em massa ({selecionados.length})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50/60">
                <th className="w-10 py-2.5 pl-4 text-left">
                  <button onClick={toggleTodos}>
                    {selecionados.length === filtrados.length && filtrados.length > 0
                      ? <CheckSquare className="w-4 h-4 text-violet-600" />
                      : <Square className="w-4 h-4 text-slate-300" />}
                  </button>
                </th>
                {["Nome", "Aniversário", "Telefone", "E-mail", "Ações"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-sm text-slate-400">Nenhum aniversariante encontrado.</td></tr>
              ) : filtrados.map((a) => {
                const dn = a.dataNascimento ? new Date(a.dataNascimento) : null;
                const dia = a.diaNascimento;
                const mes = dn ? dn.getMonth() + 1 : null;
                const anoNasc = dn ? dn.getFullYear() : null;
                const hoje = new Date();
                const ehHoje = dn && dia === hoje.getDate() && mes === hoje.getMonth() + 1;
                return (
                  <tr key={a.id} className={cn("hover:bg-slate-50/40 transition-colors", selecionados.includes(a.id) && "bg-violet-50/30")}>
                    <td className="pl-4 py-3">
                      <button onClick={() => toggleSelecionado(a.id)}>
                        {selecionados.includes(a.id)
                          ? <CheckSquare className="w-4 h-4 text-violet-600" />
                          : <Square className="w-4 h-4 text-slate-300" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold shrink-0">
                          {a.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <span className="font-medium text-slate-800 text-sm">{a.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{ehHoje ? "🎂" : "🎁"}</span>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{dia} de {mes ? MESES_PT[mes - 1] : "—"}</p>
                          <p className="text-[10px] text-slate-400">{anoNasc ? `${hoje.getFullYear() - anoNasc} anos` : "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{a.telefone ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{a.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                          <MessageCircle className="w-3 h-3" />WhatsApp
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 text-blue-600 border-blue-200 hover:bg-blue-50">
                          <Mail className="w-3 h-3" />E-mail
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <MensagemMassaModal open={modalMensagem} onOpenChange={setModalMensagem} destinatarios={nomeSelecionados} tipo="aniversario" />
    </div>
  );
}

// ─── Aba Pacientes Inativos ───────────────────────────────────────────────────

function AbaInativos() {
  const { toast } = useToast();
  const [filtroInatividade, setFiltroInatividade] = useState("90");
  const [busca, setBusca] = useState("");
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [modalMensagem, setModalMensagem] = useState(false);

  const [inativos, setInativos] = useState<PacienteInativo[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch when filter changes
  useEffect(() => {
    setLoading(true);
    const dias = Number(filtroInatividade === "todos" ? 30 : filtroInatividade);
    getPacientesInativos(dias)
      .then(setInativos)
      .catch(() => toast({ title: "Erro ao carregar pacientes inativos", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [filtroInatividade]);

  const filtrados = useMemo(() => {
    return inativos.filter((p) => {
      const matchBusca = !busca || p.nome.toLowerCase().includes(busca.toLowerCase());
      return matchBusca;
    });
  }, [inativos, busca]);

  const toggleSel = (id: string) => setSelecionados(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleTodos = () => setSelecionados(s => s.length === filtrados.length ? [] : filtrados.map(p => p.id));
  const nomeSel = selecionados.map(id => filtrados.find(p => p.id === id)?.nome ?? "").filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={filtroInatividade} onValueChange={setFiltroInatividade}>
          <SelectTrigger className="w-44 h-8 text-xs">
            <SelectValue placeholder="Sem visita há..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos (30+ dias)</SelectItem>
            <SelectItem value="30">30+ dias</SelectItem>
            <SelectItem value="60">60+ dias</SelectItem>
            <SelectItem value="90">90+ dias</SelectItem>
            <SelectItem value="180">180+ dias</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
          <Input className="pl-8 h-8 text-xs" placeholder="Buscar por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div className="flex-1" />
        {selecionados.length > 0 && (
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-xs gap-1.5 h-8" onClick={() => setModalMensagem(true)}>
            <RefreshCw className="w-3.5 h-3.5" />
            Campanha de reativação ({selecionados.length})
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50/60">
                <th className="w-10 py-2.5 pl-4">
                  <button onClick={toggleTodos}>
                    {selecionados.length === filtrados.length && filtrados.length > 0
                      ? <CheckSquare className="w-4 h-4 text-violet-600" />
                      : <Square className="w-4 h-4 text-slate-300" />}
                  </button>
                </th>
                {["Nome", "Última visita", "Inatividade", "Telefone", "Ações"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-sm text-slate-400">Nenhum paciente encontrado.</td></tr>
              ) : filtrados.map((p) => {
                const dias = p.diasInativo ?? 0;
                const cor = dias >= 180 ? "text-red-500 bg-red-50 border-red-100"
                  : dias >= 90 ? "text-orange-500 bg-orange-50 border-orange-100"
                  : "text-amber-600 bg-amber-50 border-amber-100";
                const ultimaVisitaStr = p.ultimoAgendamento
                  ? new Date(p.ultimoAgendamento).toLocaleDateString("pt-BR")
                  : "Nunca";
                return (
                  <tr key={p.id} className={cn("hover:bg-slate-50/40 transition-colors", selecionados.includes(p.id) && "bg-violet-50/30")}>
                    <td className="pl-4 py-3">
                      <button onClick={() => toggleSel(p.id)}>
                        {selecionados.includes(p.id)
                          ? <CheckSquare className="w-4 h-4 text-violet-600" />
                          : <Square className="w-4 h-4 text-slate-300" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
                          {p.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <span className="font-medium text-slate-800 text-sm">{p.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{ultimaVisitaStr}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border", cor)}>
                        <Clock className="w-3 h-3" />
                        {p.diasInativo !== null ? `${p.diasInativo} dias` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{p.telefone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 text-violet-600 border-violet-200 hover:bg-violet-50">
                          <Calendar className="w-3 h-3" />Agendar
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 text-slate-500 hover:bg-slate-50">
                          <Phone className="w-3 h-3" />Contatar
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <MensagemMassaModal open={modalMensagem} onOpenChange={setModalMensagem} destinatarios={nomeSel} tipo="reativacao" />
    </div>
  );
}

// ─── Aba Oportunidades (Kanban) ───────────────────────────────────────────────

function AbaOportunidades() {
  const [oportunidades, setOportunidades] = useState(OPORTUNIDADES_MOCK);
  const [modalNova, setModalNova] = useState(false);

  const moverCard = (id: string, novaColuna: Oportunidade["coluna"]) => {
    setOportunidades(ops => ops.map(o => o.id === id ? { ...o, coluna: novaColuna } : o));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{oportunidades.length} oportunidades no pipeline</p>
        <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-xs gap-1.5 h-8" onClick={() => setModalNova(true)}>
          <Plus className="w-3.5 h-3.5" />Nova oportunidade
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {COLUNAS_KANBAN.map((col) => {
          const cards = oportunidades.filter(o => o.coluna === col.id);
          return (
            <div key={col.id} className={cn("rounded-xl border-2 p-3 flex flex-col gap-2 min-h-[300px]", col.cor, col.corBg)}>
              {/* Column header */}
              <div className={cn("flex items-center justify-between px-2 py-1.5 rounded-lg", col.corHeader)}>
                <div className="flex items-center gap-1.5">
                  <span className={cn("w-2 h-2 rounded-full", col.corDot)} />
                  <span className="text-xs font-bold">{col.label}</span>
                </div>
                <span className="text-xs font-bold opacity-70">{cards.length}</span>
              </div>

              {/* Cards */}
              {cards.map((op) => (
                <div
                  key={op.id}
                  className="bg-white rounded-lg border shadow-sm p-3 cursor-grab group hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-bold shrink-0">
                        {op.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 leading-tight">{op.nome}</p>
                        <p className="text-[10px] text-slate-400">{op.data}</p>
                      </div>
                    </div>
                    <GripVertical className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
                  </div>
                  <span className={cn("inline-flex mt-2 text-[10px] px-1.5 py-0.5 rounded font-medium", ORIGENS_COR[op.origem] || "bg-slate-100 text-slate-600")}>
                    {op.origem}
                  </span>
                  {op.observacao && (
                    <p className="text-[10px] text-slate-500 mt-1.5 leading-tight">{op.observacao}</p>
                  )}
                  {/* Move actions */}
                  <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {COLUNAS_KANBAN.filter(c => c.id !== col.id).map(c => (
                      <button
                        key={c.id}
                        onClick={() => moverCard(op.id, c.id as Oportunidade["coluna"])}
                        className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium border transition-colors", c.corHeader, c.cor)}
                      >
                        → {c.label.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Add card button */}
              <button
                className={cn("flex items-center gap-1 text-[10px] font-medium px-2 py-1.5 rounded-lg border border-dashed opacity-50 hover:opacity-80 transition-opacity", col.cor)}
                onClick={() => setModalNova(true)}
              >
                <Plus className="w-3 h-3" />Adicionar
              </button>
            </div>
          );
        })}
      </div>

      <NovaOportunidadeModal open={modalNova} onOpenChange={setModalNova} />
    </div>
  );
}

// ─── Aba Campanhas ────────────────────────────────────────────────────────────

function AbaCampanhas() {
  const campanhas = [
    { nome: "Aniversariantes de Março", canal: "WhatsApp", enviados: 42, abertos: 38, agendados: 9, status: "concluida", data: "01/03/2026" },
    { nome: "Reativação 90 dias", canal: "E-mail", enviados: 87, abertos: 54, agendados: 12, status: "concluida", data: "15/02/2026" },
    { nome: "Aniversariantes de Abril", canal: "WhatsApp", enviados: 0, abertos: 0, agendados: 0, status: "programada", data: "01/04/2026" },
    { nome: "Check-up preventivo", canal: "SMS + E-mail", enviados: 0, abertos: 0, agendados: 0, status: "rascunho", data: "—" },
  ];

  const STATUS_CAMP: Record<string, string> = {
    concluida: "bg-emerald-100 text-emerald-700 border-emerald-200",
    programada: "bg-blue-100 text-blue-700 border-blue-200",
    rascunho: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-xs gap-1.5 h-8">
          <Plus className="w-3.5 h-3.5" />Nova campanha
        </Button>
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50/60">
              {["Campanha", "Canal", "Data", "Enviados", "Abertos", "Agendamentos", "Status"].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {campanhas.map((c, i) => (
              <tr key={i} className="hover:bg-slate-50/40 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800 text-sm">{c.nome}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{c.canal}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{c.data}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-700 tabular-nums">{c.enviados || "—"}</td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {c.abertos ? `${c.abertos} (${Math.round(c.abertos / c.enviados * 100)}%)` : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-emerald-600 font-semibold">{c.agendados || "—"}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize", STATUS_CAMP[c.status])}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MarketingPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-violet-600" />
            Marketing e Retenção
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Gerencie relacionamento com pacientes e campanhas</p>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Aniversariantes este mês", valor: 4, icon: "🎂", cor: "text-violet-600 bg-violet-50 border-violet-100" },
          { label: "Inativos há +90 dias", valor: 5, icon: "😴", cor: "text-amber-600 bg-amber-50 border-amber-100" },
          { label: "No pipeline", valor: OPORTUNIDADES_MOCK.length, icon: "✨", cor: "text-blue-600 bg-blue-50 border-blue-100" },
          { label: "Conversões este mês", valor: 2, icon: "✅", cor: "text-emerald-600 bg-emerald-50 border-emerald-100" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-xl border px-4 py-3", s.cor)}>
            <p className="text-2xl font-bold">{s.valor} <span className="text-lg">{s.icon}</span></p>
            <p className="text-[10px] font-medium opacity-80 mt-0.5 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="aniversariantes">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="aniversariantes" className="gap-1.5 text-xs">
            <span>🎂</span>Aniversariantes
          </TabsTrigger>
          <TabsTrigger value="inativos" className="gap-1.5 text-xs">
            <UserX className="w-3.5 h-3.5" />Inativos
          </TabsTrigger>
          <TabsTrigger value="oportunidades" className="gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5" />Oportunidades
          </TabsTrigger>
          <TabsTrigger value="campanhas" className="gap-1.5 text-xs">
            <Megaphone className="w-3.5 h-3.5" />Campanhas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="aniversariantes" className="mt-4">
          <AbaAniversariantes />
        </TabsContent>
        <TabsContent value="inativos" className="mt-4">
          <AbaInativos />
        </TabsContent>
        <TabsContent value="oportunidades" className="mt-4">
          <AbaOportunidades />
        </TabsContent>
        <TabsContent value="campanhas" className="mt-4">
          <AbaCampanhas />
        </TabsContent>
      </Tabs>
    </div>
  );
}
