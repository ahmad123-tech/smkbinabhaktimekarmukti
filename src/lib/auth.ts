import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        let name = user.email;
        if (user.role === "LULUSAN") {
          const lulusan = await prisma.lulusan.findUnique({ where: { userId: user.id } });
          if (lulusan) name = lulusan.nama;
        } else if (user.role === "PERUSAHAAN") {
          const perusahaan = await prisma.perusahaan.findUnique({ where: { userId: user.id } });
          if (perusahaan) name = perusahaan.nama;
        } else if (user.role === "ADMIN") {
          name = "Admin";
        } else if (user.role === "KEPALA_SEKOLAH") {
          name = "Kepala Sekolah";
        }

        return { id: user.id, email: user.email, role: user.role, name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        // Sisipkan token server saat ini ke dalam JWT
        // Jika server direstart, RUNTIME_SERVER_TOKEN berubah
        // → JWT lama tidak cocok → sesi otomatis tidak valid
        token.serverToken = process.env.RUNTIME_SERVER_TOKEN;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: {
    strategy: "jwt",
    // Maksimum umur session di sisi server (detik): 8 jam
    maxAge: 8 * 60 * 60,
  },
  // Cookie tanpa maxAge = session cookie → otomatis terhapus saat browser ditutup
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // TIDAK ada maxAge → cookie hilang saat browser ditutup
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
