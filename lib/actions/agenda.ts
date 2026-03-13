"use server";
import { prisma } from "@/lib/prisma";
import { getMedicoId } from "./helpers";

export type AgendamentoComPaciente = {
  id: string;
  dataHora: Date;
  duracao: number;
  tipo: string;
  status: string;
  convenio: string | null;
  valor: number | null;
  observacoes: string | null;
  paciente: { id: string; nome: string; telefone: string | null; convenio: string | null };
};

export async function getAgendamentos(dataInicio: Date, dataFim: Date): Promise<AgendamentoComPaciente[]> {
  const medicoId = await getMedicoId();
  return prisma.agendamento.findMany({
    where: {
      medicoId,
      dataHora: { gte: dataInicio, lte: dataFim },
    },
    include: {
      paciente: { select: { id: true, nome: true, telefone: true, convenio: true } },
    },
    orderBy: { dataHora: "asc" },
  });
}

export async function getAgendamentosHoje(): Promise<AgendamentoComPaciente[]> {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
  return getAgendamentos(inicio, fim);
}

export async function criarAgendamento(data: {
  pacienteId: string;
  dataHora: string;
  duracao: number;
  tipo: string;
  convenio?: string;
  valor?: number;
  observacoes?: string;
}) {
  const medicoId = await getMedicoId();
  return prisma.agendamento.create({
    data: {
      ...data,
      dataHora: new Date(data.dataHora),
      medicoId,
      status: "AGENDADO",
    },
    include: {
      paciente: { select: { id: true, nome: true, telefone: true, convenio: true } },
    },
  });
}

export async function atualizarStatusAgendamento(id: string, status: string) {
  const medicoId = await getMedicoId();
  return prisma.agendamento.update({
    where: { id, medicoId },
    data: { status },
  });
}

export async function getSalaDeEspera(): Promise<AgendamentoComPaciente[]> {
  const medicoId = await getMedicoId();
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);

  return prisma.agendamento.findMany({
    where: {
      medicoId,
      dataHora: { gte: inicio, lte: fim },
      status: "ESPERA",
    },
    include: {
      paciente: { select: { id: true, nome: true, telefone: true, convenio: true } },
    },
    orderBy: { dataHora: "asc" },
  });
}

export async function getResumoAgenda() {
  const medicoId = await getMedicoId();
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);

  const agendamentos = await prisma.agendamento.findMany({
    where: { medicoId, dataHora: { gte: inicio, lte: fim } },
    select: { status: true },
  });

  return {
    agendados: agendamentos.filter((a) => a.status === "AGENDADO").length,
    finalizados: agendamentos.filter((a) => a.status === "FINALIZADO").length,
    cancelados: agendamentos.filter((a) => a.status === "CANCELADO").length,
    retornos: agendamentos.filter((a) => a.status === "RETORNO").length,
    espera: agendamentos.filter((a) => a.status === "ESPERA").length,
    total: agendamentos.length,
  };
}
