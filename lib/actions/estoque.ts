"use server";
import { prisma } from "@/lib/prisma";
import { getMedicoId } from "./helpers";

export type ProdutoComMovimentacoes = {
  id: string;
  nome: string;
  categoria: string;
  unidade: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  validade: Date | null;
  status: "normal" | "baixo" | "zerado" | "vencendo";
  _count: { movimentacoes: number };
};

function calcStatus(p: { estoqueAtual: number; estoqueMinimo: number; validade: Date | null }): ProdutoComMovimentacoes["status"] {
  const em30Dias = new Date();
  em30Dias.setDate(em30Dias.getDate() + 30);
  if (p.estoqueAtual === 0) return "zerado";
  if (p.validade && p.validade <= em30Dias) return "vencendo";
  if (p.estoqueAtual < p.estoqueMinimo) return "baixo";
  return "normal";
}

export async function getProdutos(filtros?: { busca?: string; categoria?: string; status?: string }) {
  const medicoId = await getMedicoId();
  const where: Record<string, unknown> = { medicoId };
  if (filtros?.categoria) where.categoria = filtros.categoria;
  if (filtros?.busca) where.nome = { contains: filtros.busca };

  const produtos = await prisma.produtoEstoque.findMany({
    where,
    include: { _count: { select: { movimentacoes: true } } },
    orderBy: { nome: "asc" },
  });

  const comStatus = produtos.map((p) => ({ ...p, status: calcStatus(p) }));

  // JS-side status filter
  const filtrados = filtros?.status
    ? comStatus.filter((p) => p.status === filtros.status)
    : comStatus;

  return {
    produtos: filtrados as ProdutoComMovimentacoes[],
    alertas: {
      zerados: comStatus.filter((p) => p.status === "zerado").length,
      baixo: comStatus.filter((p) => p.status === "baixo").length,
      vencendo: comStatus.filter((p) => p.status === "vencendo").length,
    },
  };
}

export async function criarProduto(data: {
  nome: string;
  categoria: string;
  unidade: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  validade?: string;
}) {
  const medicoId = await getMedicoId();
  return prisma.produtoEstoque.create({
    data: {
      ...data,
      validade: data.validade ? new Date(data.validade) : undefined,
      medicoId,
    },
  });
}

export async function atualizarProduto(id: string, data: Partial<Parameters<typeof criarProduto>[0]>) {
  const medicoId = await getMedicoId();
  return prisma.produtoEstoque.update({
    where: { id, medicoId },
    data: {
      ...data,
      validade: data.validade ? new Date(data.validade) : undefined,
    },
  });
}

export async function deletarProduto(id: string) {
  const medicoId = await getMedicoId();
  return prisma.produtoEstoque.delete({ where: { id, medicoId } });
}

export async function getMovimentacoes(produtoId?: string) {
  const medicoId = await getMedicoId();
  const where: Record<string, unknown> = produtoId
    ? { produtoId }
    : { produto: { medicoId } };

  return prisma.movimentacaoEstoque.findMany({
    where,
    include: { produto: { select: { id: true, nome: true, unidade: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function registrarMovimentacao(data: {
  produtoId: string;
  tipo: "ENTRADA" | "SAIDA";
  quantidade: number;
  responsavel?: string;
  observacoes?: string;
}) {
  const medicoId = await getMedicoId();

  // Verifica que o produto pertence ao médico
  const produto = await prisma.produtoEstoque.findFirst({
    where: { id: data.produtoId, medicoId },
  });
  if (!produto) throw new Error("Produto não encontrado");

  const delta = data.tipo === "ENTRADA" ? data.quantidade : -data.quantidade;
  const novoEstoque = produto.estoqueAtual + delta;
  if (novoEstoque < 0) throw new Error("Estoque insuficiente para esta saída");

  const [movimentacao] = await prisma.$transaction([
    prisma.movimentacaoEstoque.create({ data }),
    prisma.produtoEstoque.update({
      where: { id: data.produtoId },
      data: { estoqueAtual: novoEstoque },
    }),
  ]);

  return movimentacao;
}
