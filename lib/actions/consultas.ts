"use server";
import { prisma } from "@/lib/prisma";
import { getMedicoId } from "./helpers";

export type ConsultaResumo = {
  id: string;
  createdAt: Date;
  modalidade: string;
  status: string;
  duracao: number | null;
  paciente: { id: string; nome: string };
};

export async function getConsultas(filtros: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ consultas: ConsultaResumo[]; total: number; pages: number }> {
  const medicoId = await getMedicoId();
  const { status, page = 1, limit = 20 } = filtros;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { medicoId };
  if (status) where.status = status;

  const [consultas, total] = await Promise.all([
    prisma.consulta.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        modalidade: true,
        status: true,
        duracao: true,
        paciente: { select: { id: true, nome: true } },
      },
    }),
    prisma.consulta.count({ where }),
  ]);

  return { consultas, total, pages: Math.ceil(total / limit) };
}

export async function getConsultaById(id: string) {
  const medicoId = await getMedicoId();
  const consulta = await prisma.consulta.findFirst({
    where: { id, medicoId },
    include: {
      paciente: true,
      agendamento: true,
      modelo: true,
    },
  });
  if (!consulta) return null;

  return {
    ...consulta,
    anamneseParsed: consulta.anamnese ? JSON.parse(consulta.anamnese) : null,
  };
}

export async function criarConsulta(data: {
  pacienteId: string;
  agendamentoId?: string;
  modalidade?: string;
  modeloId?: string;
}) {
  const medicoId = await getMedicoId();
  return prisma.consulta.create({
    data: {
      pacienteId: data.pacienteId,
      medicoId,
      agendamentoId: data.agendamentoId,
      modalidade: data.modalidade ?? "PRESENCIAL",
      modeloId: data.modeloId,
      status: "RASCUNHO",
    },
  });
}

export async function finalizarConsulta(id: string, anamnese: Record<string, unknown>) {
  const medicoId = await getMedicoId();
  return prisma.consulta.update({
    where: { id, medicoId },
    data: {
      anamnese: JSON.stringify(anamnese),
      status: "FINALIZADO",
    },
  });
}

/**
 * SIMULADO — gera anamnese estruturada a partir da transcrição.
 * Produção: substituir por chamada à API de IA (Claude, GPT etc).
 */
export async function processarComIA(
  consultaId: string,
  transcricao: string,
  _modeloId?: string
): Promise<Record<string, unknown>> {
  const medicoId = await getMedicoId();

  // Heurísticas simples para extrair informações da transcrição
  const textoMin = transcricao.toLowerCase();

  const queixas = [
    ["dor de cabeça", "Cefaleia"],
    ["pressão alta", "Hipertensão arterial"],
    ["diabetes", "Diabetes mellitus"],
    ["tosse", "Tosse produtiva"],
    ["cansaço", "Fadiga / astenia"],
    ["febre", "Febre"],
    ["dor abdominal", "Dor abdominal"],
    ["palpitação", "Palpitações"],
  ];

  const queixaIdentificada = queixas.find(([kw]) => textoMin.includes(kw));
  const queixaPrincipal = queixaIdentificada ? queixaIdentificada[1] : "Consulta de rotina";

  const medicamentos = [];
  const medicamentosPesquisa = ["losartana", "metformina", "enalapril", "dipirona", "ibuprofeno", "omeprazol"];
  for (const med of medicamentosPesquisa) {
    if (textoMin.includes(med)) {
      medicamentos.push(med.charAt(0).toUpperCase() + med.slice(1));
    }
  }

  const pa = textoMin.match(/(\d{2,3})\s*[\/x]\s*(\d{2,3})/);
  const peso = textoMin.match(/(\d{2,3})\s*kg/);
  const altura = textoMin.match(/(\d{1,2}[\.,]\d{2}|\d{3})\s*cm/);

  const anamnese: Record<string, unknown> = {
    queixaPrincipal,
    historiaDoenca: `${queixaPrincipal} — detalhes conforme transcrição. Início recente. Investigação em andamento.`,
    antecedentesPessoais: "A investigar",
    antecedentesFamiliares: "Não informado",
    medicamentosEmUso: medicamentos.length > 0 ? medicamentos : ["Nenhum referido"],
    alergias: "Nega alergias conhecidas",
    habitosDeVida: "A investigar",
    revisaoSistemas: {
      cardiovascular: "Sem queixas cardiovasculares referidas",
      respiratorio: "Sem queixas respiratórias referidas",
      digestivo: "Sem queixas digestivas referidas",
      neurologico: "Sem queixas neurológicas referidas",
    },
    exameFisico: {
      pa: pa ? `${pa[1]}/${pa[2]}` : "Não mensurado",
      fc: "Não mensurado",
      peso: peso ? `${peso[1]}` : "Não mensurado",
      altura: altura ? `${altura[1]}` : "Não mensurado",
      imc: "Não calculado",
    },
    hipoteseDiagnostica: `${queixaPrincipal} — hipótese a confirmar com exames`,
    conduta: "1. Solicitar exames complementares\n2. Retorno em 7–14 dias com resultados\n3. Orientações fornecidas ao paciente",
    geradoPorIA: true,
    versaoIA: "simulado-v1",
  };

  // Salva a transcrição e a anamnese gerada
  await prisma.consulta.update({
    where: { id: consultaId, medicoId },
    data: {
      transcricao,
      anamnese: JSON.stringify(anamnese),
    },
  });

  return anamnese;
}
