"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Download,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  PanelRight,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  Landmark,
  Receipt,
  FileText,
  User,
  SlidersHorizontal,
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

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusTransacao = "pago" | "pendente" | "cancelado";
type TipoTransacao = "receita" | "despesa";

interface Transacao {
  id: string;
  data: string;
  paciente: string;
  descricao: string;
  categoria: string;
  convenio: string;
  valorBruto: number;
  desconto: number;
  valorLiquido: number;
  status: StatusTransacao;
  tipo: TipoTransacao;
  formaPagamento: string;
}

interface ContaBancaria {
  nome: string;
  banco: string;
  saldo: number;
  tipo: "corrente" | "poupanca" | "investimento";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIAS_RECEITA = ["Consultas", "Retornos", "Procedimentos", "Cirurgias", "Exames"];
const CATEGORIAS_DESPESA = ["Aluguel", "Salários", "Material", "Equipamentos", "Serviços", "Impostos", "Outros"];
const CONVENIOS = ["Particular", "Unimed", "Bradesco Saúde", "SulAmérica", "Amil", "Porto Seguro"];
const FORMAS_PAGAMENTO = ["Dinheiro", "PIX", "Cartão de crédito", "Cartão de débito", "Convênio", "Boleto"];
const ITEMS_POR_PAGINA = 10;

const STATUS_CFG = {
  pago: { label: "Pago", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2, iconCls: "text-emerald-500" },
  pendente: { label: "Pendente", cls: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock, iconCls: "text-amber-500" },
  cancelado: { label: "Cancelado", cls: "bg-red-100 text-red-600 border-red-200", icon: XCircle, iconCls: "text-red-400" },
} as const;

const CONTAS_BANCARIAS: ContaBancaria[] = [
  { nome: "Conta Principal", banco: "Itaú", saldo: 28450.00, tipo: "corrente" },
  { nome: "Reserva Emergência", banco: "Nubank", saldo: 15200.00, tipo: "poupanca" },
  { nome: "Conta Operacional", banco: "Bradesco", saldo: 8760.50, tipo: "corrente" },
  { nome: "CDB Curto Prazo", banco: "XP Investimentos", saldo: 45000.00, tipo: "investimento" },
];

// ─── Mock Transactions ────────────────────────────────────────────────────────

const MOCK_TRANSACOES: Transacao[] = [
  { id: "1", data: "12/03/2026", paciente: "Fernanda Lima Sousa", descricao: "Consulta clínica", categoria: "Consultas", convenio: "Particular", valorBruto: 200, desconto: 0, valorLiquido: 200, status: "pago", tipo: "receita", formaPagamento: "PIX" },
  { id: "2", data: "12/03/2026", paciente: "Gabriel Torres Melo", descricao: "Retorno", categoria: "Retornos", convenio: "Unimed", valorBruto: 100, desconto: 20, valorLiquido: 80, status: "pendente", tipo: "receita", formaPagamento: "Convênio" },
  { id: "3", data: "12/03/2026", paciente: "—", descricao: "Material cirúrgico", categoria: "Material", convenio: "—", valorBruto: 320, desconto: 0, valorLiquido: 320, status: "pago", tipo: "despesa", formaPagamento: "Cartão de crédito" },
  { id: "4", data: "11/03/2026", paciente: "Pedro Henrique Rocha", descricao: "Consulta clínica", categoria: "Consultas", convenio: "SulAmérica", valorBruto: 200, desconto: 20, valorLiquido: 180, status: "pago", tipo: "receita", formaPagamento: "Convênio" },
  { id: "5", data: "11/03/2026", paciente: "Juliana Mendes Costa", descricao: "Procedimento ambulatorial", categoria: "Procedimentos", convenio: "Unimed", valorBruto: 400, desconto: 50, valorLiquido: 350, status: "pago", tipo: "receita", formaPagamento: "Convênio" },
  { id: "6", data: "10/03/2026", paciente: "—", descricao: "Aluguel sala clínica", categoria: "Aluguel", convenio: "—", valorBruto: 3200, desconto: 0, valorLiquido: 3200, status: "pago", tipo: "despesa", formaPagamento: "Boleto" },
  { id: "7", data: "10/03/2026", paciente: "Mariana Costa Oliveira", descricao: "Consulta clínica", categoria: "Consultas", convenio: "Particular", valorBruto: 250, desconto: 0, valorLiquido: 250, status: "pago", tipo: "receita", formaPagamento: "Dinheiro" },
  { id: "8", data: "09/03/2026", paciente: "—", descricao: "Salário secretária", categoria: "Salários", convenio: "—", valorBruto: 1800, desconto: 0, valorLiquido: 1800, status: "pago", tipo: "despesa", formaPagamento: "PIX" },
  { id: "9", data: "09/03/2026", paciente: "Ana Paula Ferreira", descricao: "Retorno", categoria: "Retornos", convenio: "Bradesco Saúde", valorBruto: 100, desconto: 20, valorLiquido: 80, status: "pago", tipo: "receita", formaPagamento: "Convênio" },
  { id: "10", data: "09/03/2026", paciente: "Carlos Eduardo Santos", descricao: "Consulta clínica", categoria: "Consultas", convenio: "Amil", valorBruto: 200, desconto: 0, valorLiquido: 200, status: "cancelado", tipo: "receita", formaPagamento: "Convênio" },
  { id: "11", data: "08/03/2026", paciente: "Beatriz Nascimento", descricao: "Exame laboratorial", categoria: "Exames", convenio: "Unimed", valorBruto: 180, desconto: 30, valorLiquido: 150, status: "pago", tipo: "receita", formaPagamento: "Convênio" },
  { id: "12", data: "08/03/2026", paciente: "—", descricao: "Conta de energia", categoria: "Serviços", convenio: "—", valorBruto: 480, desconto: 0, valorLiquido: 480, status: "pendente", tipo: "despesa", formaPagamento: "Boleto" },
  { id: "13", data: "07/03/2026", paciente: "Lucas Ferreira Dias", descricao: "Procedimento cirúrgico", categoria: "Cirurgias", convenio: "Particular", valorBruto: 2500, desconto: 0, valorLiquido: 2500, status: "pago", tipo: "receita", formaPagamento: "Cartão de crédito" },
  { id: "14", data: "07/03/2026", paciente: "—", descricao: "Manutenção equipamento", categoria: "Equipamentos", convenio: "—", valorBruto: 650, desconto: 0, valorLiquido: 650, status: "pago", tipo: "despesa", formaPagamento: "PIX" },
  { id: "15", data: "06/03/2026", paciente: "Natalia Barbosa", descricao: "Retorno", categoria: "Retornos", convenio: "SulAmérica", valorBruto: 100, desconto: 20, valorLiquido: 80, status: "pendente", tipo: "receita", formaPagamento: "Convênio" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function moeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Nova Transação Modal ─────────────────────────────────────────────────────

function NovaTransacaoModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [tipoForm, setTipoForm] = useState<TipoTransacao>("receita");
  const [form, setForm] = useState({
    paciente: "",
    descricao: "",
    categoria: "",
    convenio: "",
    valor: "",
    desconto: "",
    formaPagamento: "",
    dataEmissao: new Date().toISOString().split("T")[0],
    dataPagamento: "",
    observacoes: "",
  });

  const categorias = tipoForm === "receita" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Receipt className="w-4 h-4 text-violet-600" />
            Nova Transação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1 max-h-[70vh] overflow-y-auto pr-1">
          {/* Tipo */}
          <div className="flex rounded-lg border overflow-hidden">
            {(["receita", "despesa"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTipoForm(t); set("categoria", ""); }}
                className={cn(
                  "flex-1 py-2 text-sm font-semibold transition-all",
                  tipoForm === t
                    ? t === "receita"
                      ? "bg-emerald-600 text-white"
                      : "bg-red-500 text-white"
                    : "bg-white text-slate-500 hover:bg-slate-50"
                )}
              >
                {t === "receita" ? "Receita" : "Despesa"}
              </button>
            ))}
          </div>

          {/* Paciente (só para receita) */}
          {tipoForm === "receita" && (
            <div className="space-y-1.5">
              <Label>Paciente</Label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <Input className="pl-8" placeholder="Nome do paciente..." value={form.paciente} onChange={(e) => set("paciente", e.target.value)} />
              </div>
            </div>
          )}

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label>Descrição *</Label>
            <Input placeholder={tipoForm === "receita" ? "Ex: Consulta clínica, Procedimento..." : "Ex: Aluguel, Material..."} value={form.descricao} onChange={(e) => set("descricao", e.target.value)} />
          </div>

          {/* Categoria */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Categoria *</Label>
              <Select value={form.categoria} onValueChange={(v) => set("categoria", v)}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>{categorias.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {tipoForm === "receita" && (
              <div className="space-y-1.5">
                <Label>Convênio</Label>
                <Select value={form.convenio} onValueChange={(v) => set("convenio", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                  <SelectContent>{CONVENIOS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Valor e Desconto */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Valor bruto (R$) *</Label>
              <Input type="number" min="0" step="0.01" placeholder="0,00" value={form.valor} onChange={(e) => set("valor", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Desconto (R$)</Label>
              <Input type="number" min="0" step="0.01" placeholder="0,00" value={form.desconto} onChange={(e) => set("desconto", e.target.value)} />
            </div>
          </div>

          {/* Valor líquido calculado */}
          {form.valor && (
            <div className="bg-slate-50 rounded-lg px-3 py-2 text-sm">
              <span className="text-slate-500">Valor líquido: </span>
              <span className="font-bold text-slate-800">
                {moeda((parseFloat(form.valor) || 0) - (parseFloat(form.desconto) || 0))}
              </span>
            </div>
          )}

          {/* Forma de pagamento */}
          <div className="space-y-1.5">
            <Label>Forma de pagamento *</Label>
            <Select value={form.formaPagamento} onValueChange={(v) => set("formaPagamento", v)}>
              <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
              <SelectContent>{FORMAS_PAGAMENTO.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Data de emissão *</Label>
              <Input type="date" value={form.dataEmissao} onChange={(e) => set("dataEmissao", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Data de pagamento</Label>
              <Input type="date" value={form.dataPagamento} onChange={(e) => set("dataPagamento", e.target.value)} />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea placeholder="Anotações opcionais..." rows={2} className="resize-none" value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            className={cn(tipoForm === "receita" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600")}
            disabled={!form.descricao || !form.valor || !form.formaPagamento}
            onClick={() => onOpenChange(false)}
          >
            <Receipt className="w-4 h-4 mr-2" />
            Registrar {tipoForm === "receita" ? "receita" : "despesa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TransacoesPage() {
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroConvenio, setFiltroConvenio] = useState("todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [pagina, setPagina] = useState(1);
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  const filtradas = useMemo(() => {
    return MOCK_TRANSACOES.filter((t) => {
      const matchBusca = !busca || t.paciente.toLowerCase().includes(busca.toLowerCase()) || t.descricao.toLowerCase().includes(busca.toLowerCase());
      const matchTipo = filtroTipo === "todos" || t.tipo === filtroTipo;
      const matchCat = filtroCategoria === "todos" || t.categoria === filtroCategoria;
      const matchStatus = filtroStatus === "todos" || t.status === filtroStatus;
      const matchConvenio = filtroConvenio === "todos" || t.convenio === filtroConvenio;
      return matchBusca && matchTipo && matchCat && matchStatus && matchConvenio;
    });
  }, [busca, filtroTipo, filtroCategoria, filtroStatus, filtroConvenio]);

  const totalPaginas = Math.ceil(filtradas.length / ITEMS_POR_PAGINA);
  const paginadas = filtradas.slice((pagina - 1) * ITEMS_POR_PAGINA, pagina * ITEMS_POR_PAGINA);

  const totalReceitas = filtradas.filter(t => t.tipo === "receita").reduce((s, t) => s + t.valorLiquido, 0);
  const totalDespesas = filtradas.filter(t => t.tipo === "despesa").reduce((s, t) => s + t.valorLiquido, 0);
  const saldoTotal = CONTAS_BANCARIAS.reduce((s, c) => s + c.saldo, 0);

  const todasCategorias = [...new Set(MOCK_TRANSACOES.map(t => t.categoria))].sort();

  return (
    <div className="flex gap-4 -m-6 h-[calc(100vh-4rem)]">

      {/* ── Main Content ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-6 flex flex-col gap-5 min-w-0">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Transações</h1>
            <p className="text-sm text-slate-400 mt-0.5">{filtradas.length} transações encontradas</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
              <Download className="w-3.5 h-3.5" />CSV
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
              <FileText className="w-3.5 h-3.5" />PDF
            </Button>
            <Button className="bg-violet-600 hover:bg-violet-700 gap-1.5 text-xs h-8" size="sm" onClick={() => setModalAberto(true)}>
              <Plus className="w-3.5 h-3.5" />Nova Transação
            </Button>
            <button
              onClick={() => setSidebarAberta(!sidebarAberta)}
              className={cn("p-1.5 rounded-lg border transition-colors", sidebarAberta ? "bg-violet-50 border-violet-200 text-violet-600" : "bg-white border-slate-200 text-slate-500 hover:border-violet-200")}
            >
              <PanelRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Filtros</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Busca */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
              <Input className="pl-8 h-8 text-sm" placeholder="Buscar paciente ou descrição..." value={busca} onChange={(e) => { setBusca(e.target.value); setPagina(1); }} />
            </div>
            {/* Período */}
            <div className="flex items-center gap-1 bg-slate-50 border rounded-lg px-2 h-8">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="border-0 p-0 h-auto text-xs w-28 focus-visible:ring-0 shadow-none bg-transparent" />
              <span className="text-slate-300 text-xs">–</span>
              <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="border-0 p-0 h-auto text-xs w-28 focus-visible:ring-0 shadow-none bg-transparent" />
            </div>
            {/* Tipo */}
            <Select value={filtroTipo} onValueChange={(v) => { setFiltroTipo(v); setPagina(1); }}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
            {/* Categoria */}
            <Select value={filtroCategoria} onValueChange={(v) => { setFiltroCategoria(v); setPagina(1); }}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                {todasCategorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {/* Status */}
            <Select value={filtroStatus} onValueChange={(v) => { setFiltroStatus(v); setPagina(1); }}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            {/* Convênio */}
            <Select value={filtroConvenio} onValueChange={(v) => { setFiltroConvenio(v); setPagina(1); }}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Convênio" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {CONVENIOS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {/* Clear filters */}
            {(busca || filtroTipo !== "todos" || filtroCategoria !== "todos" || filtroStatus !== "todos" || filtroConvenio !== "todos") && (
              <button
                onClick={() => { setBusca(""); setFiltroTipo("todos"); setFiltroCategoria("todos"); setFiltroStatus("todos"); setFiltroConvenio("todos"); setPagina(1); }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 h-8 px-2 rounded-lg border border-dashed border-slate-200 hover:border-slate-300 transition-colors"
              >
                <X className="w-3 h-3" />Limpar
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50/60">
                  {["Data", "Paciente", "Descrição", "Categoria", "Convênio", "Valor Bruto", "Desconto", "Valor Líquido", "Status", "Ações"].map((h) => (
                    <th key={h} className={cn(
                      "py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap",
                      ["Valor Bruto", "Desconto", "Valor Líquido"].includes(h) ? "text-right" : "text-left"
                    )}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginadas.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 text-sm">
                      Nenhuma transação encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : paginadas.map((t) => {
                  const scfg = STATUS_CFG[t.status];
                  const StatusIcon = scfg.icon;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="px-3 py-3 text-slate-400 text-xs whitespace-nowrap">{t.data}</td>
                      <td className="px-3 py-3 text-slate-700 text-xs max-w-[140px] truncate">{t.paciente}</td>
                      <td className="px-3 py-3 text-slate-600 text-xs max-w-[160px] truncate">{t.descricao}</td>
                      <td className="px-3 py-3">
                        <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", t.tipo === "receita" ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50")}>
                          {t.categoria}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-400 text-xs">{t.convenio}</td>
                      <td className="px-3 py-3 text-right text-xs text-slate-600 tabular-nums">{moeda(t.valorBruto)}</td>
                      <td className="px-3 py-3 text-right text-xs text-slate-400 tabular-nums">{t.desconto > 0 ? `−${moeda(t.desconto)}` : "—"}</td>
                      <td className="px-3 py-3 text-right">
                        <span className={cn("text-sm font-bold tabular-nums", t.tipo === "receita" ? "text-emerald-600" : "text-red-500")}>
                          {t.tipo === "despesa" ? "−" : "+"}{moeda(t.valorLiquido)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border", scfg.cls)}>
                          <StatusIcon className={cn("w-3 h-3", scfg.iconCls)} />
                          {scfg.label}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-xs text-violet-600 hover:underline">Editar</button>
                          <span className="text-slate-200">|</span>
                          <button className="text-xs text-slate-400 hover:text-red-500">Excluir</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer — Totais + paginação */}
          <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50/60 shrink-0 flex-wrap gap-2">
            <div className="flex items-center gap-5 text-xs">
              <span className="text-slate-500">Receitas: <span className="font-bold text-emerald-600">{moeda(totalReceitas)}</span></span>
              <span className="text-slate-500">Despesas: <span className="font-bold text-red-500">{moeda(totalDespesas)}</span></span>
              <span className="text-slate-500">Saldo: <span className="font-bold text-violet-600">{moeda(totalReceitas - totalDespesas)}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {(pagina - 1) * ITEMS_POR_PAGINA + 1}–{Math.min(pagina * ITEMS_POR_PAGINA, filtradas.length)} de {filtradas.length}
              </span>
              <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1} className="p-1 rounded border hover:bg-white disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina >= totalPaginas} className="p-1 rounded border hover:bg-white disabled:opacity-30 transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sidebar Contas Bancárias ────────────────────────────────── */}
      {sidebarAberta && (
        <div className="w-64 shrink-0 bg-white border-l overflow-y-auto flex flex-col p-4 gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Saldos</h3>
            <button onClick={() => setSidebarAberta(false)} className="p-1 rounded hover:bg-slate-100 text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Total */}
          <div className="bg-violet-50 rounded-xl p-3 border border-violet-100">
            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-1">Saldo total</p>
            <p className="text-2xl font-bold text-violet-700 tabular-nums">{moeda(saldoTotal)}</p>
          </div>

          {/* Accounts */}
          <div className="space-y-2.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contas</p>
            {CONTAS_BANCARIAS.map((conta) => (
              <div key={conta.nome} className="flex items-start gap-2.5 p-2.5 rounded-lg border hover:border-violet-200 hover:bg-violet-50/30 transition-colors">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  conta.tipo === "corrente" ? "bg-blue-100" : conta.tipo === "poupanca" ? "bg-emerald-100" : "bg-amber-100"
                )}>
                  {conta.tipo === "investimento"
                    ? <CreditCard className={cn("w-4 h-4", "text-amber-600")} />
                    : <Landmark className={cn("w-4 h-4", conta.tipo === "corrente" ? "text-blue-600" : "text-emerald-600")} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{conta.nome}</p>
                  <p className="text-[10px] text-slate-400">{conta.banco}</p>
                  <p className={cn(
                    "text-sm font-bold mt-0.5 tabular-nums",
                    conta.saldo >= 0 ? "text-slate-800" : "text-red-500"
                  )}>
                    {moeda(conta.saldo)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-3">
            <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Nova conta
            </Button>
          </div>
        </div>
      )}

      {/* Modal */}
      <NovaTransacaoModal open={modalAberto} onOpenChange={setModalAberto} />
    </div>
  );
}
