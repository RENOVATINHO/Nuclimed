"use server";
import { prisma } from "@/lib/prisma";
import { getMedicoId } from "./helpers";

export async function getDashboard() {
  const medicoId = await getMedicoId();
  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0);
  const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  const [agendamentosHoje, transacoesMes, totalPacientes, todosProdutos, ultimasAvaliacoes] =
    await Promise.all([
      prisma.agendamento.findMany({
        where: { medicoId, dataHora: { gte: inicioHoje, lte: fimHoje } },
        include: { paciente: { select: { id: true, nome: true, convenio: true } } },
        orderBy: { dataHora: "asc" },
      }),

      prisma.transacao.findMany({
        where: { medicoId, dataEmissao: { gte: inicioMes } },
        select: { tipo: true, valorLiquido: true },
      }),

      prisma.paciente.count({ where: { medicoId, status: "ATIVO" } }),

      prisma.produtoEstoque.findMany({
        where: { medicoId },
        select: { id: true, nome: true, estoqueAtual: true, estoqueMinimo: true, validade: true },
      }),

      prisma.avaliacaoMEV.findMany({
        where: { medicoId },
        orderBy: { createdAt: "desc" },
        distinct: ["pacienteId"],
        include: { paciente: { select: { id: true, nome: true } } },
        take: 20,
      }),
    ]);

  // Alertas de estoque (js-side)
  const em30Dias = new Date();
  em30Dias.setDate(em30Dias.getDate() + 30);
  const alertasEstoque = todosProdutos.filter(
    (p) => p.estoqueAtual === 0 || p.estoqueAtual < p.estoqueMinimo || (p.validade && p.validade <= em30Dias)
  );

  // Pacientes MEV críticos (js-side)
  const alertasMev = ultimasAvaliacoes
    .filter(
      (a) =>
        a.scorePilar1 <= 40 ||
        a.scorePilar2 <= 40 ||
        a.scorePilar3 <= 40 ||
        a.scorePilar4 <= 40 ||
        a.scorePilar5 <= 40 ||
        a.scorePilar6 <= 40
    )
    .slice(0, 5);

  const receitasMes = transacoesMes
    .filter((t) => t.tipo === "RECEITA")
    .reduce((acc, t) => acc + t.valorLiquido, 0);
  const despesasMes = transacoesMes
    .filter((t) => t.tipo === "DESPESA")
    .reduce((acc, t) => acc + t.valorLiquido, 0);

  const resumoAgenda = {
    agendados: agendamentosHoje.filter((a) => a.status === "AGENDADO").length,
    finalizados: agendamentosHoje.filter((a) => a.status === "FINALIZADO").length,
    cancelados: agendamentosHoje.filter((a) => a.status === "CANCELADO").length,
    espera: agendamentosHoje.filter((a) => a.status === "ESPERA").length,
    total: agendamentosHoje.length,
  };

  return {
    agendamentosHoje,
    resumoAgenda,
    financeiro: { receitasMes, despesasMes, saldoMes: receitasMes - despesasMes },
    totalPacientes,
    alertasEstoque,
    alertasMev,
  };
}
