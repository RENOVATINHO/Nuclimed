"use server";
import { prisma } from "@/lib/prisma";
import { getMedicoId } from "./helpers";

export type TransacaoComPaciente = {
  id: string;
  descricao: string;
  categoria: string;
  tipo: string;
  valor: number;
  desconto: number;
  valorLiquido: number;
  formaPagamento: string;
  status: string;
  dataEmissao: Date;
  dataBaixa: Date | null;
  observacoes: string | null;
  paciente: { id: string; nome: string } | null;
};

export async function getTransacoes(filtros: {
  tipo?: string;
  categoria?: string;
  status?: string;
  convenio?: string;
  dataInicio?: string;
  dataFim?: string;
  busca?: string;
  page?: number;
  limit?: number;
}) {
  const medicoId = await getMedicoId();
  const { tipo, categoria, status, dataInicio, dataFim, busca, page = 1, limit = 20 } = filtros;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { medicoId };
  if (tipo) where.tipo = tipo;
  if (categoria) where.categoria = categoria;
  if (status) where.status = status;
  if (busca) where.descricao = { contains: busca };
  if (dataInicio || dataFim) {
    where.dataEmissao = {
      ...(dataInicio ? { gte: new Date(dataInicio) } : {}),
      ...(dataFim ? { lte: new Date(dataFim) } : {}),
    };
  }

  const [transacoes, total, agregados] = await Promise.all([
    prisma.transacao.findMany({
      where,
      skip,
      take: limit,
      orderBy: { dataEmissao: "desc" },
      include: {
        paciente: { select: { id: true, nome: true } },
      },
    }),
    prisma.transacao.count({ where }),
    prisma.transacao.aggregate({
      where: { medicoId },
      _sum: { valorLiquido: true },
    }),
  ]);

  const receitas = transacoes
    .filter((t) => t.tipo === "RECEITA")
    .reduce((acc, t) => acc + t.valorLiquido, 0);
  const despesas = transacoes
    .filter((t) => t.tipo === "DESPESA")
    .reduce((acc, t) => acc + t.valorLiquido, 0);

  return {
    transacoes: transacoes as TransacaoComPaciente[],
    total,
    pages: Math.ceil(total / limit),
    page,
    totais: { receitas, despesas, saldo: receitas - despesas },
    saldoGeral: agregados._sum.valorLiquido ?? 0,
  };
}

export async function criarTransacao(data: {
  pacienteId?: string;
  descricao: string;
  categoria: string;
  tipo: string;
  valor: number;
  desconto?: number;
  multa?: number;
  formaPagamento: string;
  status?: string;
  dataEmissao: string;
  dataBaixa?: string;
  observacoes?: string;
}) {
  const medicoId = await getMedicoId();
  const desconto = data.desconto ?? 0;
  const multa = data.multa ?? 0;
  const valorLiquido =
    data.tipo === "RECEITA"
      ? data.valor - desconto + multa
      : data.valor + multa - desconto;

  return prisma.transacao.create({
    data: {
      ...data,
      medicoId,
      desconto,
      multa,
      valorLiquido,
      status: data.status ?? "PENDENTE",
      dataEmissao: new Date(data.dataEmissao),
      dataBaixa: data.dataBaixa ? new Date(data.dataBaixa) : undefined,
    },
  });
}

export async function getDashboardFinanceiro(periodo: "semana" | "mes" | "trimestre" = "mes") {
  const medicoId = await getMedicoId();
  const hoje = new Date();

  // Período atual
  let dataInicio: Date;
  if (periodo === "semana") {
    dataInicio = new Date(hoje);
    dataInicio.setDate(hoje.getDate() - 7);
  } else if (periodo === "mes") {
    dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  } else {
    dataInicio = new Date(hoje);
    dataInicio.setMonth(hoje.getMonth() - 3);
  }

  const transacoesPeriodo = await prisma.transacao.findMany({
    where: {
      medicoId,
      dataEmissao: { gte: dataInicio, lte: hoje },
    },
    include: { paciente: { select: { id: true, nome: true } } },
    orderBy: { dataEmissao: "desc" },
  });

  const receitas = transacoesPeriodo
    .filter((t) => t.tipo === "RECEITA")
    .reduce((acc, t) => acc + t.valorLiquido, 0);
  const despesas = transacoesPeriodo
    .filter((t) => t.tipo === "DESPESA")
    .reduce((acc, t) => acc + t.valorLiquido, 0);

  // Período anterior para comparação
  const periodoEmDias = Math.ceil((hoje.getTime() - dataInicio.getTime()) / 86_400_000);
  const dataInicioAnterior = new Date(dataInicio);
  dataInicioAnterior.setDate(dataInicioAnterior.getDate() - periodoEmDias);

  const transacoesAnterior = await prisma.transacao.findMany({
    where: {
      medicoId,
      dataEmissao: { gte: dataInicioAnterior, lt: dataInicio },
    },
    select: { tipo: true, valorLiquido: true },
  });

  const receitasAnterior = transacoesAnterior
    .filter((t) => t.tipo === "RECEITA")
    .reduce((acc, t) => acc + t.valorLiquido, 0);
  const despesasAnterior = transacoesAnterior
    .filter((t) => t.tipo === "DESPESA")
    .reduce((acc, t) => acc + t.valorLiquido, 0);

  const varReceitas = receitasAnterior > 0
    ? Math.round(((receitas - receitasAnterior) / receitasAnterior) * 100)
    : 0;
  const varDespesas = despesasAnterior > 0
    ? Math.round(((despesas - despesasAnterior) / despesasAnterior) * 100)
    : 0;

  // Gráfico semanal (últimas 7 semanas)
  const semanas: { semana: string; receitas: number; despesas: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const fim = new Date(hoje);
    fim.setDate(hoje.getDate() - i * 7);
    const ini = new Date(fim);
    ini.setDate(fim.getDate() - 6);
    const label = `${ini.getDate()}/${ini.getMonth() + 1}`;

    const ts = transacoesPeriodo.filter(
      (t) => t.dataEmissao >= ini && t.dataEmissao <= fim
    );
    semanas.push({
      semana: label,
      receitas: ts.filter((t) => t.tipo === "RECEITA").reduce((a, t) => a + t.valorLiquido, 0),
      despesas: ts.filter((t) => t.tipo === "DESPESA").reduce((a, t) => a + t.valorLiquido, 0),
    });
  }

  // Categorias (receitas)
  const categoriaMap = new Map<string, number>();
  transacoesPeriodo
    .filter((t) => t.tipo === "RECEITA")
    .forEach((t) => {
      categoriaMap.set(t.categoria, (categoriaMap.get(t.categoria) ?? 0) + t.valorLiquido);
    });

  const CORES = ["#6D28D9", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];
  const categorias = Array.from(categoriaMap.entries()).map(([nome, valor], i) => ({
    nome,
    valor,
    cor: CORES[i % CORES.length],
  }));

  return {
    receitas,
    despesas,
    saldo: receitas - despesas,
    varReceitas,
    varDespesas,
    varSaldo: varReceitas - varDespesas,
    semanas,
    categorias,
    transacoesRecentes: (transacoesPeriodo as (typeof transacoesPeriodo[number] & { paciente: { id: string; nome: string } | null })[]).slice(0, 10),
  };
}
