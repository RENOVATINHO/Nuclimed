# Modelos e Chat IA (Pulso) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar as páginas `/consulta/modelos` (gerenciamento de modelos de anamnese) e `/consulta/chat` (chat com Pulso IA) com todos os componentes descritos no design doc.

**Architecture:** Componentes client React separados por responsabilidade — cada arquivo tem uma única função. As páginas importam os componentes e orquestram o estado. Mock data é usada localmente; nenhuma API real é chamada.

**Tech Stack:** Next.js 14 App Router, TypeScript (strict), Tailwind CSS, shadcn/ui (Button, Card, Input, Textarea, Badge, Dialog, Tabs, Select, DropdownMenu, Avatar, Separator), lucide-react, date-fns, `MODELOS_PADRAO` + `ESPECIALIDADES` de `lib/constants.ts`.

**Spec:** `docs/superpowers/specs/2026-03-11-modelos-chat-ia-design.md`

---

## Chunk 1: Componente ModeloCard

### Task 1: Criar `components/consulta/ModeloCard.tsx`

**Files:**
- Create: `components/consulta/ModeloCard.tsx`

- [ ] **Step 1: Criar o componente ModeloCard**

```tsx
"use client";

import { MoreVertical, Play, Copy, Pencil, Trash2, Clock, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface ModeloItem {
  id: string;
  nome: string;
  descricao: string;
  especialidade: string | null;
  usos: number;
  ultimaUtilizacao: string | null;
  tipo: "padrao" | "personalizado";
}

interface ModeloCardProps {
  modelo: ModeloItem;
  onUsar: (id: string) => void;
  onEditar?: (id: string) => void;
  onDuplicar: (id: string) => void;
  onExcluir?: (id: string) => void;
}

export function ModeloCard({ modelo, onUsar, onEditar, onDuplicar, onExcluir }: ModeloCardProps) {
  const isPersonalizado = modelo.tipo === "personalizado";

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-slate-800 text-sm leading-tight truncate">
                {modelo.nome}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {isPersonalizado ? (
                <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50 text-xs">
                  Personalizado
                </Badge>
              ) : (
                <Badge variant="outline" className="text-violet-700 border-violet-300 bg-violet-50 text-xs">
                  Nuclimed
                </Badge>
              )}
              {modelo.especialidade && (
                <Badge variant="secondary" className="text-xs">
                  {modelo.especialidade}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 text-slate-400 hover:text-slate-600">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onUsar(modelo.id)}>
                <Play className="h-4 w-4 mr-2 text-violet-600" />
                Usar modelo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicar(modelo.id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              {isPersonalizado && onEditar && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onEditar(modelo.id)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                </>
              )}
              {isPersonalizado && onExcluir && (
                <DropdownMenuItem
                  onClick={() => onExcluir(modelo.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 pt-0">
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          {modelo.descricao}
        </p>

        <div className="flex items-center gap-3 text-xs text-slate-400 mt-auto">
          <span className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            {modelo.usos} {modelo.usos === 1 ? "uso" : "usos"}
          </span>
          {modelo.ultimaUtilizacao && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {modelo.ultimaUtilizacao}
            </span>
          )}
        </div>

        <Button
          size="sm"
          className="w-full bg-violet-600 hover:bg-violet-700 text-white mt-1"
          onClick={() => onUsar(modelo.id)}
        >
          <Play className="h-3.5 w-3.5 mr-1.5" />
          Usar modelo
        </Button>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd c:/Users/guilh/Desktop/Nuclimed/Nuclimed && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros relacionados a `ModeloCard.tsx`.

- [ ] **Step 3: Commit**

```bash
cd c:/Users/guilh/Desktop/Nuclimed/Nuclimed
git add components/consulta/ModeloCard.tsx
git commit -m "feat: add ModeloCard component for template listing"
```

---

## Chunk 2: Modal CriarModeloModal

### Task 2: Criar `components/consulta/CriarModeloModal.tsx`

**Files:**
- Create: `components/consulta/CriarModeloModal.tsx`

- [ ] **Step 1: Criar o componente CriarModeloModal**

```tsx
"use client";

import { useState } from "react";
import { Sparkles, Loader2, RefreshCw, Check, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MODELOS_PADRAO } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CriarModeloModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSalvar: (nome: string, conteudo: string) => void;
}

const EXEMPLOS_PROMPTS = [
  "Quero anamnese para pediatria",
  "Quero modelo de laudo de perícia",
  "Modelo para consulta de retorno em cardiologia",
  "Anamnese focada em dor crônica",
];

const PREVIEW_MOCK = `**ANAMNESE — MODELO GERADO**

**1. Identificação**
Nome: _______________ | Idade: ___ | Sexo: ___
Data: _______________ | Médico: _______________

**2. Queixa Principal (QP)**
_________________________________________________

**3. História da Doença Atual (HDA)**
Início: ___ | Duração: ___ | Intensidade: ___/10
Fatores de melhora: ___________________________
Fatores de piora: _____________________________
Sintomas associados: __________________________

**4. Antecedentes Pessoais**
[ ] HAS  [ ] DM  [ ] Cardiopatia  [ ] Outros: ___

**5. Medicamentos em uso**
_________________________________________________

**6. Alergias**
[ ] Nega  [ ] SIM: __________________________

**7. Exame Físico**
PA: ___/___  FC: ___  FR: ___  T: ___°C
SpO2: ___%  Peso: ___kg  Altura: ___m

**8. Hipótese Diagnóstica**
_________________________________________________

**9. Conduta**
_________________________________________________`;

export function CriarModeloModal({ open, onOpenChange, onSalvar }: CriarModeloModalProps) {
  const [abaAtiva, setAbaAtiva] = useState("ia");
  const [promptIA, setPromptIA] = useState("");
  const [conteudoExemplo, setConteudoExemplo] = useState("");
  const [modeloBase, setModeloBase] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [nomeGerado, setNomeGerado] = useState("");

  function simularGeracao(nome: string) {
    setGerando(true);
    setPreview(null);
    setTimeout(() => {
      setGerando(false);
      setNomeGerado(nome || "Modelo Personalizado");
      setPreview(PREVIEW_MOCK);
    }, 2000);
  }

  function handleGerarComIA() {
    if (!promptIA.trim()) return;
    simularGeracao(promptIA.split(" ").slice(-3).join(" "));
  }

  function handleCriarDeExemplo() {
    if (!conteudoExemplo.trim()) return;
    simularGeracao("Modelo do Exemplo");
  }

  function handleCriarDeExistente() {
    if (!modeloBase) return;
    const base = MODELOS_PADRAO.find((m) => m.id === modeloBase);
    simularGeracao(base ? `Baseado em ${base.nome}` : "Modelo Personalizado");
  }

  function handleUsarEste() {
    if (!preview) return;
    onSalvar(nomeGerado, preview);
    onOpenChange(false);
    resetar();
  }

  function resetar() {
    setPromptIA("");
    setConteudoExemplo("");
    setModeloBase(null);
    setPreview(null);
    setGerando(false);
    setNomeGerado("");
    setAbaAtiva("ia");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetar(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-violet-600" />
            Criar Novo Modelo
          </DialogTitle>
        </DialogHeader>

        {!preview && !gerando && (
          <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="mt-2">
            <TabsList className="w-full">
              <TabsTrigger value="ia" className="flex-1 text-xs sm:text-sm">Criar com IA</TabsTrigger>
              <TabsTrigger value="exemplo" className="flex-1 text-xs sm:text-sm">A partir de exemplo</TabsTrigger>
              <TabsTrigger value="existente" className="flex-1 text-xs sm:text-sm">A partir de existente</TabsTrigger>
            </TabsList>

            {/* ABA: Criar com IA */}
            <TabsContent value="ia" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Descreva o modelo que precisa
                </label>
                <Textarea
                  placeholder="Ex: Quero uma anamnese completa para consulta pediátrica com seção de desenvolvimento neuromotor..."
                  className="min-h-[100px] resize-none"
                  value={promptIA}
                  onChange={(e) => setPromptIA(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-500">Exemplos:</p>
                <div className="flex flex-wrap gap-2">
                  {EXEMPLOS_PROMPTS.map((exemplo) => (
                    <button
                      key={exemplo}
                      type="button"
                      onClick={() => setPromptIA(exemplo)}
                      className="text-xs px-3 py-1.5 rounded-full border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
                    >
                      {exemplo}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-violet-600 hover:bg-violet-700"
                onClick={handleGerarComIA}
                disabled={!promptIA.trim()}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar com IA
              </Button>
            </TabsContent>

            {/* ABA: A partir de exemplo */}
            <TabsContent value="exemplo" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Cole aqui sua anamnese ou exemplo
                </label>
                <Textarea
                  placeholder="Cole aqui o texto da sua anamnese, laudo ou qualquer modelo que deseja usar como base..."
                  className="min-h-[180px] resize-none font-mono text-xs"
                  value={conteudoExemplo}
                  onChange={(e) => setConteudoExemplo(e.target.value)}
                />
              </div>

              <Button
                className="w-full bg-violet-600 hover:bg-violet-700"
                onClick={handleCriarDeExemplo}
                disabled={!conteudoExemplo.trim()}
              >
                <FileText className="h-4 w-4 mr-2" />
                Criar modelo
              </Button>
            </TabsContent>

            {/* ABA: A partir de existente */}
            <TabsContent value="existente" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Selecione um modelo como base
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {MODELOS_PADRAO.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setModeloBase(m.id)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors",
                        modeloBase === m.id
                          ? "border-violet-400 bg-violet-50 text-violet-800"
                          : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{m.nome}</span>
                        {modeloBase === m.id && <Check className="h-4 w-4 text-violet-600" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{m.descricao}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-violet-600 hover:bg-violet-700"
                onClick={handleCriarDeExistente}
                disabled={!modeloBase}
              >
                <ChevronRight className="h-4 w-4 mr-2" />
                Usar como base
              </Button>
            </TabsContent>
          </Tabs>
        )}

        {/* Estado: Gerando */}
        {gerando && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-violet-100 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-violet-600" />
              </div>
              <Loader2 className="absolute -top-1 -right-1 h-6 w-6 text-violet-600 animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-medium text-slate-700">Gerando modelo...</p>
              <p className="text-sm text-slate-400 mt-1">A IA está criando seu modelo personalizado</p>
            </div>
          </div>
        )}

        {/* Preview do modelo gerado */}
        {preview && !gerando && (
          <div className="space-y-4 mt-2">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-600" />
              <span className="font-medium text-slate-700">Modelo gerado: <span className="text-violet-700">{nomeGerado}</span></span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">
                {preview}
              </pre>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                className="flex-1 bg-violet-600 hover:bg-violet-700"
                onClick={handleUsarEste}
              >
                <Check className="h-4 w-4 mr-2" />
                Usar este
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setPreview(null); }}
              >
                Ajustar
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => simularGeracao(nomeGerado)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Gerar novamente
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd c:/Users/guilh/Desktop/Nuclimed/Nuclimed && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros em `CriarModeloModal.tsx`.

- [ ] **Step 3: Commit**

```bash
cd c:/Users/guilh/Desktop/Nuclimed/Nuclimed
git add components/consulta/CriarModeloModal.tsx
git commit -m "feat: add CriarModeloModal with 3-tab AI generation flow"
```

---

## Chunk 3: Página Modelos

### Task 3: Implementar `/app/(app)/consulta/modelos/page.tsx`

**Files:**
- Modify: `app/(app)/consulta/modelos/page.tsx`

- [ ] **Step 1: Reescrever a página de modelos**

```tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ModeloCard, type ModeloItem } from "@/components/consulta/ModeloCard";
import { CriarModeloModal } from "@/components/consulta/CriarModeloModal";
import { MODELOS_PADRAO, ESPECIALIDADES } from "@/lib/constants";

// Converte MODELOS_PADRAO para ModeloItem[]
const MODELOS_NUCLIMED: ModeloItem[] = MODELOS_PADRAO.map((m, i) => ({
  id: m.id,
  nome: m.nome,
  descricao: m.descricao,
  especialidade: m.especialidade ?? null,
  usos: Math.floor(Math.random() * 40) + 5,
  ultimaUtilizacao: i % 3 === 0 ? "há 2 dias" : i % 3 === 1 ? "há 1 semana" : null,
  tipo: "padrao" as const,
}));

const MODELOS_MOCK_USUARIO: ModeloItem[] = [
  {
    id: "personalizado-1",
    nome: "Retorno Ortopédico",
    descricao: "Modelo de retorno pós-cirúrgico para ortopedia com avaliação de reabilitação.",
    especialidade: "Ortopedia e Traumatologia",
    usos: 12,
    ultimaUtilizacao: "ontem",
    tipo: "personalizado",
  },
  {
    id: "personalizado-2",
    nome: "Check-up Executivo",
    descricao: "Avaliação preventiva completa voltada para pacientes executivos com foco em fatores de risco cardiovascular.",
    especialidade: "Clínica Geral",
    usos: 8,
    ultimaUtilizacao: "há 3 dias",
    tipo: "personalizado",
  },
];

export default function ModelosConsultaPage() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [filtroEspecialidade, setFiltroEspecialidade] = useState("todas");
  const [modalAberto, setModalAberto] = useState(false);
  const [modelosUsuario, setModelosUsuario] = useState<ModeloItem[]>(MODELOS_MOCK_USUARIO);

  const modelosNuclimedFiltrados = useMemo(
    () =>
      MODELOS_NUCLIMED.filter((m) => {
        const matchBusca =
          m.nome.toLowerCase().includes(busca.toLowerCase()) ||
          m.descricao.toLowerCase().includes(busca.toLowerCase());
        const matchEsp =
          filtroEspecialidade === "todas" || m.especialidade === filtroEspecialidade;
        return matchBusca && matchEsp;
      }),
    [busca, filtroEspecialidade]
  );

  const modelosUsuarioFiltrados = useMemo(
    () =>
      modelosUsuario.filter((m) => {
        const matchBusca =
          m.nome.toLowerCase().includes(busca.toLowerCase()) ||
          m.descricao.toLowerCase().includes(busca.toLowerCase());
        const matchEsp =
          filtroEspecialidade === "todas" || m.especialidade === filtroEspecialidade;
        return matchBusca && matchEsp;
      }),
    [busca, filtroEspecialidade, modelosUsuario]
  );

  function handleUsar(id: string) {
    router.push(`/consulta/nova?modelo=${id}`);
  }

  function handleDuplicar(id: string) {
    const base = [...MODELOS_NUCLIMED, ...modelosUsuario].find((m) => m.id === id);
    if (!base) return;
    setModelosUsuario((prev) => [
      ...prev,
      {
        ...base,
        id: `copia-${Date.now()}`,
        nome: `${base.nome} (cópia)`,
        usos: 0,
        ultimaUtilizacao: null,
        tipo: "personalizado",
      },
    ]);
  }

  function handleExcluir(id: string) {
    setModelosUsuario((prev) => prev.filter((m) => m.id !== id));
  }

  function handleSalvarNovoModelo(nome: string, conteudo: string) {
    setModelosUsuario((prev) => [
      {
        id: `novo-${Date.now()}`,
        nome,
        descricao: conteudo.substring(0, 120) + "...",
        especialidade: null,
        usos: 0,
        ultimaUtilizacao: null,
        tipo: "personalizado",
      },
      ...prev,
    ]);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Meus Modelos</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gerencie e utilize modelos de anamnese para suas consultas
          </p>
        </div>
        <Button
          className="bg-violet-600 hover:bg-violet-700"
          onClick={() => setModalAberto(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Criar modelo
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar modelos..."
            className="pl-9"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Select value={filtroEspecialidade} onValueChange={setFiltroEspecialidade}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Especialidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas especialidades</SelectItem>
            {ESPECIALIDADES.map((e) => (
              <SelectItem key={e} value={e}>{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Seção: Modelos do Nuclimed */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            Modelos do Nuclimed
          </h2>
          <Separator className="flex-1" />
          <span className="text-xs text-slate-400">{modelosNuclimedFiltrados.length} modelos</span>
        </div>
        {modelosNuclimedFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modelosNuclimedFiltrados.map((modelo) => (
              <ModeloCard
                key={modelo.id}
                modelo={modelo}
                onUsar={handleUsar}
                onDuplicar={handleDuplicar}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 py-4 text-center">
            Nenhum modelo encontrado para os filtros selecionados.
          </p>
        )}
      </section>

      {/* Seção: Meus Modelos */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            Meus Modelos
          </h2>
          <Separator className="flex-1" />
          <span className="text-xs text-slate-400">{modelosUsuarioFiltrados.length} modelos</span>
        </div>
        {modelosUsuarioFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modelosUsuarioFiltrados.map((modelo) => (
              <ModeloCard
                key={modelo.id}
                modelo={modelo}
                onUsar={handleUsar}
                onDuplicar={handleDuplicar}
                onExcluir={handleExcluir}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-xl text-center">
            <p className="text-slate-500 font-medium mb-1">Nenhum modelo personalizado ainda</p>
            <p className="text-sm text-slate-400 mb-4">Crie seu primeiro modelo com IA ou a partir de um exemplo</p>
            <Button
              variant="outline"
              className="border-violet-300 text-violet-700 hover:bg-violet-50"
              onClick={() => setModalAberto(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar modelo
            </Button>
          </div>
        )}
      </section>

      <CriarModeloModal
        open={modalAberto}
        onOpenChange={setModalAberto}
        onSalvar={handleSalvarNovoModelo}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd c:/Users/guilh/Desktop/Nuclimed/Nuclimed && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros.

- [ ] **Step 3: Testar visualmente**

Rodar `npm run dev` e navegar para `http://localhost:3000/consulta/modelos`.
Verificar: grid de cards, filtros, botão "Criar modelo", modal com 3 abas, loading e preview.

- [ ] **Step 4: Commit**

```bash
cd c:/Users/guilh/Desktop/Nuclimed/Nuclimed
git add app/\(app\)/consulta/modelos/page.tsx
git commit -m "feat: implement consulta/modelos page with grid, filters and create modal"
```

---

## Chunk 4: Componentes do Chat

### Task 4: Criar componentes de suporte ao Chat

**Files:**
- Create: `components/consulta/ChatSidebar.tsx`
- Create: `components/consulta/ChatInput.tsx`

- [ ] **Step 1: Criar ChatSidebar**

```tsx
"use client";

import { Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface Conversa {
  id: string;
  titulo: string;
  preview: string;
  data: string;
  grupo: string;
}

interface ChatSidebarProps {
  conversas: Conversa[];
  conversaAtiva: string | null;
  onSelecionar: (id: string) => void;
  onNova: () => void;
}

export function ChatSidebar({ conversas, conversaAtiva, onSelecionar, onNova }: ChatSidebarProps) {
  const grupos = Array.from(new Set(conversas.map((c) => c.grupo)));

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-slate-900 border-r border-slate-700 h-full">
      <div className="p-3">
        <Button
          className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          onClick={onNova}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova conversa
        </Button>
      </div>

      <Separator className="bg-slate-700" />

      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-4">
        {grupos.map((grupo) => (
          <div key={grupo}>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2 mb-1">
              {grupo}
            </p>
            <div className="space-y-0.5">
              {conversas
                .filter((c) => c.grupo === grupo)
                .map((conversa) => (
                  <button
                    key={conversa.id}
                    type="button"
                    onClick={() => onSelecionar(conversa.id)}
                    className={cn(
                      "w-full text-left px-2 py-2 rounded-lg transition-colors group",
                      conversaAtiva === conversa.id
                        ? "bg-violet-700/40 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 opacity-60" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate leading-tight">
                          {conversa.titulo}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5 group-hover:text-slate-400">
                          {conversa.preview}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Criar ChatInput**

```tsx
"use client";

import { useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  valor: string;
  onChange: (v: string) => void;
  onEnviar: () => void;
  desabilitado?: boolean;
}

export function ChatInput({ valor, onChange, onEnviar, desabilitado }: ChatInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (valor.trim() && !desabilitado) onEnviar();
    }
  }

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      <div className="flex gap-3 items-end max-w-4xl mx-auto">
        <Textarea
          ref={ref}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte sobre CID, condutas, medicações..."
          className="min-h-[44px] max-h-[120px] resize-none flex-1 text-sm"
          disabled={desabilitado}
          rows={1}
        />
        <Button
          size="icon"
          className={cn(
            "h-11 w-11 flex-shrink-0 transition-colors",
            valor.trim() && !desabilitado
              ? "bg-violet-600 hover:bg-violet-700"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          )}
          onClick={() => { if (valor.trim() && !desabilitado) onEnviar(); }}
          disabled={!valor.trim() || desabilitado}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-slate-400 text-center mt-2 max-w-4xl mx-auto">
        As respostas são informativas e não substituem o julgamento clínico.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Verificar TypeScript**

```bash
cd c:/Users/guilh/Desktop/Nuclimed/Nuclimed && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros.

- [ ] **Step 4: Commit**

```bash
cd c:/Users/guilh/Desktop/Nuclimed/Nuclimed
git add components/consulta/ChatSidebar.tsx components/consulta/ChatInput.tsx
git commit -m "feat: add ChatSidebar and ChatInput components"
```

---

## Chunk 5: Página Chat

### Task 5: Implementar `/app/(app)/consulta/chat/page.tsx`

**Files:**
- Modify: `app/(app)/consulta/chat/page.tsx`

- [ ] **Step 1: Reescrever a página de chat**

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChatSidebar, type Conversa } from "@/components/consulta/ChatSidebar";
import { ChatInput } from "@/components/consulta/ChatInput";
import { cn } from "@/lib/utils";

interface Mensagem {
  id: string;
  papel: "usuario" | "ia";
  conteudo: string;
  timestamp: string;
  digitando?: boolean;
}

const SUGESTOES = [
  "Qual a conduta para hipertensão estágio 2?",
  "Quais os critérios diagnósticos para diabetes tipo 2?",
  "Interações medicamentosas entre metformina e outros antidiabéticos",
  "Explique o escore de Wells para TEP",
];

const RESPOSTAS_MOCK = [
  `**Hipertensão Arterial Estágio 2** (PAS ≥ 160 ou PAD ≥ 100 mmHg)

A conduta inclui:
- **Modificações do estilo de vida** (MEV): dieta DASH, redução de sódio, atividade física regular
- **Terapia medicamentosa**: indicada imediatamente. Primeira linha: IECA/BRA + diurético tiazídico ou bloqueador de canal de cálcio
- **Meta terapêutica**: < 130/80 mmHg para a maioria dos pacientes

Referência: 7ª Diretriz Brasileira de Hipertensão Arterial (SBC, 2020).`,

  `**Critérios Diagnósticos para DM Tipo 2** (ADA/SBD):

Qualquer um dos critérios abaixo:
1. **Glicemia de jejum** ≥ 126 mg/dL (2 medições)
2. **Glicemia 2h** após TOTG ≥ 200 mg/dL
3. **HbA1c** ≥ 6,5% (método certificado)
4. **Glicemia casual** ≥ 200 mg/dL com sintomas clássicos

Nota: Na ausência de hiperglicemia sintomática, repetir o teste confirmatório.`,

  `**Interações Metformina x Antidiabéticos:**

- **Sulfonilureias**: risco de hipoglicemia (sinérgico). Monitorar glicemia.
- **Inibidores SGLT-2**: associação benéfica, baixo risco de hipoglicemia. Verificar função renal.
- **Análogos de GLP-1**: sinergia no controle glicêmico e peso. Combinação frequente.
- **Insulina**: pode potencializar efeito hipoglicemiante. Ajuste de dose necessário.
- **Contraindicação**: metformina deve ser suspensa se TFG < 30 mL/min/1,73m².`,

  `**Escore de Wells para TEP:**

| Critério | Pontos |
|---|---|
| TVP ou TEP prévios | +1,5 |
| FC > 100 bpm | +1,5 |
| Cirurgia/imobilização recente | +1,5 |
| Sinais clínicos de TVP | +3 |
| Diagnóstico alternativo menos provável | +3 |
| Hemoptise | +1 |
| Neoplasia ativa | +1 |

**Interpretação**: ≤ 4 pontos = baixa probabilidade; > 4 pontos = alta probabilidade.
D-Dímero indicado na baixa probabilidade; angiotomografia na alta.`,
];

const CONVERSAS_MOCK: Conversa[] = [
  { id: "1", titulo: "Conduta HAS estágio 2", preview: "Qual a conduta para...", data: "hoje", grupo: "Hoje" },
  { id: "2", titulo: "Critérios DM tipo 2", preview: "Quais os critérios...", data: "hoje", grupo: "Hoje" },
  { id: "3", titulo: "Escore de Wells TEP", preview: "Explique o escore...", data: "ontem", grupo: "Ontem" },
  { id: "4", titulo: "Interações metformina", preview: "Interações medicamentosas...", data: "ontem", grupo: "Ontem" },
  { id: "5", titulo: "Fibrilação atrial aguda", preview: "Conduta na FA...", data: "esta semana", grupo: "Esta semana" },
];

function agora() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function ConsultaChatPage() {
  const [conversas] = useState<Conversa[]>(CONVERSAS_MOCK);
  const [conversaAtiva, setConversaAtiva] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput] = useState("");
  const [respondendo, setRespondendo] = useState(false);
  const mensagensEndRef = useRef<HTMLDivElement>(null);
  const respostaMockIdx = useRef(0);

  useEffect(() => {
    mensagensEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  function novaConversa() {
    setConversaAtiva(null);
    setMensagens([]);
  }

  function selecionarConversa(id: string) {
    setConversaAtiva(id);
    setMensagens([]);
  }

  function simularDigitacao(texto: string, idMensagem: string) {
    let i = 0;
    const intervalo = setInterval(() => {
      i += 3;
      setMensagens((prev) =>
        prev.map((m) =>
          m.id === idMensagem
            ? { ...m, conteudo: texto.substring(0, i), digitando: i < texto.length }
            : m
        )
      );
      if (i >= texto.length) {
        clearInterval(intervalo);
        setRespondendo(false);
      }
    }, 20);
  }

  function enviarMensagem() {
    if (!input.trim() || respondendo) return;

    const msgUsuario: Mensagem = {
      id: `u-${Date.now()}`,
      papel: "usuario",
      conteudo: input,
      timestamp: agora(),
    };

    const resposta = RESPOSTAS_MOCK[respostaMockIdx.current % RESPOSTAS_MOCK.length];
    respostaMockIdx.current += 1;

    const msgIA: Mensagem = {
      id: `ia-${Date.now()}`,
      papel: "ia",
      conteudo: "",
      timestamp: agora(),
      digitando: true,
    };

    setMensagens((prev) => [...prev, msgUsuario, msgIA]);
    setInput("");
    setRespondendo(true);

    setTimeout(() => simularDigitacao(resposta, msgIA.id), 600);
  }

  function usarSugestao(texto: string) {
    setInput(texto);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        conversas={conversas}
        conversaAtiva={conversaAtiva}
        onSelecionar={selecionarConversa}
        onNova={novaConversa}
      />

      {/* Área central */}
      <div className="flex flex-col flex-1 min-w-0 bg-white">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <Avatar className="h-9 w-9 bg-violet-600">
            <AvatarFallback className="bg-violet-600 text-white font-bold text-sm">P</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-800">Pulso IA — Assistente Médico</h2>
              <Badge variant="outline" className="text-xs text-violet-700 border-violet-300 bg-violet-50">
                Beta
              </Badge>
            </div>
            <p className="text-xs text-slate-400">Baseado em evidências científicas</p>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {mensagens.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 max-w-xl mx-auto text-center">
              <div className="h-16 w-16 rounded-2xl bg-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">P</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-700">Como posso ajudar?</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Pergunte sobre CIDs, condutas clínicas, medicamentos e muito mais.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                {SUGESTOES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => usarSugestao(s)}
                    className="text-left text-sm px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-colors leading-snug"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {mensagens.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 max-w-3xl",
                    msg.papel === "usuario" ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  {msg.papel === "ia" && (
                    <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                      <AvatarFallback className="bg-violet-600 text-white text-xs font-bold">P</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[85%]",
                      msg.papel === "usuario"
                        ? "bg-violet-600 text-white rounded-tr-sm"
                        : "bg-slate-100 text-slate-700 rounded-tl-sm"
                    )}
                  >
                    <pre className="whitespace-pre-wrap font-sans">{msg.conteudo}</pre>
                    {msg.digitando && (
                      <span className="inline-flex gap-0.5 ml-1 align-middle">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    )}
                    <p className={cn(
                      "text-xs mt-1.5",
                      msg.papel === "usuario" ? "text-violet-200" : "text-slate-400"
                    )}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={mensagensEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <ChatInput
          valor={input}
          onChange={setInput}
          onEnviar={enviarMensagem}
          desabilitado={respondendo}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd c:/Users/guilh/Desktop/Nuclimed/Nuclimed && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros.

- [ ] **Step 3: Testar visualmente**

Rodar `npm run dev` e navegar para `http://localhost:3000/consulta/chat`.
Verificar:
- Sidebar escura com histórico de conversas
- Sugestões iniciais como chips clicáveis
- Digitação de mensagem e envio via Enter
- Efeito de digitação da IA
- Layout full-height sem scroll da página

- [ ] **Step 4: Verificar build completo**

```bash
cd c:/Users/guilh/Desktop/Nuclimed/Nuclimed && npm run build 2>&1 | tail -20
```

Esperado: build bem-sucedido sem erros.

- [ ] **Step 5: Commit final**

```bash
cd c:/Users/guilh/Desktop/Nuclimed/Nuclimed
git add app/\(app\)/consulta/chat/page.tsx
git commit -m "feat: implement consulta/chat page with Pulso IA interface and typing effect"
```
