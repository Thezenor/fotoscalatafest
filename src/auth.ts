import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/server/db";
import { authConfig } from "@/server/auth/auth.config";
import { rateLimit, clientIpFrom } from "@/server/services/ratelimit.service";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Inicialización completa de Auth.js (runtime Node): añade el provider de
 * credenciales que consulta Prisma y verifica la contraseña con bcrypt.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(raw, request) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Anti-fuerza-bruta: máx. 8 intentos por IP+email cada 10 min.
        const ip = request?.headers ? clientIpFrom(request.headers as Headers) : "unknown";
        const rl = await rateLimit(`login:${ip}:${email.toLowerCase()}`, 8, 600);
        if (!rl.ok) return null;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user || !user.isActive || !user.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});
