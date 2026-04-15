import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

declare module 'next-auth' {
  interface Session {
    user: {
      agencyId: string;
      agencyName: string;
    } & DefaultSession['user'];
  }

  interface User {
    agencyId?: string;
    agencyName?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const seller = await prisma.seller.findUnique({
          where: { email },
          include: { agency: true },
        });

        if (!seller) return null;

        const isValid = await compare(password, seller.password);
        if (!isValid) return null;

        return {
          id: seller.id,
          email: seller.email,
          name: seller.name,
          agencyId: seller.agencyId,
          agencyName: seller.agency.name,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.agencyId = user.agencyId;
        token.agencyName = user.agencyName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.agencyId =
          (token as Record<string, unknown>).agencyId as string;
        session.user.agencyName =
          (token as Record<string, unknown>).agencyName as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
