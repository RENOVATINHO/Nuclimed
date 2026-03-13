"use server";
import { prisma } from "@/lib/prisma";

/**
 * Retorna o ID do médico ativo.
 * Dev bypass — substituir por getServerSession quando auth Medico estiver pronto.
 */
export async function getMedicoId(): Promise<string> {
  const medico = await prisma.medico.findFirst({ select: { id: true } });
  if (!medico) throw new Error("Nenhum médico encontrado — execute: npx prisma db seed");
  return medico.id;
}
