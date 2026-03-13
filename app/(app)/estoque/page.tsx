"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  getProdutos,
  getMovimentacoes,
  criarProduto,
  atualizarProduto,
  deletarProduto,
  registrarMovimentacao,
  type ProdutoComMovimentacoes,
} from "@/lib/actions/estoque";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusEstoque = "normal" | "baixo" | "zerado" | "vencendo";

// Server returns this shape from getMovimentacoes
interface MovimentacaoServidor {
  id: string;
  tipo: string;
  quantidade: number;
  responsavel?: string | null;
  observacoes?: string | null;
  createdAt: Date;
  produto: { id: string; nome: string; unidade: string };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIAS = ["Medicamentos", "Material cirúrgico", "EPI", "Equipamentos", "Descartáveis", "Limpeza", "Outros"];
const UNIDADES = ["un", "cx", "amp", "fr", "kg", "L", "mL", "par", "rolo"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<StatusEstoque, { label: string; cls: string; dot: string }> = {
  normal: { label: "Normal", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  baixo: { label: "Baixo", cls: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  zerado: { label: "Zerado", cls: "bg-red-100 text-red-600 border-red-200", dot: "bg-red-500" },
  vencendo: { label: "Vencendo", cls: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500" },
};

function formatValidade(validade?: Date | null): string {
  if (!validade) return "—";
  const d = new Date(validade);
  return d.toLocaleDateString("pt-BR");
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function CadastrarProdutoModal({
  open,
  onOpenChange,
  produto,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  produto?: ProdutoComMovimentacoes | null;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [nome, setNome] = useState(produto?.nome ?? "");
  const [categoria, setCategoria] = useState(produto?.categoria ?? "");
  const [unidade, setUnidade] = useState(produto?.unidade ?? "");
  const [estoqueAtual, setEstoqueAtual] = useState(String(produto?.estoqueAtual ?? 0));
  const [estoqueMinimo, setEstoqueMinimo] = useState(String(produto?.estoqueMinimo ?? 0));
  const [validade, setValidade] = useState(
    produto?.validade ? new Date(produto.validade).toISOString().split("T")[0] : ""
  );

  // Reset fields when product changes
  useEffect(() => {
    setNome(produto?.nome ?? "");
    setCategoria(produto?.categoria ?? "");
    setUnidade(produto?.unidade ?? "");
    setEstoqueAtual(String(produto?.estoqueAtual ?? 0));
    setEstoqueMinimo(String(produto?.estoqueMinimo ?? 0));
    setValidade(produto?.validade ? new Date(produto.validade).toISOString().split("T")[0] : "");
  }, [produto]);

  const handleSubmit = async () => {
    if (!nome || !categoria || !unidade) return;
    setSaving(true);
    try {
      const payload = {
        nome,
        categoria,
        unidade,
        estoqueAtual: Number(estoqueAtual),
        estoqueMinimo: Number(estoqueMinimo),
        validade: validade || undefined,
      };
      if (produto) {
        await atualizarProduto(produto.id, payload);
        toast({ title: "Produto atualizado com sucesso!" });
      } else {
        await criarProduto(payload);
        toast({ title: "Produto cadastrado com sucesso!" });
      }
      onOpenChange(false);
      onSuccess();
    } catch {
      toast({ title: "Erro ao salvar produto", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

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
            <Input
              className="h-8 text-xs"
              placeholder="Ex: Luva cirúrgica estéril P"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Categoria *</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>{CATEGORIAS.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Unidade *</Label>
              <Select value={unidade} onValueChange={setUnidade}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>{UNIDADES.map(u => <SelectItem key={u} value={u} className="text-xs">{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Quantidade atual</Label>
              <Input
                type="number"
                min="0"
                className="h-8 text-xs"
                value={estoqueAtual}
                onChange={(e) => setEstoqueAtual(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Estoque mínimo *</Label>
              <Input
                type="number"
                min="0"
                className="h-8 text-xs"
                value={estoqueMinimo}
                onChange={(e) => setEstoqueMinimo(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Validade</Label>
            <Input
              type="date"
              className="h-8 text-xs"
              value={validade}
              onChange={(e) => setValidade(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button
            size="sm"
            className="bg-violet-600 hover:bg-violet-700 text-xs"
            disabled={!nome || !categoria || !unidade || saving}
            onClick={handleSubmit}
          >
            {saving ? "Salvando..." : produto ? "Salvar alterações" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MovimentacaoModal({
  open,
  onOpenChange,
  produtos,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  produtos: ProdutoComMovimentacoes[];
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [tipo, setTipo] = useState<"ENTRADA" | "SAIDA">("ENTRADA");
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!produtoId || !quantidade) return;
    setSaving(true);
    try {
      await registrarMovimentacao({
        produtoId,
        tipo,
        quantidade: Number(quantidade),
        responsavel: responsavel || undefined,
        observacoes: observacoes || undefined,
      });
      toast({ title: "Movimentação registrada com sucesso!" });
      // Reset form
      setProdutoId("");
      setQuantidade("");
      setResponsavel("");
      setObservacoes("");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao registrar movimentação";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            {tipo === "ENTRADA"
              ? <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
              : <ArrowUpCircle className="w-4 h-4 text-red-500" />}
            Registrar movimentação
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="flex rounded-lg border overflow-hidden text-xs font-semibold">
            {(["ENTRADA", "SAIDA"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                className={cn("flex-1 py-2 transition-colors", tipo === t
                  ? t === "ENTRADA" ? "bg-emerald-600 text-white" : "bg-red-500 text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50")}
              >
                {t === "ENTRADA" ? "Entrada" : "Saída"}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Produto *</Label>
            <Select value={produtoId} onValueChange={setProdutoId}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecionar produto" /></SelectTrigger>
              <SelectContent>
                {produtos.map(p => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Quantidade *</Label>
              <Input
                type="number"
                min="1"
                className="h-8 text-xs"
                placeholder="0"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Responsável</Label>
              <Input
                className="h-8 text-xs"
                placeholder="Nome"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Motivo / Observações</Label>
            <Textarea
              placeholder="Descreva o motivo da movimentação..."
              rows={2}
              className="resize-none text-xs"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button
            size="sm"
            className={cn("text-xs", tipo === "ENTRADA" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600")}
            disabled={!produtoId || !quantidade || saving}
            onClick={handleSubmit}
          >
            {saving ? "Registrando..." : `Registrar ${tipo === "ENTRADA" ? "entrada" : "saída"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Aba Estoque Atual ────────────────────────────────────────────────────────

function AbaEstoqueAtual({
  produtos,
  totalProdutos,
  loading,
  onMovimentar,
  onEdit,
  onDelete,
  onFiltroChange,
}: {
  produtos: ProdutoComMovimentacoes[];
  totalProdutos: number;
  loading: boolean;
  onMovimentar: () => void;
  onEdit: (p: ProdutoComMovimentacoes) => void;
  onDelete: (id: string) => void;
  onFiltroChange: (filtros: { busca?: string; categoria?: string; status?: string }) => void;
}) {
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  useEffect(() => {
    onFiltroChange({
      busca: busca || undefined,
      categoria: filtroCategoria !== "todos" ? filtroCategoria : undefined,
      status: filtroStatus !== "todos" ? filtroStatus : undefined,
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
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50/60">
                  {["Produto", "Categoria", "Qtd. Atual", "Mínimo", "Validade", "Status", "Ações"].map(h => (
                    <th key={h} className={cn("px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider",
                      ["Qtd. Atual", "Mínimo"].includes(h) ? "text-right" : "text-left"
                    )}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {produtos.map((p) => {
                  const cfg = STATUS_CFG[p.status];
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
                          p.estoqueAtual === 0 ? "text-red-500" : p.estoqueAtual < p.estoqueMinimo ? "text-amber-600" : "text-slate-800"
                        )}>
                          {p.estoqueAtual}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">{p.unidade}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-slate-400 tabular-nums">{p.estoqueMinimo} {p.unidade}</td>
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
                          <button
                            className="p-1 rounded hover:bg-violet-50 text-violet-500 transition-colors"
                            onClick={() => onEdit(p)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1 rounded hover:bg-red-50 text-red-400 transition-colors"
                            onClick={() => onDelete(p.id)}
                          >
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
              {produtos.length} de {totalProdutos} produtos
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Aba Movimentações ────────────────────────────────────────────────────────

function AbaMovimentacoes({
  movimentacoes,
  loading,
  onRegistrar,
}: {
  movimentacoes: MovimentacaoServidor[];
  loading: boolean;
  onRegistrar: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{movimentacoes.length} registros recentes</p>
        <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-xs gap-1.5 h-8" onClick={onRegistrar}>
          <Plus className="w-3.5 h-3.5" />Registrar movimentação
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        /* Timeline */
        <div className="space-y-2">
          {movimentacoes.map((m, idx) => {
            const isEntrada = m.tipo === "ENTRADA";
            const dataStr = new Date(m.createdAt).toLocaleDateString("pt-BR");
            const horaStr = new Date(m.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
            const prevDataStr = idx > 0 ? new Date(movimentacoes[idx - 1].createdAt).toLocaleDateString("pt-BR") : null;

            return (
              <div key={m.id} className="relative">
                {/* Day separator */}
                {(idx === 0 || prevDataStr !== dataStr) && (
                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2">{dataStr}</span>
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
                        <p className="text-sm font-semibold text-slate-800">{m.produto.nome}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{m.observacoes || "—"}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn("text-sm font-bold tabular-nums", isEntrada ? "text-emerald-600" : "text-red-500")}>
                          {isEntrada ? "+" : "−"}{m.quantidade} {m.produto.unidade}
                        </p>
                        <p className="text-[10px] text-slate-400">{horaStr}</p>
                      </div>
                    </div>
                    {m.responsavel && (
                      <p className="text-[10px] text-slate-400 mt-1">por {m.responsavel}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Aba Produtos (CRUD) ──────────────────────────────────────────────────────

function AbaProdutos({
  produtos,
  loading,
  onRefresh,
}: {
  produtos: ProdutoComMovimentacoes[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [modalCadastro, setModalCadastro] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<ProdutoComMovimentacoes | null>(null);
  const { toast } = useToast();

  const filtrados = useMemo(() => {
    return produtos.filter(p =>
      (!busca || p.nome.toLowerCase().includes(busca.toLowerCase())) &&
      (filtroCategoria === "todos" || p.categoria === filtroCategoria)
    );
  }, [produtos, busca, filtroCategoria]);

  const handleDelete = async (id: string) => {
    try {
      await deletarProduto(id);
      toast({ title: "Produto removido com sucesso!" });
      onRefresh();
    } catch {
      toast({ title: "Erro ao remover produto", variant: "destructive" });
    }
  };

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

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtrados.map((p) => {
            const cfg = STATUS_CFG[p.status];
            const pct = p.estoqueMinimo > 0 ? Math.min((p.estoqueAtual / p.estoqueMinimo) * 100, 100) : 100;
            return (
              <div key={p.id} className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md hover:border-slate-200 transition-all group">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 leading-tight">{p.nome}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{p.categoria}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      className="p-1 rounded hover:bg-violet-50 text-violet-400"
                      onClick={() => { setProdutoEditando(p); setModalCadastro(true); }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-red-50 text-red-400"
                      onClick={() => handleDelete(p.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stock bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Estoque</span>
                    <span className="font-bold text-slate-800 tabular-nums">{p.estoqueAtual} / {p.estoqueMinimo} {p.unidade}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all",
                        p.status === "zerado" ? "bg-red-500"
                        : p.status === "vencendo" ? "bg-orange-400"
                        : p.status === "baixo" ? "bg-amber-400"
                        : "bg-emerald-500"
                      )}
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
      )}

      <CadastrarProdutoModal
        open={modalCadastro}
        onOpenChange={(v) => { setModalCadastro(v); if (!v) setProdutoEditando(null); }}
        produto={produtoEditando}
        onSuccess={onRefresh}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EstoquePage() {
  const { toast } = useToast();

  const [produtos, setProdutos] = useState<ProdutoComMovimentacoes[]>([]);
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [alertas, setAlertas] = useState({ zerados: 0, baixo: 0, vencendo: 0 });
  const [loadingProdutos, setLoadingProdutos] = useState(true);

  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoServidor[]>([]);
  const [loadingMovimentacoes, setLoadingMovimentacoes] = useState(true);

  const [modalMovimentacao, setModalMovimentacao] = useState(false);

  // Current filters used by AbaEstoqueAtual
  const [filtros, setFiltros] = useState<{ busca?: string; categoria?: string; status?: string }>({});

  const fetchProdutos = useCallback(async (f?: { busca?: string; categoria?: string; status?: string }) => {
    setLoadingProdutos(true);
    getProdutos(f ?? filtros)
      .then(({ produtos: p, alertas: a }) => {
        setProdutos(p);
        setTotalProdutos(p.length);
        setAlertas(a);
      })
      .catch(() => toast({ title: "Erro ao carregar produtos", variant: "destructive" }))
      .finally(() => setLoadingProdutos(false));
  }, [filtros, toast]);

  const fetchMovimentacoes = useCallback(async () => {
    setLoadingMovimentacoes(true);
    getMovimentacoes()
      .then((data) => setMovimentacoes(data as unknown as MovimentacaoServidor[]))
      .catch(() => toast({ title: "Erro ao carregar movimentações", variant: "destructive" }))
      .finally(() => setLoadingMovimentacoes(false));
  }, [toast]);

  useEffect(() => {
    fetchProdutos();
    fetchMovimentacoes();
  }, []);

  const handleFiltroChange = (novosFiltros: { busca?: string; categoria?: string; status?: string }) => {
    setFiltros(novosFiltros);
    fetchProdutos(novosFiltros);
  };

  const handleDeleteProduto = async (id: string) => {
    try {
      await deletarProduto(id);
      toast({ title: "Produto removido com sucesso!" });
      fetchProdutos();
    } catch {
      toast({ title: "Erro ao remover produto", variant: "destructive" });
    }
  };

  const handleMovimentacaoSuccess = () => {
    fetchProdutos();
    fetchMovimentacoes();
  };

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
        <div className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm", alertas.vencendo > 0 ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-200 opacity-60")}>
          <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
            <CalendarClock className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            {loadingProdutos
              ? <Skeleton className="h-7 w-12 mb-1" />
              : <p className="text-xl font-bold text-orange-700">{alertas.vencendo}</p>
            }
            <p className="text-[10px] font-semibold text-orange-600 leading-tight">
              {alertas.vencendo === 1 ? "produto vence" : "produtos vencem"} em menos de 30 dias
            </p>
          </div>
        </div>

        <div className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm", alertas.zerados > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200 opacity-60")}>
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
            <PackageX className="w-5 h-5 text-red-600" />
          </div>
          <div>
            {loadingProdutos
              ? <Skeleton className="h-7 w-12 mb-1" />
              : <p className="text-xl font-bold text-red-700">{alertas.zerados}</p>
            }
            <p className="text-[10px] font-semibold text-red-600 leading-tight">
              {alertas.zerados === 1 ? "produto com" : "produtos com"} estoque zerado
            </p>
          </div>
        </div>

        <div className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm", alertas.baixo > 0 ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200 opacity-60")}>
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <PackageMinus className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            {loadingProdutos
              ? <Skeleton className="h-7 w-12 mb-1" />
              : <p className="text-xl font-bold text-amber-700">{alertas.baixo}</p>
            }
            <p className="text-[10px] font-semibold text-amber-600 leading-tight">
              {alertas.baixo === 1 ? "produto abaixo" : "produtos abaixo"} do estoque mínimo
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
          <AbaEstoqueAtual
            produtos={produtos}
            totalProdutos={totalProdutos}
            loading={loadingProdutos}
            onMovimentar={() => setModalMovimentacao(true)}
            onEdit={(_p) => {
              // Edit is handled inside AbaProdutos tab via its own modal
            }}
            onDelete={handleDeleteProduto}
            onFiltroChange={handleFiltroChange}
          />
        </TabsContent>
        <TabsContent value="movimentacoes" className="mt-4">
          <AbaMovimentacoes
            movimentacoes={movimentacoes}
            loading={loadingMovimentacoes}
            onRegistrar={() => setModalMovimentacao(true)}
          />
        </TabsContent>
        <TabsContent value="produtos" className="mt-4">
          <AbaProdutos
            produtos={produtos}
            loading={loadingProdutos}
            onRefresh={fetchProdutos}
          />
        </TabsContent>
      </Tabs>

      <MovimentacaoModal
        open={modalMovimentacao}
        onOpenChange={setModalMovimentacao}
        produtos={produtos}
        onSuccess={handleMovimentacaoSuccess}
      />
    </div>
  );
}
