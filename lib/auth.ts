import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const medico = await prisma.medico.findUnique({
          where: { email: credentials.email },
        });

        if (!medico) return null;

        // TODO: verificar senha com bcrypt em produção
        // Por enquanto aceita qualquer senha para desenvolvimento
        return {
          id: medico.id,
          email: medico.email,
          name: medico.nome,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
