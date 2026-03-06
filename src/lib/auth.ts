import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { verifyPassword } from './crypto';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages:   { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user || !user.password) return null;
        if (!await verifyPassword(credentials.password, user.password)) return null;
        if (user.active === false) return null;

        return {
          id:        user.id,
          email:     user.email,
          name:      user.name,
          role:      user.role as string,
          avatarUrl: user.avatarUrl ?? undefined,
          phone:     user.phone    ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id        = user.id;
        token.role      = (user as any).role;
        token.avatarUrl = (user as any).avatarUrl;
        token.phone     = (user as any).phone;
      }
      // Permitir update de session (cuando el usuario edita su perfil)
      if (trigger === 'update' && session) {
        if (session.name)                    token.name      = session.name;
        if (session.avatarUrl !== undefined) token.avatarUrl = session.avatarUrl;
        if (session.phone     !== undefined) token.phone     = session.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id        = token.id        ?? '';
        (session.user as any).role      = token.role      ?? '';
        (session.user as any).avatarUrl = token.avatarUrl ?? null;
        (session.user as any).phone     = token.phone     ?? null;
      }
      return session;
    },
  },
};
