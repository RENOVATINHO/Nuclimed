"use server";
import { prisma } from "@/lib/prisma";
import { getMedicoId } from "./helpers";

export type RespostasMEV = {
  nutricao: {
    ultraprocessados: string;
    vegetais: string;
    agua: string;
    acucar: string;
    fermentados: string;
  };
  atividade: {
    exercicio: string;
    resistencia: string;
    aerobico: string;
    sedentario: number;
  };
  sono: {
    horas: number;
    ambiente: string;
    telas: string;
    descansado: string;
    dificuldade: string;
  };
  toxicos: {
    fuma: string;
    alcool: string;
    pesticidas: string;
    plastico: string;
  };
  mental: {
    relaxamento: string;
    hobby: string;
    ansiedade: string;
    suporte: string;
  };
  social: {
    relacoes: string;
    solidao: string;
    familia: string;
    comunidade: string;
  };
};

export function calcularScores(respostas: RespostasMEV) {
  const n = respostas.nutricao;
  const scorePilar1 = Math.round(
    (+(["Nunca", "Raramente"].includes(n.ultraprocessados)) +
      +(n.vegetais === "Sim") +
      +(n.agua === "Sim") +
      +(n.acucar === "Não") +
      +(n.fermentados === "Sim")) /
      5 *
      100
  );

  const af = respostas.atividade;
  const scorePilar2 = Math.round(
    (+(af.exercicio === "Sim") +
      +(af.resistencia === "Sim") +
      +(af.aerobico === "Sim") +
      +(af.sedentario <= 4)) /
      4 *
      100
  );

  const s = respostas.sono;
  const scorePilar3 = Math.round(
    (+(s.horas >= 7 && s.horas <= 9) +
      +(s.ambiente === "Sim") +
      +(s.telas === "Sim") +
      +(s.descansado === "Sim") +
      +(s.dificuldade === "Não")) /
      5 *
      100
  );

  const t = respostas.toxicos;
  const scorePilar4 = Math.round(
    (+(t.fuma === "Não") +
      +(["Nunca", "Raramente"].includes(t.alcool)) +
      +(t.pesticidas === "Não") +
      +(t.plastico === "Sim")) /
      4 *
      100
  );

  const sm = respostas.mental;
  const scorePilar5 = Math.round(
    (+(sm.relaxamento === "Sim") +
      +(sm.hobby === "Sim") +
      +(sm.ansiedade === "Não") +
      +(sm.suporte === "Sim")) /
      4 *
      100
  );

  const sc = respostas.social;
  const scorePilar6 = Math.round(
    (+(sc.relacoes === "Sim") +
      +(sc.solidao === "Não") +
      +(sc.familia === "Sim") +
      +(sc.comunidade === "Sim")) /
      4 *
      100
  );

  return { scorePilar1, scorePilar2, scorePilar3, scorePilar4, scorePilar5, scorePilar6 };
}

function gerarRiscos(scores: ReturnType<typeof calcularScores>) {
  const PILARES = [
    { key: "scorePilar1" as const, nome: "Nutrição", icone: "🥗" },
    { key: "scorePilar2" as const, nome: "Atividade Física", icone: "🏃" },
    { key: "scorePilar3" as const, nome: "Sono", icone: "😴" },
    { key: "scorePilar4" as const, nome: "Controle de Tóxicos", icone: "🚭" },
    { key: "scorePilar5" as const, nome: "Saúde Mental", icone: "🧠" },
    { key: "scorePilar6" as const, nome: "Conexões Sociais", icone: "👥" },
  ];
  return PILARES.filter((p) => scores[p.key] <= 40).map((p) => ({
    pilar: p.nome,
    icone: p.icone,
    score: scores[p.key],
  }));
}

function gerarPlanoAcao(scores: ReturnType<typeof calcularScores>) {
  const metas: Array<{ pilar: string; meta: string; prazo: string; concluida: boolean }> = [];

  if (scores.scorePilar3 <= 70) {
    metas.push({
      pilar: "Sono",
      meta: "Estabelecer rotina de sono: deitar às 22h30 e acordar às 6h30, mantendo horário regular inclusive nos fins de semana.",
      prazo: "30 dias",
      concluida: false,
    });
  }
  if (scores.scorePilar1 <= 70) {
    metas.push({
      pilar: "Nutrição",
      meta: "Substituir 2 refeições com ultraprocessados por opções integrais e naturais, priorizando vegetais coloridos.",
      prazo: "2 semanas",
      concluida: false,
    });
  }
  if (scores.scorePilar2 <= 70) {
    metas.push({
      pilar: "Atividade Física",
      meta: "Iniciar programa de caminhadas de 30 minutos, 4× por semana, progredindo para corrida leve após 30 dias.",
      prazo: "15 dias",
      concluida: false,
    });
  }
  if (scores.scorePilar5 <= 70) {
    metas.push({
      pilar: "Saúde Mental",
      meta: "Praticar 10 minutos diários de meditação guiada pela manhã (app Headspace ou Insight Timer).",
      prazo: "14 dias",
      concluida: false,
    });
  }
  if (scores.scorePilar4 <= 70) {
    metas.push({
      pilar: "Controle de Tóxicos",
      meta: "Reduzir consumo de álcool para no máximo 1 vez por semana e evitar embalagens plásticas para alimentos quentes.",
      prazo: "30 dias",
      concluida: false,
    });
  }
  if (scores.scorePilar6 <= 70) {
    metas.push({
      pilar: "Conexões Sociais",
      meta: "Participar de ao menos uma atividade social ou comunitária por semana (grupo, clube, voluntariado).",
      prazo: "21 dias",
      concluida: false,
    });
  }

  return metas.slice(0, 5);
}

export async function criarAvaliacao(data: {
  pacienteId: string;
  peso?: number;
  altura?: number;
  circAbdominal?: number;
  comorbidades?: string[];
  indicadoresLab?: Record<string, string>;
  respostas: RespostasMEV;
}) {
  const medicoId = await getMedicoId();
  const scores = calcularScores(data.respostas);
  const imc =
    data.peso && data.altura
      ? parseFloat((data.peso / Math.pow(data.altura / 100, 2)).toFixed(1))
      : undefined;

  const riscos = gerarRiscos(scores);
  const planoAcao = gerarPlanoAcao(scores);

  return prisma.avaliacaoMEV.create({
    data: {
      pacienteId: data.pacienteId,
      medicoId,
      peso: data.peso,
      altura: data.altura,
      imc,
      circAbdominal: data.circAbdominal,
      comorbidades: data.comorbidades ? JSON.stringify(data.comorbidades) : undefined,
      indicadoresLab: data.indicadoresLab ? JSON.stringify(data.indicadoresLab) : undefined,
      respostas: JSON.stringify(data.respostas),
      ...scores,
      riscos: JSON.stringify(riscos),
      planoAcao: JSON.stringify(planoAcao),
    },
  });
}

export async function getAvaliacaoById(id: string) {
  const medicoId = await getMedicoId();
  const av = await prisma.avaliacaoMEV.findFirst({
    where: { id, medicoId },
    include: { paciente: { select: { id: true, nome: true } } },
  });
  if (!av) return null;

  return {
    ...av,
    comorbidadesParsed: av.comorbidades ? JSON.parse(av.comorbidades) : [],
    indicadoresLabParsed: av.indicadoresLab ? JSON.parse(av.indicadoresLab) : {},
    respostasParsed: av.respostas ? JSON.parse(av.respostas) : null,
    riscosParsed: av.riscos ? JSON.parse(av.riscos) : [],
    planoAcaoParsed: av.planoAcao ? JSON.parse(av.planoAcao) : [],
  };
}

export async function getAvaliacoesPaciente(pacienteId: string) {
  const medicoId = await getMedicoId();
  const avs = await prisma.avaliacaoMEV.findMany({
    where: { pacienteId, medicoId },
    orderBy: { createdAt: "desc" },
  });
  return avs.map((av) => ({
    ...av,
    riscosParsed: av.riscos ? JSON.parse(av.riscos) : [],
  }));
}

export async function getPacientesComAtencaoMEV() {
  const medicoId = await getMedicoId();

  // Última avaliação por paciente
  const pacientes = await prisma.paciente.findMany({
    where: { medicoId, status: "ATIVO" },
    select: {
      id: true,
      nome: true,
      avaliacoesMev: {
        orderBy: { createdAt: "desc" },
        take: 1,
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
      },
    },
  });

  const NOMES_PILARES = [
    { key: "scorePilar1" as const, nome: "Nutrição" },
    { key: "scorePilar2" as const, nome: "Atividade Física" },
    { key: "scorePilar3" as const, nome: "Sono" },
    { key: "scorePilar4" as const, nome: "Controle de Tóxicos" },
    { key: "scorePilar5" as const, nome: "Saúde Mental" },
    { key: "scorePilar6" as const, nome: "Conexões Sociais" },
  ];

  return pacientes
    .filter((p) => p.avaliacoesMev.length > 0)
    .map((p) => {
      const av = p.avaliacoesMev[0];
      const pilarCritico = NOMES_PILARES.reduce((min, pl) =>
        av[pl.key] < av[min.key] ? pl : min
      );
      return {
        id: p.id,
        nome: p.nome,
        pilarCritico: pilarCritico.nome,
        score: av[pilarCritico.key],
        avaliacaoId: av.id,
        dataAvaliacao: av.createdAt,
      };
    })
    .filter((p) => p.score <= 40)
    .sort((a, b) => a.score - b.score);
}

export async function getEstatisticasPilares() {
  const medicoId = await getMedicoId();
  const avs = await prisma.avaliacaoMEV.findMany({
    where: { medicoId },
    select: {
      scorePilar1: true,
      scorePilar2: true,
      scorePilar3: true,
      scorePilar4: true,
      scorePilar5: true,
      scorePilar6: true,
      pacienteId: true,
    },
  });

  const totalPacientesAvaliados = new Set(avs.map((a) => a.pacienteId)).size;

  if (avs.length === 0) {
    return Array(6).fill({ pacientesAvaliados: 0, scoresMedio: 0 });
  }

  const media = (key: keyof (typeof avs)[0]) =>
    Math.round(avs.reduce((sum, a) => sum + (a[key] as number), 0) / avs.length);

  return [
    { nome: "Nutrição", pacientesAvaliados: totalPacientesAvaliados, scoreMedio: media("scorePilar1") },
    { nome: "Atividade Física", pacientesAvaliados: totalPacientesAvaliados, scoreMedio: media("scorePilar2") },
    { nome: "Sono", pacientesAvaliados: totalPacientesAvaliados, scoreMedio: media("scorePilar3") },
    { nome: "Controle de Tóxicos", pacientesAvaliados: totalPacientesAvaliados, scoreMedio: media("scorePilar4") },
    { nome: "Saúde Mental", pacientesAvaliados: totalPacientesAvaliados, scoreMedio: media("scorePilar5") },
    { nome: "Conexões Sociais", pacientesAvaliados: totalPacientesAvaliados, scoreMedio: media("scorePilar6") },
  ];
}
