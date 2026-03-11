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
  usos: (i * 7 + 5) % 40 + 5,
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
