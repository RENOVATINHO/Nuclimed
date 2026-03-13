"use server";
import { prisma } from "@/lib/prisma";
import { getMedicoId } from "./helpers";

export type PacienteResumo = {
  id: string;
  nome: string;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
  dataNascimento: Date | null;
  sexo: string | null;
  convenio: string | null;
  tipoSanguineo: string | null;
  status: string;
  cidade: string | null;
  _count: { agendamentos: number; consultas: number };
};

export type PacienteCompleto = PacienteResumo & {
  estadoCivil: string | null;
  naturalidade: string | null;
  endereco: string | null;
  alergias: string | null;
  observacoes: string | null;
  agendamentos: Array<{
    id: string;
    dataHora: Date;
    tipo: string;
    status: string;
    convenio: string | null;
  }>;
  consultas: Array<{
    id: string;
    createdAt: Date;
    modalidade: string;
    status: string;
  }>;
  avaliacoesMev: Array<{
    id: string;
    createdAt: Date;
    scorePilar1: number;
    scorePilar2: number;
    scorePilar3: number;
    scorePilar4: number;
    scorePilar5: number;
    scorePilar6: number;
  }>;
};

export async function getPacientes(filtros: {
  busca?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const medicoId = await getMedicoId();
  const { busca, status, page = 1, limit = 20 } = filtros;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { medicoId };
  if (status) where.status = status;
  if (busca) {
    where.OR = [
      { nome: { contains: busca } },
      { cpf: { contains: busca } },
      { email: { contains: busca } },
      { telefone: { contains: busca } },
    ];
  }

  const [pacientes, total] = await Promise.all([
    prisma.paciente.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nome: "asc" },
      select: {
        id: true,
        nome: true,
        cpf: true,
        email: true,
        telefone: true,
        dataNascimento: true,
        sexo: true,
        convenio: true,
        tipoSanguineo: true,
        status: true,
        cidade: true,
        _count: { select: { agendamentos: true, consultas: true } },
      },
    }),
    prisma.paciente.count({ where }),
  ]);

  return { pacientes, total, pages: Math.ceil(total / limit), page };
}

export async function getPacienteById(id: string): Promise<PacienteCompleto | null> {
  const medicoId = await getMedicoId();
  return prisma.paciente.findFirst({
    where: { id, medicoId },
    include: {
      _count: { select: { agendamentos: true, consultas: true } },
      agendamentos: {
        select: { id: true, dataHora: true, tipo: true, status: true, convenio: true },
        orderBy: { dataHora: "desc" },
        take: 10,
      },
      consultas: {
        select: { id: true, createdAt: true, modalidade: true, status: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      avaliacoesMev: {
        select: {
          id: true,
          createdAt: true,
          scorePilar1: true,
          scorePilar2: true,
          scorePilar3: true,
          scorePilar4: true,
          scorePilar5: true,
          scorePilar6: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  }) as Promise<PacienteCompleto | null>;
}

export async function criarPaciente(data: {
  nome: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  dataNascimento?: string;
  sexo?: string;
  estadoCivil?: string;
  naturalidade?: string;
  cidade?: string;
  endereco?: string;
  convenio?: string;
  tipoSanguineo?: string;
  alergias?: string;
  observacoes?: string;
}) {
  const medicoId = await getMedicoId();
  return prisma.paciente.create({
    data: {
      ...data,
      dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : undefined,
      medicoId,
    },
  });
}

export async function atualizarPaciente(id: string, data: Partial<Parameters<typeof criarPaciente>[0]>) {
  const medicoId = await getMedicoId();
  return prisma.paciente.update({
    where: { id, medicoId },
    data: {
      ...data,
      dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : undefined,
    },
  });
}

export async function getPacientesInativos(dias: number) {
  const medicoId = await getMedicoId();
  const corte = new Date();
  corte.setDate(corte.getDate() - dias);

  // Pacientes cujo último agendamento foi antes do corte ou não têm agendamento
  const pacientesAtivos = await prisma.paciente.findMany({
    where: { medicoId, status: "ATIVO" },
    include: {
      agendamentos: {
        orderBy: { dataHora: "desc" },
        take: 1,
        select: { dataHora: true },
      },
    },
  });

  return pacientesAtivos
    .filter((p) => {
      const ultimo = p.agendamentos[0]?.dataHora;
      return !ultimo || ultimo < corte;
    })
    .map((p) => ({
      id: p.id,
      nome: p.nome,
      email: p.email,
      telefone: p.telefone,
      convenio: p.convenio,
      ultimoAgendamento: p.agendamentos[0]?.dataHora ?? null,
      diasInativo: p.agendamentos[0]
        ? Math.floor((Date.now() - p.agendamentos[0].dataHora.getTime()) / 86_400_000)
        : null,
    }));
}

export async function getAniversariantes(mes?: number) {
  const medicoId = await getMedicoId();
  const mesAlvo = mes ?? new Date().getMonth() + 1;

  const pacientes = await prisma.paciente.findMany({
    where: { medicoId, status: "ATIVO", dataNascimento: { not: null } },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      dataNascimento: true,
      convenio: true,
    },
  });

  return pacientes
    .filter((p) => p.dataNascimento && p.dataNascimento.getMonth() + 1 === mesAlvo)
    .map((p) => ({
      ...p,
      diaNascimento: p.dataNascimento!.getDate(),
    }))
    .sort((a, b) => a.diaNascimento - b.diaNascimento);
}
