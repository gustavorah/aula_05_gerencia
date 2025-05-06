import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import pool from "../../../../../db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          // throw new Error("Email e senha são obrigatórios");
          return null;
        }

        try {
          // Query the database for the user with the given email
          const result = await pool.query(
            "SELECT * FROM usuario WHERE email = $1",
            [credentials.email]
          );

          const user = result.rows[0];

          // If no user found with that email
          if (!user) {
            return null;
            throw new Error("Email não encontrado");
          }

          // Check if the password is correct
          const passwordMatch = await compare(credentials.password, user.senha);

          if (!passwordMatch) {
            return null;
            throw new Error("Senha incorreta");
          }

          // Update last login time
          // await pool.query(
          //   "UPDATE usuario SET ultimo_login = CURRENT_TIMESTAMP WHERE id = $1",
          //   [user.id]
          // );

          // Return the user object (excluding sensitive data)
          return {
            id: user.id,
            name: user.nome,
            email: user.email,
          };
        } catch (error) {
          console.error("Erro ao autenticar:", error);
          return null;
          throw new Error("Falha na autenticação");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback:", session, token);
      if (token && session.user) {
        session.user.id = token.id as string;
      }

      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "your-fallback-secret-but-use-env-in-production",
  debug: true
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

