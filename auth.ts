import NextAuth, { DefaultSession } from 'next-auth';
import authConfig from './auth.config';

import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/prisma';

declare module 'next-auth' {
    interface User {
        isAdmin?: boolean;
    }

    interface Session {
        user: User & DefaultSession['user'];
        expires: string;
        error: string;
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: 'jwt' },
    callbacks: {
        async jwt({ token, user, account, trigger, session }) {
            if (account && user) {
                token.id = user.id;
                token.isAdmin = user.isAdmin;
            }
            return token;
        },
        async session({ session, user, token }) {
            const prismaUser = await prisma.user.findUnique({
                where: { id: token.id as string },
                include: {
                    plugins: { include: { plugin: true } },
                },
            });

            const prismaUserPlugins = prismaUser?.plugins.map((p) => p.plugin);

            return {
                ...session,
                user: {
                    ...session.user,
                    isAdmin: prismaUser?.isAdmin,
                    plugins: prismaUserPlugins,
                },
            };
        },
    },
    ...authConfig,
});
