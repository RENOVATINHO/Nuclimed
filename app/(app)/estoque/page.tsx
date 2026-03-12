"use client";

import { useState, useMemo } from "react";
import {
  PackageX,
  PackageMinus,
  Search,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  Package,
  Edit2,
  Trash2,
  CalendarClock,
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

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusEstoque = "normal" | "baixo" | "zerado" | "vencendo";

interface Produto {
  id: string;
  nome: string;
  categoria: string;
  unidade: string;
  qtdAtual: number;
  qtdMinima: number;
  validade?: string;
  lote?: string;
  fornecedor?: string;
}

interface Movimentacao {
  id: string;
  data: string;
  hora: string;
  produto: string;
  tipo: "entrada" | "saida";
  quantidade: number;
  unidade: string;
  responsavel: string;
  motivo: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIAS = ["Medicamentos", "Material cirúrgico", "EPI", "Equipamentos", "Descartáveis", "Limpeza", "Outros"];
const UNIDADES = ["un", "cx", "amp", "fr", "kg", "L", "mL", "par", "rolo"];

// ─── Mock Data ────────────────────────────────────────────────────────────────

const PRODUTOS_MOCK: Produto[] = [
  { id: "1", nome: "Luva cirúrgica estéril P", categoria: "EPI", unidade: "par", qtdAtual: 45, qtdMinima: 50, validade: "2027-06-30", lote: "LC-2024-001", fornecedor: "Medline" },
  { id: "2", nome: "Luva cirúrgica estéril M", categoria: "EPI", unidade: "par", qtdAtual: 32, qtdMinima: 50, validade: "2027-04-15", lote: "LC-2024-002", fornecedor: "Medline" },
  { id: "3", nome: "Seringa 5mL", categoria: "Descartáveis", unidade: "un", qtdAtual: 0, qtdMinima: 100, validade: "2028-01-01", lote: "SR-2024-101", fornecedor: "BD Medical" },
  { id: "4", nome: "Agulha 25x7", categoria: "Descartáveis", unidade: "un", qtdAtual: 80, qtdMinima: 100, validade: "2028-06-01", lote: "AG-2024-202", fornecedor: "BD Medical" },
  { id: "5", nome: "Lidocaína 2% 20mL", categoria: "Medicamentos", unidade: "amp", qtdAtual: 12, qtdMinima: 10, validade: "2026-03-28", lote: "LI-2025-001", fornecedor: "Cristália" },
  { id: "6", nome: "Clorhexidina 2% 1L", categoria: "Medicamentos", unidade: "fr", qtdAtual: 8, qtdMinima: 5, validade: "2026-08-15", lote: "CX-2025-033", fornecedor: "Rioquímica" },
  { id: "7", nome: "Gaze estéril 7,5x7,5", categoria: "Material cirúrgico", unidade: "cx", qtdAtual: 15, qtdMinima: 10, validade: "2029-01-01", lote: "GZ-2024-055", fornecedor: "Cremer" },
  { id: "8", nome: "Esparadrapo 10cm", categoria: "Material cirúrgico", unidade: "rolo", qtdAtual: 6, qtdMinima: 10, validade: "2028-03-01", lote: "ES-2024-077", fornecedor: "Cremer" },
  { id: "9", nome: "Máscara cirúrgica tripla", categoria: "EPI", unidade: "cx", qtdAtual: 4, qtdMinima: 20, validade: "2027-12-01", lote: "MC-2024-099", fornecedor: "Nobre" },
  { id: "10", nome: "Álcool 70% 500mL", categoria: "Limpeza", unidade: "fr", qtdAtual: 18, qtdMinima: 10, validade: "2026-02-28", lote: "AL-2025-011", fornecedor: "Rioquímica" },
  { id: "11", nome: "Bisturi nº 15", categoria: "Material cirúrgico", unidade: "un", qtdAtual: 30, qtdMinima: 20, validade: "2030-01-01", lote: "BI-2024-022", fornecedor: "Solidor" },
  { id: "12", nome: "Fio sutura 3-0", categoria: "Material cirúrgico", unidade: "un", qtdAtual: 0, qtdMinima: 30, validade: "2027-09-01", lote: "FS-2024-044", fornecedor: "Shalon" },
];

const MOVIMENTACOES_MOCK: Movimentacao[] = [
  { id: "1", data: "12/03/2026", hora: "14:32", produto: "Lidocaína 2% 20mL", tipo: "saida", quantidade: 3, unidade: "amp", responsavel: "Dr. João Silva", motivo: "Procedimento cirúrgico" },
  { id: "2", data: "12/03/2026", hora: "11:15", produto: "Luva cirúrgica estéril M", tipo: "saida", quantidade: 4, unidade: "par", responsavel: "Dra. Maria Oliveira", motivo: "Consulta" },
  { id: "3", data: "11/03/2026", hora: "09:00", produto: "Seringa 5mL", tipo: "entrada", quantidade: 200, unidade: "un", responsavel: "Secretária Ana", motivo: "Compra — NF 2024/003" },
  { id: "4", data: "11/03/2026", hora: "08:45", produto: "Agulha 25x7", tipo: "entrada", quantidade: 100, unidade: "un", responsavel: "Secretária Ana", motivo: "Compra — NF 2024/003" },
  { id: "5", data: "10/03/2026", hora: "16:20", produto: "Gaze estéril 7,5x7,5", tipo: "saida", quantidade: 2, unidade: "cx", responsavel: "Enfermeiro Carlos", motivo: "Curativo pós-operatório" },
  { id: "6", data: "10/03/2026", hora: "15:10", produto: "Álcool 70% 500mL", tipo: "saida", quantidade: 2, unidade: "fr", responsavel: "Técnico Bruno", motivo: "Assepsia sala cirúrgica" },
  { id: "7", data: "09/03/2026", hora: "09:30", produto: "Máscara cirúrgica tripla", tipo: "entrada", quantidade: 10, unidade: "cx", responsavel: "Secretária Ana", motivo: "Compra urgente" },
  { id: "8", data: "08/03/2026", hora: "17:00", produto: "Bisturi nº 15", tipo: "saida", quantidade: 5, unidade: "un", responsavel: "Dr. João Silva", motivo: "Procedimento" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatus(produto: Produto): StatusEstoque {
  const hoje = new Date();
  const diasParaVencer = produto.validade
    ? Math.ceil((new Date(produto.validade).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  if (produto.qtdAtual === 0) return "zerado";
  if (diasParaVencer <= 30) return "vencendo";
  if (produto.qtdAtual < produto.qtdMinima) return "baixo";
  return "normal";
}

const STATUS_CFG: Record<StatusEstoque, { label: string; cls: string; dot: string }> = {
  normal: { label: "Normal", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  baixo: { label: "Baixo", cls: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  zerado: { label: "Zerado", cls: "bg-red-100 text-red-600 border-red-200", dot: "bg-red-500" },
  vencendo: { label: "Vencendo", cls: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500" },
};

function formatValidade(validade?: string): string {
  if (!validade) return "—";
  const [y, m, d] = validade.split("-");
  return `${d}/${m}/${y}`;
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function CadastrarProdutoModal({ open, onOpenChange, produto }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  produto?: Produto | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Package className="w-4 h-4 text-violet-600" />
            {produto ? "Editar produto" : "Cadastrar produto"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome do produto *</Label>
            <Input className="h-8 text-xs" placeholder="Ex: Luva cirúrgica estéril P" defaultValue={produto?.nome} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Categoria *</Label>
              <Select defaultValue={produto?.categoria}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>{CATEGORIAS.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Unidade *</Label>
              <Select defaultValue={produto?.unidade}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>{UNIDADES.map(u => <SelectItem key={u} value={u} className="text-xs">{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Quantidade atual</Label>
              <Input type="number" min="0" className="h-8 text-xs" defaultValue={produto?.qtdAtual ?? 0} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Estoque mínimo *</Label>
              <Input type="number" min="0" className="h-8 text-xs" defaultValue={produto?.qtdMinima} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Validade</Label>
              <Input type="date" className="h-8 text-xs" defaultValue={produto?.validade} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Lote</Label>
              <Input className="h-8 text-xs" placeholder="Ex: LC-2024-001" defaultValue={produto?.lote} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fornecedor</Label>
            <Input className="h-8 text-xs" placeholder="Nome do fornecedor" defaultValue={produto?.fornecedor} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-xs" onClick={() => onOpenChange(false)}>
            {produto ? "Salvar alterações" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MovimentacaoModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {tipo === "entrada"
              ? <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
              : <ArrowUpCircle className="w-4 h-4 text-red-500" />}
            Registrar movimentação
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="flex rounded-lg border overflow-hidden text-xs font-semibold">
            {(["entrada", "saida"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                className={cn("flex-1 py-2 transition-colors", tipo === t
                  ? t === "entrada" ? "bg-emerald-600 text-white" : "bg-red-500 text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50")}
              >
                {t === "entrada" ? "Entrada" : "Saída"}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Produto *</Label>
            <Select>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecionar produto" /></SelectTrigger>
              <SelectContent>{PRODUTOS_MOCK.map(p => <SelectItem key={p.id} value={p.id} className="text-xs">{p.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Quantidade *</Label>
              <Input type="number" min="1" className="h-8 text-xs" placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Data</Label>
              <Input type="date" className="h-8 text-xs" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Motivo</Label>
            <Textarea placeholder="Descreva o motivo da movimentação..." rows={2} className="resize-none text-xs" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            size="sm"
            className={cn("text-xs", tipo === "entrada" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600")}
            onClick={() => onOpenChange(false)}
          >
            Registrar {tipo}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Aba Estoque Atual ────────────────────────────────────────────────────────

function AbaEstoqueAtual({ onMovimentar }: { onMovimentar: () => void }) {
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const filtrados = useMemo(() => {
    return PRODUTOS_MOCK.filter((p) => {
      const status = getStatus(p);
      const matchBusca = !busca || p.nome.toLowerCase().includes(busca.toLowerCase());
      const matchCat = filtroCategoria === "todos" || p.categoria === filtroCategoria;
      const matchStatus = filtroStatus === "todos" || status === filtroStatus;
      return matchBusca && matchCat && matchStatus;
    });
  }, [busca, filtroCategoria, filtroStatus]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
          <Input className="pl-8 h-8 text-xs" placeholder="Buscar produto..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas categorias</SelectItem>
            {CATEGORIAS.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos status</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="baixo">Baixo</SelectItem>
            <SelectItem value="zerado">Zerado</SelectItem>
            <SelectItem value="vencendo">Vencendo</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8" onClick={onMovimentar}>
          <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-600" />Registrar entrada
        </Button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50/60">
              {["Produto", "Categoria", "Qtd. Atual", "Mínimo", "Lote", "Validade", "Status", "Ações"].map(h => (
                <th key={h} className={cn("px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider",
                  ["Qtd. Atual", "Mínimo"].includes(h) ? "text-right" : "text-left"
                )}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtrados.map((p) => {
              const status = getStatus(p);
              const cfg = STATUS_CFG[status];
              const diasValidade = p.validade
                ? Math.ceil((new Date(p.validade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                : null;
              return (
                <tr key={p.id} className="hover:bg-slate-50/40 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                        <Package className="w-3.5 h-3.5 text-violet-500" />
                      </div>
                      <span className="font-medium text-slate-800 text-xs leading-tight">{p.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500">{p.categoria}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn(
                      "text-sm font-bold tabular-nums",
                      p.qtdAtual === 0 ? "text-red-500" : p.qtdAtual < p.qtdMinima ? "text-amber-600" : "text-slate-800"
                    )}>
                      {p.qtdAtual}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">{p.unidade}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-slate-400 tabular-nums">{p.qtdMinima} {p.unidade}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{p.lote || "—"}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-xs text-slate-600">{formatValidade(p.validade)}</p>
                      {diasValidade !== null && diasValidade <= 90 && (
                        <p className={cn("text-[10px]", diasValidade <= 30 ? "text-orange-500 font-semibold" : "text-slate-400")}>
                          {diasValidade > 0 ? `${diasValidade}d restantes` : "Vencido"}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border", cfg.cls)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 rounded hover:bg-violet-50 text-violet-500 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1 rounded hover:bg-red-50 text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-4 py-2.5 border-t bg-slate-50/60 text-xs text-slate-400">
          {filtrados.length} de {PRODUTOS_MOCK.length} produtos
        </div>
      </div>
    </div>
  );
}

// ─── Aba Movimentações ────────────────────────────────────────────────────────

function AbaMovimentacoes({ onRegistrar }: { onRegistrar: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{MOVIMENTACOES_MOCK.length} registros recentes</p>
        <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-xs gap-1.5 h-8" onClick={onRegistrar}>
          <Plus className="w-3.5 h-3.5" />Registrar movimentação
        </Button>
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        {MOVIMENTACOES_MOCK.map((m, idx) => {
          const isEntrada = m.tipo === "entrada";
          return (
            <div key={m.id} className="relative">
              {/* Day separator */}
              {(idx === 0 || MOVIMENTACOES_MOCK[idx - 1].data !== m.data) && (
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2">{m.data}</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
              )}

              <div className="flex gap-3 items-start bg-white rounded-xl border shadow-sm p-3 hover:border-slate-200 hover:shadow-md transition-all">
                {/* Icon */}
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                  isEntrada ? "bg-emerald-50" : "bg-red-50"
                )}>
                  {isEntrada
                    ? <ArrowDownCircle className="w-5 h-5 text-emerald-600" />
                    : <ArrowUpCircle className="w-5 h-5 text-red-500" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{m.produto}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{m.motivo}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn("text-sm font-bold tabular-nums", isEntrada ? "text-emerald-600" : "text-red-500")}>
                        {isEntrada ? "+" : "−"}{m.quantidade} {m.unidade}
                      </p>
                      <p className="text-[10px] text-slate-400">{m.hora}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">por {m.responsavel}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Aba Produtos (CRUD) ──────────────────────────────────────────────────────

function AbaProdutos() {
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [modalCadastro, setModalCadastro] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);

  const filtrados = useMemo(() => {
    return PRODUTOS_MOCK.filter(p =>
      (!busca || p.nome.toLowerCase().includes(busca.toLowerCase())) &&
      (filtroCategoria === "todos" || p.categoria === filtroCategoria)
    );
  }, [busca, filtroCategoria]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
          <Input className="pl-8 h-8 text-xs" placeholder="Buscar produto..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="Categoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas categorias</SelectItem>
            {CATEGORIAS.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button
          size="sm"
          className="bg-violet-600 hover:bg-violet-700 text-xs gap-1.5 h-8"
          onClick={() => { setProdutoEditando(null); setModalCadastro(true); }}
        >
          <Plus className="w-3.5 h-3.5" />Cadastrar produto
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtrados.map((p) => {
          const status = getStatus(p);
          const cfg = STATUS_CFG[status];
          const pct = p.qtdMinima > 0 ? Math.min((p.qtdAtual / p.qtdMinima) * 100, 100) : 100;
          return (
            <div key={p.id} className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md hover:border-slate-200 transition-all group">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                    <Package className="w-4.5 h-4.5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{p.nome}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{p.categoria} · {p.fornecedor || "—"}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    className="p-1 rounded hover:bg-violet-50 text-violet-400"
                    onClick={() => { setProdutoEditando(p); setModalCadastro(true); }}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 rounded hover:bg-red-50 text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Stock bar */}
              <div className="space-y-1 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Estoque</span>
                  <span className="font-bold text-slate-800 tabular-nums">{p.qtdAtual} / {p.qtdMinima} {p.unidade}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", status === "zerado" ? "bg-red-500" : status === "vencendo" ? "bg-orange-400" : status === "baixo" ? "bg-amber-400" : "bg-emerald-500")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <CalendarClock className="w-3 h-3" />
                  {formatValidade(p.validade)}
                </div>
                <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border", cfg.cls)}>
                  <span className={cn("w-1 h-1 rounded-full", cfg.dot)} />
                  {cfg.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <CadastrarProdutoModal
        open={modalCadastro}
        onOpenChange={(v) => { setModalCadastro(v); if (!v) setProdutoEditando(null); }}
        produto={produtoEditando}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EstoquePage() {
  const [modalMovimentacao, setModalMovimentacao] = useState(false);

  const zerados = PRODUTOS_MOCK.filter(p => getStatus(p) === "zerado").length;
  const baixo = PRODUTOS_MOCK.filter(p => getStatus(p) === "baixo").length;
  const vencendo = PRODUTOS_MOCK.filter(p => getStatus(p) === "vencendo").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Estoque de Insumos</h1>
          <p className="text-sm text-slate-400 mt-0.5">Controle de materiais, medicamentos e insumos</p>
        </div>
        <Button size="sm" className="bg-violet-600 hover:bg-violet-700 gap-1.5 text-xs h-8" onClick={() => setModalMovimentacao(true)}>
          <Plus className="w-3.5 h-3.5" />Movimentação
        </Button>
      </div>

      {/* Alert cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm", vencendo > 0 ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-200 opacity-60")}>
          <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
            <CalendarClock className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-orange-700">{vencendo}</p>
            <p className="text-[10px] font-semibold text-orange-600 leading-tight">
              {vencendo === 1 ? "produto vence" : "produtos vencem"} em menos de 30 dias
            </p>
          </div>
        </div>

        <div className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm", zerados > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200 opacity-60")}>
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <PackageX className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-red-700">{zerados}</p>
            <p className="text-[10px] font-semibold text-red-600 leading-tight">
              {zerados === 1 ? "produto com" : "produtos com"} estoque zerado
            </p>
          </div>
        </div>

        <div className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm", baixo > 0 ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200 opacity-60")}>
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <PackageMinus className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-amber-700">{baixo}</p>
            <p className="text-[10px] font-semibold text-amber-600 leading-tight">
              {baixo === 1 ? "produto abaixo" : "produtos abaixo"} do estoque mínimo
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="estoque">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="estoque" className="text-xs">Estoque Atual</TabsTrigger>
          <TabsTrigger value="movimentacoes" className="text-xs">Movimentações</TabsTrigger>
          <TabsTrigger value="produtos" className="text-xs">Produtos</TabsTrigger>
        </TabsList>

        <TabsContent value="estoque" className="mt-4">
          <AbaEstoqueAtual onMovimentar={() => setModalMovimentacao(true)} />
        </TabsContent>
        <TabsContent value="movimentacoes" className="mt-4">
          <AbaMovimentacoes onRegistrar={() => setModalMovimentacao(true)} />
        </TabsContent>
        <TabsContent value="produtos" className="mt-4">
          <AbaProdutos />
        </TabsContent>
      </Tabs>

      <MovimentacaoModal open={modalMovimentacao} onOpenChange={setModalMovimentacao} />
    </div>
  );
}
