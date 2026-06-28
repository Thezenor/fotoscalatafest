import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Configuración base de Auth.js, segura para el runtime Edge (middleware):
 * NO importa Prisma ni bcrypt. Los providers pesados se añaden en src/auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
  providers: [], // se rellenan en src/auth.ts (Node runtime)
  callbacks: {
    // Propaga el rol y el id al token y a la sesión.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: Role }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
