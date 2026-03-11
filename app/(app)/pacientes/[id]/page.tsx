"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  FileText,
  CreditCard,
  User,
  Edit,
  Plus,
  ChevronRight,
  Weight,
  Ruler,
  Droplets,
  AlertTriangle,
  Clock,
  Stethoscope,
  TrendingUp,
  Upload,
  Download,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PacienteDetalhe {
  id: string;
  nome: string;
  cpf: string;
  dataNasc: string;
  sexo: string;
  estadoCivil: string;
  naturalidade: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  convenio: string | null;
  status: "Ativo" | "Inativo";
  // saúde
  peso: number;
  altura: number;
  tipoSanguineo: string;
  alergias: string[];
  // MEV
  scoreMev: {
    movimento: number;
    estresse: number;
    sono: number;
    nutricao: number;
    relacionamentos: number;
    proposito: number;
  } | null;
}

interface Consulta {
  id: string;
  data: string;
  tipo: string;
  diagnosticos: string[];
  medico: string;
}

interface Exame {
  id: string;
  data: string;
  nome: string;
  status: "Solicitado" | "Resultado disponível";
  arquivo?: string;
}

interface Cobranca {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  status: "Pago" | "Pendente";
  convenio: string | null;
}

// ─── Mock de paciente ─────────────────────────────────────────────────────────

const MOCK_PACIENTE: PacienteDetalhe = {
  id: "p001",
  nome: "Ana Carolina Souza",
  cpf: "123.456.789-00",
  dataNasc: "1988-03-15",
  sexo: "Feminino",
  estadoCivil: "Casada",
  naturalidade: "São Paulo - SP",
  telefone: "(11) 99123-4567",
  email: "ana.souza@email.com",
  endereco: "Rua das Flores, 123, Apto 45",
  cidade: "São Paulo",
  estado: "SP",
  cep: "01234-567",
  convenio: "Unimed",
  status: "Ativo",
  peso: 62,
  altura: 165,
  tipoSanguineo: "A+",
  alergias: ["Dipirona", "Penicilina"],
  scoreMev: {
    movimento: 72,
    estresse: 55,
    sono: 68,
    nutricao: 80,
    relacionamentos: 90,
    proposito: 75,
  },
};

const MOCK_CONSULTAS: Consulta[] = [
  {
    id: "c1",
    data: "2026-02-28",
    tipo: "Retorno",
    diagnosticos: ["M54.5 — Dor lombar baixa", "F41.1 — Transtorno de ansiedade generalizada"],
    medico: "Dr. Ricardo Alves",
  },
  {
    id: "c2",
    data: "2025-11-10",
    tipo: "Consulta inicial",
    diagnosticos: ["J06.9 — IVAS aguda"],
    medico: "Dr. Ricardo Alves",
  },
  {
    id: "c3",
    data: "2025-08-22",
    tipo: "Check-up",
    diagnosticos: ["Z00.0 — Exame geral rotineiro"],
    medico: "Dr. Ricardo Alves",
  },
];

const MOCK_EXAMES: Exame[] = [
  { id: "e1", data: "2026-02-28", nome: "Hemograma completo", status: "Resultado disponível", arquivo: "hemograma.pdf" },
  { id: "e2", data: "2026-02-28", nome: "TSH e T4 livre", status: "Solicitado" },
  { id: "e3", data: "2025-11-10", nome: "Raio-X coluna lombar", status: "Resultado disponível", arquivo: "rx-coluna.pdf" },
  { id: "e4", data: "2025-08-22", nome: "Perfil lipídico", status: "Resultado disponível", arquivo: "lipidico.pdf" },
];

const MOCK_COBRANCAS: Cobranca[] = [
  { id: "f1", data: "2026-02-28", descricao: "Consulta de retorno", valor: 250, status: "Pago", convenio: "Unimed" },
  { id: "f2", data: "2025-11-10", descricao: "Consulta inicial", valor: 350, status: "Pago", convenio: null },
  { id: "f3", data: "2025-08-22", descricao: "Check-up completo", valor: 450, status: "Pago", convenio: "Unimed" },
  { id: "f4", data: "2026-03-15", descricao: "Exames laboratoriais", valor: 120, status: "Pendente", convenio: "Unimed" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function iniciais(nome: string) {
  return nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

function calcIdade(dataNasc: string) {
  const nasc = new Date(dataNasc);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  if (
    hoje.getMonth() < nasc.getMonth() ||
    (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())
  ) idade--;
  return idade;
}

function calcIMC(peso: number, altura: number) {
  const imc = peso / Math.pow(altura / 100, 2);
  return imc.toFixed(1);
}

function classificacaoIMC(imc: number) {
  if (imc < 18.5) return { label: "Abaixo do peso", color: "text-blue-600" };
  if (imc < 25) return { label: "Peso normal", color: "text-emerald-600" };
  if (imc < 30) return { label: "Sobrepeso", color: "text-amber-600" };
  return { label: "Obesidade", color: "text-red-600" };
}

function formatarData(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function scoreCorLabel(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

// ─── Componente Página ────────────────────────────────────────────────────────

export default function PacientePerfilPage({ params }: { params: { id: string } }) {
  const [abaFinanceira, setAbaFinanceira] = useState<"todos" | "pago" | "pendente">("todos");

  // TODO: buscar paciente real pelo params.id
  const paciente = MOCK_PACIENTE;
  const imc = parseFloat(calcIMC(paciente.peso, paciente.altura));
  const imcInfo = classificacaoIMC(imc);

  const radarData = paciente.scoreMev
    ? [
        { pillar: "Movimento", value: paciente.scoreMev.movimento },
        { pillar: "Estresse", value: paciente.scoreMev.estresse },
        { pillar: "Sono", value: paciente.scoreMev.sono },
        { pillar: "Nutrição", value: paciente.scoreMev.nutricao },
        { pillar: "Relac.", value: paciente.scoreMev.relacionamentos },
        { pillar: "Propósito", value: paciente.scoreMev.proposito },
      ]
    : null;

  const cobrancasFiltradas = MOCK_COBRANCAS.filter((c) => {
    if (abaFinanceira === "pago") return c.status === "Pago";
    if (abaFinanceira === "pendente") return c.status === "Pendente";
    return true;
  });

  const totalPago = MOCK_COBRANCAS.filter((c) => c.status === "Pago").reduce((s, c) => s + c.valor, 0);
  const totalPendente = MOCK_COBRANCAS.filter((c) => c.status === "Pendente").reduce((s, c) => s + c.valor, 0);

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/pacientes" className="hover:text-slate-700 flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Pacientes
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-700 font-medium">{paciente.nome}</span>
      </div>

      {/* ── Header do paciente ────────────────────────────────────────────────── */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-xl font-bold text-violet-700">
              {iniciais(paciente.nome)}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">{paciente.nome}</h1>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
                    paciente.status === "Ativo"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  )}
                >
                  {paciente.status}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {calcIdade(paciente.dataNasc)} anos &middot; {paciente.sexo} &middot; CPF {paciente.cpf}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {paciente.telefone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {paciente.email}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {paciente.cidade} - {paciente.estado}
                </span>
                {paciente.convenio && (
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {paciente.convenio}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            <Link href={`/agenda?paciente=${paciente.id}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                Agendar consulta
              </Button>
            </Link>
            <Link href={`/consulta/nova?paciente=${paciente.id}`}>
              <Button size="sm" className="gap-2 bg-violet-600 hover:bg-violet-700">
                <Plus className="h-4 w-4" />
                Nova consulta
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Abas principais ──────────────────────────────────────────────────── */}
      <Tabs defaultValue="resumo" className="space-y-6">
        <TabsList className="h-9">
          <TabsTrigger value="resumo" className="gap-1.5 text-xs px-4">
            <User className="h-3.5 w-3.5" />
            Resumo
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-1.5 text-xs px-4">
            <Stethoscope className="h-3.5 w-3.5" />
            Histórico Clínico
          </TabsTrigger>
          <TabsTrigger value="exames" className="gap-1.5 text-xs px-4">
            <FileText className="h-3.5 w-3.5" />
            Exames
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="gap-1.5 text-xs px-4">
            <CreditCard className="h-3.5 w-3.5" />
            Financeiro
          </TabsTrigger>
        </TabsList>

        {/* ── ABA RESUMO ──────────────────────────────────────────────────────── */}
        <TabsContent value="resumo" className="space-y-4 mt-0">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

            {/* Dados pessoais */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <User className="h-4 w-4 text-violet-500" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                <InfoRow label="Nome completo" value={paciente.nome} />
                <InfoRow label="CPF" value={paciente.cpf} />
                <InfoRow label="Data de nascimento" value={`${formatarData(paciente.dataNasc)} (${calcIdade(paciente.dataNasc)} anos)`} />
                <InfoRow label="Sexo" value={paciente.sexo} />
                <InfoRow label="Estado civil" value={paciente.estadoCivil} />
                <InfoRow label="Naturalidade" value={paciente.naturalidade} />
              </CardContent>
            </Card>

            {/* Contato & endereço */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Phone className="h-4 w-4 text-blue-500" />
                  Contato &amp; Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm">
                <InfoRow label="Telefone" value={paciente.telefone} />
                <InfoRow label="Email" value={paciente.email} />
                <InfoRow label="Endereço" value={paciente.endereco} />
                <InfoRow label="Cidade" value={`${paciente.cidade} - ${paciente.estado}`} />
                <InfoRow label="CEP" value={paciente.cep} />
                <InfoRow label="Convênio" value={paciente.convenio ?? "Particular"} />
              </CardContent>
            </Card>

            {/* Dados de saúde */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Heart className="h-4 w-4 text-red-500" />
                  Dados de Saúde
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-slate-50 p-2.5 text-center">
                    <Weight className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-base font-bold text-slate-800">{paciente.peso}</p>
                    <p className="text-[10px] text-muted-foreground">kg</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 text-center">
                    <Ruler className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-base font-bold text-slate-800">{paciente.altura}</p>
                    <p className="text-[10px] text-muted-foreground">cm</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 text-center">
                    <TrendingUp className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-1" />
                    <p className={cn("text-base font-bold", imcInfo.color)}>{imc}</p>
                    <p className="text-[10px] text-muted-foreground">IMC</p>
                  </div>
                </div>
                <p className={cn("text-xs font-medium", imcInfo.color)}>{imcInfo.label}</p>
                <Separator />
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-red-400" />
                  <span className="text-slate-600">Tipo sanguíneo:</span>
                  <span className="font-semibold text-slate-800">{paciente.tipoSanguineo}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-slate-600">Alergias:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {paciente.alergias.map((a) => (
                      <span
                        key={a}
                        className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-700"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Score MEV */}
          {radarData && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Heart className="h-4 w-4 text-emerald-500" />
                  Score MEV — Medicina de Estilo de Vida
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  {/* Radar chart */}
                  <div className="h-48 w-full sm:w-64 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 10, fill: "#64748b" }} />
                        <Radar
                          dataKey="value"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.25}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Barras de pilares */}
                  <div className="flex-1 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {radarData.map((item) => (
                      <div key={item.pillar}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-slate-600">{item.pillar}</span>
                          <span className={cn("text-xs font-bold", scoreCorLabel(item.value))}>
                            {item.value}%
                          </span>
                        </div>
                        <Progress
                          value={item.value}
                          className="h-1.5"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Link href={`/mev/avaliacao/${paciente.id}`}>
                    <Button variant="outline" size="sm" className="text-xs gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Ver avaliação completa
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── ABA HISTÓRICO CLÍNICO ────────────────────────────────────────────── */}
        <TabsContent value="historico" className="space-y-4 mt-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {MOCK_CONSULTAS.length} atendimento(s) registrado(s)
            </p>
            <Link href={`/consulta/nova?paciente=${paciente.id}`}>
              <Button size="sm" className="gap-2 bg-violet-600 hover:bg-violet-700 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Nova consulta
              </Button>
            </Link>
          </div>

          {/* Timeline */}
          <div className="relative space-y-0">
            {MOCK_CONSULTAS.map((c, i) => (
              <div key={c.id} className="flex gap-4">
                {/* Linha do tempo */}
                <div className="flex flex-col items-center">
                  <div className="mt-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-violet-200 bg-violet-50">
                    <Stethoscope className="h-3.5 w-3.5 text-violet-600" />
                  </div>
                  {i < MOCK_CONSULTAS.length - 1 && (
                    <div className="w-px flex-1 bg-slate-200 my-1" />
                  )}
                </div>

                {/* Conteúdo */}
                <Card className="mb-3 flex-1">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-800">{c.tipo}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatarData(c.data)}
                          </span>
                          <span className="text-xs text-muted-foreground">&middot; {c.medico}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {c.diagnosticos.map((d) => (
                            <span
                              key={d}
                              className="inline-flex rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs text-slate-600"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Link href={`/consulta/${c.id}`}>
                        <Button variant="outline" size="sm" className="text-xs gap-1 shrink-0">
                          <FileText className="h-3 w-3" />
                          Ver anamnese
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {MOCK_CONSULTAS.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground">Nenhum atendimento registrado.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── ABA EXAMES ────────────────────────────────────────────────────────── */}
        <TabsContent value="exames" className="space-y-4 mt-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {MOCK_EXAMES.length} exame(s) registrado(s)
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <Upload className="h-3.5 w-3.5" />
                Enviar PDF
              </Button>
              <Button size="sm" className="gap-2 text-xs bg-violet-600 hover:bg-violet-700">
                <Plus className="h-3.5 w-3.5" />
                Solicitar exame
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Data</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Exame</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Arquivo</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {MOCK_EXAMES.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs text-slate-600">{formatarData(e.data)}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800">{e.nome}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border",
                          e.status === "Resultado disponível"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        )}
                      >
                        {e.status === "Resultado disponível" ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {e.arquivo ? (
                        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-violet-600">
                          <Download className="h-3.5 w-3.5" />
                          {e.arquivo}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ── ABA FINANCEIRO ───────────────────────────────────────────────────── */}
        <TabsContent value="financeiro" className="space-y-4 mt-0">
          {/* Resumo */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Total pago</p>
                <p className="mt-1 text-xl font-bold text-emerald-600">
                  {totalPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Pendente</p>
                <p className="mt-1 text-xl font-bold text-amber-600">
                  {totalPendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">Total geral</p>
                <p className="mt-1 text-xl font-bold text-slate-800">
                  {(totalPago + totalPendente).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            {(["todos", "pago", "pendente"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={abaFinanceira === f ? "default" : "outline"}
                className={cn(
                  "text-xs capitalize",
                  abaFinanceira === f && "bg-violet-600 hover:bg-violet-700"
                )}
                onClick={() => setAbaFinanceira(f)}
              >
                {f === "todos" ? "Todos" : f === "pago" ? "Pagos" : "Pendentes"}
              </Button>
            ))}
          </div>

          {/* Tabela */}
          <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Data</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Descrição</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Convênio</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Valor</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cobrancasFiltradas.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs text-slate-600">{formatarData(c.data)}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800">{c.descricao}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{c.convenio ?? "Particular"}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                      {c.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border",
                          c.status === "Pago"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        )}
                      >
                        {c.status === "Pago" ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Sub-componente de linha de info ─────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-slate-800">{value}</span>
    </div>
  );
}
